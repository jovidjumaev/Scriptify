# Local Whisper Transcription Setup

This guide explains how to set up local Whisper transcription for Scriptify, which provides free, offline speech-to-text functionality.

## Prerequisites

- Python 3.7 or higher
- pip3 (Python package manager)
- At least 2GB of free disk space (for the Whisper model)

## Quick Setup

1. **Run the setup script:**
   ```bash
   ./setup-whisper.sh
   ```

   This script will:
   - Check if Python 3 is installed
   - Install the required Python packages
   - Set up the Whisper transcription service

2. **Start the app:**
   ```bash
   npm run tauri:dev
   ```

## Manual Setup

If the setup script doesn't work, you can install the dependencies manually:

1. **Navigate to the Python directory:**
   ```bash
   cd src-tauri/python
   ```

2. **Install the required packages:**
   ```bash
   pip3 install openai-whisper>=20231117 torch>=2.0.0 numpy>=1.21.0
   ```

## How It Works

### Local Whisper Service
- Uses the open-source Whisper model from OpenAI
- Runs entirely on your local machine (no internet required after setup)
- Supports multiple languages and audio formats
- Speed depends on your machine's GPU/CPU

### Model Sizes
The app uses the "base" model by default, which provides a good balance of speed and accuracy:
- **tiny**: Fastest, least accurate
- **base**: Good balance (default)
- **small**: Better accuracy, slower
- **medium**: High accuracy, slower
- **large**: Best accuracy, slowest

### Supported Audio Formats
- MP3, WAV, M4A, OGG
- Any format that Whisper supports

## Troubleshooting

### Python Not Found
```bash
# Install Python 3 on macOS
brew install python3

# Install Python 3 on Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip
```

### Torch Installation Issues
```bash
# Install PyTorch with CUDA support (if you have an NVIDIA GPU)
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install PyTorch for CPU only
pip3 install torch torchvision torchaudio
```

### Whisper Model Download Issues
The first transcription will download the Whisper model (~1GB). If it fails:
1. Check your internet connection
2. Ensure you have enough disk space
3. Try running the transcription again

### Performance Tips
- **GPU**: If you have an NVIDIA GPU, install PyTorch with CUDA support for faster transcription
- **CPU**: The app works fine on CPU, just slower
- **Model Size**: Use "tiny" model for faster transcription, "large" for better accuracy

## Fallback Behavior

If local Whisper is not available, the app will automatically fall back to the mock transcription service for testing purposes.

## API Integration

The local Whisper service is designed to be a drop-in replacement for paid APIs. You can easily switch between:
- Local Whisper (free, offline)
- OpenAI Whisper API (paid, online)
- Azure Speech Service (paid, online)

## Development

### Testing Local Whisper
```bash
# Test the Python script directly
cd src-tauri/python
python3 whisper_transcribe.py --audio-path /path/to/audio.mp3 --language en
```

### Customizing the Model
Edit `src-tauri/python/whisper_transcribe.py` to change the default model size or add custom options.

## License

This implementation uses the open-source Whisper model, which is licensed under the MIT License. 