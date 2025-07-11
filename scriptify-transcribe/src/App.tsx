import React, { useState } from 'react'
import { Mic, MicOff, Play, Pause, Download, Settings, FileText, Users } from 'lucide-react'
import TranscriptionPanel from './components/TranscriptionPanel'
import AudioRecorder from './components/AudioRecorder'
import SettingsPanel from './components/SettingsPanel'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const handleStartRecording = () => {
    setIsRecording(true)
    // TODO: Implement actual recording logic
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    // TODO: Implement actual recording stop logic
  }

  const handleTranscriptionUpdate = (text: string) => {
    setTranscription(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Scriptify Transcribe</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Recording Controls */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recording Controls</h2>
              
              <AudioRecorder
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
              />
              
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn-secondary flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button className="btn-secondary flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Transcription */}
          <div className="lg:col-span-2">
            <TranscriptionPanel
              transcription={transcription}
              onTranscriptionUpdate={handleTranscriptionUpdate}
            />
          </div>
        </div>
      </main>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

export default App 