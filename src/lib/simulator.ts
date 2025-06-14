export interface WizardParams {
  climateKey?: ClimateKey
  customClimate?: boolean
  customTemp?: number
  customSolar?: number
  systemType?: string
  mode?: 'quick' | 'custom'
  tankVol?: number
  bioFilterVol?: number
  purifierVol?: number
  sumpVol?: number
  pipeDia?: number
  farmSize: string
  customFarmSize?: number
  fishSpecies: string[]
  cropChoice: string[]
  budget: string
  customBudget?: number
  customBudgetCurrency?: string
  energySource: string
}

export interface SimulationResult {
  fishYieldKg: number
  vegYieldKg: number
  dailyWaterL: number
  dailyKWh: number
  systemEfficiency: number
  monthlyOperatingCost: number
  climateKey?: ClimateKey
  tempUsed?: number
  solarFactor?: number
}

// System type efficiency multipliers
const SYSTEM_TYPE_EFFICIENCY = {
  'media-bed': 1.0,    // Baseline efficiency
  'nft': 1.15,         // 15% more efficient for plant growth
  'dwc': 1.25          // 25% more efficient for plant growth
}

// System type water usage multipliers
const SYSTEM_WATER_USAGE = {
  'media-bed': 1.0,    // Baseline water usage
  'nft': 0.8,          // 20% less water usage
  'dwc': 0.9           // 10% less water usage
}

// System presets with all volume parameters
export const SYSTEM_PRESETS = {
  'media-bed': {
    tankVol: 300,
    bioFilterVol: 50,
    purifierVol: 30,
    sumpVol: 100,
    pipeDia: 25
  },
  'nft': {
    tankVol: 400,
    bioFilterVol: 80,
    purifierVol: 50,
    sumpVol: 150,
    pipeDia: 32
  },
  'dwc': {
    tankVol: 250,
    bioFilterVol: 60,
    purifierVol: 40,
    sumpVol: 120,
    pipeDia: 20
  }
}

// Validation rules
export const VALIDATION_RULES = {
  tankVol: { min: 100, max: 2000 },
  bioFilterVol: { min: 20, max: 500 },
  purifierVol: { min: 10, max: 300 },
  sumpVol: { min: 50, max: 800 },
  pipeDia: { min: 15, max: 50 },
  customTemp: { min: 10, max: 30 },
  customSolar: { min: 0.5, max: 8 },
  customFarmSize: { min: 1, max: 10000 }
}

