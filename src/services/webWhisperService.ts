import { TranscriptionRequest, TranscriptionResponse } from './transcriptionService'

export class WebWhisperService {
  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    try {
      // Try to use a local web server for Whisper transcription
      return await this.tryLocalWhisperServer(request)
    } catch (error) {
      console.error('Web Whisper transcription error:', error)
      throw new Error(`Failed to transcribe audio: ${error}`)
    }
  }
  
  private async tryLocalWhisperServer(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    try {
      // Convert audio blob to base64
      const base64Audio = await this.blobToBase64(request.audioBlob)
      
      // Try to connect to a local Whisper server (if running)
      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio_data: base64Audio,
          language: request.language || 'en',
          model: 'base'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Local Whisper server error: ${response.status}`)
      }
      
      const result = await response.json()
      return {
        text: result.text || '',
        confidence: result.confidence || 0.8,
        language: request.language || 'en',
        segments: result.segments || []
      }
    } catch (error) {
      console.warn('Local Whisper server not available:', error)
      throw new Error('Local Whisper server not running. Please start the Whisper server with: python whisper_server.py')
    }
  }
  
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix to get just the base64
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
} 