import { simulate, batchSimulate, WizardParams } from '../../lib/simulator'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Handle single simulation
    if (body.params && !Array.isArray(body.params)) {
      const result = simulate(body.params as WizardParams)
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }
    
    // Handle batch simulation
    if (body.params && Array.isArray(body.params)) {
      const results = batchSimulate(body.params as WizardParams[])
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }
    
    return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  } catch (error) {
    console.error('Simulation API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
}