import React, { useState } from 'react'
import { useSubscription } from '../lib/subscription'
import { PaywallModal } from './PaywallModal'
import { Crown, Lock } from 'lucide-react'

interface ProGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProGate({ feature, children, fallback }: ProGateProps) {
  const { isPro } = useSubscription()
  const [showPaywall, setShowPaywall] = useState(false)

  if (isPro) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent dark:from-slate-800/90 z-10 flex items-center justify-center rounded-2xl">
          <button
            onClick={() => setShowPaywall(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Crown className="h-5 w-5" />
            <span>Upgrade to Pro</span>
          </button>
        </div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={feature}
      />
    </>
  )
}

export function ProBadge() {
  const { isPro } = useSubscription()

  if (!isPro) return null

  return (
    <div className="inline-flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium">
      <Crown className="h-3 w-3" />
      <span>Pro</span>
    </div>
  )
}

export function ProFeatureButton({ feature, onClick, children, className = '' }: {
  feature: string
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  const { isPro } = useSubscription()
  const [showPaywall, setShowPaywall] = useState(false)

  const handleClick = () => {
    if (isPro) {
      onClick()
    } else {
      setShowPaywall(true)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`relative ${className}`}
      >
        {children}
        {!isPro && (
          <div className="absolute -top-1 -right-1">
            <Lock className="h-4 w-4 text-amber-500" />
          </div>
        )}
      </button>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={feature}
      />
    </>
  )
}