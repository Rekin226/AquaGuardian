// Stripe Checkout Session API endpoint
// This would typically be implemented as a serverless function or API route

export async function POST(request: Request) {
  try {
    const { priceId, successUrl, cancelUrl } = await request.json()
    
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_creation: 'always',
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Checkout session creation error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}