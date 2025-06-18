import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useSubscription } from '../lib/subscription'
import { supabase } from '../lib/supabase'
import { WizardStep } from '../components/wizard/WizardStep'
import { ProFeatureButton } from '../components/ProGate'
import { CustomBudgetInput } from '../components/CustomBudgetInput'
import { AIAssistant } from '../components/AIAssistant'
import { detectClimateFromTimezone, CLIMATE_PRESETS, type ClimateKey } from '../data/climate'
import { SYSTEM_PRESETS, validateSystemParams } from '../lib/simulator'
import { loadCustomBudget, getBudgetCategory } from '../lib/budget'
import { motion } from 'framer-motion'
import { 
  Home, 
  Fish, 
  Leaf, 
  DollarSign, 
  Zap,
  CheckCircle,
  Sparkles,
  Crown,
  MapPin,
  Settings,
  Ruler,
  Thermometer,
  Sun,
  Brain
} from 'lucide-react'

interface WizardData {
  climateKey: ClimateKey
  customClimate: boolean
  customTemp?: number
  customSolar?: number
  systemType: string
  mode: 'quick' | 'custom'
  tankVol?: number
  bioFilterVol?: number
  purifierVol?: number
  sumpVol?: number
  pipeDia?: number
  farmSize: string
  customFarmSize?: number
  fishSpecies: string[]
  cropChoice: string[]
  budget: string
  customBudget?: number
  customBudgetCurrency?: string
  energySource: string
}

