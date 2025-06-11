import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'

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
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="relative">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          
          {/* Step indicators */}
          <div className="absolute top-0 left-0 w-full flex justify-between">
            {Array.from({ length: totalSteps }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`w-3 h-3 rounded-full border-2 ${
                  i + 1 <= currentStep
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                }`}
              >
                {i + 1 < currentStep && (
                  <CheckCircle className="w-3 h-3 text-white -m-0.5" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Step content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 lg:p-12"
      >
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3"
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-slate-600 dark:text-slate-400 text-lg"
          >
            {description}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {children}
        </motion.div>

        {/* Navigation buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-between mt-12 pt-8 border-t border-slate-200 dark:border-slate-700"
        >
          <button
            onClick={onPrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-700 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <span>{currentStep === totalSteps ? 'Complete Setup' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}