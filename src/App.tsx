import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  FileText, 
  Moon, 
  Sun, 
  Monitor,
  Plus,
  Trash2,
  Menu,
  X,
  Mic,
  MicOff,
  Play,
  Pause,
  Download,
  Copy,
  Edit3,
  Check,
  Sparkles,
  Zap,
  Headphones
} from 'lucide-react'
import TranscriptionPanel from './components/TranscriptionPanel'
import AudioRecorder from './components/AudioRecorder'
import SettingsPanel from './components/SettingsPanel'
import { SettingsProvider } from './contexts/SettingsContext'
import { useAppStore } from './stores/useAppStore'
import { Toaster } from 'react-hot-toast'

function App() {
  const [transcription, setTranscription] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  
  const { 
    sessions, 
    currentSessionId, 
    createSession, 
    updateSession, 
    deleteSession, 
    setCurrentSession 
  } = useAppStore()

  const handleTranscriptionUpdate = (text: string) => {
    setTranscription(text)
    if (currentSessionId) {
      updateSession(currentSessionId, { transcription: text })
    }
  }

  const handleNewSession = () => {
    createSession('New Session')
    setShowSidebar(false)
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    document.documentElement.classList.remove('light', 'dark')
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      document.documentElement.classList.add(systemTheme)
    } else {
      document.documentElement.classList.add(newTheme)
    }
  }

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'dark'
    handleThemeChange(savedTheme)
  }, [])

  useEffect(() => {
    // Auto-save transcription
    if (transcription && currentSessionId) {
      const timeoutId = setTimeout(() => {
        updateSession(currentSessionId, { transcription })
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [transcription, currentSessionId, updateSession])

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float"></div>
        </div>

        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              backdropFilter: 'blur(20px)',
            },
          }}
        />

        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 glass border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="btn-ghost lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center glow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Scriptify</h1>
                    <p className="text-sm text-slate-400">AI Transcription Studio</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <div className="glass rounded-xl p-1">
                  {[
                    { icon: Sun, value: 'light', label: 'Light' },
                    { icon: Monitor, value: 'system', label: 'System' },
                    { icon: Moon, value: 'dark', label: 'Dark' },
                  ].map(({ icon: Icon, value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleThemeChange(value as any)}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        theme === value 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                      title={label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className="btn-ghost"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex h-screen pt-20">
          {/* Sidebar */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ x: -400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -400, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-96 glass border-r border-white/10 shadow-2xl lg:relative lg:translate-x-0"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-gradient">Sessions</h2>
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="btn-ghost lg:hidden"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNewSession}
                      className="w-full mb-6 btn-primary flex items-center justify-center space-x-3"
                    >
                      <Plus className="w-5 h-5" />
                      <span>New Session</span>
                    </motion.button>
                    
                    <div className="space-y-3">
                      {sessions.map((session: any) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.02 }}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                            currentSessionId === session.id
                              ? 'glass bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/50 glow'
                              : 'glass-dark hover:glass-hover'
                          } border`}
                          onClick={() => setCurrentSession(session.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate text-slate-100">{session.title}</h3>
                              <p className="text-sm text-slate-400 truncate mt-1">
                                {session.transcription || 'No transcription yet'}
                              </p>
                              <p className="text-xs text-slate-500 mt-2">
                                {new Date(session.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation()
                                deleteSession(session.id)
                              }}
                              className="btn-danger p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full max-w-7xl mx-auto">
                {/* Left Panel - Recording Controls */}
                <div className="xl:col-span-1">
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="card h-[800px]"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Mic className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-100">Audio Uploader</h2>
                        <p className="text-sm text-slate-400">Upload or drop audio files</p>
                      </div>
                    </div>
                    
                    <AudioRecorder onTranscriptionUpdate={handleTranscriptionUpdate} />
                  </motion.div>
                </div>

                {/* Right Panel - Transcription */}
                <div className="xl:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="h-[800px]"
                  >
                    <TranscriptionPanel
                      transcription={transcription}
                      onTranscriptionUpdate={handleTranscriptionUpdate}
                    />
                  </motion.div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <SettingsPanel onClose={() => setShowSettings(false)} />
          )}
        </AnimatePresence>

        {/* Overlay for mobile sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </SettingsProvider>
  )
}

export default App