export function Wizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPro } = useSubscription()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [simulationCount, setSimulationCount] = useState(0)
  const [showAIAssistant, setShowAIAssistant] = useState(true)
  const [data, setData] = useState<WizardData>({
    climateKey: detectClimateFromTimezone(),
    customClimate: false,
    systemType: 'media-bed',
    mode: 'quick',
    farmSize: '',
    fishSpecies: [],
    cropChoice: [],
    budget: '',
    energySource: '',
  })

  const totalSteps = 7
  const maxFreeSimulations = 3

  useEffect(() => {
    // Load custom budget if available
    const savedBudget = loadCustomBudget()
    if (savedBudget) {
      setData(prev => ({
        ...prev,
        budget: 'custom',
        customBudget: savedBudget.amount,
        customBudgetCurrency: savedBudget.currency
      }))
    }
  }, [])

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      await completeWizard()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAIRecommendation = (recommendation: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...recommendation }))
  }

  const completeWizard = async () => {
    if (!user) return

    // Check simulation limit for free users
    if (!isPro && simulationCount >= maxFreeSimulations) {
      return // This will be handled by the ProFeatureButton
    }

    // Validate system parameters if in custom mode
    if (data.mode === 'custom') {
      const validation = validateSystemParams(data)
      if (!validation.isValid) {
        alert(`Please fix the following issues:\n${validation.errors.join('\n')}`)
        return
      }
    }

    setLoading(true)
    try {
      const designName = `${data.systemType.toUpperCase()} ${data.mode === 'custom' ? 'Custom' : 'Quick'} System - ${new Date().toLocaleDateString()}`
      
      const { data: design, error } = await supabase
        .from('designs')
        .insert({
          user_id: user.id,
          name: designName,
          params: data,
        })
        .select()
        .single()

      if (error) throw error

      setSimulationCount(prev => prev + 1)
      navigate(`/dashboard/${design.id}`)
    } catch (error) {
      console.error('Error creating design:', error)
    } finally {
      setLoading(false)
    }
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return data.climateKey !== undefined
      case 2:
        return data.systemType !== ''
      case 3:
        return data.farmSize !== '' && (data.farmSize !== 'custom' || (data.customFarmSize && data.customFarmSize >= 1 && data.customFarmSize <= 10000))
      case 4:
        return data.fishSpecies.length > 0
      case 5:
        return data.cropChoice.length > 0
      case 6:
        return data.budget !== '' && (data.budget !== 'custom' || (data.customBudget && data.customBudget > 0))
      case 7:
        return data.energySource !== ''
      default:
        return false
    }
  }

  const updateData = (field: keyof WizardData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WizardStep
            title="Location & Climate"
            description="Select your climate zone for accurate yield estimates"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-6">
              {/* AI Assistant */}
              {showAIAssistant && (
                <AIAssistant
                  currentStep={currentStep}
                  currentData={data}
                  onApplyRecommendation={handleAIRecommendation}
                />
              )}

              {/* Auto-detected climate */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-emerald-800 dark:text-emerald-200">
                    Auto-detected: {CLIMATE_PRESETS[data.climateKey].label}
                  </span>
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Based on your timezone • {CLIMATE_PRESETS[data.climateKey].temp}°C • {CLIMATE_PRESETS[data.climateKey].solar}× solar factor
                </p>
              </div>

              {/* Climate presets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(CLIMATE_PRESETS).map(([key, preset], index) => (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      updateData('climateKey', key as ClimateKey)
                      updateData('customClimate', false)
                    }}
                    className={`p-6 text-left rounded-2xl border-2 transition-all duration-200 ${
                      data.climateKey === key && !data.customClimate
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {preset.label}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {preset.temp}°C • {preset.solar}× solar
                        </p>
                      </div>
                      {data.climateKey === key && !data.customClimate && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Custom climate toggle */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <button
                  onClick={() => updateData('customClimate', !data.customClimate)}
                  className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                    data.customClimate
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        Custom Climate
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Set specific temperature and solar values
                      </p>
                    </div>
                    {data.customClimate && <CheckCircle className="h-5 w-5 text-purple-500" />}
                  </div>
                </button>

                {/* Custom climate inputs */}
                {data.customClimate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Thermometer className="inline h-4 w-4 mr-1" />
                        Water Temperature (°C)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="30"
                        value={data.customTemp || ''}
                        onChange={(e) => updateData('customTemp', parseFloat(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white dark:bg-slate-700"
                        placeholder="20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Sun className="inline h-4 w-4 mr-1" />
                        Solar Factor (kWh/m²/day)
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        max="8"
                        step="0.1"
                        value={data.customSolar || ''}
                        onChange={(e) => updateData('customSolar', parseFloat(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white dark:bg-slate-700"
                        placeholder="1.0"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </WizardStep>
        )

      case 2:
        return (
          <WizardStep
            title="System Type"
            description="Choose the aquaponic system type that best fits your needs"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-6">
              {/* AI Assistant */}
              {showAIAssistant && (
                <AIAssistant
                  currentStep={currentStep}
                  currentData={data}
                  onApplyRecommendation={handleAIRecommendation}
                />
              )}

              {/* Quick/Custom mode toggle */}
              <div className="flex items-center justify-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                <button
                  onClick={() => updateData('mode', 'quick')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    data.mode === 'quick'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Quick Setup
                </button>
                <button
                  onClick={() => updateData('mode', 'custom')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    data.mode === 'custom'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Custom Setup
                </button>
              </div>

              {/* System type selection */}
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(SYSTEM_PRESETS).map(([type, preset], index) => (
                  <motion.button
                    key={type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      updateData('systemType', type)
                      if (data.mode === 'quick') {
                        // Auto-fill preset values
                        updateData('tankVol', preset.tankVol)
                        updateData('bioFilterVol', preset.bioFilterVol)
                        updateData('purifierVol', preset.purifierVol)
                        updateData('sumpVol', preset.sumpVol)
                        updateData('pipeDia', preset.pipeDia)
                      }
                    }}
                    className={`p-6 text-left rounded-2xl border-2 transition-all duration-200 ${
                      data.systemType === type
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                          {type.toUpperCase()} System
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                          <div>Tank: {preset.tankVol}L</div>
                          <div>Bio-filter: {preset.bioFilterVol}L</div>
                          <div>Purifier: {preset.purifierVol}L</div>
                          <div>Pipe: {preset.pipeDia}mm</div>
                        </div>
                        {data.mode === 'quick' && (
                          <span className="inline-block bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-xs">
                            Preset values will be used
                          </span>
                        )}
                      </div>
                      {data.systemType === type && (
                        <CheckCircle className="h-5 w-5 text-emerald-500 ml-4" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Custom mode inputs */}
              {data.mode === 'custom' && data.systemType && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 p-6 bg-slate-50 dark:bg-slate-700 rounded-2xl"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Custom Configuration
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Tank Volume (L)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="2000"
                        value={data.tankVol || ''}
                        onChange={(e) => updateData('tankVol', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Bio-Filter Volume (L)
                      </label>
                      <input
                        type="number"
                        min="20"
                        max="500"
                        value={data.bioFilterVol || ''}
                        onChange={(e) => updateData('bioFilterVol', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Purifier Volume (L)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={data.purifierVol || ''}
                        onChange={(e) => updateData('purifierVol', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Sump Volume (L)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="800"
                        value={data.sumpVol || ''}
                        onChange={(e) => updateData('sumpVol', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Pipe Diameter (mm)
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="50"
                        value={data.pipeDia || ''}
                        onChange={(e) => updateData('pipeDia', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </WizardStep>
        )

      case 3:
        return (
          <WizardStep
            title="Farm Size"
            description="What size aquaponic system are you planning?"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              {/* AI Assistant */}
              {showAIAssistant && (
                <AIAssistant
                  currentStep={currentStep}
                  currentData={data}
                  onApplyRecommendation={handleAIRecommendation}
                />
              )}

              {/* Simulation Counter for Free Users */}
              {!isPro && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Free Plan: {simulationCount}/{maxFreeSimulations} simulations used
                      </span>
                    </div>
                    {simulationCount >= maxFreeSimulations && (
                      <span className="text-xs text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-800 px-2 py-1 rounded-full">
                        Upgrade for unlimited
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'small', label: 'Small (Home/Hobby)', desc: '~4.6 m² (50 sq ft)', icon: '🏠' },
                  { value: 'medium', label: 'Medium (Commercial)', desc: '~46.5 m² (500 sq ft)', icon: '🏢' },
                  { value: 'large', label: 'Large (Industrial)', desc: '~232 m² (2500 sq ft)', icon: '🏭' },
                  { value: 'custom', label: 'Custom Size', desc: 'Enter your specific area', icon: '⚙️' },
                ].map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateData('farmSize', option.value)}
                    className={`p-6 text-left rounded-2xl border-2 transition-all duration-200 ${
                      data.farmSize === option.value
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{option.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {option.label}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {option.desc}
                        </p>
                      </div>
                      {data.farmSize === option.value && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Custom farm size input */}
              {data.farmSize === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-6 bg-slate-50 dark:bg-slate-700 rounded-2xl"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <Ruler className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Custom Farm Size
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Farm Area (m²)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          step="0.1"
                          value={data.customFarmSize || ''}
                          onChange={(e) => updateData('customFarmSize', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 pr-12 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
                          placeholder="Enter area"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                          m²
                        </span>
                      </div>
                      {data.customFarmSize && (data.customFarmSize < 1 || data.customFarmSize > 10000) && (
                        <p className="mt-2 text-sm text-red-600">
                          Farm size must be between 1-10,000 m²
                        </p>
                      )}
                    </div>
                    
                    {data.customFarmSize && data.customFarmSize >= 1 && data.customFarmSize <= 10000 && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                        <h5 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                          Size Reference
                        </h5>
                        <div className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                          <div>Area: {data.customFarmSize} m²</div>
                          <div>≈ {(data.customFarmSize * 10.764).toFixed(1)} sq ft</div>
                          <div className="font-medium">
                            Category: {
                              data.customFarmSize <= 10 ? 'Small/Hobby' :
                              data.customFarmSize <= 100 ? 'Medium/Commercial' :
                              'Large/Industrial'
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </WizardStep>
        )

      case 4:
        return (
          <WizardStep
            title="Fish Species"
            description="Which fish species would you like to raise?"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              {/* AI Assistant */}
              {showAIAssistant && (
                <AIAssistant
                  currentStep={currentStep}
                  currentData={data}
                  onApplyRecommendation={handleAIRecommendation}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: 'Tilapia', emoji: '🐟', difficulty: 'Beginner' },
                  { name: 'Trout', emoji: '🎣', difficulty: 'Intermediate' },
                  { name: 'Catfish', emoji: '🐠', difficulty: 'Beginner' },
                  { name: 'Bass', emoji: '🐟', difficulty: 'Advanced' },
                  { name: 'Perch', emoji: '🐠', difficulty: 'Intermediate' },
                  { name: 'Salmon', emoji: '🐟', difficulty: 'Advanced' },
                  { name: 'Koi', emoji: '🐠', difficulty: 'Intermediate' },
                  { name: 'Goldfish', emoji: '🐟', difficulty: 'Beginner' },
                ].map((species, index) => (
                  <motion.button
                    key={species.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const newSpecies = data.fishSpecies.includes(species.name)
                        ? data.fishSpecies.filter(s => s !== species.name)
                        : [...data.fishSpecies, species.name]
                      updateData('fishSpecies', newSpecies)
                    }}
                    className={`p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                      data.fishSpecies.includes(species.name)
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{species.emoji}</span>
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {species.name}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {species.difficulty}
                          </p>
                        </div>
                      </div>
                      {data.fishSpecies.includes(species.name) && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                Select one or more fish species (recommended: start with one)
              </p>
            </div>
          </WizardStep>
        )

      case 5:
        return (
          <WizardStep
            title="Crop Choice"
            description="What crops do you want to grow in your system?"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              {/* AI Assistant */}
              {showAIAssistant && (
                <AIAssistant
                  currentStep={currentStep}
                  currentData={data}
                  onApplyRecommendation={handleAIRecommendation}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: 'Lettuce', emoji: '🥬', difficulty: 'Beginner' },
                  { name: 'Spinach', emoji: '🥬', difficulty: 'Beginner' },
                  { name: 'Kale', emoji: '🥬', difficulty: 'Beginner' },
                  { name: 'Herbs (Basil, Mint)', emoji: '🌿', difficulty: 'Beginner' },
                  { name: 'Tomatoes', emoji: '🍅', difficulty: 'Intermediate' },
                  { name: 'Cucumbers', emoji: '🥒', difficulty: 'Intermediate' },
                  { name: 'Peppers', emoji: '🌶️', difficulty: 'Intermediate' },
                  { name: 'Strawberries', emoji: '🍓', difficulty: 'Advanced' },
                ].map((crop, index) => (
                  <motion.button
                    key={crop.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const newCrops = data.cropChoice.includes(crop.name)
                        ? data.cropChoice.filter(c => c !== crop.name)
                        : [...data.cropChoice, crop.name]
                      updateData('cropChoice', newCrops)
                    }}
                    className={`p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                      data.cropChoice.includes(crop.name)
                        ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{crop.emoji}</span>
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {crop.name}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {crop.difficulty}
                          </p>
                        </div>
                      </div>
                      {data.cropChoice.includes(crop.name) && (
                        <CheckCircle className="h-5 w-5 text-teal-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                Select the crops you want to grow (leafy greens are easiest for beginners)
              </p>
            </div>
          </WizardStep>
        )

      case 6:
        return (
          <WizardStep
            title="Budget"
            description="What's your budget range for this aquaponic system?"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-6">
              {/* AI Assistant */}
              {showAIAssistant && (
                <AIAssistant
                  currentStep={currentStep}
                  currentData={data}
                  onApplyRecommendation={handleAIRecommendation}
                />
              )}

              {/* Budget presets */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { value: 'under-1000', label: 'Under $1,000', desc: 'Basic starter system', emoji: '💰' },
                  { value: '1000-5000', label: '$1,000 - $5,000', desc: 'Mid-range home system', emoji: '💵' },
                  { value: '5000-20000', label: '$5,000 - $20,000', desc: 'Commercial starter', emoji: '💸' },
                  { value: 'over-20000', label: 'Over $20,000', desc: 'Large commercial system', emoji: '🏦' },
                  { value: 'custom', label: 'Custom Budget', desc: 'Enter your specific amount', emoji: '⚙️' },
                ].map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateData('budget', option.value)}
                    className={`p-6 text-left rounded-2xl border-2 transition-all duration-200 ${
                      data.budget === option.value
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {option.label}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {option.desc}
                        </p>
                      </div>
                      {data.budget === option.value && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Custom budget input */}
              {data.budget === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6"
                >
                  <CustomBudgetInput
                    value={data.customBudget}
                    currency={data.customBudgetCurrency}
                    onSave={(amount, currency) => {
                      updateData('customBudget', amount)
                      updateData('customBudgetCurrency', currency)
                    }}
                    onClear={() => {
                      updateData('customBudget', undefined)
                      updateData('customBudgetCurrency', undefined)
                      updateData('budget', '')
                    }}
                  />
                </motion.div>
              )}
            </div>
          </WizardStep>
        )

      case 7:
        return (
          <WizardStep
            title="Energy Source"
            description="How do you plan to power your aquaponic system?"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={!isPro && simulationCount >= maxFreeSimulations ? () => {} : handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              {/* AI Assistant */}
              {showAIAssistant && (
                <AIAssistant
                  currentStep={currentStep}
                  currentData={data}
                  onApplyRecommendation={handleAIRecommendation}
                />
              )}

              <div className="grid grid-cols-1 gap-4">
                {[
                  { value: 'grid', label: 'Grid Electricity', desc: 'Standard electrical power', emoji: '⚡' },
                  { value: 'solar', label: 'Solar Power', desc: 'Renewable solar energy', emoji: '☀️' },
                  { value: 'hybrid', label: 'Hybrid (Grid + Solar)', desc: 'Combination approach', emoji: '🔋' },
                  { value: 'generator', label: 'Generator Backup', desc: 'Backup power solution', emoji: '🔌' },
                ].map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateData('energySource', option.value)}
                    className={`p-6 text-left rounded-2xl border-2 transition-all duration-200 ${
                      data.energySource === option.value
                        ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {option.label}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {option.desc}
                        </p>
                      </div>
                      {data.energySource === option.value && (
                        <CheckCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Pro Gate for Final Step */}
              {!isPro && simulationCount >= maxFreeSimulations && (
                <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                  <div className="text-center">
                    <Crown className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                      Upgrade to Continue
                    </h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
                      You've used all {maxFreeSimulations} free simulations. Upgrade to Pro Designer for unlimited access.
                    </p>
                    <ProFeatureButton
                      feature="unlimited system simulations"
                      onClick={completeWizard}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center space-x-2">
                        <Crown className="h-5 w-5" />
                        <span>Upgrade to Pro</span>
                      </div>
                    </ProFeatureButton>
                  </div>
                </div>
              )}
            </div>
          </WizardStep>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"
          />
          <p className="text-slate-600 dark:text-slate-400 mb-2">Creating your aquaponic design...</p>
          <div className="flex items-center justify-center space-x-1 text-emerald-600">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm">This will just take a moment</span>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* AI Assistant Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          className={`p-3 rounded-2xl shadow-lg transition-all duration-200 ${
            showAIAssistant 
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600'
          }`}
          title={showAIAssistant ? 'Hide AI Assistant' : 'Show AI Assistant'}
        >
          <Brain className="h-5 w-5" />
        </button>
      </div>

      {renderStep()}
    </div>
  )
}