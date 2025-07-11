import React, { useState } from 'react'
import { Edit3, Save, Copy, Download, Share2 } from 'lucide-react'

interface TranscriptionPanelProps {
  transcription: string
  onTranscriptionUpdate: (text: string) => void
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
  transcription,
  onTranscriptionUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(transcription)

  const handleSave = () => {
    onTranscriptionUpdate(editedText)
    setIsEditing(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcription)
      // TODO: Show success toast
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting transcription...')
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Sharing transcription...')
  }

  return (
    <div className="card h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Transcription</h2>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit transcription"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              title="Save changes"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleExport}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export transcription"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share transcription"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transcription Content */}
      <div className="flex-1">
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Your transcription will appear here..."
          />
        ) : (
          <div className="w-full h-96 p-4 border border-gray-200 rounded-lg bg-gray-50 overflow-y-auto">
            {transcription ? (
              <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                {transcription}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <div className="text-4xl mb-4">🎤</div>
                <p className="text-lg font-medium">No transcription yet</p>
                <p className="text-sm">Start recording to see your transcription here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transcription Stats */}
      {transcription && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Words: {transcription.split(/\s+/).filter(word => word.length > 0).length}</span>
            <span>Characters: {transcription.length}</span>
            <span>Estimated time: {Math.ceil(transcription.split(/\s+/).length / 150)} min read</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TranscriptionPanel 