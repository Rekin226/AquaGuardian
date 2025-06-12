import { loadStripe, Stripe } from '@stripe/stripe-js'

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY

// Initialize Stripe
let stripePromise: Promise<Stripe | null>

if (STRIPE_PUBLISHABLE_KEY) {
  stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
} else {
  console.warn('Stripe publishable key not found. Payment features will be disabled.')
  stripePromise = Promise.resolve(null)
}

export interface StripeProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  client_secret: string
}

export interface SubscriptionResult {
  success: boolean
  subscription?: any
  error?: string
}

export interface PaymentResult {
  success: boolean
  paymentIntent?: PaymentIntent
  error?: string
}

export class StripeService {
  private static instance: StripeService
  private stripe: Stripe | null = null
  private initialized = false

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService()
    }
    return StripeService.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      this.stripe = await stripePromise
      this.initialized = true
      
      if (!this.stripe) {
        console.warn('Stripe failed to initialize. Check your publishable key.')
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
    }
  }

  async createPaymentIntent(amount: number, currency = 'usd'): Promise<PaymentResult> {
    if (!this.stripe) {
      return { success: false, error: 'Stripe not initialized' }
    }

    try {
      // Call your backend API to create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const paymentIntent = await response.json()
      return { success: true, paymentIntent }
    } catch (error: any) {
      console.error('Payment intent creation failed:', error)
      return { success: false, error: error.message || 'Payment intent creation failed' }
    }
  }

  async confirmPayment(clientSecret: string, paymentMethod: any): Promise<PaymentResult> {
    if (!this.stripe) {
      return { success: false, error: 'Stripe not initialized' }
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, paymentIntent }
    } catch (error: any) {
      console.error('Payment confirmation failed:', error)
      return { success: false, error: error.message || 'Payment confirmation failed' }
    }
  }

  async createSubscription(priceId: string, customerId?: string): Promise<SubscriptionResult> {
    try {
      // Call your backend API to create subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      const subscription = await response.json()
      return { success: true, subscription }
    } catch (error: any) {
      console.error('Subscription creation failed:', error)
      return { success: false, error: error.message || 'Subscription creation failed' }
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<SubscriptionResult> {
    try {
      // Call your backend API to cancel subscription
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const subscription = await response.json()
      return { success: true, subscription }
    } catch (error: any) {
      console.error('Subscription cancellation failed:', error)
      return { success: false, error: error.message || 'Subscription cancellation failed' }
    }
  }

  async getProducts(): Promise<StripeProduct[]> {
    // Return predefined products for AquaGuardian
    return [
      {
        id: 'price_1234567890', // Use actual Stripe price ID
        name: 'Pro Designer Monthly',
        description: 'Unlimited simulations, advanced analytics, and premium features',
        price: 9,
        currency: 'usd',
        interval: 'month',
        features: [
          'Unlimited system simulations',
          'Advanced performance analytics',
          'Unlimited token minting',
          'Priority customer support',
          'Detailed PDF exports',
          'Commercial usage rights'
        ]
      },
      {
        id: 'price_0987654321', // Use actual Stripe price ID
        name: 'Pro Designer Yearly',
        description: 'Annual subscription with 2 months free',
        price: 99,
        currency: 'usd',
        interval: 'year',
        features: [
          'All Pro Monthly features',
          '2 months free (save $18)',
          'Priority feature requests',
          'Dedicated account manager',
          'Custom integrations',
          'White-label options'
        ]
      }
    ]
  }

  async createCheckoutSession(priceId: string, successUrl: string, cancelUrl: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Call your backend API to create Stripe Checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl,
          cancelUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      return { success: true, url }
    } catch (error: any) {
      console.error('Checkout session creation failed:', error)
      return { success: false, error: error.message || 'Checkout session creation failed' }
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.stripe !== null
  }

  getStripe(): Stripe | null {
    return this.stripe
  }
}

export const stripe = StripeService.getInstance()