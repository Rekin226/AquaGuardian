import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth'
import { stripe, SubscriptionData } from './stripe'
import { getProductByPriceId } from '../stripe-config'

interface SubscriptionContextType {
  subscription: SubscriptionData | null
  loading: boolean
  isPro: boolean
  isActive: boolean
  productName: string | null
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      initializeSubscription()
    } else {
      setSubscription(null)
      setLoading(false)
    }
  }, [user])

  const initializeSubscription = async () => {
    try {
      await stripe.initialize()
      await refreshSubscription()
    } catch (error) {
      console.error('Failed to initialize subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSubscription = async () => {
    try {
      const subscriptionData = await stripe.getUserSubscription()
      setSubscription(subscriptionData)
    } catch (error) {
      console.error('Failed to refresh subscription:', error)
    }
  }

  // Determine if user has an active subscription
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isPro = isActive

  // Get product name from subscription
  const productName = subscription?.priceId 
    ? getProductByPriceId(subscription.priceId)?.name || null
    : null

  const value = {
    subscription,
    loading,
    isPro,
    isActive,
    productName,
    refreshSubscription
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}