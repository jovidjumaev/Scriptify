import { useState, useCallback, useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'

interface AudioRecorderState {
  audioBlob: Blob | null
  audioUrl: string | null
  transcription: string
  isTranscribing: boolean
  error: string | null
  progress: number
  progressMessage: string
}

interface TranscriptionRequest {
  audioBlob: Blob
  language?: string
  model?: string
}

interface ProgressUpdate {
  step: string
  progress: number
  message: string
}

interface UseAudioRecorderReturn extends AudioRecorderState {
  clearRecording: () => void
  transcribeAudio: (language?: string) => Promise<void>
  uploadAudioFile: (file: File) => Promise<void>
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  
  const [state, setState] = useState<AudioRecorderState>({
    audioBlob: null,
    audioUrl: null,
    transcription: '',
    isTranscribing: false,
    error: null,
    progress: 0,
    progressMessage: '',
  })

  // Listen for progress updates from Tauri backend
  useEffect(() => {
    let unlisten: (() => void) | undefined

    const setupProgressListener = async () => {
      try {
        unlisten = await listen<ProgressUpdate>('transcription-progress', (event) => {
          const { step, progress, message } = event.payload
          setState(prev => ({
            ...prev,
            progress,
            progressMessage: message,
          }))
        })
      } catch (error) {
        console.warn('Failed to setup progress listener:', error)
      }
    }

    setupProgressListener()

    return () => {
      if (unlisten) {
        unlisten()
      }
    }
  }, [])

  const clearRecording = useCallback(() => {
    setState(prev => ({
      ...prev,
      audioBlob: null,
      audioUrl: null,
      transcription: '',
      error: null,
      progress: 0,
      progressMessage: '',
    }))
  }, [])

  const uploadAudioFile = useCallback(async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        throw new Error('Please select an audio file')
      }

      // Create blob and URL
      const blob = new Blob([file], { type: file.type })
      const url = URL.createObjectURL(blob)

      setState(prev => ({
        ...prev,
        audioBlob: blob,
        audioUrl: url,
        transcription: '',
        error: null,
        progress: 0,
        progressMessage: '',
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to upload audio file',
      }))
      throw error
    }
  }, [])

  const transcribeAudio = useCallback(async (language?: string) => {
    if (!state.audioBlob) {
      setState(prev => ({ ...prev, error: 'No audio to transcribe' }))
      return
    }

    setState(prev => ({ 
      ...prev, 
      isTranscribing: true, 
      error: null,
      progress: 0,
      progressMessage: 'Initializing transcription...'
    }))

    try {
      // Use language from parameter or fallback to store setting
      const languageToUse = language || 'en' // Default to 'en'
      
      // Try to use local Whisper service, fallback to web service
      let transcriptionService
      try {
        const { createLocalWhisperService } = await import('../services/transcriptionService')
        transcriptionService = await createLocalWhisperService()
      } catch (error) {
        console.warn('Local Whisper not available, using web service')
        const { WebWhisperService } = await import('../services/webWhisperService')
        transcriptionService = new WebWhisperService()
      }
      
      const request: TranscriptionRequest = {
        audioBlob: state.audioBlob,
        language: languageToUse,
        model: 'whisper-1', // Default model
      }

      const response = await transcriptionService.transcribe(request)
      
      setState(prev => ({
        ...prev,
        transcription: response.text,
        isTranscribing: false,
        error: null,
        progress: 100,
        progressMessage: 'Transcription completed!',
      }))
    } catch (error) {
      console.error('Transcription error:', error)
      setState(prev => ({
        ...prev,
        isTranscribing: false,
        error: error instanceof Error ? error.message : 'Transcription failed',
        progress: 0,
        progressMessage: '',
      }))
      throw error
    }
  }, [state.audioBlob])

  return {
    ...state,
    clearRecording,
    transcribeAudio,
    uploadAudioFile,
  }
} 