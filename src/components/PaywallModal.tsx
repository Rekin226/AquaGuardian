import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { revenuecat } from '../lib/revenuecat'
import { useSubscription } from '../lib/subscription'
import { 
  X, 
  Crown, 
  Check, 
  Zap, 
  Infinity, 
  Shield,
  Sparkles,
  Loader
} from 'lucide-react'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
}

export function PaywallModal({ isOpen, onClose, feature }: PaywallModalProps) {
  const { refreshSubscription } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await revenuecat.purchasePackage('pro_monthly')
      
      if (result.success) {
        await refreshSubscription()
        onClose()
      } else {
        setError(result.error || 'Purchase failed')
      }
    } catch (error: any) {
      setError(error.message || 'Purchase failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await revenuecat.restorePurchases()
      
      if (result.success) {
        await refreshSubscription()
        onClose()
      } else {
        setError(result.error || 'Restore failed')
      }
    } catch (error: any) {
      setError(error.message || 'Restore failed')
    } finally {
      setLoading(false)
    }
  }

  const proFeatures = [
    { icon: Infinity, text: 'Unlimited system simulations' },
    { icon: Zap, text: 'Advanced performance analytics' },
    { icon: Shield, text: 'Unlimited token minting' },
    { icon: Sparkles, text: 'Priority customer support' },
    { icon: Crown, text: 'Export detailed reports' },
    { icon: Check, text: 'Commercial usage rights' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4"
                >
                  <Crown className="h-8 w-8" />
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro Designer</h2>
                <p className="text-emerald-100">
                  Unlock {feature} and all premium features
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="inline-flex items-baseline space-x-1">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$9</span>
                  <span className="text-slate-600 dark:text-slate-400">/month</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Cancel anytime • 7-day free trial
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {proFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                      <feature.icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
                >
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Start Free Trial'
                  )}
                </motion.button>

                <button
                  onClick={handleRestore}
                  disabled={loading}
                  className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-3 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Already subscribed? Restore purchases
                </button>
              </div>

              {/* Terms */}
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6 leading-relaxed">
                By subscribing, you agree to our Terms of Service and Privacy Policy. 
                Subscription automatically renews unless cancelled.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}