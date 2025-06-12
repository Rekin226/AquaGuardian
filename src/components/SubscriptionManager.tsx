import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { useSubscription } from '../lib/subscription'
import { StripeCheckout } from './StripeCheckout'
import { STRIPE_PRODUCTS } from '../stripe-config'
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Loader
} from 'lucide-react'

export function SubscriptionManager() {
  const { user } = useAuth()
  const { subscription, isPro, isActive, productName, refreshSubscription } = useSubscription()
  const [showCheckout, setShowCheckout] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRefreshSubscription = async () => {
    setLoading(true)
    setError(null)

    try {
      await refreshSubscription()
    } catch (error: any) {
      setError(error.message || 'Failed to refresh subscription')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'text-emerald-600'
      case 'past_due':
        return 'text-amber-600'
      case 'canceled':
      case 'unpaid':
        return 'text-red-600'
      default:
        return 'text-slate-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'past_due':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case 'canceled':
      case 'unpaid':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <XCircle className="h-4 w-4 text-slate-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl ${isPro ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
              <Crown className={`h-6 w-6 ${isPro ? 'text-emerald-600' : 'text-slate-500'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {productName || (isPro ? 'Active Subscription' : 'Free Plan')}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {isPro ? 'All premium features unlocked' : 'Limited features available'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleRefreshSubscription}
            disabled={loading}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Subscription Details */}
        {subscription && isActive ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Next Billing
                  </span>
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Status
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(subscription.status)}
                  <span className={`text-lg font-semibold capitalize ${getStatusColor(subscription.status)}`}>
                    {subscription.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Payment Method
                  </span>
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {subscription.paymentMethodBrand && subscription.paymentMethodLast4
                    ? `${subscription.paymentMethodBrand.toUpperCase()} •••• ${subscription.paymentMethodLast4}`
                    : 'Not available'
                  }
                </p>
              </div>
            </div>

            {/* Subscription Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => window.open('https://billing.stripe.com/p/login/test_123', '_blank')}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Manage Billing</span>
              </button>
              
              {subscription.cancelAtPeriodEnd ? (
                <div className="flex items-center space-x-2 px-4 py-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Cancels at period end</span>
                </div>
              ) : (
                <button
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cancel Subscription</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Subscribe to {STRIPE_PRODUCTS[0]?.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {STRIPE_PRODUCTS[0]?.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {STRIPE_PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className="p-4 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-emerald-500 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      ${product.price}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {product.mode === 'subscription' ? 'per month' : 'one-time'}
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {product.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {product.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Choose Plan
            </button>
          </div>
        )}
      </motion.div>

      {/* Pro Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
      >
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          {STRIPE_PRODUCTS[0]?.name} Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STRIPE_PRODUCTS[0]?.features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="flex items-center space-x-3"
            >
              <CheckCircle className={`h-5 w-5 ${isPro ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className={`${isPro ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                {feature}
              </span>
            </motion.div>
          )) || []}
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center space-x-3"
        >
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Stripe Checkout Modal */}
      <StripeCheckout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </div>
  )
}