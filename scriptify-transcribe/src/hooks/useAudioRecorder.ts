import { useState, useRef, useCallback } from 'react'
import { createTranscriptionService, TranscriptionRequest } from '../services/transcriptionService'

interface UseAudioRecorderReturn {
  isRecording: boolean
  isPaused: boolean
  recordingTime: number
  audioBlob: Blob | null
  audioUrl: string | null
  transcription: string
  isTranscribing: boolean
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  clearRecording: () => void
  transcribeAudio: (language?: string) => Promise<void>
  uploadAudioFile: (file: File) => void
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcription, setTranscription] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setRecordingTime(elapsed)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder

      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setIsRecording(false)
        setIsPaused(false)
        stopTimer()
      }

      mediaRecorder.onpause = () => {
        setIsPaused(true)
        stopTimer()
      }

      mediaRecorder.onresume = () => {
        setIsPaused(false)
        startTimer()
      }

      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setIsPaused(false)
      startTimer()
    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.')
      console.error('Recording error:', err)
    }
  }, [startTimer, stopTimer])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [isRecording])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
    }
  }, [isRecording, isPaused])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
    }
  }, [isRecording, isPaused])

  const clearRecording = useCallback(() => {
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    setAudioBlob(null)
    setTranscription('')
    setError(null)
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    stopTimer()
    chunksRef.current = []
  }, [isRecording, audioUrl, stopTimer])

  const transcribeAudio = useCallback(async (language: string = 'auto') => {
    if (!audioBlob) {
      setError('No audio to transcribe')
      return
    }

    setIsTranscribing(true)
    setError(null)

    try {
      // Try to use local whisper service
      const { createLocalWhisperService } = await import('../services/transcriptionService')
      const transcriptionService = await createLocalWhisperService()
      
      const request: TranscriptionRequest = {
        audioBlob: audioBlob,
        language: language === 'auto' ? undefined : language,
        model: 'base'
      }
      
      const response = await transcriptionService.transcribe(request)
      setTranscription(response.text)
    } catch (err) {
      setError('Transcription failed. Please try again.')
      console.error('Transcription error:', err)
    } finally {
      setIsTranscribing(false)
    }
  }, [audioBlob])

  const uploadAudioFile = useCallback((file: File) => {
    setError(null)
    setAudioBlob(file)
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    setTranscription('')
    
    // Estimate duration for uploaded files
    const audio = new Audio(url)
    audio.addEventListener('loadedmetadata', () => {
      setRecordingTime(Math.floor(audio.duration))
    })
  }, [])

  return {
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
  }
} 