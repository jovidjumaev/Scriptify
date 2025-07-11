import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'

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
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {isComplete ? 'Transcription Complete!' : 'Transcribing Audio'}
          </h3>
          <p className="text-sm text-text-secondary truncate">{message}</p>
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
      <div className="relative">
        <div className="w-full bg-bg-secondary/30 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
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
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
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