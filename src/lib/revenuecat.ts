import * as Purchases from '@revenuecat/purchases-js'
import { PurchasesOffering, CustomerInfo } from '@revenuecat/purchases-js'

// Initialize RevenueCat
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY

if (REVENUECAT_API_KEY) {
  Purchases.configure(REVENUECAT_API_KEY)
}

export interface Subscription {
  isActive: boolean
  productId: string | null
  expirationDate: Date | null
  willRenew: boolean
}

export class RevenueCatService {
  private static instance: RevenueCatService
  private initialized = false

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService()
    }
    return RevenueCatService.instance
  }

  async initialize(userId: string): Promise<void> {
    if (!REVENUECAT_API_KEY) {
      console.warn('RevenueCat API key not found. Subscription features disabled.')
      return
    }

    try {
      await Purchases.logIn(userId)
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error)
    }
  }

  async getSubscriptionStatus(): Promise<Subscription> {
    if (!this.initialized) {
      return {
        isActive: false,
        productId: null,
        expirationDate: null,
        willRenew: false
      }
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo()
      const proEntitlement = customerInfo.entitlements.active['pro']
      
      if (proEntitlement) {
        return {
          isActive: true,
          productId: proEntitlement.productIdentifier,
          expirationDate: new Date(proEntitlement.expirationDate!),
          willRenew: proEntitlement.willRenew
        }
      }

      return {
        isActive: false,
        productId: null,
        expirationDate: null,
        willRenew: false
      }
    } catch (error) {
      console.error('Failed to get subscription status:', error)
      return {
        isActive: false,
        productId: null,
        expirationDate: null,
        willRenew: false
      }
    }
  }

  async getOfferings(): Promise<PurchasesOffering[]> {
    if (!this.initialized) return []

    try {
      const offerings = await Purchases.getOfferings()
      return Object.values(offerings.all)
    } catch (error) {
      console.error('Failed to get offerings:', error)
      return []
    }
  }

  async purchasePackage(packageId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized) {
      return { success: false, error: 'RevenueCat not initialized' }
    }

    try {
      const offerings = await Purchases.getOfferings()
      const currentOffering = offerings.current
      
      if (!currentOffering) {
        return { success: false, error: 'No offerings available' }
      }

      const packageToPurchase = currentOffering.availablePackages.find(
        pkg => pkg.identifier === packageId
      )

      if (!packageToPurchase) {
        return { success: false, error: 'Package not found' }
      }

      await Purchases.purchasePackage(packageToPurchase)
      return { success: true }
    } catch (error: any) {
      console.error('Purchase failed:', error)
      return { success: false, error: error.message || 'Purchase failed' }
    }
  }

  async restorePurchases(): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized) {
      return { success: false, error: 'RevenueCat not initialized' }
    }

    try {
      await Purchases.restorePurchases()
      return { success: true }
    } catch (error: any) {
      console.error('Restore failed:', error)
      return { success: false, error: error.message || 'Restore failed' }
    }
  }
}

export const revenuecat = RevenueCatService.getInstance()