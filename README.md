# Scriptify - AI-Powered Audio Transcription Tool

A modern, open-source desktop application for high-quality audio transcription using Whisper AI. Built with Tauri, React, and TypeScript for cross-platform compatibility.

## About This Project

I created this app during my internship in Seoul, South Korea. Since I didn't speak Korean, I needed a solution to transcribe and later translate my company meetings. This open-source tool was born from that practical need - allowing me to record meetings and get accurate transcriptions that I could then translate to understand what was discussed.

Currently, Scriptify supports English and Korean transcription, with plans to expand to more languages in the future.

## Features

- 🎤 **High-Quality Transcription**: Powered by OpenAI's Whisper model for accurate speech-to-text conversion
- 🌍 **Multi-Language Support**: Currently supports English and Korean (more languages coming soon)
- 💻 **Cross-Platform**: Works on Windows, macOS, and Linux
- 🎨 **Modern UI**: Beautiful, responsive interface with dark/light theme support
- 📁 **File Export**: Export transcriptions in multiple formats (TXT, DOCX, PDF, SRT, VTT)
- 🔄 **Real-time Progress**: Live progress tracking during transcription
- 📊 **Statistics**: Word count, character count, and estimated reading time
- 🎵 **Audio Playback**: Built-in audio player for uploaded files

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+ with pip
- Rust (for Tauri development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/scriptify.git
   cd scriptify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Python environment**
   ```bash
   # Create virtual environment
   python3 -m venv scriptify-env
   source scriptify-env/bin/activate  # On Windows: scriptify-env\Scripts\activate
   
   # Install Python dependencies
   pip install -r src-tauri/python/requirements.txt
   ```

4. **Run the application**
   ```bash
   npm run tauri dev
   ```

## Usage

1. **Upload Audio**: Drag and drop audio files or click to browse
2. **Select Language**: Choose between English, Korean, or auto-detect
3. **Start Transcription**: Click "Auto Transcribe" to begin
4. **View Results**: See real-time progress and final transcription
5. **Export**: Save your transcription in various formats

## Supported Audio Formats

- MP3, WAV, M4A, FLAC, and other common audio formats
- Maximum file size: 25MB (for optimal performance)

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenAI Whisper](https://github.com/openai/whisper) for the transcription model
- [Tauri](https://tauri.app/) for the desktop framework
- [React](https://reactjs.org/) for the UI framework
- [Framer Motion](https://www.framer.com/motion/) for animations

## Roadmap

- [ ] Support for more languages (Japanese, Chinese, Spanish, etc.)
- [ ] Translation features
- [ ] Cloud sync capabilities
- [ ] Batch processing
- [ ] Advanced audio editing
- [ ] Speaker identification
- [ ] Custom model training

---

Made with ❤️ for the open-source community 