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
  ChevronUp
} from 'lucide-react'
import { aiAssistant, type AIRecommendation, type UserGoals, type LocationContext, type BudgetConstraints } from '../lib/ai-assistant'
import { WizardParams } from '../lib/simulator'

interface AIAssistantProps {
  currentStep: number
  currentData: Partial<WizardParams>
  onApplyRecommendation?: (recommendation: Partial<WizardParams>) => void
  className?: string
}

export function AIAssistant({ currentStep, currentData, onApplyRecommendation, className = '' }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [recommendations, setRecommendations] = useState<AIRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [stepSuggestions, setStepSuggestions] = useState<string[]>([])

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
                Smart recommendations for your aquaponic system
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
            <div className="p-4 space-y-4">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}