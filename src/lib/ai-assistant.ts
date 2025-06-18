import { WizardParams, SimulationResult, simulate, batchSimulate } from './simulator'
import { CLIMATE_PRESETS, type ClimateKey } from '../data/climate'

export interface UserGoals {
  primaryPurpose: 'food_production' | 'education' | 'commercial' | 'hobby' | 'research'
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  timeCommitment: 'low' | 'medium' | 'high'
  spaceConstraints: 'indoor' | 'outdoor' | 'greenhouse' | 'mixed'
  sustainabilityFocus: 'high' | 'medium' | 'low'
}

export interface LocationContext {
  climateKey: ClimateKey
  customClimate?: {
    temp: number
    solar: number
  }
  timezone?: string
  seasonality?: 'year_round' | 'seasonal'
}

export interface BudgetConstraints {
  totalBudget: number
  currency: string
  prioritizeUpfront: boolean // vs ongoing costs
  includesLabor: boolean
}

export interface AIRecommendation {
  confidence: number // 0-1
  reasoning: string
  systemType: string
  farmSize: string
  customFarmSize?: number
  fishSpecies: string[]
  cropChoice: string[]
  energySource: string
  estimatedResults: SimulationResult
  alternatives: Array<{
    name: string
    changes: Partial<WizardParams>
    tradeoffs: string
    confidence: number
  }>
  tips: string[]
  warnings?: string[]
}

export class AIDesignAssistant {
  private static instance: AIDesignAssistant

  static getInstance(): AIDesignAssistant {
    if (!AIDesignAssistant.instance) {
      AIDesignAssistant.instance = new AIDesignAssistant()
    }
    return AIDesignAssistant.instance
  }

  /**
   * Generate AI-powered recommendations based on user goals, location, and budget
   */
  async generateRecommendations(
    goals: UserGoals,
    location: LocationContext,
    budget: BudgetConstraints
  ): Promise<AIRecommendation> {
    // Analyze user context and generate optimal configuration
    const baseConfig = this.analyzeUserContext(goals, location, budget)
    
    // Run simulations for multiple configurations
    const alternatives = this.generateAlternatives(baseConfig, goals, budget)
    const allConfigs = [baseConfig, ...alternatives.map(alt => ({ ...baseConfig, ...alt.changes }))]
    
    // Batch simulate all configurations
    const results = batchSimulate(allConfigs)
    const primaryResult = results[0]
    
    // Calculate confidence based on multiple factors
    const confidence = this.calculateConfidence(baseConfig, goals, location, budget)
    
    // Generate reasoning and tips
    const reasoning = this.generateReasoning(baseConfig, goals, location, budget)
    const tips = this.generateTips(baseConfig, goals, primaryResult)
    const warnings = this.generateWarnings(baseConfig, goals, budget, primaryResult)

    return {
      confidence,
      reasoning,
      systemType: baseConfig.systemType!,
      farmSize: baseConfig.farmSize,
      customFarmSize: baseConfig.customFarmSize,
      fishSpecies: baseConfig.fishSpecies,
      cropChoice: baseConfig.cropChoice,
      energySource: baseConfig.energySource,
      estimatedResults: primaryResult,
      alternatives: alternatives.map((alt, index) => ({
        ...alt,
        confidence: this.calculateAlternativeConfidence(alt, results[index + 1])
      })),
      tips,
      warnings
    }
  }

