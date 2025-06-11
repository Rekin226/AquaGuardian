import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { WizardStep } from '../components/wizard/WizardStep'
import { motion } from 'framer-motion'
import { 
  Home, 
  Fish, 
  Leaf, 
  DollarSign, 
  Zap,
  CheckCircle,
  Sparkles
} from 'lucide-react'

interface WizardData {
  farmSize: string
  fishSpecies: string[]
  cropChoice: string[]
  budget: string
  energySource: string
}

export function Wizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<WizardData>({
    farmSize: '',
    fishSpecies: [],
    cropChoice: [],
    budget: '',
    energySource: '',
  })

  const totalSteps = 5

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

  const completeWizard = async () => {
    if (!user) return

    setLoading(true)
    try {
      const designName = `Aquaponic System - ${new Date().toLocaleDateString()}`
      
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
        return data.farmSize !== ''
      case 2:
        return data.fishSpecies.length > 0
      case 3:
        return data.cropChoice.length > 0
      case 4:
        return data.budget !== ''
      case 5:
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
            title="Farm Size"
            description="What size aquaponic system are you planning?"
            currentStep={currentStep}
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

      case 2:
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

      case 3:
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

      case 4:
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

      case 5:
        return (
          <WizardStep
            title="Energy Source"
            description="How do you plan to power your aquaponic system?"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
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