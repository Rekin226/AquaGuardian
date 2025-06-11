import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { WizardStep } from '../components/wizard/WizardStep'
import { 
  Home, 
  Fish, 
  Leaf, 
  DollarSign, 
  Zap,
  CheckCircle
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
                  { value: 'small', label: 'Small (Home/Hobby)', desc: 'Up to 50 sq ft' },
                  { value: 'medium', label: 'Medium (Commercial)', desc: '50-500 sq ft' },
                  { value: 'large', label: 'Large (Industrial)', desc: '500+ sq ft' },
                  { value: 'custom', label: 'Custom Size', desc: 'Tell us your specific needs' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateData('farmSize', option.value)}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      data.farmSize === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Home className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {option.desc}
                        </p>
                      </div>
                    </div>
                  </button>
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
                  'Tilapia',
                  'Trout',
                  'Catfish',
                  'Bass',
                  'Perch',
                  'Salmon',
                  'Koi',
                  'Goldfish',
                ].map((species) => (
                  <button
                    key={species}
                    onClick={() => {
                      const newSpecies = data.fishSpecies.includes(species)
                        ? data.fishSpecies.filter(s => s !== species)
                        : [...data.fishSpecies, species]
                      updateData('fishSpecies', newSpecies)
                    }}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      data.fishSpecies.includes(species)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Fish className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {species}
                      </span>
                      {data.fishSpecies.includes(species) && (
                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
                  'Lettuce',
                  'Spinach',
                  'Kale',
                  'Herbs (Basil, Mint)',
                  'Tomatoes',
                  'Cucumbers',
                  'Peppers',
                  'Strawberries',
                ].map((crop) => (
                  <button
                    key={crop}
                    onClick={() => {
                      const newCrops = data.cropChoice.includes(crop)
                        ? data.cropChoice.filter(c => c !== crop)
                        : [...data.cropChoice, crop]
                      updateData('cropChoice', newCrops)
                    }}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      data.cropChoice.includes(crop)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {crop}
                      </span>
                      {data.cropChoice.includes(crop) && (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
                  { value: 'under-1000', label: 'Under $1,000', desc: 'Basic starter system' },
                  { value: '1000-5000', label: '$1,000 - $5,000', desc: 'Mid-range home system' },
                  { value: '5000-20000', label: '$5,000 - $20,000', desc: 'Commercial starter' },
                  { value: 'over-20000', label: 'Over $20,000', desc: 'Large commercial system' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateData('budget', option.value)}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      data.budget === option.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mt-1" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {option.desc}
                        </p>
                      </div>
                    </div>
                  </button>
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
                  { value: 'grid', label: 'Grid Electricity', desc: 'Standard electrical power' },
                  { value: 'solar', label: 'Solar Power', desc: 'Renewable solar energy' },
                  { value: 'hybrid', label: 'Hybrid (Grid + Solar)', desc: 'Combination approach' },
                  { value: 'generator', label: 'Generator Backup', desc: 'Backup power solution' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateData('energySource', option.value)}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      data.energySource === option.value
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-1" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {option.desc}
                        </p>
                      </div>
                    </div>
                  </button>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Creating your aquaponic design...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {renderStep()}
    </div>
  )
}