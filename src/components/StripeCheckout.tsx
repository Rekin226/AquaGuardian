import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { stripe, StripeProduct } from '../lib/stripe'
import { useAuth } from '../lib/auth'
import { useSubscription } from '../lib/subscription'
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Crown, 
  Loader,
  AlertCircle,
  ExternalLink,
  Lock
} from 'lucide-react'

interface StripeCheckoutProps {
  isOpen: boolean
  onClose: () => void
  product?: StripeProduct
}

export function StripeCheckout({ isOpen, onClose, product }: StripeCheckoutProps) {
  const { user } = useAuth()
  const { refreshSubscription } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<StripeProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<StripeProduct | null>(product || null)

  useEffect(() => {
    if (isOpen) {
      initializeStripe()
      loadProducts()
    }
  }, [isOpen])

  const initializeStripe = async () => {
    try {
      await stripe.initialize()
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
      setError('Payment system unavailable. Please try again later.')
    }
  }

  const loadProducts = async () => {
    try {
      const availableProducts = await stripe.getProducts()
      setProducts(availableProducts)
      
      if (!selectedProduct && availableProducts.length > 0) {
        setSelectedProduct(availableProducts[0])
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const handleCheckout = async () => {
    if (!selectedProduct || !user) return

    setLoading(true)
    setError(null)

    try {
      const successUrl = `${window.location.origin}/account/billing?success=true`
      const cancelUrl = `${window.location.origin}/account/billing?canceled=true`

      const result = await stripe.createCheckoutSession(
        selectedProduct.id,
        successUrl,
        cancelUrl
      )

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url
      } else {
        setError(result.error || 'Failed to create checkout session')
      }
    } catch (error: any) {
      setError(error.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDirectPayment = async () => {
    if (!selectedProduct || !user) return

    setLoading(true)
    setError(null)

    try {
      // Create payment intent
      const paymentResult = await stripe.createPaymentIntent(selectedProduct.price)
      
      if (paymentResult.success) {
        // In a real implementation, you would collect payment method details
        // and confirm the payment. For demo purposes, we'll simulate success.
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Create subscription
        const subscriptionResult = await stripe.createSubscription(selectedProduct.id, user.id)
        
        if (subscriptionResult.success) {
          await refreshSubscription()
          onClose()
        } else {
          setError(subscriptionResult.error || 'Subscription creation failed')
        }
      } else {
        setError(paymentResult.error || 'Payment failed')
      }
    } catch (error: any) {
      setError(error.message || 'Payment processing failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            ×
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
            
            <h2 className="text-3xl font-bold mb-2">Upgrade to Pro Designer</h2>
            <p className="text-emerald-100">
              Unlock unlimited simulations and premium features
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Product Selection */}
          {products.length > 1 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Choose Your Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                      selectedProduct?.id === prod.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {prod.name}
                      </h4>
                      {prod.interval === 'year' && (
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-xs font-medium">
                          Save 18%
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      ${prod.price}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      per {prod.interval}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {prod.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Product Features */}
          {selectedProduct && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                What's Included
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedProduct.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Payment Options
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                disabled={loading || !selectedProduct}
                className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <div className="text-left">
                    <div className="font-medium text-slate-900 dark:text-white">
                      Stripe Checkout
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Secure payment with credit card or digital wallet
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={handleDirectPayment}
                disabled={loading || !selectedProduct}
                className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <div className="text-left">
                    <div className="font-medium text-slate-900 dark:text-white">
                      Direct Payment
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Pay directly within the app (Demo)
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center space-x-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Security & Trust */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Cancel Anytime</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4 leading-relaxed">
              By subscribing, you agree to our Terms of Service and Privacy Policy. 
              Subscription automatically renews unless cancelled. Cancel anytime from your account settings.
            </p>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Processing payment...</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}