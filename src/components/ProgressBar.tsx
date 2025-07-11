import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, Zap, Sparkles } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

interface ProgressBarProps {
  progress: number
  message: string
  isComplete?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message, isComplete = false }) => {
  // Format progress as integer percentage
  const percent = Math.round(progress)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-4/5 mx-auto"
    >
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-shrink-0">
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center"
            >
              <CheckCircle className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center"
            >
              <Loader2 className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-100 mb-1">
            {isComplete ? 'Transcription Complete!' : 'Transcribing Audio'}
          </h3>
          <p className="text-sm text-slate-400 truncate">{message}</p>
        </div>
        <div className="text-right min-w-[80px]">
          <motion.span 
            className="text-3xl font-bold text-gradient"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {percent}%
          </motion.span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/50 rounded-full h-4 overflow-hidden backdrop-blur-sm">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
            animate={{ x: [-100, 100] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>

      {/* Progress Steps */}
      <div className="mt-6 flex flex-wrap justify-between gap-x-8 gap-y-4">
        {[
          { step: 10, label: 'Initialize', icon: Zap },
          { step: 30, label: 'Process', icon: Sparkles },
          { step: 70, label: 'Transcribe', icon: Loader2 },
          { step: 100, label: 'Complete', icon: CheckCircle },
        ].map(({ step, label, icon: Icon }) => (
          <motion.div 
            key={step}
            className={`flex flex-col items-center space-y-2 ${percent >= step ? 'text-indigo-400' : 'text-slate-500'}`}
            style={{ minWidth: 80 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: step / 100 * 0.5 }}
          >
            <motion.div 
              className={`w-3 h-3 rounded-full ${percent >= step ? 'bg-indigo-500' : 'bg-slate-600'}`}
              animate={percent >= step ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{label}</span>
          </motion.div>
        ))}
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center"
          >
            <p className="text-green-400 font-medium">🎉 Transcription completed successfully!</p>
            <p className="text-sm text-green-300 mt-1">Your audio has been processed and transcribed</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ProgressBar 