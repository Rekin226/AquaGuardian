import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DollarSign, 
  Save, 
  Check, 
  AlertCircle, 
  Trash2,
  Edit3,
  Calculator,
  TrendingUp
} from 'lucide-react'
import { 
  validateBudget, 
  formatCurrency, 
  detectUserCurrency,
  saveCustomBudget,
  loadCustomBudget,
  clearCustomBudget,
  getBudgetCategory,
  BUDGET_PRESETS,
  type CustomBudget
} from '../lib/budget'

interface CustomBudgetInputProps {
  value?: number
  currency?: string
  onSave: (amount: number, currency: string) => void
  onClear?: () => void
  className?: string
}

export function CustomBudgetInput({ 
  value, 
  currency: propCurrency, 
  onSave, 
  onClear,
  className = '' 
}: CustomBudgetInputProps) {
  const [amount, setAmount] = useState<string>(value?.toString() || '')
  const [currency, setCurrency] = useState<string>(propCurrency || detectUserCurrency())
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedBudget, setSavedBudget] = useState<CustomBudget | null>(null)

  useEffect(() => {
    // Load saved budget on component mount
    const loaded = loadCustomBudget()
    if (loaded) {
      setSavedBudget(loaded)
      if (!value) {
        setAmount(loaded.amount.toString())
        setCurrency(loaded.currency)
      }
    }
  }, [value])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow only numbers and decimal point
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      setAmount(inputValue)
      setError(null)
    }
  }

  const handleSave = async () => {
    const numericAmount = parseFloat(amount)
    const validation = validateBudget(numericAmount)
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid budget amount')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Simulate save delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      saveCustomBudget(numericAmount, currency)
      setSavedBudget({
        amount: numericAmount,
        currency,
        lastUpdated: new Date()
      })
      
      onSave(numericAmount, currency)
      setIsEditing(false)
      setShowSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      setError('Failed to save budget. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your custom budget? This action cannot be undone.')) {
      clearCustomBudget()
      setSavedBudget(null)
      setAmount('')
      setIsEditing(false)
      setError(null)
      onClear?.()
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancel = () => {
    if (savedBudget) {
      setAmount(savedBudget.amount.toString())
      setCurrency(savedBudget.currency)
    } else {
      setAmount('')
    }
    setIsEditing(false)
    setError(null)
  }

  const numericAmount = parseFloat(amount)
  const isValidAmount = !isNaN(numericAmount) && numericAmount > 0
  const budgetCategory = isValidAmount ? getBudgetCategory(numericAmount) : null
  const categoryLabel = budgetCategory ? BUDGET_PRESETS[budgetCategory as keyof typeof BUDGET_PRESETS].label : null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Budget Display/Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Custom Budget
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Set your total project budget
              </p>
            </div>
          </div>
          
          {savedBudget && !isEditing && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                title="Edit budget"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={handleClear}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                title="Clear budget"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Budget Amount Display/Input */}
        {!isEditing && savedBudget ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <div className="text-4xl font-bold text-emerald-600 mb-2">
              {formatCurrency(savedBudget.amount, savedBudget.currency)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Total Project Budget
            </div>
            {categoryLabel && (
              <div className="inline-flex items-center space-x-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm">
                <TrendingUp className="h-3 w-3" />
                <span>{categoryLabel} Range</span>
              </div>
            )}
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Last updated: {savedBudget.lastUpdated.toLocaleDateString()}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Amount Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Budget Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter your budget"
                    className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-lg font-medium ${
                      error ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                    } bg-white dark:bg-slate-700`}
                  />
                </div>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="BRL">BRL (R$)</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            {isValidAmount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(numericAmount, currency)}
                    </div>
                    {categoryLabel && (
                      <div className="text-sm text-emerald-700 dark:text-emerald-300">
                        {categoryLabel} Range
                      </div>
                    )}
                  </div>
                  <Calculator className="h-6 w-6 text-emerald-600" />
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!isValidAmount || isSaving}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Budget</span>
                  </>
                )}
              </motion.button>

              {isEditing && (
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-600 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center space-x-3"
          >
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3"
          >
            <Check className="h-5 w-5 text-emerald-600" />
            <p className="text-emerald-700 dark:text-emerald-300">
              Budget saved successfully! Your settings have been updated.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6"
      >
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Budget Guidelines
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              What's Included:
            </h5>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• System components and equipment</li>
              <li>• Installation and setup costs</li>
              <li>• Initial fish and plant stock</li>
              <li>• Basic monitoring equipment</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Additional Costs:
            </h5>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• Monthly operating expenses</li>
              <li>• Electricity and water usage</li>
              <li>• Fish feed and nutrients</li>
              <li>• Maintenance and replacements</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}