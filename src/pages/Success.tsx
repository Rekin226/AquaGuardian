import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSubscription } from '../lib/subscription'
import { CheckCircle, Crown, ArrowRight, Sparkles } from 'lucide-react'

export function Success() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshSubscription, productName } = useSubscription()

  useEffect(() => {
    // Refresh subscription data when user lands on success page
    refreshSubscription()
  }, [refreshSubscription])

  const sessionId = searchParams.get('session_id')
  const isFromCheckout = searchParams.get('success') === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Welcome to {productName || 'AquaGuard'}
            </p>
          </motion.div>
        </motion.div>

        {/* Success Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 mb-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full mb-4">
              <Crown className="h-5 w-5" />
              <span className="font-medium">Subscription Active</span>
            </div>
            
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
              You're all set!
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Your subscription has been activated and you now have access to all premium features.
            </p>
          </div>

          {/* What's Next */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              What's next?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    Explore Premium Features
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Access advanced analytics, unlimited monitoring, and priority support.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    Manage Your Account
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Update billing information and manage your subscription settings.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Session Info */}
          {sessionId && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">Transaction ID:</span> {sessionId}
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/wizard')}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span>Start Using AquaGuardian</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => navigate('/account/billing')}
            className="flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-8 py-3 rounded-2xl font-medium transition-all duration-200"
          >
            <span>Manage Subscription</span>
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@aquaguardian.green" className="text-emerald-600 hover:text-emerald-700">
              support@aquaguardian.green
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}