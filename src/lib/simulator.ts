export interface WizardParams {
  farmSize: string
  fishSpecies: string[]
  cropChoice: string[]
  budget: string
  energySource: string
}

export interface SimulationResult {
  fishYieldKg: number
  vegYieldKg: number
  dailyWaterL: number
  dailyKWh: number
  systemEfficiency: number
  monthlyOperatingCost: number
}

// Base constants for calculations
const FARM_SIZE_MULTIPLIERS = {
  small: 1,      // 50 sq ft baseline
  medium: 10,    // 500 sq ft
  large: 50,     // 2500 sq ft
  custom: 25     // assume mid-large for custom
}

// Fish yield per species (kg per year per unit area)
const FISH_YIELD_RATES = {
  'Tilapia': 45,      // High yield, fast growing
  'Trout': 35,        // Moderate yield, premium fish
  'Catfish': 40,      // Good yield, hardy
  'Bass': 25,         // Lower yield, premium
  'Perch': 30,        // Moderate yield
  'Salmon': 20,       // Lower yield, premium
  'Koi': 15,          // Ornamental, lower food yield
  'Goldfish': 10      // Ornamental, minimal food yield
}

// Vegetable yield per crop type (kg per year per unit area)
const VEG_YIELD_RATES = {
  'Lettuce': 25,              // Fast growing leafy green
  'Spinach': 20,              // Fast growing, multiple harvests
  'Kale': 18,                 // Slower but productive
  'Herbs (Basil, Mint)': 15,  // High value, moderate yield
  'Tomatoes': 35,             // High yield but more complex
  'Cucumbers': 30,            // Good yield, space efficient
  'Peppers': 20,              // Moderate yield, high value
  'Strawberries': 12          // Lower yield but premium
}

// Water consumption factors (liters per day per unit area)
const WATER_CONSUMPTION_BASE = {
  small: 50,    // Base daily water for small system
  medium: 400,  // Scaled for medium
  large: 1800,  // Scaled for large
  custom: 900   // Mid-range estimate
}

// Energy consumption factors (kWh per day per unit area)
const ENERGY_CONSUMPTION_BASE = {
  small: 2.5,   // Pumps, aeration, lighting
  medium: 18,   // Scaled systems
  large: 75,    // Industrial scale
  custom: 35    // Mid-range estimate
}

// Energy source efficiency multipliers
const ENERGY_EFFICIENCY = {
  grid: 1.0,      // Standard efficiency
  solar: 0.85,    // Some conversion losses but renewable
  hybrid: 0.92,   // Best of both worlds
  generator: 1.1  // Less efficient but reliable backup
}

/**
 * Simulates aquaponic system performance based on wizard parameters
 * Uses simplified grey-box equations for yield and resource predictions
 * 
 * @param params - Configuration from onboarding wizard
 * @returns Predicted system performance metrics
 */
export function simulate(params: WizardParams): SimulationResult {
  const sizeMultiplier = FARM_SIZE_MULTIPLIERS[params.farmSize as keyof typeof FARM_SIZE_MULTIPLIERS] || 1
  
  // Calculate fish yield (kg/year)
  // Formula: Sum of (species_yield_rate * size_multiplier * species_efficiency)
  const fishYieldKg = params.fishSpecies.reduce((total, species) => {
    const baseYield = FISH_YIELD_RATES[species as keyof typeof FISH_YIELD_RATES] || 20
    // Multiple species reduce efficiency due to complexity
    const speciesEfficiency = params.fishSpecies.length > 1 ? 0.85 : 1.0
    return total + (baseYield * sizeMultiplier * speciesEfficiency)
  }, 0)

  // Calculate vegetable yield (kg/year)  
  // Formula: Sum of (crop_yield_rate * size_multiplier * crop_synergy)
  const vegYieldKg = params.cropChoice.reduce((total, crop) => {
    const baseYield = VEG_YIELD_RATES[crop as keyof typeof VEG_YIELD_RATES] || 15
    // Diverse crops can have synergistic effects up to a point
    const cropSynergy = Math.min(1.2, 1 + (params.cropChoice.length - 1) * 0.05)
    return total + (baseYield * sizeMultiplier * cropSynergy)
  }, 0)

  // Calculate daily water consumption (L/day)
  // Formula: base_consumption * size_factor * crop_water_factor * fish_water_factor
  const baseWater = WATER_CONSUMPTION_BASE[params.farmSize as keyof typeof WATER_CONSUMPTION_BASE] || 200
  const cropWaterFactor = 1 + (params.cropChoice.length * 0.1) // More crops = more water
  const fishWaterFactor = 1 + (params.fishSpecies.length * 0.15) // More fish = more water
  const dailyWaterL = baseWater * cropWaterFactor * fishWaterFactor

  // Calculate daily energy consumption (kWh/day)
  // Formula: base_energy * energy_efficiency * system_complexity
  const baseEnergy = ENERGY_CONSUMPTION_BASE[params.farmSize as keyof typeof ENERGY_CONSUMPTION_BASE] || 10
  const energyEfficiency = ENERGY_EFFICIENCY[params.energySource as keyof typeof ENERGY_EFFICIENCY] || 1.0
  const systemComplexity = 1 + ((params.fishSpecies.length + params.cropChoice.length - 2) * 0.08)
  const dailyKWh = (baseEnergy * systemComplexity) / energyEfficiency

  // Calculate system efficiency (0-100%)
  // Based on species/crop compatibility and system complexity
  const speciesComplexity = params.fishSpecies.length > 2 ? 0.9 : 1.0
  const cropComplexity = params.cropChoice.length > 4 ? 0.95 : 1.0
  const budgetEfficiency = getBudgetEfficiency(params.budget)
  const systemEfficiency = Math.round(speciesComplexity * cropComplexity * budgetEfficiency * 100)

  // Calculate monthly operating cost (USD)
  // Includes electricity, water, feed, and maintenance
  const electricityCost = dailyKWh * 30 * 0.12 // $0.12/kWh average
  const waterCost = dailyWaterL * 30 * 0.001 // $0.001/L average
  const feedCost = fishYieldKg * 0.8 * 2.5 / 12 // Feed conversion ratio * feed cost per month
  const maintenanceCost = sizeMultiplier * 25 // Base maintenance per size
  const monthlyOperatingCost = Math.round(electricityCost + waterCost + feedCost + maintenanceCost)

  return {
    fishYieldKg: Math.round(fishYieldKg * 10) / 10,
    vegYieldKg: Math.round(vegYieldKg * 10) / 10,
    dailyWaterL: Math.round(dailyWaterL),
    dailyKWh: Math.round(dailyKWh * 10) / 10,
    systemEfficiency,
    monthlyOperatingCost
  }
}

/**
 * Helper function to determine budget efficiency factor
 * Higher budgets allow for better equipment and higher efficiency
 */
function getBudgetEfficiency(budget: string): number {
  switch (budget) {
    case 'under-1000':
      return 0.75 // Basic equipment, lower efficiency
    case '1000-5000':
      return 0.85 // Good equipment, decent efficiency  
    case '5000-20000':
      return 0.95 // Professional equipment, high efficiency
    case 'over-20000':
      return 1.0  // Top-tier equipment, maximum efficiency
    default:
      return 0.8  // Default moderate efficiency
  }
}

/**
 * Batch simulation function for multiple parameter sets
 * Useful for optimization and comparison scenarios
 */
export function batchSimulate(paramSets: WizardParams[]): SimulationResult[] {
  return paramSets.map(params => simulate(params))
}