export interface GrokMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GrokResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class GrokAPIService {
  private static instance: GrokAPIService
  private apiKey: string | null = null

  static getInstance(): GrokAPIService {
    if (!GrokAPIService.instance) {
      GrokAPIService.instance = new GrokAPIService()
    }
    return GrokAPIService.instance
  }

  initialize(apiKey: string) {
    this.apiKey = apiKey
  }

  async chat(messages: GrokMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Grok API key not configured')
    }

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages,
          model: 'grok-beta',
          stream: false,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`)
      }

      const data: GrokResponse = await response.json()
      return data.choices[0]?.message?.content || 'No response from Grok'
    } catch (error) {
      console.error('Grok API error:', error)
      throw new Error('Failed to get response from Grok AI')
    }
  }

  async getAquaponicAdvice(
    question: string,
    systemContext: {
      systemType?: string
      farmSize?: string
      fishSpecies?: string[]
      crops?: string[]
      climate?: string
      budget?: number
      experienceLevel?: string
    }
  ): Promise<string> {
    const systemPrompt = `You are an expert aquaponics consultant with 20+ years of experience in sustainable agriculture. You provide practical, actionable advice for aquaponic system design and management.

Current system context:
- System Type: ${systemContext.systemType || 'Not specified'}
- Farm Size: ${systemContext.farmSize || 'Not specified'}
- Fish Species: ${systemContext.fishSpecies?.join(', ') || 'Not specified'}
- Crops: ${systemContext.crops?.join(', ') || 'Not specified'}
- Climate: ${systemContext.climate || 'Not specified'}
- Budget: ${systemContext.budget ? `$${systemContext.budget}` : 'Not specified'}
- Experience Level: ${systemContext.experienceLevel || 'Not specified'}

Guidelines:
- Provide specific, actionable advice
- Consider the user's experience level
- Reference the current system context when relevant
- Include practical tips and potential challenges
- Keep responses concise but comprehensive
- Focus on sustainable and efficient practices`

    const messages: GrokMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ]

    return await this.chat(messages)
  }

  isConfigured(): boolean {
    return this.apiKey !== null
  }
}

export const grokAPI = GrokAPIService.getInstance()