  private analyzeUserContext(
    goals: UserGoals,
    location: LocationContext,
    budget: BudgetConstraints
  ): WizardParams {
    // Determine optimal system type based on experience and goals
    const systemType = this.selectSystemType(goals, budget)
    
    // Calculate appropriate farm size
    const farmSizing = this.calculateFarmSize(goals, budget)
    
    // Select fish species based on experience and climate
    const fishSpecies = this.selectFishSpecies(goals, location)
    
    // Choose crops based on goals and system type
    const cropChoice = this.selectCrops(goals, location, systemType)
    
    // Determine energy source based on budget and sustainability focus
    const energySource = this.selectEnergySource(goals, budget, location)
    
    // Convert budget to appropriate category
    const budgetCategory = this.categorizeBudget(budget)

    return {
      climateKey: location.climateKey,
      customClimate: !!location.customClimate,
      customTemp: location.customClimate?.temp,
      customSolar: location.customClimate?.solar,
      systemType,
      mode: goals.experienceLevel === 'advanced' ? 'custom' : 'quick',
      farmSize: farmSizing.category,
      customFarmSize: farmSizing.customSize,
      fishSpecies,
      cropChoice,
      budget: budgetCategory,
      customBudget: budget.totalBudget,
      customBudgetCurrency: budget.currency,
      energySource
    }
  }

  private selectSystemType(goals: UserGoals, budget: BudgetConstraints): string {
    // Beginner-friendly and budget-conscious: Media Bed
    if (goals.experienceLevel === 'beginner' || budget.totalBudget < 2000) {
      return 'media-bed'
    }
    
    // Commercial or high production focus: DWC for efficiency
    if (goals.primaryPurpose === 'commercial' || goals.primaryPurpose === 'food_production') {
      return 'dwc'
    }
    
    // Educational or space-efficient: NFT
    if (goals.primaryPurpose === 'education' || goals.spaceConstraints === 'indoor') {
      return 'nft'
    }
    
    // Default to media bed for reliability
    return 'media-bed'
  }

  private calculateFarmSize(goals: UserGoals, budget: BudgetConstraints): { category: string; customSize?: number } {
    // Budget-based sizing
    if (budget.totalBudget < 1000) {
      return { category: 'small' }
    } else if (budget.totalBudget < 5000) {
      return { category: 'medium' }
    } else if (budget.totalBudget >= 20000) {
      return { category: 'large' }
    }
    
    // Purpose-based sizing
    if (goals.primaryPurpose === 'commercial') {
      return { category: 'large' }
    } else if (goals.primaryPurpose === 'education') {
      return { category: 'medium' }
    } else if (goals.primaryPurpose === 'hobby') {
      return { category: 'small' }
    }
    
    // Custom sizing for specific needs
    if (goals.timeCommitment === 'high' && budget.totalBudget > 10000) {
      return { category: 'custom', customSize: 75 } // Custom large size
    }
    
    return { category: 'medium' }
  }

  private selectFishSpecies(goals: UserGoals, location: LocationContext): string[] {
    const climate = CLIMATE_PRESETS[location.climateKey]
    
    // Beginner-friendly species
    if (goals.experienceLevel === 'beginner') {
      if (climate.temp >= 22) {
        return ['Tilapia'] // Warm water, hardy
      } else {
        return ['Goldfish'] // Cold tolerant, forgiving
      }
    }
    
    // Commercial focus - high yield species
    if (goals.primaryPurpose === 'commercial') {
      if (climate.temp >= 20) {
        return ['Tilapia', 'Catfish'] // High yield warm water
      } else {
        return ['Trout', 'Perch'] // Cold water commercial
      }
    }
    
    // Educational - diverse species for learning
    if (goals.primaryPurpose === 'education') {
      return ['Tilapia', 'Goldfish'] // Easy to observe and maintain
    }
    
    // Advanced users - optimize for climate
    if (climate.temp >= 24) {
      return ['Tilapia'] // Tropical optimization
    } else if (climate.temp >= 18) {
      return ['Bass', 'Perch'] // Temperate species
    } else {
      return ['Trout'] // Cold water specialist
    }
  }

