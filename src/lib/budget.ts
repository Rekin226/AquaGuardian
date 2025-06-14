export interface CustomBudget {
  amount: number
  currency: string
  lastUpdated: Date
}

export interface BudgetValidation {
  isValid: boolean
  error?: string
}

// Budget validation rules
export const BUDGET_VALIDATION = {
  min: 100,
  max: 1000000
}

// Default budget presets
export const BUDGET_PRESETS = {
  'under-1000': { min: 0, max: 1000, label: 'Under $1,000' },
  '1000-5000': { min: 1000, max: 5000, label: '$1,000 - $5,000' },
  '5000-20000': { min: 5000, max: 20000, label: '$5,000 - $20,000' },
  'over-20000': { min: 20000, max: Infinity, label: 'Over $20,000' },
  'custom': { min: 0, max: Infinity, label: 'Custom Amount' }
}

/**
 * Validates custom budget amount
 */
export function validateBudget(amount: number): BudgetValidation {
  if (isNaN(amount) || amount <= 0) {
    return {
      isValid: false,
      error: 'Budget amount must be a positive number'
    }
  }

  if (amount < BUDGET_VALIDATION.min) {
    return {
      isValid: false,
      error: `Budget must be at least $${BUDGET_VALIDATION.min.toLocaleString()}`
    }
  }

  if (amount > BUDGET_VALIDATION.max) {
    return {
      isValid: false,
      error: `Budget cannot exceed $${BUDGET_VALIDATION.max.toLocaleString()}`
    }
  }

  return { isValid: true }
}

/**
 * Formats currency amount according to user's locale
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  } catch (error) {
    // Fallback to USD if currency is not supported
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
}

/**
 * Detects user's currency from locale
 */
export function detectUserCurrency(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale
    const currencyMap: Record<string, string> = {
      'en-US': 'USD',
      'en-GB': 'GBP',
      'en-CA': 'CAD',
      'en-AU': 'AUD',
      'de': 'EUR',
      'fr': 'EUR',
      'es': 'EUR',
      'it': 'EUR',
      'nl': 'EUR',
      'ja': 'JPY',
      'zh': 'CNY',
      'ko': 'KRW',
      'pt-BR': 'BRL',
      'ru': 'RUB',
      'in': 'INR'
    }
    
    // Check exact match first
    if (currencyMap[locale]) {
      return currencyMap[locale]
    }
    
    // Check language prefix
    const language = locale.split('-')[0]
    return currencyMap[language] || 'USD'
  } catch (error) {
    return 'USD'
  }
}

/**
 * Saves custom budget to localStorage
 */
export function saveCustomBudget(amount: number, currency: string = 'USD'): void {
  const customBudget: CustomBudget = {
    amount,
    currency,
    lastUpdated: new Date()
  }
  
  localStorage.setItem('aquaguardian_custom_budget', JSON.stringify(customBudget))
}

/**
 * Loads custom budget from localStorage
 */
export function loadCustomBudget(): CustomBudget | null {
  try {
    const stored = localStorage.getItem('aquaguardian_custom_budget')
    if (!stored) return null
    
    const parsed = JSON.parse(stored)
    return {
      ...parsed,
      lastUpdated: new Date(parsed.lastUpdated)
    }
  } catch (error) {
    console.warn('Failed to load custom budget from localStorage:', error)
    return null
  }
}

/**
 * Clears custom budget from localStorage
 */
export function clearCustomBudget(): void {
  localStorage.removeItem('aquaguardian_custom_budget')
}

/**
 * Gets budget efficiency factor for custom amounts
 */
export function getCustomBudgetEfficiency(amount: number): number {
  if (amount < 1000) return 0.75
  if (amount < 5000) return 0.85
  if (amount < 20000) return 0.95
  return 1.0
}

/**
 * Determines which preset range a custom amount falls into
 */
export function getBudgetCategory(amount: number): string {
  if (amount < 1000) return 'under-1000'
  if (amount < 5000) return '1000-5000'
  if (amount < 20000) return '5000-20000'
  return 'over-20000'
}