import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'

interface ProgressBarProps {
  progress: number
  message: string
  isComplete?: boolean
}

// 단계명 추출 함수
function extractStage(message: string, isComplete: boolean): string {
  if (isComplete) return 'Complete';
  if (message.toLowerCase().includes('initializing')) return 'Initializing';
  if (message.toLowerCase().includes('loading whisper model')) return 'Loading Model';
  if (message.toLowerCase().includes('preparing audio')) return 'Preparing Audio';
  if (message.toLowerCase().includes('chunking audio')) return 'Chunking Audio';
  if (message.toLowerCase().includes('transcribing')) return 'Transcribing';
  if (message.toLowerCase().includes('formatting')) return 'Formatting';
  if (message.toLowerCase().includes('completed')) return 'Complete';
  return 'Processing';
}

const stageColors: Record<string, string> = {
  'Initializing': 'from-blue-400 to-blue-600',
  'Loading Model': 'from-indigo-500 to-purple-500',
  'Preparing Audio': 'from-cyan-500 to-blue-400',
  'Chunking Audio': 'from-pink-500 to-fuchsia-500',
  'Transcribing': 'from-amber-500 to-orange-500',
  'Formatting': 'from-green-400 to-emerald-500',
  'Complete': 'from-green-500 to-emerald-500',
  'Processing': 'from-gray-400 to-gray-600',
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message, isComplete = false }) => {
  const percent = Math.round(progress)
  const stage = extractStage(message, isComplete)
  const colorClass = stageColors[stage] || 'from-indigo-500 to-purple-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-4/5 mx-auto glass rounded-2xl p-6 shadow-lg"
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
    >
      {/* 단계명 강조 */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-shrink-0">
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <CheckCircle className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-2xl flex items-center justify-center shadow-lg`}
            >
              <Loader2 className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {/* 단계명 */}
          <h3 className={`text-lg font-bold tracking-wide bg-gradient-to-r ${colorClass} bg-clip-text text-transparent drop-shadow-sm`}>
            {stage}
          </h3>
          {/* 보조 메시지 */}
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        </div>
        <div className="text-right min-w-[80px]">
          <motion.span 
            className="text-3xl font-bold text-gradient"
            style={{ WebkitTextStroke: '1px var(--bg-primary)' }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {percent}%
          </motion.span>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-bg-secondary/30 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${colorClass} rounded-full shadow`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        {/* Progress Steps */}
        <div className="flex justify-between mt-2">
          {[0, 25, 50, 75, 100].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                percent >= step 
                  ? `bg-gradient-to-r ${colorClass}`
                  : 'bg-text-muted/30'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default ProgressBar 