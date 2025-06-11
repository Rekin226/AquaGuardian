import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { useSubscription } from '../lib/subscription'
import { revenuecat } from '../lib/revenuecat'
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader,
  AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function Billing() {
  const { user } = useAuth()
  const { subscription, isPro, refreshSubscription } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await refreshSubscription()
      setSuccess('Subscription status updated successfully')
    } catch (error: any) {
      setError(error.message || 'Failed to refresh subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await revenuecat.restorePurchases()
      
      if (result.success) {
        await refreshSubscription()
        setSuccess('Purchases restored successfully')
      } else {
        setError(result.error || 'Failed to restore purchases')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to restore purchases')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Link
              to="/wizard"
              className="p-3 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Billing & Subscription
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your Pro Designer subscription
              </p>
            </div>
          </div>
        </motion.div>

        {/* Status Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center space-x-3"
          >
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3"
          >
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <p className="text-emerald-700 dark:text-emerald-300">{success}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Subscription Status
              </h2>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Plan Status */}
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${isPro ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-200 dark:bg-slate-600'}`}>
                    <Crown className={`h-6 w-6 ${isPro ? 'text-emerald-600' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {isPro ? 'Pro Designer' : 'Free Plan'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {isPro ? 'All premium features unlocked' : 'Limited features available'}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isPro 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                }`}>
                  {isPro ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Subscription Details */}
              {isPro && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-2xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Next Billing Date
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {formatDate(subscription.expirationDate)}
                    </p>
                  </div>

                  <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-2xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Renewal Status
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {subscription.willRenew ? 'Auto-renew' : 'Cancelled'}
                    </p>
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-2xl">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Account Email
                  </span>
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {user?.email || 'Not available'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Upgrade/Manage */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
              </h3>
              
              {!isPro ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">$9</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">per month</div>
                  </div>
                  <Link
                    to="/wizard"
                    className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-2xl font-medium text-center transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Upgrade Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manage your subscription through your app store or payment provider.
                  </p>
                  <button
                    onClick={handleRestore}
                    disabled={loading}
                    className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 py-3 rounded-2xl font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Restoring...</span>
                      </div>
                    ) : (
                      'Restore Purchases'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Support */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Need Help?
              </h3>
              <div className="space-y-3">
                <a
                  href="mailto:support@aquaguardian.green"
                  className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <span>Contact Support</span>
                </a>
                <a
                  href="/terms"
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>Terms of Service</span>
                </a>
                <a
                  href="/privacy"
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>Privacy Policy</span>
                </a>
              </div>
            </div>

            {/* Domain Info */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                    Custom Domain
                  </h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    This site is configured to use the custom domain{' '}
                    <code className="bg-emerald-100 dark:bg-emerald-800 px-1 rounded">
                      aquaguardian.green
                    </code>
                    {' '}via Entri domain mapping.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}