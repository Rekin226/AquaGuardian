import React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface WizardStepProps {
  title: string
  description: string
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  children: React.ReactNode
}

export function WizardStep({
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  canGoNext,
  children,
}: WizardStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        {children}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onPrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
          >
            <span>{currentStep === totalSteps ? 'Complete Setup' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}