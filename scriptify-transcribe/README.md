# Scriptify Transcribe

![Scriptify Transcribe](dist/example.png)

An open-source speech transcription tool built with Tauri, React, and TypeScript.

## Features

- Real-time speech-to-text conversion
- Multi-language support with auto-detection
- Advanced text editing with AI-powered suggestions
- Multiple export formats (TXT, DOCX, PDF, SRT, VTT)
- Cloud synchronization and version history
- Collaborative editing capabilities
- Custom voice model training
- Privacy-first with local processing options
- Cross-platform support (Windows, macOS, Linux)

## Technology Stack

- Frontend: React 18 + TypeScript + Tailwind CSS
- Backend: Rust (Tauri)
- UI Components: Lucide React Icons
- Build Tool: Vite

## Installation

### Prerequisites

- Node.js 18+ or Bun
- Rust (latest stable version)
- Tauri CLI

### Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd scriptify-transcribe
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Install Tauri CLI
   ```bash
   npm install -g @tauri-apps/cli
   ```

4. Run in development mode
   ```bash
   npm run tauri:dev
   ```

## Development

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


## License

This project is licensed under the MIT License - see the LICENSE file for details.

