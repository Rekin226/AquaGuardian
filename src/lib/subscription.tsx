import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth'
import { revenuecat, Subscription } from './revenuecat'

interface SubscriptionContextType {
  subscription: Subscription
  loading: boolean
  isPro: boolean
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription>({
    isActive: false,
    productId: null,
    expirationDate: null,
    willRenew: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      initializeSubscription()
    } else {
      setLoading(false)
    }
  }, [user])

  const initializeSubscription = async () => {
    if (!user) return

    try {
      await revenuecat.initialize(user.id)
      await refreshSubscription()
    } catch (error) {
      console.error('Failed to initialize subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSubscription = async () => {
    try {
      const status = await revenuecat.getSubscriptionStatus()
      setSubscription(status)
    } catch (error) {
      console.error('Failed to refresh subscription:', error)
    }
  }

  const isPro = subscription.isActive

  const value = {
    subscription,
    loading,
    isPro,
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