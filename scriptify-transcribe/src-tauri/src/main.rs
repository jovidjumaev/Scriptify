// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

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
}

#[tauri::command]
async fn transcribe_audio(
    request: TranscriptionRequest,
    state: State<'_, TranscriptionState>,
) -> Result<TranscriptionResponse, String> {
    // TODO: Implement actual transcription logic
    // For now, return a mock response
    let mock_text = "This is a mock transcription. The actual transcription service will be implemented here.";
    
    let response = TranscriptionResponse {
        text: mock_text.to_string(),
        confidence: 0.95,
    };
    
    // Store the transcription in state
    *state.0.lock().unwrap() = mock_text.to_string();
    
    Ok(response)
}

#[tauri::command]
async fn save_transcription(
    text: String,
    file_path: String,
    state: State<'_, TranscriptionState>,
) -> Result<(), String> {
    // TODO: Implement file saving logic
    println!("Saving transcription to: {}", file_path);
    println!("Text: {}", text);
    
    // Update state
    *state.0.lock().unwrap() = text;
    
    Ok(())
}

#[tauri::command]
async fn get_transcription(state: State<'_, TranscriptionState>) -> Result<String, String> {
    let transcription = state.0.lock().unwrap();
    Ok(transcription.clone())
}

fn main() {
    tauri::Builder::default()
        .manage(TranscriptionState::default())
        .invoke_handler(tauri::generate_handler![
            transcribe_audio,
            save_transcription,
            get_transcription
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 