# Scriptify

![Scriptify](dist/example.png)

An AI-powered audio transcription tool built with Tauri, React, and TypeScript for cross-platform compatibility.

## About

Created during an internship in Seoul, South Korea, this tool was developed to transcribe and translate company meetings. It supports English and Korean transcription with plans to expand to more languages.

## Features

- High-quality audio transcription using Whisper AI
- Support for multiple audio formats (MP3, WAV, M4A, FLAC)
- Cross-platform compatibility (Windows, macOS, Linux)
- Real-time transcription progress
- Multiple export formats
- English and Korean language support

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+ with pip
- Rust (for Tauri development)

### Installation

1. Clone the repository
   ```bash
   git clone git@github.com:jovidjumaev/Scriptify.git
   cd Scriptify
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up Python environment
   ```bash
   python3 -m venv scriptify-env
   source scriptify-env/bin/activate
   pip install -r src-tauri/python/requirements.txt
   ```

4. Run the application
   ```bash
   npm run tauri dev
   ```

## Usage

1. Upload audio files by dragging and dropping or browsing
2. Select language (English, Korean, or auto-detect)
3. Click "Auto Transcribe" to begin
4. View real-time progress and final transcription
5. Export in various formats

## Supported Audio Formats

- MP3, WAV, M4A, FLAC, and other common formats
- Maximum file size: 25MB

## Development

### Project Structure

```
scriptify/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   └── stores/            # State management
├── src-tauri/             # Tauri backend
│   ├── src/               # Rust backend code
│   └── python/            # Python transcription service
└── dist/                  # Built application
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run tauri dev` - Run Tauri development build
- `npm run build` - Build for production
- `npm run tauri build` - Build Tauri application

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
