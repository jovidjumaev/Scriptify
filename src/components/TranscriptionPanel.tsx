import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Copy, 
  Download, 
  FileText,
  Check,
  X,
  Edit3,
  Share2,
  BarChart3,
  Clock,
  MessageSquare,
  Sparkles,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { ExportService } from '../services/exportService'
import toast from 'react-hot-toast'

interface TranscriptionPanelProps {
  transcription: string
  onTranscriptionUpdate: (text: string) => void
}

export default function TranscriptionPanel({ transcription, onTranscriptionUpdate }: TranscriptionPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showStats, setShowStats] = useState(true)
  // Remove all references to exportFormat, language, and settings-related logic
  // Only keep core export and transcription display logic

  useEffect(() => {
    setEditText(transcription)
  }, [transcription])

  const handleSave = () => {
    onTranscriptionUpdate(editText)
    setIsEditing(false)
    toast.success('Transcription saved')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcription)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy text')
    }
  }

  const handleExport = async (format?: 'txt' | 'docx' | 'pdf' | 'srt' | 'vtt') => {
    try {
      // Use the format from settings if not specified
      // const exportFormatToUse = format || exportFormat
      
      await ExportService.exportTranscription({
        text: transcription,
        metadata: {
          title: 'Transcription',
          createdAt: new Date(),
          // language: language, // Removed language from metadata
        }
      }, {
        format: format || 'txt', // Default to txt if format is not provided
        filename: `transcription-${Date.now()}`,
      })
      toast.success(`Exported as ${format || 'txt'.toUpperCase()}`)
      setShowExportMenu(false)
    } catch (error) {
      toast.error('Export failed')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Transcription',
        text: transcription,
      })
    } else {
      handleCopy()
    }
  }

  const wordCount = transcription.split(/\s+/).filter(word => word.length > 0).length
  const charCount = transcription.length
  const estimatedReadTime = Math.ceil(wordCount / 150)

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Transcription</h2>
            <p className="text-sm text-text-secondary">View and edit your transcriptions</p>
          </div>
          {transcription && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-2 text-green-400"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Ready</span>
            </motion.div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStats(!showStats)}
            className="btn-ghost"
            title="Toggle statistics"
          >
            {showStats ? <BarChart3 className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
          </motion.button>

          {!isEditing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="btn-ghost"
              title="Edit transcription"
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="btn-ghost text-green-400"
              title="Save changes"
            >
              <Check className="w-4 h-4" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="btn-ghost"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
          
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
              title="Export transcription"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </motion.button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-64 glass border border-glass-border rounded-xl py-2 z-10 shadow-lg"
                >
                  <div className="px-4 py-2 text-xs font-medium text-text-secondary uppercase tracking-wide border-b border-glass-border">
                    Export Format
                  </div>
                  {/* Quick Export with Default Format */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleExport()}
                    className="w-full px-4 py-3 text-left text-sm text-indigo-400 hover:bg-indigo-500/10 flex items-center space-x-3 transition-colors border-b border-glass-border"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Quick Export (TXT)</span>
                  </motion.button>
                  {/* All Format Options */}
                  {[
                    { format: 'txt', label: 'Plain Text (.txt)', icon: FileText },
                    { format: 'docx', label: 'Word Document (.docx)', icon: FileText },
                    { format: 'pdf', label: 'PDF Document (.pdf)', icon: FileText },
                    { format: 'srt', label: 'SubRip Subtitles (.srt)', icon: FileText },
                    { format: 'vtt', label: 'WebVTT (.vtt)', icon: FileText },
                  ].map(({ format, label, icon: Icon }) => (
                    <motion.button
                      key={format}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleExport(format as any)}
                      className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-indigo-500/10 flex items-center space-x-3 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="btn-ghost"
            title="Share transcription"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Transcription Content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1"
            >
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-full p-6 glass rounded-2xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm text-text-primary placeholder-text-secondary"
                placeholder="Your transcription will appear here..."
                autoFocus
              />
            </motion.div>
          ) : (
            <motion.div
              key="viewing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1"
            >
              <div className="w-full h-full p-6 glass rounded-2xl overflow-y-auto">
                {transcription ? (
                  <div className="whitespace-pre-wrap text-text-primary leading-relaxed font-mono text-sm">
                    {transcription}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-6xl mb-6"
                    >
                      🎤
                    </motion.div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">No transcription yet</h3>
                    <p className="text-text-secondary">Start recording or upload an audio file to see your transcription here</p>
                    
                    <motion.div 
                      className="mt-8 flex items-center justify-center space-x-2 text-text-muted"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">AI-powered transcription</span>
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transcription Stats */}
      <AnimatePresence>
        {transcription && showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-glass-border"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div 
                className="text-center p-4 glass rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-text-primary">{wordCount}</div>
                <div className="text-sm text-text-secondary">Words</div>
              </motion.div>

              <motion.div 
                className="text-center p-4 glass rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-text-primary">{charCount}</div>
                <div className="text-sm text-text-secondary">Characters</div>
              </motion.div>

              <motion.div 
                className="text-center p-4 glass rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-text-primary">{estimatedReadTime}</div>
                <div className="text-sm text-text-secondary">Min Read</div>
              </motion.div>

              <motion.div 
                className="text-center p-4 glass rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-text-primary">AI</div>
                <div className="text-sm text-text-secondary">Powered</div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 