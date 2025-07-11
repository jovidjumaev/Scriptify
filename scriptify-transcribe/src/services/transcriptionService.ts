export interface TranscriptionRequest {
  audioBlob: Blob
  language?: string
  model?: string
}

export interface TranscriptionResponse {
  text: string
  confidence: number
  language?: string
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
}

export interface TranscriptionService {
  transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse>
}

// OpenAI Whisper API service
export class OpenAIWhisperService implements TranscriptionService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    try {
      // Convert blob to base64
      const arrayBuffer = await request.audioBlob.arrayBuffer()
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: `data:${request.audioBlob.type};base64,${base64Audio}`,
          model: request.model || 'whisper-1',
          language: request.language === 'auto' ? undefined : request.language,
          response_format: 'verbose_json',
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        text: data.text,
        confidence: data.confidence || 0.9,
        language: data.language,
        segments: data.segments?.map((segment: any) => ({
          start: segment.start,
          end: segment.end,
          text: segment.text
        }))
      }
    } catch (error) {
      console.error('OpenAI Whisper API error:', error)
      throw new Error('Failed to transcribe audio with OpenAI Whisper')
    }
  }
}

// Azure Speech Service
export class AzureSpeechService implements TranscriptionService {
  private subscriptionKey: string
  private region: string

  constructor(subscriptionKey: string, region: string) {
    this.subscriptionKey = subscriptionKey
    this.region = region
  }

  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    try {
      // This is a simplified implementation
      // In a real app, you'd need to handle Azure's specific API requirements
      const response = await fetch(`https://${this.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'audio/wav',
        },
        body: request.audioBlob,
      })

      if (!response.ok) {
        throw new Error(`Azure Speech API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        text: data.DisplayText || data.NBest?.[0]?.Display || '',
        confidence: data.NBest?.[0]?.Confidence || 0.9,
        language: request.language,
      }
    } catch (error) {
      console.error('Azure Speech API error:', error)
      throw new Error('Failed to transcribe audio with Azure Speech')
    }
  }
}

// Web Whisper Service for browser environment
export class WebWhisperService implements TranscriptionService {
  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
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

// Helper function to check if Tauri is available
async function isTauriAvailable(): Promise<boolean> {
  try {
    // Check if we're in a Tauri environment
    if (typeof window !== 'undefined' && typeof window.__TAURI_IPC__ === 'function') {
      await import('@tauri-apps/api/tauri')
      return true
    }
    return false
  } catch {
    return false
  }
}

// Factory function to create transcription service
export function createTranscriptionService(type: 'openai' | 'azure' | 'local-whisper', config?: any): TranscriptionService {
  switch (type) {
    case 'openai':
      if (!config?.apiKey) {
        throw new Error('OpenAI API key is required')
      }
      return new OpenAIWhisperService(config.apiKey)
    
    case 'azure':
      if (!config?.subscriptionKey || !config?.region) {
        throw new Error('Azure subscription key and region are required')
      }
      return new AzureSpeechService(config.subscriptionKey, config.region)
    
    case 'local-whisper':
      throw new Error('Local Whisper service not available - use createLocalWhisperService() instead')
    
    default:
      throw new Error('Invalid transcription service type')
  }
}

// Async factory function for local whisper
export async function createLocalWhisperService(): Promise<TranscriptionService> {
  try {
    // Check if Tauri is available
    if (!(await isTauriAvailable())) {
      console.warn('Tauri runtime not available, using web service')
      return new WebWhisperService()
    }

    // For Tauri environment, we would need to implement a local whisper service
    // For now, fall back to web service
    return new WebWhisperService()
  } catch (error) {
    console.warn('Local Whisper service not available, using web service')
    return new WebWhisperService()
  }
} 