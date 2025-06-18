import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Sparkles,
  Target,
  Zap,
  X,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Send,
  Settings,
  Key
} from 'lucide-react'
import { aiAssistant, type AIRecommendation, type UserGoals, type LocationContext, type BudgetConstraints } from '../lib/ai-assistant'
import { grokAPI, type GrokMessage } from '../lib/grok-api'
import { WizardParams } from '../lib/simulator'

interface AIAssistantProps {
  currentStep: number
  currentData: Partial<WizardParams>
  onApplyRecommendation?: (recommendation: Partial<WizardParams>) => void
  className?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIAssistant({ currentStep, currentData, onApplyRecommendation, className = '' }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'recommendations' | 'chat' | 'settings'>('recommendations')
  const [recommendations, setRecommendations] = useState<AIRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [stepSuggestions, setStepSuggestions] = useState<string[]>([])
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  
  // Settings state
  const [grokApiKey, setGrokApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  // Mock user context - in a real app, this would come from user profile/preferences
  const mockUserGoals: UserGoals = {
    primaryPurpose: 'food_production',
    experienceLevel: 'beginner',
    timeCommitment: 'medium',
    spaceConstraints: 'outdoor',
    sustainabilityFocus: 'high'
  }

  const mockLocation: LocationContext = {
    climateKey: currentData.climateKey || 'temperate',
    customClimate: currentData.customClimate ? {
      temp: currentData.customTemp || 20,
      solar: currentData.customSolar || 1.0
    } : undefined
  }

  const mockBudget: BudgetConstraints = {
    totalBudget: currentData.customBudget || 5000,
    currency: currentData.customBudgetCurrency || 'USD',
    prioritizeUpfront: true,
    includesLabor: false
  }

  useEffect(() => {
    // Load saved API key
    const savedApiKey = localStorage.getItem('grok_api_key')
    if (savedApiKey) {
      setGrokApiKey(savedApiKey)
      grokAPI.initialize(savedApiKey)
    }

    // Get step-specific suggestions
    const suggestions = aiAssistant.getStepSuggestions(
      currentStep,
      currentData,
      mockUserGoals,
      mockLocation,
      mockBudget
    )
    setStepSuggestions(suggestions)
  }, [currentStep, currentData])

  const generateFullRecommendations = async () => {
    setLoading(true)
    try {
      const recs = await aiAssistant.generateRecommendations(
        mockUserGoals,
        mockLocation,
        mockBudget
      )
      setRecommendations(recs)
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyRecommendation = (config: Partial<WizardParams>) => {
    if (onApplyRecommendation) {
      onApplyRecommendation(config)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading || !grokAPI.isConfigured()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    try {
      const systemContext = {
        systemType: currentData.systemType,
        farmSize: currentData.farmSize,
        fishSpecies: currentData.fishSpecies,
        crops: currentData.cropChoice,
        climate: currentData.climateKey,
        budget: currentData.customBudget,
        experienceLevel: mockUserGoals.experienceLevel
      }

      const response = await grokAPI.getAquaponicAdvice(userMessage.content, systemContext)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your Grok API key and try again.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  const saveApiKey = () => {
    if (grokApiKey.trim()) {
      localStorage.setItem('grok_api_key', grokApiKey.trim())
      grokAPI.initialize(grokApiKey.trim())
      setShowApiKeyInput(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence'
    if (confidence >= 0.6) return 'Medium Confidence'
    return 'Low Confidence'
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                AI Design Assistant
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Smart recommendations and expert chat
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'recommendations'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Recommendations</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Expert Chat</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </div>
              </button>
            </div>

            <div className="p-4">
              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  {/* Step Suggestions */}
                  {stepSuggestions.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Smart Suggestions
                        </span>
                      </div>
                      {stepSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
                        >
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            {suggestion}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Generate Full Recommendations */}
                  {!recommendations && (
                    <button
                      onClick={generateFullRecommendations}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Get AI Recommendations</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Full Recommendations */}
                  {recommendations && (
                    <div className="space-y-4">
                      {/* Confidence & Reasoning */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-slate-900 dark:text-white">
                              AI Analysis
                            </span>
                          </div>
                          <span className={`text-sm font-medium ${getConfidenceColor(recommendations.confidence)}`}>
                            {getConfidenceLabel(recommendations.confidence)} ({Math.round(recommendations.confidence * 100)}%)
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {recommendations.reasoning}
                        </p>
                      </div>

                      {/* Primary Recommendation */}
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">
                            Recommended Configuration
                          </h4>
                          <button
                            onClick={() => applyRecommendation({
                              systemType: recommendations.systemType,
                              farmSize: recommendations.farmSize,
                              customFarmSize: recommendations.customFarmSize,
                              fishSpecies: recommendations.fishSpecies,
                              cropChoice: recommendations.cropChoice,
                              energySource: recommendations.energySource
                            })}
                            className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
                          >
                            <Zap className="h-3 w-3" />
                            <span>Apply</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300 font-medium">System:</span>
                            <span className="ml-2 text-emerald-800 dark:text-emerald-200">
                              {recommendations.systemType.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300 font-medium">Size:</span>
                            <span className="ml-2 text-emerald-800 dark:text-emerald-200">
                              {recommendations.farmSize}
                              {recommendations.customFarmSize && ` (${recommendations.customFarmSize}m²)`}
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300 font-medium">Fish:</span>
                            <span className="ml-2 text-emerald-800 dark:text-emerald-200">
                              {recommendations.fishSpecies.join(', ')}
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300 font-medium">Energy:</span>
                            <span className="ml-2 text-emerald-800 dark:text-emerald-200">
                              {recommendations.energySource}
                            </span>
                          </div>
                        </div>

                        {/* Estimated Results */}
                        <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <div className="text-lg font-bold text-emerald-600">
                                {recommendations.estimatedResults.fishYieldKg.toFixed(1)}
                              </div>
                              <div className="text-xs text-emerald-700 dark:text-emerald-300">kg fish/year</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-emerald-600">
                                {recommendations.estimatedResults.vegYieldKg.toFixed(1)}
                              </div>
                              <div className="text-xs text-emerald-700 dark:text-emerald-300">kg crops/year</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-emerald-600">
                                {recommendations.estimatedResults.systemEfficiency}%
                              </div>
                              <div className="text-xs text-emerald-700 dark:text-emerald-300">efficiency</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Alternatives */}
                      {recommendations.alternatives.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            Alternative Configurations
                          </h4>
                          {recommendations.alternatives.map((alt, index) => (
                            <div
                              key={index}
                              className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-slate-900 dark:text-white">
                                  {alt.name}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs ${getConfidenceColor(alt.confidence)}`}>
                                    {Math.round(alt.confidence * 100)}%
                                  </span>
                                  <button
                                    onClick={() => applyRecommendation(alt.changes)}
                                    className="px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors"
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {alt.tradeoffs}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tips */}
                      {recommendations.tips.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Pro Tips
                            </span>
                          </div>
                          {recommendations.tips.map((tip, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-sm text-slate-600 dark:text-slate-400">{tip}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Warnings */}
                      {recommendations.warnings && recommendations.warnings.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                              Important Considerations
                            </span>
                          </div>
                          {recommendations.warnings.map((warning, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-sm text-amber-700 dark:text-amber-300">{warning}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reset Button */}
                      <button
                        onClick={() => setRecommendations(null)}
                        className="w-full flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-2 text-sm transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Get New Recommendations</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  {!grokAPI.isConfigured() ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Expert Chat Powered by Grok
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Configure your Grok API key to chat with an AI aquaponics expert
                      </p>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Configure API Key
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Chat Messages */}
                      <div className="h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                        {chatMessages.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                              Ask me anything about aquaponics! I can help with system design, troubleshooting, species selection, and more.
                            </p>
                          </div>
                        ) : (
                          chatMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  message.role === 'user'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.role === 'user' ? 'text-purple-200' : 'text-slate-500'
                                }`}>
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                        {chatLoading && (
                          <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-3 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input */}
                      <form onSubmit={handleChatSubmit} className="flex space-x-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask about aquaponics..."
                          className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white dark:bg-slate-700"
                          disabled={chatLoading}
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || chatLoading}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white">
                        Grok API Configuration
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Enter your Grok API key to enable expert chat functionality. Your key is stored locally and never shared.
                    </p>

                    {!showApiKeyInput && !grokAPI.isConfigured() ? (
                      <button
                        onClick={() => setShowApiKeyInput(true)}
                        className="w-full p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-purple-500 transition-colors"
                      >
                        <div className="text-center">
                          <Key className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Click to add Grok API key
                          </p>
                        </div>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <input
                            type="password"
                            value={grokApiKey}
                            onChange={(e) => setGrokApiKey(e.target.value)}
                            placeholder="Enter your Grok API key"
                            className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white dark:bg-slate-700"
                          />
                          <button
                            onClick={saveApiKey}
                            disabled={!grokApiKey.trim()}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
                          >
                            Save
                          </button>
                        </div>
                        
                        {grokAPI.isConfigured() && (
                          <div className="flex items-center space-x-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">API key configured successfully</span>
                          </div>
                        )}
                        
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Get your API key from{' '}
                          <a 
                            href="https://console.x.ai" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700"
                          >
                            console.x.ai
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}