  private selectCrops(goals: UserGoals, location: LocationContext, systemType: string): string[] {
    const climate = CLIMATE_PRESETS[location.climateKey]
    
    // Beginner-friendly crops
    if (goals.experienceLevel === 'beginner') {
      return ['Lettuce', 'Spinach'] // Fast growing, forgiving
    }
    
    // Commercial focus - high value crops
    if (goals.primaryPurpose === 'commercial') {
      if (systemType === 'dwc') {
        return ['Lettuce', 'Herbs (Basil, Mint)', 'Spinach'] // DWC optimized
      } else {
        return ['Tomatoes', 'Peppers', 'Herbs (Basil, Mint)'] // High value
      }
    }
    
    // Educational - diverse learning opportunities
    if (goals.primaryPurpose === 'education') {
      return ['Lettuce', 'Herbs (Basil, Mint)', 'Tomatoes'] // Variety for learning
    }
    
    // Climate-optimized selection
    if (climate.solar >= 1.1) {
      return ['Tomatoes', 'Peppers', 'Cucumbers'] // High light crops
    } else {
      return ['Lettuce', 'Spinach', 'Kale'] // Shade tolerant
    }
  }

  private selectEnergySource(goals: UserGoals, budget: BudgetConstraints, location: LocationContext): string {
    // Sustainability focus
    if (goals.sustainabilityFocus === 'high') {
      if (budget.totalBudget > 5000) {
        return 'solar' // Can afford solar setup
      } else {
        return 'hybrid' // Compromise solution
      }
    }
    
    // Budget constraints
    if (budget.totalBudget < 2000) {
      return 'grid' // Most economical upfront
    }
    
    // Climate considerations
    const climate = CLIMATE_PRESETS[location.climateKey]
    if (climate.solar >= 1.1 && budget.totalBudget > 3000) {
      return 'solar' // Good solar potential
    }
    
    return 'grid' // Default reliable option
  }

  private categorizeBudget(budget: BudgetConstraints): string {
    if (budget.totalBudget < 1000) return 'under-1000'
    if (budget.totalBudget < 5000) return '1000-5000'
    if (budget.totalBudget < 20000) return '5000-20000'
    return 'over-20000'
  }

  private generateAlternatives(
    baseConfig: WizardParams,
    goals: UserGoals,
    budget: BudgetConstraints
  ): Array<{ name: string; changes: Partial<WizardParams>; tradeoffs: string }> {
    const alternatives = []

    // Budget-optimized alternative
    if (budget.totalBudget > 2000) {
      alternatives.push({
        name: 'Budget-Optimized',
        changes: {
          systemType: 'media-bed',
          farmSize: 'small',
          energySource: 'grid',
          fishSpecies: ['Goldfish'],
          cropChoice: ['Lettuce', 'Spinach']
        },
        tradeoffs: 'Lower upfront cost but reduced yield potential'
      })
    }

    // High-efficiency alternative
    if (goals.experienceLevel !== 'beginner') {
      alternatives.push({
        name: 'High-Efficiency',
        changes: {
          systemType: 'dwc',
          energySource: 'solar',
          fishSpecies: ['Tilapia'],
          cropChoice: ['Lettuce', 'Herbs (Basil, Mint)']
        },
        tradeoffs: 'Higher complexity but maximum yield and sustainability'
      })
    }

    // Space-optimized alternative
    alternatives.push({
      name: 'Space-Optimized',
      changes: {
        systemType: 'nft',
        farmSize: 'small',
        cropChoice: ['Lettuce', 'Herbs (Basil, Mint)', 'Spinach']
      },
      tradeoffs: 'Compact design but requires more attention to nutrient flow'
    })

    return alternatives
  }

  private calculateConfidence(
    config: WizardParams,
    goals: UserGoals,
    location: LocationContext,
    budget: BudgetConstraints
  ): number {
    let confidence = 0.7 // Base confidence

    // Experience level alignment
    if (goals.experienceLevel === 'beginner' && config.systemType === 'media-bed') {
      confidence += 0.15
    } else if (goals.experienceLevel === 'advanced' && config.mode === 'custom') {
      confidence += 0.1
    }

    // Budget alignment
    const simulation = simulate(config)
    if (simulation.monthlyOperatingCost < budget.totalBudget * 0.05) {
      confidence += 0.1 // Operating costs are reasonable
    }

    // Climate suitability
    const climate = CLIMATE_PRESETS[location.climateKey]
    if (config.fishSpecies.includes('Tilapia') && climate.temp >= 22) {
      confidence += 0.05 // Good climate match
    }

    return Math.min(confidence, 0.95) // Cap at 95%
  }

