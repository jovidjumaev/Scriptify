# Scriptify Transcribe

An open-source, free speech transcription tool with advanced features built with Tauri, React, and TypeScript.

## 🚀 Features

- **Real-time Transcription**: Live speech-to-text conversion
- **Multi-language Support**: Support for multiple languages with auto-detection
- **Advanced Editing**: Rich text editing with AI-powered suggestions
- **Multiple Export Formats**: Export to TXT, DOCX, PDF, SRT, and VTT
- **Cloud Sync**: Version history and cloud synchronization
- **Collaborative Editing**: Real-time collaborative transcription editing
- **Custom Voice Models**: Train and use custom voice recognition models
- **Privacy-First**: Local processing options and encrypted storage
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Rust (Tauri)
- **UI Components**: Lucide React Icons
- **Build Tool**: Vite
- **Package Manager**: npm

## 📦 Installation

### Prerequisites

- Node.js 18+ or Bun
- Rust (latest stable version)
- Tauri CLI

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scriptify-transcribe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Tauri CLI**
   ```bash
   npm install -g @tauri-apps/cli
   ```

4. **Run in development mode**
   ```bash
   npm run tauri:dev
   ```

## 🏗️ Development

### Project Structure

```
scriptify-transcribe/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── src-tauri/             # Tauri backend
│   ├── src/               # Rust source code
│   └── Cargo.toml         # Rust dependencies
├── dist/                  # Build output
└── package.json           # Node.js dependencies
```

### Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build frontend for production
- `npm run tauri:dev` - Start Tauri development mode
- `npm run tauri:build` - Build desktop application

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Basic UI framework
- [x] Audio recording interface
- [x] Transcription display
- [x] Settings panel

### Phase 2: Advanced Features 🚧
- [ ] Real-time transcription with OpenAI Whisper
- [ ] Multiple export formats
- [ ] Advanced editing interface
- [ ] File management system

### Phase 3: Collaboration Features 📋
- [ ] Real-time collaborative editing
- [ ] Comments and annotations
- [ ] Version control
- [ ] Team workspaces

### Phase 4: AI Enhancements 📋
- [ ] Speaker diarization
- [ ] Emotion detection
- [ ] Keyword extraction
- [ ] Custom vocabulary training

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Vibe](https://github.com/thewh1teagle/vibe)
- Built with [Tauri](https://tauri.app/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/scriptify-transcribe/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/scriptify-transcribe/discussions)
- **Email**: support@scriptify-transcribe.com

## 🔗 Links

- **Website**: [scriptify-transcribe.com](https://scriptify-transcribe.com)
- **Documentation**: [docs.scriptify-transcribe.com](https://docs.scriptify-transcribe.com)
- **Download**: [Releases](https://github.com/your-username/scriptify-transcribe/releases)

---

Made with ❤️ by the Scriptify Team 