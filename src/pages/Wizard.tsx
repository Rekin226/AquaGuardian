import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useSubscription } from '../lib/subscription'
import { supabase } from '../lib/supabase'
import { WizardStep } from '../components/wizard/WizardStep'
import { ProFeatureButton } from '../components/ProGate'
import { SYSTEM_PRESETS, validateSystemParams, VALIDATION_RULES } from '../lib/simulator'
import { CLIMATE_PRESETS, detectClimateFromTimezone, getClimateEmoji, ClimateKey } from '../data/climate'
import { motion } from 'framer-motion'
import { 
  Settings,
  Home, 
  Fish, 
  Leaf, 
  DollarSign, 
  Zap,
  CheckCircle,
  Sparkles,
  Crown,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Thermometer,
  Sun
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
  fishSpecies: string[]
  cropChoice: string[]
  budget: string
  energySource: string
}

export function Wizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPro } = useSubscription()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [simulationCount, setSimulationCount] = useState(0)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [data, setData] = useState<WizardData>({
    climateKey: detectClimateFromTimezone(),
    customClimate: false,
    systemType: '',
    mode: 'quick',
    farmSize: '',
    fishSpecies: [],
    cropChoice: [],
    budget: '',
    energySource: '',
  })

  const totalSteps = 7
  const maxFreeSimulations = 3

  const handleNext = async () => {
    // Validate current step
    if ((currentStep === 0 && data.mode === 'custom') || (currentStep === 0 && data.customClimate)) {
      const validation = validateSystemParams(data)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        return
      }
    }
    setValidationErrors([])

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await completeWizard()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeWizard = async () => {
    if (!user) return

    // Check simulation limit for free users
    if (!isPro && simulationCount >= maxFreeSimulations) {
      return // This will be handled by the ProFeatureButton
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
      case 0:
        // Location step - always valid since we have auto-detection
        if (data.customClimate) {
          const validation = validateSystemParams(data)
          return validation.isValid
        }
        return true
      case 1:
        if (data.systemType === '') return false
        if (data.mode === 'custom') {
          const validation = validateSystemParams(data)
          return validation.isValid
        }
        return true
      case 2:
        return data.farmSize !== ''
      case 3:
        return data.fishSpecies.length > 0
      case 4:
        return data.cropChoice.length > 0
      case 5:
        return data.budget !== ''
      case 6:
        return data.energySource !== ''
      default:
        return false
    }
  }

  const updateData = (field: keyof WizardData, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-populate preset values when system type changes in quick mode
      if (field === 'systemType' && newData.mode === 'quick') {
        const preset = SYSTEM_PRESETS[value as keyof typeof SYSTEM_PRESETS]
        if (preset) {
          return {
            ...newData,
            tankVol: preset.tankVol,
            bioFilterVol: preset.bioFilterVol,
            purifierVol: preset.purifierVol,
            sumpVol: preset.sumpVol,
            pipeDia: preset.pipeDia
          }
        }
      }
      
      // Clear custom values when switching to quick mode
      if (field === 'mode' && value === 'quick' && newData.systemType) {
        const preset = SYSTEM_PRESETS[newData.systemType as keyof typeof SYSTEM_PRESETS]
        if (preset) {
          return {
            ...newData,
            tankVol: preset.tankVol,
            bioFilterVol: preset.bioFilterVol,
            purifierVol: preset.purifierVol,
            sumpVol: preset.sumpVol,
            pipeDia: preset.pipeDia
          }
        }
      }
      
      return newData
    })
    
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WizardStep
            title="Location & Climate"
            description="Select your climate zone for accurate yield and energy estimates"
            currentStep={currentStep + 1}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-6">
              {/* Auto-detected Climate */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl"
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-200">
                      Auto-detected: {getClimateEmoji(data.climateKey)} {CLIMATE_PRESETS[data.climateKey].label}
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Based on your timezone • {CLIMATE_PRESETS[data.climateKey].temp}°C • {CLIMATE_PRESETS[data.climateKey].solar}× solar
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Climate Preset Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(CLIMATE_PRESETS).map(([key, preset], index) => (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateData('climateKey', key as ClimateKey)}
                    className={`p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                      data.climateKey === key
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getClimateEmoji(key as ClimateKey)}</span>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {preset.label}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {preset.temp}°C • {preset.solar}× solar factor
                          </p>
                        </div>
                      </div>
                      {data.climateKey === key && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Custom Climate Toggle */}
              <div className="flex items-center justify-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                <span className={`text-sm font-medium ${!data.customClimate ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`}>
                  Preset Climate
                </span>
                <button
                  onClick={() => updateData('customClimate', !data.customClimate)}
                  className="relative"
                >
                  {!data.customClimate ? (
                    <ToggleLeft className="h-8 w-8 text-emerald-600" />
                  ) : (
                    <ToggleRight className="h-8 w-8 text-emerald-600" />
                  )}
                </button>
                <span className={`text-sm font-medium ${data.customClimate ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`}>
                  Custom Climate
                </span>
              </div>

              {/* Custom Climate Inputs */}
              {data.customClimate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Custom Climate Settings
                  </h3>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                            Validation Errors
                          </h4>
                          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                            {validationErrors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="h-4 w-4" />
                          <span>Average Water Temperature (°C)</span>
                        </div>
                      </label>
                      <input
                        type="number"
                        min={VALIDATION_RULES.customTemp.min}
                        max={VALIDATION_RULES.customTemp.max}
                        step="0.1"
                        value={data.customTemp || ''}
                        onChange={(e) => updateData('customTemp', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
                        placeholder={`${VALIDATION_RULES.customTemp.min}-${VALIDATION_RULES.customTemp.max}`}
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Range: {VALIDATION_RULES.customTemp.min}-{VALIDATION_RULES.customTemp.max}°C
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4" />
                          <span>Solar Radiation (kWh/m²/day)</span>
                        </div>
                      </label>
                      <input
                        type="number"
                        min={VALIDATION_RULES.customSolar.min}
                        max={VALIDATION_RULES.customSolar.max}
                        step="0.1"
                        value={data.customSolar || ''}
                        onChange={(e) => updateData('customSolar', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
                        placeholder={`${VALIDATION_RULES.customSolar.min}-${VALIDATION_RULES.customSolar.max}`}
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Range: {VALIDATION_RULES.customSolar.min}-{VALIDATION_RULES.customSolar.max} kWh/m²/day
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Custom Climate:</strong> Enter your local average water temperature and solar radiation values for more accurate yield predictions.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </WizardStep>
        )

      case 1:
        return (
          <WizardStep
            title="System Type & Configuration"
            description="Choose your aquaponic system type and configuration mode"
            currentStep={currentStep + 1}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-8">
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

              {/* Mode Toggle */}
              <div className="flex items-center justify-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                <span className={`text-sm font-medium ${data.mode === 'quick' ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`}>
                  Quick Setup
                </span>
                <button
                  onClick={() => updateData('mode', data.mode === 'quick' ? 'custom' : 'quick')}
                  className="relative"
                >
                  {data.mode === 'quick' ? (
                    <ToggleLeft className="h-8 w-8 text-emerald-600" />
                  ) : (
                    <ToggleRight className="h-8 w-8 text-emerald-600" />
                  )}
                </button>
                <span className={`text-sm font-medium ${data.mode === 'custom' ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`}>
                  Custom Setup
                </span>
              </div>

              {/* System Type Selection */}
              <div className="grid grid-cols-1 gap-6">
                {[
                  { 
                    value: 'media-bed', 
                    label: 'Media Bed System', 
                    desc: 'Uses gravel or clay pebbles as growing medium. Great for beginners.',
                    icon: '🪨',
                    difficulty: 'Beginner',
                    efficiency: '85%'
                  },
                  { 
                    value: 'nft', 
                    label: 'NFT System', 
                    desc: 'Nutrient Film Technique with shallow channels. Efficient and space-saving.',
                    icon: '🌊',
                    difficulty: 'Intermediate',
                    efficiency: '95%'
                  },
                  { 
                    value: 'dwc', 
                    label: 'DWC System', 
                    desc: 'Deep Water Culture with roots in oxygenated water. Fastest growth.',
                    icon: '💧',
                    difficulty: 'Advanced',
                    efficiency: '100%'
                  },
                ].map((option, index) => (
                  <motion.div
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                      data.systemType === option.value
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg'
                    }`}
                  >
                    <button
                      onClick={() => updateData('systemType', option.value)}
                      className="w-full p-6 text-left"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{option.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {option.label}
                            </h3>
                            {data.systemType === option.value && (
                              <CheckCircle className="h-6 w-6 text-emerald-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            {option.desc}
                          </p>
                          <div className="flex items-center space-x-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              option.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                              option.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {option.difficulty}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Efficiency: {option.efficiency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    {/* Preview SVG */}
                    <div className="px-6 pb-6">
                      <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                        <img 
                          src={`/svg/${option.value}.svg`} 
                          alt={`${option.label} diagram`}
                          className="w-full h-auto max-h-32 object-contain"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Custom Configuration Panel */}
              {data.systemType && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>System Configuration</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      data.mode === 'quick' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    }`}>
                      {data.mode === 'quick' ? 'Preset Values' : 'Custom Values'}
                    </span>
                  </h3>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                            Validation Errors
                          </h4>
                          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                            {validationErrors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'tankVol', label: 'Tank Volume (L)', min: VALIDATION_RULES.tankVol.min, max: VALIDATION_RULES.tankVol.max },
                      { key: 'bioFilterVol', label: 'Bio-Filter Volume (L)', min: VALIDATION_RULES.bioFilterVol.min, max: VALIDATION_RULES.bioFilterVol.max },
                      { key: 'purifierVol', label: 'Purifier Volume (L)', min: VALIDATION_RULES.purifierVol.min, max: VALIDATION_RULES.purifierVol.max },
                      { key: 'sumpVol', label: 'Sump Volume (L)', min: VALIDATION_RULES.sumpVol.min, max: VALIDATION_RULES.sumpVol.max },
                      { key: 'pipeDia', label: 'Pipe Diameter (mm)', min: VALIDATION_RULES.pipeDia.min, max: VALIDATION_RULES.pipeDia.max },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {field.label}
                        </label>
                        <input
                          type="number"
                          min={field.min}
                          max={field.max}
                          value={data[field.key as keyof WizardData] || ''}
                          onChange={(e) => updateData(field.key as keyof WizardData, parseInt(e.target.value) || 0)}
                          disabled={data.mode === 'quick'}
                          className={`w-full px-4 py-3 border rounded-2xl transition-colors ${
                            data.mode === 'quick' 
                              ? 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                          }`}
                          placeholder={`${field.min}-${field.max}`}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Range: {field.min}-{field.max}
                        </p>
                      </div>
                    ))}
                  </div>

                  {data.mode === 'quick' && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Quick Setup:</strong> Using optimized preset values for {data.systemType.toUpperCase()} systems. 
                        Switch to Custom Setup to modify these values.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </WizardStep>
        )

      case 2:
        return (
          <WizardStep
            title="Farm Size"
            description="What size aquaponic system are you planning?"
            currentStep={currentStep + 1}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'small', label: 'Small (Home/Hobby)', desc: 'Up to 50 sq ft', icon: '🏠' },
                  { value: 'medium', label: 'Medium (Commercial)', desc: '50-500 sq ft', icon: '🏢' },
                  { value: 'large', label: 'Large (Industrial)', desc: '500+ sq ft', icon: '🏭' },
                  { value: 'custom', label: 'Custom Size', desc: 'Tell us your specific needs', icon: '⚙️' },
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
            </div>
          </WizardStep>
        )

      case 3:
        return (
          <WizardStep
            title="Fish Species"
            description="Which fish species would you like to raise?"
            currentStep={currentStep + 1}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
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

      case 4:
        return (
          <WizardStep
            title="Crop Choice"
            description="What crops do you want to grow in your system?"
            currentStep={currentStep + 1}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
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

      case 5:
        return (
          <WizardStep
            title="Budget"
            description="What's your budget range for this aquaponic system?"
            currentStep={currentStep + 1}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { value: 'under-1000', label: 'Under $1,000', desc: 'Basic starter system', emoji: '💰' },
                  { value: '1000-5000', label: '$1,000 - $5,000', desc: 'Mid-range home system', emoji: '💵' },
                  { value: '5000-20000', label: '$5,000 - $20,000', desc: 'Commercial starter', emoji: '💸' },
                  { value: 'over-20000', label: 'Over $20,000', desc: 'Large commercial system', emoji: '🏦' },
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
            </div>
          </WizardStep>
        )

      case 6:
        return (
          <WizardStep
            title="Energy Source"
            description="How do you plan to power your aquaponic system?"
            currentStep={currentStep + 1}
            totalSteps={totalSteps}
            onNext={!isPro && simulationCount >= maxFreeSimulations ? () => {} : handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
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
      {renderStep()}
    </div>
  )
}