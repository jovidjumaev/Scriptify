# Whisper Web Server Setup

This setup allows your web browser version to use real Whisper transcription, just like the desktop app!

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
# Make sure you're in your virtual environment
source scriptify-env/bin/activate

# Run the setup script
python setup_whisper_server.py
```

### 2. Start the Whisper Web Server
```bash
# In your virtual environment
python whisper_server.py
```

You should see:
```
Loading Whisper model...
Whisper model loaded successfully!
Starting Whisper Web Server...
Server will be available at http://localhost:8000
```

### 3. Test the Server
```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status": "healthy", "model": "whisper-base"}
```

## 🎯 How It Works

1. **Web App** → Sends audio to `http://localhost:8000/transcribe`
2. **Whisper Server** → Runs your Python Whisper script
3. **Real Transcription** → Returns actual transcribed text

## 📋 Usage

### Start Both Servers

**Terminal 1 - Whisper Server:**
```bash
source scriptify-env/bin/activate
python whisper_server.py
```

**Terminal 2 - Web App:**
```bash
npm run dev
```

### Use the Web App

1. Open `http://localhost:1420` in your browser
2. Upload an audio file
3. Get **real Whisper transcription**! 🎉

## 🔧 Troubleshooting

### Port 8000 Already in Use
```bash
# Kill any process using port 8000
lsof -ti:8000 | xargs kill -9
```

### Flask Not Found
```bash
# Install Flask manually
pip install flask flask-cors
```

### Whisper Model Download Issues
```bash
# Clear cache and retry
rm -rf ~/.cache/whisper
python whisper_server.py
```

## 🎉 Benefits

- ✅ **Real transcription** in web browser
- ✅ **Same Whisper model** as desktop app
- ✅ **No API keys** required
- ✅ **Works offline** (after model download)
- ✅ **Cross-platform** compatibility

## 🔄 Alternative: Desktop App

If you prefer, you can still use the desktop app which has the same Whisper functionality built-in:

```bash
npm run tauri:dev
```

Both versions now provide real Whisper transcription! 🎯 