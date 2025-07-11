import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TranscriptionData {
  text: string
  confidence: number
  language?: string
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
}

interface Session {
  id: string
  title: string
  transcription: string
  createdAt: Date
  updatedAt: Date
}

interface AppState {
  // Transcription state
  transcription: string
  isTranscribing: boolean
  transcriptionData: TranscriptionData | null
  error: string | null
  
  // Settings
  language: string
  model: string
  transcriptionService: 'local-whisper' | 'openai' | 'azure'
  
  // Sessions
  sessions: Session[]
  currentSessionId: string | null
  
  // Actions
  setTranscription: (text: string) => void
  setTranscriptionData: (data: TranscriptionData) => void
  setIsTranscribing: (isTranscribing: boolean) => void
  setError: (error: string | null) => void
  clearTranscription: () => void
  updateSettings: (settings: Partial<{
    language: string
    model: string
    transcriptionService: 'local-whisper' | 'openai' | 'azure'
  }>) => void
  
  // Session actions
  createSession: (title: string) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  deleteSession: (id: string) => void
  setCurrentSession: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      transcription: '',
      isTranscribing: false,
      transcriptionData: null,
      error: null,
      
      // Default settings
      language: 'auto',
      model: 'base',
      transcriptionService: 'local-whisper',
      
      // Sessions
      sessions: [],
      currentSessionId: null,
      
      // Actions
      setTranscription: (text) => set({ transcription: text }),
      
      setTranscriptionData: (data) => set({ 
        transcriptionData: data,
        transcription: data.text 
      }),
      
      setIsTranscribing: (isTranscribing) => set({ isTranscribing }),
      
      setError: (error) => set({ error }),
      
      clearTranscription: () => set({ 
        transcription: '', 
        transcriptionData: null, 
        error: null 
      }),
      
      updateSettings: (settings) => set((state) => ({
        ...state,
        ...settings
      })),
      
      // Session actions
      createSession: (title) => {
        const newSession: Session = {
          id: Date.now().toString(),
          title,
          transcription: '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set((state) => ({
          sessions: [...state.sessions, newSession],
          currentSessionId: newSession.id
        }))
      },
      
      updateSession: (id, updates) => set((state) => ({
        sessions: state.sessions.map(session => 
          session.id === id 
            ? { ...session, ...updates, updatedAt: new Date() }
            : session
        )
      })),
      
      deleteSession: (id) => set((state) => {
        const newSessions = state.sessions.filter(session => session.id !== id)
        const newCurrentSessionId = state.currentSessionId === id 
          ? (newSessions.length > 0 ? newSessions[0].id : null)
          : state.currentSessionId
        return {
          sessions: newSessions,
          currentSessionId: newCurrentSessionId
        }
      }),
      
      setCurrentSession: (id) => set({ currentSessionId: id })
    }),
    {
      name: 'scriptify-store',
      partialize: (state) => ({
        language: state.language,
        model: state.model,
        transcriptionService: state.transcriptionService,
        sessions: state.sessions,
        currentSessionId: state.currentSessionId
      })
    }
  )
) 