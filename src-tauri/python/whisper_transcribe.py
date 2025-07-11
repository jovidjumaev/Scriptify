#!/usr/bin/env python3
"""
Local Whisper Transcription Service
Uses the open-source Whisper model for free, offline transcription.
"""

import sys
import json
import argparse
import tempfile
import os
import warnings
from pathlib import Path
import whisper
import torch
from tqdm import tqdm
import numpy as np
import soundfile as sf
import subprocess

def transcribe_audio(audio_path, language=None, model_size="base", chunk_length=30):
    try:
        # Suppress Whisper warnings to prevent interference with progress bars
        warnings.filterwarnings("ignore", category=UserWarning, module="whisper")
        
        # Use stderr for progress output so it doesn't interfere with JSON output on stdout
        steps = ["Loading Whisper model", "Preparing audio", "Chunking audio", "Transcribing chunks", "Formatting result"]
        pbar = tqdm(steps, desc="Progress", unit="step", file=sys.stderr, leave=False)
        
        # Step 1: Load model
        pbar.set_description("Loading Whisper model")
        model = whisper.load_model(model_size)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        pbar.update(1)

        # Step 2: Prepare audio (convert to wav if needed)
        pbar.set_description("Preparing audio")
        orig_audio_path = audio_path
        if not audio_path.lower().endswith('.wav'):
            wav_path = audio_path + '.converted.wav'
            # Suppress ffmpeg output
            subprocess.run([
                'ffmpeg', '-y', '-i', audio_path, '-ar', '16000', '-ac', '1', wav_path
            ], check=True, capture_output=True)
            audio_path = wav_path
        audio, sr = sf.read(audio_path)
        duration = len(audio) / sr
        pbar.update(1)

        # Step 3: Chunking audio
        pbar.set_description("Chunking audio")
        chunk_samples = int(chunk_length * sr)
        num_chunks = int(np.ceil(len(audio) / chunk_samples))
        pbar.update(1)

        # Step 4: Transcribing chunks
        all_segments = []
        all_text = []
        chunk_pbar = tqdm(range(num_chunks), desc="Transcribing chunks", unit="chunk", file=sys.stderr, leave=False)
        for i in chunk_pbar:
            start_sample = i * chunk_samples
            end_sample = min((i + 1) * chunk_samples, len(audio))
            chunk_audio = audio[start_sample:end_sample]
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=True) as tmp:
                sf.write(tmp.name, chunk_audio, sr)
                if language and language != "auto":
                    result = model.transcribe(tmp.name, language=language)
                else:
                    result = model.transcribe(tmp.name)
                if "segments" in result:
                    for segment in result["segments"]:
                        all_segments.append({
                            "start": segment["start"] + i * chunk_length,
                            "end": segment["end"] + i * chunk_length,
                            "text": segment["text"].strip()
                        })
                all_text.append(result["text"].strip())
        pbar.update(1)

        # Step 5: Formatting result
        pbar.set_description("Formatting result")
        transcription_result = {
            "text": " ".join(all_text).strip(),
            "confidence": 0.9,
            "language": language or "auto",
            "segments": all_segments
        }
        pbar.update(1)
        pbar.close()
        chunk_pbar.close()
        return transcription_result
    except Exception as e:
        error_result = {
            "error": str(e),
            "text": "",
            "confidence": 0.0,
            "language": language or "auto",
            "segments": []
        }
        return error_result

def main():
    """Main function to handle command line arguments and transcription."""
    parser = argparse.ArgumentParser(description="Local Whisper Transcription")
    parser.add_argument("--audio-path", required=True, help="Path to audio file")
    parser.add_argument("--language", default="auto", help="Language code (auto for auto-detect)")
    parser.add_argument("--model-size", default="base", 
                       choices=["tiny", "base", "small", "medium", "large"],
                       help="Whisper model size")
    
    args = parser.parse_args()
    
    # Check if audio file exists
    if not os.path.exists(args.audio_path):
        error_result = {
            "error": f"Audio file not found: {args.audio_path}",
            "text": "",
            "confidence": 0.0,
            "language": args.language,
            "segments": []
        }
        print(json.dumps(error_result))
        sys.exit(1)
    
    # Perform transcription
    result = transcribe_audio(args.audio_path, args.language, args.model_size)
    
    # Output result as JSON to stdout
    print(json.dumps(result))

if __name__ == "__main__":
    main() 