import { saveAs } from 'file-saver'

// Helper to detect Tauri
function isTauri() {
  return typeof window !== 'undefined' && '__TAURI_IPC__' in window
}

export interface ExportOptions {
  format: 'txt' | 'docx' | 'pdf' | 'srt' | 'vtt'
  includeMetadata?: boolean
  includeTimestamps?: boolean
  filename?: string
}

export interface TranscriptionData {
  text: string
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
  metadata?: {
    title?: string
    duration?: number
    language?: string
    confidence?: number
    createdAt?: Date
  }
}

export class ExportService {
  static async exportTranscription(
    data: TranscriptionData,
    options: ExportOptions
  ): Promise<void> {
    const filename = options.filename || `transcription-${Date.now()}`
    let blob: Blob | null = null
    let ext = options.format

    switch (options.format) {
      case 'txt':
        blob = await this.getTxtBlob(data)
        break
      case 'docx':
        blob = await this.getDocxBlob(data)
        break
      case 'pdf':
        blob = await this.getPdfBlob(data)
        break
      case 'srt':
        blob = await this.getSrtBlob(data)
        break
      case 'vtt':
        blob = await this.getVttBlob(data)
        break
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }

    if (isTauri()) {
      // Use Tauri's file system API
      const { save } = await import('@tauri-apps/api/dialog')
      const { writeBinaryFile } = await import('@tauri-apps/api/fs')
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const filePath = await save({
        defaultPath: `${filename}.${ext}`,
        filters: [{ name: options.format.toUpperCase(), extensions: [ext] }],
      })
      if (filePath) {
        await writeBinaryFile({ path: filePath, contents: uint8Array })
      }
    } else {
      // Use file-saver in the browser
      saveAs(blob, `${filename}.${ext}`)
    }
  }

  private static async getTxtBlob(data: TranscriptionData): Promise<Blob> {
    let content = data.text
    if (data.metadata?.title) {
      content = `${data.metadata.title}\n\n${content}`
    }
    return new Blob([content], { type: 'text/plain;charset=utf-8' })
  }

  private static async getDocxBlob(data: TranscriptionData): Promise<Blob> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${data.metadata?.title || 'Transcription'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .content { line-height: 1.6; }
            .metadata { color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">${data.metadata?.title || 'Transcription'}</div>
          <div class="content">${data.text.replace(/\n/g, '<br>')}</div>
          ${data.metadata ? `
            <div class="metadata">
              <p>Duration: ${this.formatDuration(data.metadata.duration)}</p>
              <p>Language: ${data.metadata.language || 'Unknown'}</p>
              <p>Confidence: ${data.metadata.confidence ? `${(data.metadata.confidence * 100).toFixed(1)}%` : 'Unknown'}</p>
              <p>Created: ${data.metadata.createdAt?.toLocaleString() || 'Unknown'}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `
    return new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  }

  private static async getPdfBlob(data: TranscriptionData): Promise<Blob> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${data.metadata?.title || 'Transcription'}</title>
          <style>
            @media print {
              body { margin: 20px; }
            }
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .content { line-height: 1.6; }
            .metadata { color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">${data.metadata?.title || 'Transcription'}</div>
          <div class="content">${data.text.replace(/\n/g, '<br>')}</div>
          ${data.metadata ? `
            <div class="metadata">
              <p>Duration: ${this.formatDuration(data.metadata.duration)}</p>
              <p>Language: ${data.metadata.language || 'Unknown'}</p>
              <p>Confidence: ${data.metadata.confidence ? `${(data.metadata.confidence * 100).toFixed(1)}%` : 'Unknown'}</p>
              <p>Created: ${data.metadata.createdAt?.toLocaleString() || 'Unknown'}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `
    return new Blob([htmlContent], { type: 'application/pdf' })
  }

  private static async getSrtBlob(data: TranscriptionData): Promise<Blob> {
    if (!data.segments) {
      throw new Error('SRT export requires timestamp segments')
    }
    const srtContent = data.segments
      .map((segment, index) => {
        const startTime = this.formatSrtTime(segment.start)
        const endTime = this.formatSrtTime(segment.end)
        return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text.trim()}\n`
      })
      .join('\n')
    return new Blob([srtContent], { type: 'text/plain;charset=utf-8' })
  }

  private static async getVttBlob(data: TranscriptionData): Promise<Blob> {
    if (!data.segments) {
      throw new Error('VTT export requires timestamp segments')
    }
    const vttContent = `WEBVTT\n\n${data.segments
      .map((segment, index) => {
        const startTime = this.formatVttTime(segment.start)
        const endTime = this.formatVttTime(segment.end)
        return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text.trim()}\n`
      })
      .join('\n')}`
    return new Blob([vttContent], { type: 'text/plain;charset=utf-8' })
  }

  private static formatDuration(seconds?: number): string {
    if (seconds === undefined || seconds === null) return 'Unknown'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  private static formatSrtTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms
      .toString()
      .padStart(3, '0')}`
  }

  private static formatVttTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms
      .toString()
      .padStart(3, '0')}`
  }

  static async exportMultipleFormats(
    data: TranscriptionData,
    formats: Array<'txt' | 'docx' | 'pdf' | 'srt' | 'vtt'>,
    filename?: string
  ): Promise<void> {
    const JSZip = require('jszip');
    const zip = new JSZip()
    const baseFilename = filename || `transcription-${Date.now()}`

    for (const format of formats) {
      const content = await this.generateContent(data, format)
      zip.file(`${baseFilename}.${format}`, content)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `${baseFilename}-export.zip`)
  }

  private static async generateContent(
    data: TranscriptionData,
    format: string
  ): Promise<string> {
    switch (format) {
      case 'txt':
        return data.text
      case 'srt':
        if (!data.segments) throw new Error('SRT requires segments')
        return data.segments
          .map((segment, index) => {
            const startTime = this.formatSrtTime(segment.start)
            const endTime = this.formatSrtTime(segment.end)
            return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text.trim()}\n`
          })
          .join('\n')
      case 'vtt':
        if (!data.segments) throw new Error('VTT requires segments')
        return `WEBVTT\n\n${data.segments
          .map((segment, index) => {
            const startTime = this.formatVttTime(segment.start)
            const endTime = this.formatVttTime(segment.end)
            return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text.trim()}\n`
          })
          .join('\n')}`
      default:
        return data.text
    }
  }
} 