  private calculateAlternativeConfidence(alternative: any, result: SimulationResult): number {
    // Base confidence for alternatives is lower
    let confidence = 0.6

    // Efficiency bonus
    if (result.systemEfficiency > 85) {
      confidence += 0.1
    }

    // Yield potential
    if (result.fishYieldKg + result.vegYieldKg > 100) {
      confidence += 0.05
    }

    return Math.min(confidence, 0.85)
  }

  private generateReasoning(
    config: WizardParams,
    goals: UserGoals,
    location: LocationContext,
    budget: BudgetConstraints
  ): string {
    const reasons = []

    // System type reasoning
    if (config.systemType === 'media-bed') {
      reasons.push('Media bed system recommended for reliability and beginner-friendliness')
    } else if (config.systemType === 'dwc') {
      reasons.push('Deep Water Culture selected for maximum yield efficiency')
    } else if (config.systemType === 'nft') {
      reasons.push('NFT system chosen for space efficiency and water conservation')
    }

    // Climate reasoning
    const climate = CLIMATE_PRESETS[location.climateKey]
    if (climate.temp >= 22) {
      reasons.push(`${climate.label} climate is ideal for warm-water species like Tilapia`)
    } else {
      reasons.push(`${climate.label} climate requires cold-tolerant species selection`)
    }

    // Budget reasoning
    if (budget.totalBudget < 2000) {
      reasons.push('Configuration optimized for budget constraints while maintaining functionality')
    } else if (budget.totalBudget > 10000) {
      reasons.push('Higher budget allows for premium components and sustainability features')
    }

    return reasons.join('. ') + '.'
  }

  private generateTips(config: WizardParams, goals: UserGoals, result: SimulationResult): string[] {
    const tips = []

    // Experience-based tips
    if (goals.experienceLevel === 'beginner') {
      tips.push('Start with a single fish species to simplify management')
      tips.push('Monitor water quality daily during the first month')
      tips.push('Keep a maintenance log to track system performance')
    }

    // System-specific tips
    if (config.systemType === 'dwc') {
      tips.push('Ensure adequate aeration - fish depend on dissolved oxygen')
      tips.push('Monitor water temperature closely as DWC systems can fluctuate')
    } else if (config.systemType === 'nft') {
      tips.push('Check for clogs in nutrient channels weekly')
      tips.push('Maintain proper slope (1:40) for optimal water flow')
    }

    // Performance optimization
    if (result.systemEfficiency < 80) {
      tips.push('Consider upgrading to energy-efficient pumps to improve overall efficiency')
    }

    // Sustainability tips
    if (config.energySource === 'grid') {
      tips.push('Consider solar panels as a future upgrade to reduce operating costs')
    }

    return tips
  }

  private generateWarnings(
    config: WizardParams,
    goals: UserGoals,
    budget: BudgetConstraints,
    result: SimulationResult
  ): string[] | undefined {
    const warnings = []

    // Budget warnings
    if (result.monthlyOperatingCost > budget.totalBudget * 0.1) {
      warnings.push('Monthly operating costs may be higher than expected for your budget')
    }

    // Experience warnings
    if (goals.experienceLevel === 'beginner' && config.fishSpecies.length > 1) {
      warnings.push('Multiple fish species increase complexity - consider starting with one')
    }

    // System warnings
    if (config.systemType === 'dwc' && goals.timeCommitment === 'low') {
      warnings.push('DWC systems require daily monitoring - consider media bed for lower maintenance')
    }

    // Climate warnings
    const climate = CLIMATE_PRESETS[config.climateKey!]
    if (climate.temp < 18 && config.fishSpecies.includes('Tilapia')) {
      warnings.push('Tilapia may struggle in cooler climates - consider heating or cold-water species')
    }

    return warnings.length > 0 ? warnings : undefined
  }

