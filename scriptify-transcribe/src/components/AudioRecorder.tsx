import React, { useRef, useEffect, useState } from 'react'
import { Mic, MicOff, Play, Pause, Square, Upload, Trash2, Languages, Check } from 'lucide-react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'

interface AudioRecorderProps {
  onTranscriptionUpdate: (text: string) => void
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptionUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isFromRecording, setIsFromRecording] = useState(false)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    transcription,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    transcribeAudio,
    uploadAudioFile,
  } = useAudioRecorder()

  // Real waveform visualization using mic input
  useEffect(() => {
    let animationId: number | null = null
    let dataArray: Uint8Array | null = null
    let analyser: AnalyserNode | null = null
    let audioContext: AudioContext | null = null
    let source: MediaStreamAudioSourceNode | null = null

    async function setupAnalyser() {
      if (isRecording && !isPaused && canvasRef.current) {
        audioContext = new window.AudioContext()
        audioContextRef.current = audioContext
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        source = audioContext.createMediaStreamSource(stream)
        sourceRef.current = source
        analyser = audioContext.createAnalyser()
        analyser.fftSize = 64
        source.connect(analyser)
        analyserRef.current = analyser
        dataArray = new Uint8Array(analyser.frequencyBinCount)

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const animate = () => {
          if (!isRecording || isPaused) return
          analyser!.getByteFrequencyData(dataArray!)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#3b82f6'
          const bars = dataArray!.length
          const barWidth = canvas.width / bars
          for (let i = 0; i < bars; i++) {
            const barHeight = (dataArray![i] / 255) * canvas.height
            const x = i * barWidth
            const y = (canvas.height - barHeight) / 2
            ctx.fillRect(x, y, barWidth - 2, barHeight)
          }
          setAudioLevel(Math.max(...dataArray!))
          animationId = requestAnimationFrame(animate)
        }
        animate()
      }
    }
    setupAnalyser()
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect()
        analyserRef.current = null
      }
    }
  }, [isRecording, isPaused])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadAudioFile(file)
      setIsFromRecording(false)
    }
  }

  const handleTranscribe = async (language: string = 'auto') => {
    await transcribeAudio(language)
    if (transcription) {
      onTranscriptionUpdate(transcription)
    }
  }

  const handlePlayAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
    }
  }

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const handleSubmitRecording = () => {
    stopRecording()
  }

  // Track if the audio is from recording or upload
  useEffect(() => {
    if (isRecording) setIsFromRecording(true)
  }, [isRecording])

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Audio Visualization */}
      {isRecording && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <canvas
            ref={canvasRef}
            width={300}
            height={60}
            className="w-full h-15 border rounded"
          />
          <div className="text-center mt-2">
            <span className="text-sm font-mono text-gray-700">
              {formatTime(recordingTime)}
            </span>
          </div>
        </div>
      )}

      {/* Recording Status */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
        <span className="text-sm text-gray-600">
          {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Ready to record'}
        </span>
        {isRecording && (
          <span className="text-sm font-mono text-gray-700">
            {formatTime(recordingTime)}
          </span>
        )}
      </div>

      {/* Main Recording Controls */}
      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={() => { startRecording(); setIsFromRecording(true); }}
            className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
            aria-label="Record"
          >
            <Mic className="w-8 h-8" />
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center transition-all duration-200"
                aria-label="Pause"
              >
                <Pause className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-200"
                aria-label="Play"
              >
                <Play className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={handleSubmitRecording}
              className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all duration-200"
              aria-label="Submit Recording"
            >
              <Check className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* File Upload - Always Show */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Audio</span>
          </button>
          {(audioBlob || isRecording) && (
            <button
              onClick={clearRecording}
              className="btn-secondary flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Audio Playback */}
      {audioUrl && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Audio Playback</h4>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handlePlayAudio}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handlePauseAudio}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Pause className="w-4 h-4 text-gray-600" />
            </button>
            <audio ref={audioRef} src={audioUrl} className="hidden" />
          </div>
          {/* Transcribe Button - Show for both recorded and uploaded audio */}
          {audioBlob && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => handleTranscribe()}
                disabled={isTranscribing}
                className="btn-primary w-full max-w-xs flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTranscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transcribing...</span>
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4" />
                    <span>Transcribe</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Audio Info */}
      {audioBlob && (
        <div className="border-t pt-4">
          <div className="text-xs text-gray-500 space-y-1">
            <p>File size: {Math.round(audioBlob.size / 1024)}KB</p>
            <p>Duration: {recordingTime > 0 ? formatTime(recordingTime) : 'Unknown'}</p>
            <p>Format: {audioBlob.type || 'Unknown'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioRecorder 