// Stripe Subscription API endpoint

export async function POST(request: Request) {
  try {
    const { priceId, customerId } = await request.json()
    
    // Validate required environment variables
    const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY || import.meta.env.VITE_STRIPE_SECRET_KEY
    
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe secret key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe with secret key
    const stripe = require('stripe')(stripeSecretKey)

    let customer = customerId

    // Create customer if not provided
    if (!customer) {
      const newCustomer = await stripe.customers.create()
      customer = newCustomer.id
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    return new Response(
      JSON.stringify({
        id: subscription.id,
        status: subscription.status,
        client_secret: subscription.latest_invoice.payment_intent.client_secret,
        customer_id: customer,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Subscription creation error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}