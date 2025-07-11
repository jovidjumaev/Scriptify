// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::process::{Command, Stdio};
use std::path::Path;
use std::fs;
use std::env;
use std::io::{BufRead, BufReader};
use tauri::{State, Manager};

#[derive(Default)]
struct TranscriptionState(Mutex<String>);

#[derive(Debug, Serialize, Deserialize)]
struct TranscriptionRequest {
    audio_data: Vec<u8>,
    language: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct TranscriptionResponse {
    text: String,
    confidence: f32,
    language: Option<String>,
    segments: Option<Vec<Segment>>,
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Segment {
    start: f32,
    end: f32,
    text: String,
}

#[derive(Debug, Serialize, Clone)]
struct ProgressUpdate {
    step: String,
    progress: f32,
    message: String,
}

#[tauri::command]
async fn transcribe_audio(
    request: TranscriptionRequest,
    state: State<'_, TranscriptionState>,
    app: tauri::AppHandle,
) -> Result<TranscriptionResponse, String> {
    // Create a temporary file for the audio data
    let temp_dir = std::env::temp_dir();
    let temp_file = temp_dir.join(format!("audio_{}.webm", uuid::Uuid::new_v4()));
    
    // Write audio data to temporary file
    fs::write(&temp_file, &request.audio_data)
        .map_err(|e| format!("Failed to write audio file: {}", e))?;
    
    // Get the path to the Python script - try multiple possible locations
    let script_path = if let Ok(current_exe) = env::current_exe() {
        // If we can get the executable path, look for the script relative to it
        if let Some(exe_dir) = current_exe.parent() {
            let relative_path = exe_dir.join("python/whisper_transcribe.py");
            if relative_path.exists() {
                relative_path
            } else {
                // Try going up to the project root
                let project_root = exe_dir.join("../../src-tauri/python/whisper_transcribe.py");
                if project_root.exists() {
                    project_root
                } else {
                    // Try current working directory
                    let cwd_path = Path::new("src-tauri/python/whisper_transcribe.py");
                    if cwd_path.exists() {
                        cwd_path.to_path_buf()
                    } else {
                        // Try absolute path from current directory
                        let current_dir = env::current_dir().unwrap_or_else(|_| Path::new(".").to_path_buf());
                        let absolute_path = current_dir.join("src-tauri/python/whisper_transcribe.py");
                        if absolute_path.exists() {
                            absolute_path
                        } else {
                            // Try going up one level from current directory (since we're in src-tauri)
                            let parent_dir = current_dir.parent().unwrap_or(&current_dir);
                            let parent_path = parent_dir.join("src-tauri/python/whisper_transcribe.py");
                            if parent_path.exists() {
                                parent_path
                            } else {
                                Path::new("src-tauri/python/whisper_transcribe.py").to_path_buf()
                            }
                        }
                    }
                }
            }
        } else {
            Path::new("src-tauri/python/whisper_transcribe.py").to_path_buf()
        }
    } else {
        // Fallback to current directory
        let current_dir = env::current_dir().unwrap_or_else(|_| Path::new(".").to_path_buf());
        let absolute_path = current_dir.join("src-tauri/python/whisper_transcribe.py");
        if absolute_path.exists() {
            absolute_path
        } else {
            // Try going up one level from current directory (since we're in src-tauri)
            let parent_dir = current_dir.parent().unwrap_or(&current_dir);
            let parent_path = parent_dir.join("src-tauri/python/whisper_transcribe.py");
            if parent_path.exists() {
                parent_path
            } else {
                Path::new("src-tauri/python/whisper_transcribe.py").to_path_buf()
            }
        }
    };
    
    // Debug: Print the resolved script path
    println!("Looking for script at: {}", script_path.display());
    println!("Script exists: {}", script_path.exists());
    println!("Current working directory: {:?}", env::current_dir());
    
    if !script_path.exists() {
        return Err(format!("Whisper transcription script not found at: {}", script_path.display()));
    }
    
    // Build the command to run the Python script
    // Try to use the virtual environment Python first
    let python_executable = if let Ok(current_dir) = env::current_dir() {
        let venv_python = current_dir.join("scriptify-env/bin/python3");
        if venv_python.exists() {
            venv_python.to_string_lossy().to_string()
        } else {
            // Try parent directory
            let parent_venv_python = current_dir.parent().unwrap_or(&current_dir).join("scriptify-env/bin/python3");
            if parent_venv_python.exists() {
                parent_venv_python.to_string_lossy().to_string()
            } else {
                "python3".to_string()
            }
        }
    } else {
        "python3".to_string()
    };
    
    println!("Using Python executable: {}", python_executable);
    
    let mut command = Command::new(&python_executable);
    command
        .arg(&script_path)
        .arg("--audio-path")
        .arg(&temp_file)
        .arg("--language")
        .arg(request.language.unwrap_or_else(|| "auto".to_string()))
        .arg("--model-size")
        .arg("base") // Use base model for speed/accuracy balance
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    
    // Execute the command
    let mut child = command
        .spawn()
        .map_err(|e| format!("Failed to execute transcription script: {}", e))?;
    
    // Get handles for stdout and stderr
    let stdout = child.stdout.take().expect("Failed to capture stdout");
    let stderr = child.stderr.take().expect("Failed to capture stderr");
    
    // Send initial progress update
    let _ = app.emit_all("transcription-progress", ProgressUpdate {
        step: "initializing".to_string(),
        progress: 0.0,
        message: "Starting transcription...".to_string(),
    });
    
    // Read stderr in real-time for progress updates
    let stderr_reader = BufReader::new(stderr);
    let app_handle = app.clone();
    let stderr_thread = std::thread::spawn(move || {
        let mut last_progress = 0.0;
        let mut step_start_time = std::time::Instant::now();
        let mut transcription_completed = false;
        
        for line in stderr_reader.lines() {
            if let Ok(line) = line {
                // Filter out warning messages and only show progress updates
                if !line.contains("UserWarning") && !line.contains("warnings.warn") && !line.trim().is_empty() {
                    eprintln!("{}", line);
                    
                    // Parse progress updates and send to frontend
                    if line.contains("Loading Whisper model") {
                        let progress = 20.0; // 20% for loading model
                        last_progress = progress;
                        step_start_time = std::time::Instant::now();
                        let _ = app_handle.emit_all("transcription-progress", ProgressUpdate {
                            step: "loading_model".to_string(),
                            progress,
                            message: "Loading Whisper model...".to_string(),
                        });
                    } else if line.contains("Preparing audio") {
                        let progress = 40.0; // 40% for preparing audio
                        last_progress = progress;
                        step_start_time = std::time::Instant::now();
                        let _ = app_handle.emit_all("transcription-progress", ProgressUpdate {
                            step: "preparing_audio".to_string(),
                            progress,
                            message: "Preparing audio...".to_string(),
                        });
                    } else if line.contains("Chunking audio") {
                        let progress = 60.0; // 60% for chunking audio
                        last_progress = progress;
                        step_start_time = std::time::Instant::now();
                        let _ = app_handle.emit_all("transcription-progress", ProgressUpdate {
                            step: "chunking_audio".to_string(),
                            progress,
                            message: "Chunking audio...".to_string(),
                        });
                    } else if line.contains("Transcribing chunks") {
                        // Parse chunk progress more carefully
                        if line.contains("%") {
                            // Look for percentage in the line
                            let parts: Vec<&str> = line.split('%').collect();
                            if parts.len() > 0 {
                                let percentage_part = parts[0];
                                // Extract the percentage number
                                if let Some(last_pipe) = percentage_part.rfind('|') {
                                    let after_pipe = &percentage_part[last_pipe + 1..];
                                    if let Ok(percentage_val) = after_pipe.trim().parse::<f32>() {
                                        let base_progress = 60.0; // 60% for transcription step
                                        let chunk_progress = (percentage_val / 100.0) * 30.0; // 30% for chunks
                                        let total_progress = base_progress + chunk_progress;
                                        last_progress = total_progress;
                                        
                                        let _ = app_handle.emit_all("transcription-progress", ProgressUpdate {
                                            step: "transcribing".to_string(),
                                            progress: total_progress,
                                            message: format!("Transcribing chunks... {:.0}%", percentage_val),
                                        });
                                    }
                                }
                            }
                        } else {
                            // If we see "Transcribing chunks" but no percentage, increment progress gradually
                            let progress = 80.0; // 80% for transcribing without percentage
                            if progress > last_progress {
                                last_progress = progress;
                                let _ = app_handle.emit_all("transcription-progress", ProgressUpdate {
                                    step: "transcribing".to_string(),
                                    progress,
                                    message: "Transcribing chunks...".to_string(),
                                });
                            }
                        }
                    } else if line.contains("Formatting result") {
                        let progress = 95.0; // 95% for formatting
                        last_progress = progress;
                        transcription_completed = true;
                        let _ = app_handle.emit_all("transcription-progress", ProgressUpdate {
                            step: "formatting".to_string(),
                            progress,
                            message: "Formatting result...".to_string(),
                        });
                    }
                    
                    // Add intermediate progress updates based on time, but be more conservative
                    let elapsed = step_start_time.elapsed();
                    if elapsed.as_secs() > 3 && last_progress < 85.0 && !transcription_completed {
                        let time_based_progress = last_progress + (elapsed.as_secs() as f32 * 0.2).min(2.0);
                        if time_based_progress > last_progress {
                            last_progress = time_based_progress;
                            let _ = app_handle.emit_all("transcription-progress", ProgressUpdate {
                                step: "processing".to_string(),
                                progress: time_based_progress,
                                message: "Processing...".to_string(),
                            });
                        }
                    }
                }
            }
        }
    });
    
    // Read stdout for the JSON result
    let stdout_reader = BufReader::new(stdout);
    let mut output_str = String::new();
    for line in stdout_reader.lines() {
        if let Ok(line) = line {
            output_str.push_str(&line);
            output_str.push('\n');
        }
    }
    
    // Wait for the process to complete
    let status = child.wait()
        .map_err(|e| format!("Failed to wait for transcription script: {}", e))?;
    
    // Wait for stderr thread to complete
    stderr_thread.join().map_err(|_| "Failed to join stderr thread")?;
    
    // Clean up the temporary file
    let _ = fs::remove_file(&temp_file);
    
    // Debug: Print command exit code
    println!("Command exit code: {}", status);
    
    // Only send completion progress update if the process was successful
    if status.success() {
        let _ = app.emit_all("transcription-progress", ProgressUpdate {
            step: "completed".to_string(),
            progress: 100.0,
            message: "Transcription completed!".to_string(),
        });
    }
    
    // Parse the JSON output
    let result: serde_json::Value = serde_json::from_str(&output_str)
        .map_err(|e| format!("Failed to parse JSON response: {}", e))?;
    
    // Check for errors in the Python script output
    if let Some(error) = result.get("error").and_then(|e| e.as_str()) {
        if !error.is_empty() {
            return Err(format!("Transcription failed: {}", error));
        }
    }
    
    // Extract the transcription text
    let text = result.get("text")
        .and_then(|t| t.as_str())
        .unwrap_or("")
        .to_string();
    
    let confidence = result.get("confidence")
        .and_then(|c| c.as_f64())
        .unwrap_or(0.0) as f32;
    
    let language = result.get("language")
        .and_then(|l| l.as_str())
        .map(|l| l.to_string());
    
    // Extract segments if available
    let segments = result.get("segments")
        .and_then(|s| s.as_array())
        .map(|segments_array| {
            segments_array.iter().filter_map(|segment| {
                let obj = segment.as_object()?;
                let start = obj.get("start")?.as_f64()? as f32;
                let end = obj.get("end")?.as_f64()? as f32;
                let text = obj.get("text")?.as_str()?.to_string();
                Some(Segment { start, end, text })
            }).collect()
        });
    
    // Store the transcription in state
    {
        let mut state_guard = state.0.lock().map_err(|e| e.to_string())?;
        *state_guard = text.clone();
    }
    
    Ok(TranscriptionResponse {
        text,
        confidence,
        language,
        segments,
        error: None,
    })
}

#[tauri::command]
async fn save_transcription(
    text: String,
    file_path: String,
    state: State<'_, TranscriptionState>,
) -> Result<(), String> {
    // Store the transcription in state
    {
        let mut state_guard = state.0.lock().map_err(|e| e.to_string())?;
        *state_guard = text.clone();
    }
    
    // Save to file
    fs::write(&file_path, text)
        .map_err(|e| format!("Failed to save transcription: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn get_transcription(state: State<'_, TranscriptionState>) -> Result<String, String> {
    let state_guard = state.0.lock().map_err(|e| e.to_string())?;
    Ok(state_guard.clone())
}

fn main() {
    tauri::Builder::default()
        .manage(TranscriptionState::default())
        .invoke_handler(tauri::generate_handler![
            transcribe_audio,
            save_transcription,
            get_transcription,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 