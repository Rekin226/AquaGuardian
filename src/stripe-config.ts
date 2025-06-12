// Stripe Product Configuration for AquaGuardian
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

// Product configuration based on provided Stripe products
export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SU6zhbF8WBSGLf',
    priceId: 'price_1RZ8lh4FSGO7OZ6CYV4tHt8h',
    name: 'AquaGuard',
    description: 'Premium aquaponic system monitoring and optimization',
    price: 5.00,
    currency: 'usd',
    mode: 'subscription',
    features: [
      'Real-time system monitoring',
      'Advanced analytics dashboard',
      'Performance optimization alerts',
      'Mobile app access',
      'Priority customer support',
      'Data export capabilities'
    ]
  }
]

// Helper function to get product by ID
export function getProductById(id: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.id === id)
}

// Helper function to get product by price ID
export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId)
}

// Default product (first in the list)
export const DEFAULT_PRODUCT = STRIPE_PRODUCTS[0]