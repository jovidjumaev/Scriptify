import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, Mic, FileText, Shield, Settings, Palette, Volume2, Languages, Eye, EyeOff, Zap, Sparkles } from 'lucide-react'

interface SettingsPanelProps {
  onClose: () => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="glass w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-8 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Settings</h2>
                <p className="text-sm text-slate-400">Customize your transcription experience</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="btn-ghost"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-64 glass border-r border-white/10">
              <nav className="p-6 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </motion.button>
                  )
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-slate-100 mb-6 flex items-center space-x-3">
                        <Palette className="w-5 h-5 text-indigo-400" />
                        <span>General Settings</span>
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="glass p-6 rounded-2xl">
                          <label className="block text-sm font-medium text-slate-200 mb-3">
                            Default Export Format
                          </label>
                          <select className="w-full p-3 glass rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="txt">Plain Text (.txt)</option>
                            <option value="docx">Word Document (.docx)</option>
                            <option value="pdf">PDF (.pdf)</option>
                            <option value="srt">Subtitle (.srt)</option>
                          </select>
                        </div>

                        <div className="glass p-6 rounded-2xl">
                          <label className="block text-sm font-medium text-slate-200 mb-3">
                            Auto-save Interval
                          </label>
                          <select className="w-full p-3 glass rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="30">30 seconds</option>
                            <option value="60">1 minute</option>
                            <option value="300">5 minutes</option>
                            <option value="0">Disabled</option>
                          </select>
                        </div>

                        <div className="glass p-6 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-sm font-medium text-slate-200 mb-1">
                                Enable dark mode
                              </label>
                              <p className="text-sm text-slate-400">Use dark theme for better eye comfort</p>
                            </div>
                            <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'audio' && (
                  <motion.div
                    key="audio"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-slate-100 mb-6 flex items-center space-x-3">
                        <Volume2 className="w-5 h-5 text-purple-400" />
                        <span>Audio Settings</span>
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="glass p-6 rounded-2xl">
                          <label className="block text-sm font-medium text-slate-200 mb-3">
                            Input Device
                          </label>
                          <select className="w-full p-3 glass rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="default">Default Microphone</option>
                            <option value="system">System Audio</option>
                          </select>
                        </div>

                        <div className="glass p-6 rounded-2xl">
                          <label className="block text-sm font-medium text-slate-200 mb-3">
                            Audio Quality
                          </label>
                          <select className="w-full p-3 glass rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="high">High Quality (44.1kHz)</option>
                            <option value="medium">Medium Quality (22.05kHz)</option>
                            <option value="low">Low Quality (11.025kHz)</option>
                          </select>
                        </div>

                        <div className="glass p-6 rounded-2xl">
                          <label className="block text-sm font-medium text-slate-200 mb-3">
                            Noise Reduction
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              defaultValue="50"
                              className="flex-1 accent-indigo-500"
                            />
                            <span className="text-sm text-slate-400 w-12">50%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'language' && (
                  <motion.div
                    key="language"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-slate-100 mb-6 flex items-center space-x-3">
                        <Languages className="w-5 h-5 text-pink-400" />
                        <span>Language Settings</span>
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="glass p-6 rounded-2xl">
                          <label className="block text-sm font-medium text-slate-200 mb-3">
                            Transcription Language
                          </label>
                          <select className="w-full p-3 glass rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="auto">Auto-detect</option>
                            <option value="en">English</option>
                            <option value="ko">Korean</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                            <option value="pt">Portuguese</option>
                            <option value="ru">Russian</option>
                            <option value="ja">Japanese</option>
                            <option value="zh">Chinese</option>
                          </select>
                        </div>

                        <div className="glass p-6 rounded-2xl">
                          <label className="block text-sm font-medium text-slate-200 mb-3">
                            Interface Language
                          </label>
                          <select className="w-full p-3 glass rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="en">English</option>
                            <option value="ko">한국어</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'privacy' && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-slate-100 mb-6 flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span>Privacy Settings</span>
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="glass p-6 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-sm font-medium text-slate-200 mb-1">
                                Process audio locally
                              </label>
                              <p className="text-sm text-slate-400">When possible, process audio on your device</p>
                            </div>
                            <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                            </div>
                          </div>
                        </div>

                        <div className="glass p-6 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-sm font-medium text-slate-200 mb-1">
                                Allow anonymous usage data
                              </label>
                              <p className="text-sm text-slate-400">Help improve the app with anonymous data</p>
                            </div>
                            <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                            </div>
                          </div>
                        </div>

                        <div className="glass p-6 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-sm font-medium text-slate-200 mb-1">
                                Auto-delete recordings
                              </label>
                              <p className="text-sm text-slate-400">Delete recordings after 30 days</p>
                            </div>
                            <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 p-8 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Save Changes
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SettingsPanel 