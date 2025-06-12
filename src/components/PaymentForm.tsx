import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { stripe } from '../lib/stripe'
import { 
  CreditCard, 
  Calendar, 
  Lock, 
  User,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'

interface PaymentFormProps {
  amount: number
  currency?: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  loading?: boolean
}

export function PaymentForm({ 
  amount, 
  currency = 'usd', 
  onSuccess, 
  onError, 
  loading = false 
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'US'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    stripe.initialize()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required'
    } else if (formData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Card number is invalid'
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required'
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be MM/YY format'
    }

    if (!formData.cvc) {
      newErrors.cvc = 'CVC is required'
    } else if (formData.cvc.length < 3) {
      newErrors.cvc = 'CVC must be at least 3 digits'
    }

    if (!formData.name) {
      newErrors.name = 'Cardholder name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (field === 'cvc') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4)
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setProcessing(true)

    try {
      // Create payment intent
      const paymentResult = await stripe.createPaymentIntent(amount, currency)
      
      if (!paymentResult.success || !paymentResult.paymentIntent) {
        throw new Error(paymentResult.error || 'Failed to create payment intent')
      }

      // In a real implementation, you would use Stripe Elements to securely collect
      // and tokenize the payment method. For demo purposes, we'll simulate this.
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock payment method object
      const mockPaymentMethod = {
        id: `pm_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        type: 'card',
        card: {
          brand: 'visa',
          last4: formData.cardNumber.slice(-4),
          exp_month: parseInt(formData.expiryDate.split('/')[0]),
          exp_year: parseInt('20' + formData.expiryDate.split('/')[1])
        },
        billing_details: {
          name: formData.name,
          email: formData.email,
          address: {
            line1: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country
          }
        }
      }

      // Confirm payment
      const confirmResult = await stripe.confirmPayment(
        paymentResult.paymentIntent.client_secret,
        mockPaymentMethod
      )

      if (confirmResult.success) {
        onSuccess(confirmResult.paymentIntent)
      } else {
        throw new Error(confirmResult.error || 'Payment confirmation failed')
      }
    } catch (error: any) {
      onError(error.message || 'Payment processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const isFormValid = Object.keys(errors).length === 0 && 
    formData.email && formData.cardNumber && formData.expiryDate && 
    formData.cvc && formData.name

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Display */}
      <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl">
        <div className="text-3xl font-bold text-emerald-600 mb-2">
          ${amount.toFixed(2)}
        </div>
        <div className="text-sm text-emerald-700 dark:text-emerald-300">
          One-time payment • Secure checkout
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
              errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
            } bg-white dark:bg-slate-700`}
            placeholder="your@email.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.email}</span>
          </p>
        )}
      </div>

      {/* Card Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Payment Information
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Card Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                errors.cardNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
              } bg-white dark:bg-slate-700`}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.cardNumber}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Expiry Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                  errors.expiryDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                } bg-white dark:bg-slate-700`}
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.expiryDate}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              CVC
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={formData.cvc}
                onChange={(e) => handleInputChange('cvc', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                  errors.cvc ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                } bg-white dark:bg-slate-700`}
                placeholder="123"
                maxLength={4}
              />
            </div>
            {errors.cvc && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.cvc}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Cardholder Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
              } bg-white dark:bg-slate-700`}
              placeholder="John Doe"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Billing Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Billing Address
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
              placeholder="123 Main Street"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
              placeholder="San Francisco"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700"
              placeholder="94102"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={!isFormValid || processing || loading}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
      >
        {processing || loading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader className="h-5 w-5 animate-spin" />
            <span>Processing Payment...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Pay ${amount.toFixed(2)}</span>
          </div>
        )}
      </motion.button>

      {/* Security Notice */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
          <CheckCircle className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Powered by Stripe • PCI DSS Compliant
        </p>
      </div>
    </form>
  )
}