  /**
   * Get smart suggestions for the current wizard step
   */
  getStepSuggestions(
    currentStep: number,
    currentData: Partial<WizardParams>,
    goals?: UserGoals,
    location?: LocationContext,
    budget?: BudgetConstraints
  ): string[] {
    const suggestions = []

    switch (currentStep) {
      case 1: // Climate
        if (location) {
          const climate = CLIMATE_PRESETS[location.climateKey]
          suggestions.push(`Your ${climate.label} climate (${climate.temp}°C) is ${climate.temp >= 22 ? 'excellent' : 'suitable'} for aquaponics`)
          if (climate.solar >= 1.1) {
            suggestions.push('High solar radiation in your area makes solar power a great option')
          }
        }
        break

      case 2: // System Type
        if (goals?.experienceLevel === 'beginner') {
          suggestions.push('Media bed systems are most forgiving for beginners')
        }
        if (budget && budget.totalBudget < 2000) {
          suggestions.push('Media bed offers the best value for smaller budgets')
        }
        break

      case 3: // Farm Size
        if (goals?.primaryPurpose === 'commercial') {
          suggestions.push('Consider medium or large size for commercial viability')
        }
        if (budget) {
          const recommendedSize = budget.totalBudget < 2000 ? 'small' : 
                                 budget.totalBudget < 10000 ? 'medium' : 'large'
          suggestions.push(`Your budget suggests a ${recommendedSize} system would be optimal`)
        }
        break

      case 4: // Fish Species
        if (location) {
          const climate = CLIMATE_PRESETS[location.climateKey]
          if (climate.temp >= 22) {
            suggestions.push('Tilapia thrives in your warm climate')
          } else {
            suggestions.push('Consider cold-water species like Trout for your climate')
          }
        }
        if (goals?.experienceLevel === 'beginner') {
          suggestions.push('Start with one hardy species like Tilapia or Goldfish')
        }
        break

      case 5: // Crops
        if (currentData.systemType === 'dwc') {
          suggestions.push('Leafy greens like lettuce perform exceptionally well in DWC systems')
        }
        if (goals?.primaryPurpose === 'commercial') {
          suggestions.push('Herbs and microgreens offer the highest profit margins')
        }
        break

      case 6: // Budget
        if (currentData.systemType && currentData.farmSize) {
          // Estimate based on selections
          const estimatedCost = this.estimateSystemCost(currentData)
          suggestions.push(`Based on your selections, expect costs around $${estimatedCost.toLocaleString()}`)
        }
        break

      case 7: // Energy
        if (location) {
          const climate = CLIMATE_PRESETS[location.climateKey]
          if (climate.solar >= 1.1) {
            suggestions.push('Your area receives excellent solar radiation - solar power is highly recommended')
          }
        }
        if (goals?.sustainabilityFocus === 'high') {
          suggestions.push('Solar or hybrid systems align with your sustainability goals')
        }
        break
    }

    return suggestions
  }

  private estimateSystemCost(config: Partial<WizardParams>): number {
    let baseCost = 0

    // System type costs
    switch (config.systemType) {
      case 'media-bed': baseCost = 800; break
      case 'nft': baseCost = 1200; break
      case 'dwc': baseCost = 1000; break
      default: baseCost = 1000
    }

    // Size multipliers
    switch (config.farmSize) {
      case 'small': baseCost *= 1; break
      case 'medium': baseCost *= 3; break
      case 'large': baseCost *= 8; break
      case 'custom': baseCost *= 2; break
    }

    // Energy source additions
    if (config.energySource === 'solar') {
      baseCost += 2000
    } else if (config.energySource === 'hybrid') {
      baseCost += 1000
    }

    return Math.round(baseCost)
  }
}

export const aiAssistant = AIDesignAssistant.getInstance()