export function validateSystemParams(params: WizardParams): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (params.mode === 'custom') {
    // Tank volume validation
    if (!params.tankVol || params.tankVol < VALIDATION_RULES.tankVol.min || params.tankVol > VALIDATION_RULES.tankVol.max) {
      errors.push(`Tank volume must be between ${VALIDATION_RULES.tankVol.min}-${VALIDATION_RULES.tankVol.max}L`)
    }
    
    // Bio-filter volume validation
    if (!params.bioFilterVol || params.bioFilterVol < VALIDATION_RULES.bioFilterVol.min || params.bioFilterVol > VALIDATION_RULES.bioFilterVol.max) {
      errors.push(`Bio-filter volume must be between ${VALIDATION_RULES.bioFilterVol.min}-${VALIDATION_RULES.bioFilterVol.max}L`)
    }
    
    // Purifier volume validation
    if (!params.purifierVol || params.purifierVol < VALIDATION_RULES.purifierVol.min || params.purifierVol > VALIDATION_RULES.purifierVol.max) {
      errors.push(`Purifier volume must be between ${VALIDATION_RULES.purifierVol.min}-${VALIDATION_RULES.purifierVol.max}L`)
    }
    
    // Sump volume validation
    if (!params.sumpVol || params.sumpVol < VALIDATION_RULES.sumpVol.min || params.sumpVol > VALIDATION_RULES.sumpVol.max) {
      errors.push(`Sump volume must be between ${VALIDATION_RULES.sumpVol.min}-${VALIDATION_RULES.sumpVol.max}L`)
    }
    
    // Pipe diameter validation
    if (!params.pipeDia || params.pipeDia < VALIDATION_RULES.pipeDia.min || params.pipeDia > VALIDATION_RULES.pipeDia.max) {
      errors.push(`Pipe diameter must be between ${VALIDATION_RULES.pipeDia.min}-${VALIDATION_RULES.pipeDia.max}mm`)
    }
    
    // Relationship validations
    if (params.tankVol && params.bioFilterVol && params.bioFilterVol > params.tankVol * 0.5) {
      errors.push('Bio-filter volume should not exceed 50% of tank volume')
    }
    
    if (params.tankVol && params.purifierVol && params.purifierVol > params.tankVol * 0.3) {
      errors.push('Purifier volume should not exceed 30% of tank volume')
    }
    
    if (params.tankVol && params.sumpVol && params.sumpVol > params.tankVol * 0.8) {
      errors.push('Sump volume should not exceed 80% of tank volume')
    }
  }
  
  // Custom climate validation
  if (params.customClimate) {
    if (!params.customTemp || params.customTemp < VALIDATION_RULES.customTemp.min || params.customTemp > VALIDATION_RULES.customTemp.max) {
      errors.push(`Water temperature must be between ${VALIDATION_RULES.customTemp.min}-${VALIDATION_RULES.customTemp.max}°C`)
    }
    
    if (!params.customSolar || params.customSolar < VALIDATION_RULES.customSolar.min || params.customSolar > VALIDATION_RULES.customSolar.max) {
      errors.push(`Solar radiation must be between ${VALIDATION_RULES.customSolar.min}-${VALIDATION_RULES.customSolar.max} kWh/m²/day`)
    }
  }
  
  // Custom farm size validation
  if (params.farmSize === 'custom') {
    if (!params.customFarmSize || params.customFarmSize < VALIDATION_RULES.customFarmSize.min || params.customFarmSize > VALIDATION_RULES.customFarmSize.max) {
      errors.push(`Farm size must be between ${VALIDATION_RULES.customFarmSize.min}-${VALIDATION_RULES.customFarmSize.max} m²`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Base constants for calculations
const FARM_SIZE_MULTIPLIERS = {
  small: 1,      // 50 sq ft baseline (4.6 m²)
  medium: 10,    // 500 sq ft (46.5 m²)
  large: 50,     // 2500 sq ft (232 m²)
  custom: 25     // Will be calculated based on customFarmSize
}

// Convert square feet to square meters for reference
const FARM_SIZE_M2 = {
  small: 4.6,    // ~50 sq ft
  medium: 46.5,  // ~500 sq ft
  large: 232.3   // ~2500 sq ft
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
  custom: 900   // Will be calculated based on customFarmSize
}

// Energy consumption factors (kWh per day per unit area)
const ENERGY_CONSUMPTION_BASE = {
  small: 2.5,   // Pumps, aeration, lighting
  medium: 18,   // Scaled systems
  large: 75,    // Industrial scale
  custom: 35    // Will be calculated based on customFarmSize
}

// Energy source efficiency multipliers
const ENERGY_EFFICIENCY = {
  grid: 1.0,      // Standard efficiency
  solar: 0.85,    // Some conversion losses but renewable
  hybrid: 0.92,   // Best of both worlds
  generator: 1.1  // Less efficient but reliable backup
}

/**
 * Calculate size multiplier for custom farm size
 */
function getCustomSizeMultiplier(customFarmSize: number): number {
  // Use small system (4.6 m²) as baseline
  return customFarmSize / FARM_SIZE_M2.small
}

/**
 * Calculate water consumption for custom farm size
 */
function getCustomWaterConsumption(customFarmSize: number): number {
  // Scale linearly from small system baseline
  return (customFarmSize / FARM_SIZE_M2.small) * WATER_CONSUMPTION_BASE.small
}

/**
 * Calculate energy consumption for custom farm size
 */
function getCustomEnergyConsumption(customFarmSize: number): number {
  // Scale with slight efficiency gains for larger systems
  const baseRatio = customFarmSize / FARM_SIZE_M2.small
  const efficiencyFactor = Math.pow(baseRatio, 0.9) // Slight efficiency gains
  return efficiencyFactor * ENERGY_CONSUMPTION_BASE.small
}

/**
 * Simulates aquaponic system performance based on wizard parameters
 * Uses simplified grey-box equations for yield and resource predictions
 * Now includes climate factor adjustments, custom farm size support, and custom budget handling
 * 
 * @param params - Configuration from onboarding wizard
 * @returns Predicted system performance metrics with climate data
 */
export function simulate(params: WizardParams): SimulationResult {
  let sizeMultiplier: number
  let baseWater: number
  let baseEnergy: number

  // Handle custom farm size
  if (params.farmSize === 'custom' && params.customFarmSize) {
    sizeMultiplier = getCustomSizeMultiplier(params.customFarmSize)
    baseWater = getCustomWaterConsumption(params.customFarmSize)
    baseEnergy = getCustomEnergyConsumption(params.customFarmSize)
  } else {
    sizeMultiplier = FARM_SIZE_MULTIPLIERS[params.farmSize as keyof typeof FARM_SIZE_MULTIPLIERS] || 1
    baseWater = WATER_CONSUMPTION_BASE[params.farmSize as keyof typeof WATER_CONSUMPTION_BASE] || 200
    baseEnergy = ENERGY_CONSUMPTION_BASE[params.farmSize as keyof typeof ENERGY_CONSUMPTION_BASE] || 10
  }

  const systemTypeEfficiency = SYSTEM_TYPE_EFFICIENCY[params.systemType as keyof typeof SYSTEM_TYPE_EFFICIENCY] || 1.0
  const systemWaterMultiplier = SYSTEM_WATER_USAGE[params.systemType as keyof typeof SYSTEM_WATER_USAGE] || 1.0
  
  // Get climate factors
  let climateTemp: number
  let climateSolar: number
  let climateKey: ClimateKey | undefined = params.climateKey
  
  if (params.customClimate && params.customTemp && params.customSolar) {
    // Use custom climate values
    climateTemp = Math.max(VALIDATION_RULES.customTemp.min, Math.min(VALIDATION_RULES.customTemp.max, params.customTemp))
    climateSolar = Math.max(VALIDATION_RULES.customSolar.min, Math.min(VALIDATION_RULES.customSolar.max, params.customSolar))
  } else if (params.climateKey && CLIMATE_PRESETS[params.climateKey]) {
    // Use preset climate values
    const preset = CLIMATE_PRESETS[params.climateKey]
    climateTemp = preset.temp
    climateSolar = preset.solar
  } else {
    // Default to temperate climate
    const preset = CLIMATE_PRESETS.temperate
    climateTemp = preset.temp
    climateSolar = preset.solar
    climateKey = 'temperate'
  }
  
  // Calculate fish yield (kg/year) with climate adjustment
  // Formula: Sum of (species_yield_rate * size_multiplier * species_efficiency * temp_factor)
  let fishYieldKg = params.fishSpecies.reduce((total, species) => {
    const baseYield = FISH_YIELD_RATES[species as keyof typeof FISH_YIELD_RATES] || 20
    // Multiple species reduce efficiency due to complexity
    const speciesEfficiency = params.fishSpecies.length > 1 ? 0.85 : 1.0
    return total + (baseYield * sizeMultiplier * speciesEfficiency)
  }, 0)
  
  // Apply climate temperature factor to fish growth (baseline 20°C)
  fishYieldKg *= (climateTemp / 20)

  // Calculate vegetable yield (kg/year) with climate adjustment
  // Formula: Sum of (crop_yield_rate * size_multiplier * crop_synergy * system_efficiency * solar_factor)
  let vegYieldKg = params.cropChoice.reduce((total, crop) => {
    const baseYield = VEG_YIELD_RATES[crop as keyof typeof VEG_YIELD_RATES] || 15
    // Diverse crops can have synergistic effects up to a point
    const cropSynergy = Math.min(1.2, 1 + (params.cropChoice.length - 1) * 0.05)
    return total + (baseYield * sizeMultiplier * cropSynergy * systemTypeEfficiency)
  }, 0)
  
  // Apply climate solar factor to vegetable growth
  vegYieldKg *= climateSolar

  // Calculate daily water consumption (L/day)
  // Formula: base_consumption * crop_water_factor * fish_water_factor * system_water_multiplier
  const cropWaterFactor = 1 + (params.cropChoice.length * 0.1) // More crops = more water
  const fishWaterFactor = 1 + (params.fishSpecies.length * 0.15) // More fish = more water
  const dailyWaterL = baseWater * cropWaterFactor * fishWaterFactor * systemWaterMultiplier

  // Calculate daily energy consumption (kWh/day)
  // Formula: base_energy * energy_efficiency * system_complexity * system_energy_multiplier
  const energyEfficiency = ENERGY_EFFICIENCY[params.energySource as keyof typeof ENERGY_EFFICIENCY] || 1.0
  const systemComplexity = 1 + ((params.fishSpecies.length + params.cropChoice.length - 2) * 0.08)
  
  // DWC systems require additional energy for air pumps
  const systemEnergyMultiplier = params.systemType === 'dwc' ? 1.2 : 1.0
  const dailyKWh = (baseEnergy * systemComplexity * systemEnergyMultiplier) / energyEfficiency

  // Calculate system efficiency (0-100%)
  // Based on species/crop compatibility, system complexity, system type, and budget
  const speciesComplexity = params.fishSpecies.length > 2 ? 0.9 : 1.0
  const cropComplexity = params.cropChoice.length > 4 ? 0.95 : 1.0
  const budgetEfficiency = getBudgetEfficiency(params.budget, params.customBudget)
  const systemEfficiency = Math.round(speciesComplexity * cropComplexity * budgetEfficiency * systemTypeEfficiency * 100)

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
    monthlyOperatingCost,
    climateKey,
    tempUsed: climateTemp,
    solarFactor: climateSolar
  }
}

/**
 * Helper function to determine budget efficiency factor
 * Higher budgets allow for better equipment and higher efficiency
 * Now supports custom budget amounts
 */
function getBudgetEfficiency(budget: string, customBudget?: number): number {
  if (budget === 'custom' && customBudget) {
    // Use custom budget amount to determine efficiency
    if (customBudget < 1000) return 0.75
    if (customBudget < 5000) return 0.85
    if (customBudget < 20000) return 0.95
    return 1.0
  }

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