import React, { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Trash2, 
  Languages, 
  Check,
  AlertCircle,
  Play,
  Pause,
  FileAudio,
  Zap,
  Sparkles,
  Settings
} from 'lucide-react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
// Remove: import { useAppStore } from '../stores/useAppStore'
import ProgressBar from './ProgressBar'
import toast from 'react-hot-toast'

interface AudioRecorderProps {
  onTranscriptionUpdate: (text: string) => void
}

const AnimatedWaveform = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex items-end h-8 space-x-1 w-24 mx-auto">
    {[1,2,3,4,5,6,7,8,9,10].map((bar, i) => (
      <motion.div
        key={i}
        className="w-1 rounded bg-gradient-to-t from-indigo-500 to-purple-400"
        animate={{
          height: isPlaying ? [8, 32, 12, 28, 10, 24, 16, 32, 8, 20][i % 10] : 8
        }}
        transition={{
          repeat: Infinity,
          duration: 1 + (i % 3) * 0.2,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        style={{ minHeight: 8 }}
      />
    ))}
  </div>
)

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptionUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  // Remove: const { clearTranscription, audioQuality, inputDevice } = useAppStore()
  
  const {
    audioBlob,
    audioUrl,
    transcription,
    isTranscribing,
    error,
    progress,
    progressMessage,
    transcribeAudio,
    uploadAudioFile,
    clearRecording,
  } = useAudioRecorder()

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      // clearTranscription() // This line was removed from the new_code, so it's removed here.
      await uploadAudioFile(file)
      toast.success('Audio file uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload audio file')
    }
  }, [uploadAudioFile]) // This line was removed from the new_code, so it's removed here.

  const handleTranscribe = useCallback(async (language: string = 'auto') => {
    try {
      // clearTranscription() // This line was removed from the new_code, so it's removed here.
      await transcribeAudio(language)
    } catch (error) {
      toast.error('Transcription failed')
    }
  }, [transcribeAudio]) // This line was removed from the new_code, so it's removed here.

  const handlePlayAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress(
        (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100
      )
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find(file => file.type.startsWith('audio/'))
    
    if (audioFile) {
      handleFileUpload(audioFile)
    } else {
      toast.error('Please drop an audio file')
    }
  }

  // Handle transcription completion
  React.useEffect(() => {
    if (transcription && !isTranscribing) {
      onTranscriptionUpdate(transcription)
      toast.success('Transcription completed')
    }
  }, [transcription, isTranscribing, onTranscriptionUpdate])

  // Error handling
  React.useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Reset progress on new audio
  React.useEffect(() => {
    setAudioProgress(0)
    setIsPlaying(false)
  }, [audioUrl])

  return (
    <div className="flex flex-col h-full w-full gap-y-8 transition-all duration-300">
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass border-red-500/20 bg-red-500/10 rounded-xl p-4"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card with fixed width and improved alignment */}
      <div className="w-96 flex flex-col items-center gap-y-4 p-0 mx-auto overflow-visible">
        {/* Upload Card */}
        <div className="flex flex-col items-center w-full justify-center">
          <motion.div
            className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-300 glass-dark max-w-xs mx-auto flex flex-col items-center justify-center ${
              isDragging 
                ? 'border-indigo-400 bg-indigo-500/20 scale-105' 
                : 'border-border-secondary hover:border-border-primary hover:bg-bg-secondary/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated Upload Icon */}
            <motion.div
              animate={isDragging ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <Upload className="w-10 h-10 text-indigo-300" />
              </motion.div>
            </motion.div>
            <h3 className="text-base font-semibold text-text-primary mb-2 truncate w-full">Drop audio files here</h3>
            <p className="text-xs text-text-secondary mb-2 break-words w-full">Supports MP3, WAV, M4A, and other audio formats</p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 16px #a78bfa' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary flex items-center space-x-2 mx-auto text-xs px-3 py-2 max-w-full truncate"
              aria-label="Choose audio file"
            >
              <Upload className="w-4 h-4" />
              <span className="truncate">Choose Audio File</span>
            </motion.button>
            {/* Drag overlay */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-500/30 rounded-2xl z-10 pointer-events-none"
                >
                  <Sparkles className="w-10 h-10 text-white mb-2 animate-bounce" />
                  <span className="text-lg font-bold text-white">Drop to upload</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileUpload(file)
              }
            }}
            className="hidden"
          />
        </div>

        {/* Audio File Loaded State */}
        <AnimatePresence>
          {audioBlob && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col w-full max-w-xs mx-auto bg-bg-secondary/80 rounded-2xl px-5 py-3 mt-3 mb-3 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileAudio className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-base text-text-primary font-semibold truncate">Audio loaded</span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlayAudio}
                    className={`rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isPlaying ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-bg-secondary/70 text-indigo-300 hover:bg-indigo-500/30'}`}
                    aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearRecording}
                    className="rounded-full bg-red-500 text-white p-2 text-base focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="Clear audio file"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              
              {/* Audio Quality Display */}
              {/* This section was removed from the new_code, so it's removed here. */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Divider */}
        <div className="flex items-center space-x-4 my-2">
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/30 to-transparent" />
          <span className="text-xs text-text-secondary uppercase tracking-widest">Step 2</span>
          <div className="flex-1 h-px bg-gradient-to-l from-indigo-500/30 to-transparent" />
        </div>

        {/* Transcription Controls */}
        <AnimatePresence>
          {audioBlob && !isTranscribing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-3 w-full"
            >
              <div className="text-center">
                <h3 className="text-base font-semibold text-text-primary mb-1">Ready to Transcribe</h3>
                <p className="text-xs text-text-secondary">Choose your preferred language or use auto-detection</p>
              </div>
              <div className="flex flex-col items-center justify-center w-full">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 12px #a78bfa' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTranscribe()}
                  disabled={isTranscribing}
                  className="btn-primary flex items-center justify-center space-x-2 text-sm px-4 py-2 shadow-md w-48 max-w-xs truncate"
                  aria-label="Auto Transcribe"
                >
                  <Zap className="w-4 h-4 animate-pulse-slow" />
                  <span className="truncate">Auto Transcribe</span>
                </motion.button>
                <div className="flex items-center space-x-2 w-48 max-w-xs justify-center mt-5">
                  <Languages className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <span className="text-xs text-text-secondary flex-shrink-0">Language:</span>
                  <div className="relative w-40">
                    <select
                      onChange={(e) => handleTranscribe(e.target.value)}
                      className="appearance-none bg-bg-secondary/70 border border-border-secondary rounded-lg px-3 py-2 text-xs text-text-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full pr-8 min-w-[8rem]"
                      aria-label="Select transcription language"
                      title="Select the language for transcription. Default is auto-detect."
                    >
                      <option value="auto">Auto-detect</option>
                      <option value="en">English</option>
                      <option value="ko">Korean</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-text-secondary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <AnimatePresence>
          {isTranscribing && (
            <ProgressBar 
              progress={progress} 
              message={progressMessage}
              isComplete={progress === 100}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AudioRecorder 