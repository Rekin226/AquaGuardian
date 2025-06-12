import { loadStripe, Stripe } from '@stripe/stripe-js'
import { supabase } from './supabase'

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

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
  priceId: string
  name: string
  description: string
  price: number
  currency: string
  mode: 'payment' | 'subscription'
  features: string[]
}

export interface CheckoutSessionResult {
  success: boolean
  url?: string
  sessionId?: string
  error?: string
}

export interface SubscriptionData {
  status: string
  priceId: string | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  paymentMethodBrand: string | null
  paymentMethodLast4: string | null
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

  async createCheckoutSession(
    priceId: string,
    mode: 'payment' | 'subscription',
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSessionResult> {
    try {
      // Get the current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.access_token) {
        return { success: false, error: 'User not authenticated' }
      }

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          mode,
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        console.error('Checkout session creation failed:', error)
        return { success: false, error: error.message || 'Failed to create checkout session' }
      }

      return {
        success: true,
        url: data.url,
        sessionId: data.sessionId,
      }
    } catch (error: any) {
      console.error('Checkout session creation failed:', error)
      return { success: false, error: error.message || 'Failed to create checkout session' }
    }
  }

  async getUserSubscription(): Promise<SubscriptionData | null> {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle()

      if (error) {
        console.error('Failed to fetch subscription:', error)
        return null
      }

      if (!data) {
        return null
      }

      return {
        status: data.subscription_status || 'not_started',
        priceId: data.price_id,
        currentPeriodStart: data.current_period_start 
          ? new Date(data.current_period_start * 1000) 
          : null,
        currentPeriodEnd: data.current_period_end 
          ? new Date(data.current_period_end * 1000) 
          : null,
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
        paymentMethodBrand: data.payment_method_brand,
        paymentMethodLast4: data.payment_method_last4,
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
      return null
    }
  }

  async getUserOrders() {
    try {
      const { data, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false })

      if (error) {
        console.error('Failed to fetch orders:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      return []
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