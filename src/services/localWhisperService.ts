import { invoke } from '@tauri-apps/api/tauri'
import { TranscriptionRequest, TranscriptionResponse } from './transcriptionService'

export interface LocalWhisperRequest {
  audio_data: number[] // Audio data as bytes
  language?: string
}

export interface LocalWhisperResponse {
  text: string
  confidence: number
  language?: string
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
  error?: string
}

export class LocalWhisperService {
  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    try {
      // Check if Tauri is available
      if (typeof window === 'undefined' || typeof window.__TAURI_IPC__ !== 'function') {
        throw new Error('Tauri runtime not available. This service only works in the Tauri desktop app.')
      }
      
      // Convert Blob to Uint8Array
      const arrayBuffer = await request.audioBlob.arrayBuffer()
      const audioData = Array.from(new Uint8Array(arrayBuffer))
      
      // Call the Tauri backend using the imported invoke function
      const response: LocalWhisperResponse = await invoke('transcribe_audio', {
        request: {
          audio_data: audioData,
          language: request.language,
        },
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return {
        text: response.text,
        confidence: response.confidence,
        language: response.language,
        segments: response.segments,
      }
    } catch (error) {
      console.error('Local Whisper transcription error:', error)
      throw new Error(`Failed to transcribe audio with local Whisper: ${error}`)
    }
  }
} 