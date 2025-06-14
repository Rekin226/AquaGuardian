import { describe, it, expect } from 'vitest'
import { simulate, batchSimulate, WizardParams, validateSystemParams } from './simulator'

describe('Aquaponic System Simulator', () => {
  it('should calculate yields for small home system', () => {
    const params: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'small',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce', 'Spinach'],
      budget: '1000-5000',
      energySource: 'grid'
    }

    const result = simulate(params)

    expect(result.fishYieldKg).toBeGreaterThan(0)
    expect(result.vegYieldKg).toBeGreaterThan(0)
    expect(result.dailyWaterL).toBeGreaterThan(0)
    expect(result.dailyKWh).toBeGreaterThan(0)
    expect(result.systemEfficiency).toBeGreaterThanOrEqual(0)
    expect(result.systemEfficiency).toBeLessThanOrEqual(100)
    expect(result.monthlyOperatingCost).toBeGreaterThan(0)
    expect(result.climateKey).toBe('temperate')
    expect(result.tempUsed).toBe(18)
    expect(result.solarFactor).toBe(0.90)
  })

  it('should calculate yields for large commercial system', () => {
    const params: WizardParams = {
      climateKey: 'tropical',
      systemType: 'dwc',
      mode: 'quick',
      farmSize: 'large',
      fishSpecies: ['Tilapia', 'Trout'],
      cropChoice: ['Tomatoes', 'Cucumbers', 'Lettuce', 'Herbs (Basil, Mint)'],
      budget: 'over-20000',
      energySource: 'hybrid'
    }

    const result = simulate(params)

    // Large system should have significantly higher yields
    expect(result.fishYieldKg).toBeGreaterThan(1000)
    expect(result.vegYieldKg).toBeGreaterThan(2000)
    expect(result.dailyWaterL).toBeGreaterThan(2000)
    expect(result.dailyKWh).toBeGreaterThan(50)

    // DWC system should have higher efficiency
    expect(result.systemEfficiency).toBe(100) // Maximum budget efficiency with DWC bonus
    expect(result.climateKey).toBe('tropical')
    expect(result.tempUsed).toBe(25)
    expect(result.solarFactor).toBe(1.15)
  })

  it('should handle custom farm size correctly', () => {
    const customParams: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'custom',
      customFarmSize: 100, // 100 m²
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const mediumParams: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'medium', // ~46.5 m²
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const customResult = simulate(customParams)
    const mediumResult = simulate(mediumParams)

    // Custom 100m² should yield more than medium ~46.5m²
    expect(customResult.fishYieldKg).toBeGreaterThan(mediumResult.fishYieldKg)
    expect(customResult.vegYieldKg).toBeGreaterThan(mediumResult.vegYieldKg)
    expect(customResult.dailyWaterL).toBeGreaterThan(mediumResult.dailyWaterL)
  })

  it('should validate custom farm size correctly', () => {
    const validParams: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'custom',
      customFarmSize: 50,
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const validation = validateSystemParams(validParams)
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('should reject invalid custom farm size', () => {
    const invalidParams: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'custom',
      customFarmSize: 15000, // Too large
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const validation = validateSystemParams(invalidParams)
    expect(validation.isValid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
    expect(validation.errors[0]).toContain('Farm size must be between 1-10000 m²')
  })

  it('should apply climate factors correctly', () => {
    const tropicalParams: WizardParams = {
      climateKey: 'tropical',
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const temperateParams: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const tropicalResult = simulate(tropicalParams)
    const temperateResult = simulate(temperateParams)

    // Tropical should have higher fish yield (warmer water) and vegetable yield (more solar)
    expect(tropicalResult.fishYieldKg).toBeGreaterThan(temperateResult.fishYieldKg)
    expect(tropicalResult.vegYieldKg).toBeGreaterThan(temperateResult.vegYieldKg)
  })

  it('should handle custom climate correctly', () => {
    const customParams: WizardParams = {
      customClimate: true,
      customTemp: 22,
      customSolar: 1.1,
      systemType: 'nft',
      mode: 'quick',
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const result = simulate(customParams)

    expect(result.tempUsed).toBe(22)
    expect(result.solarFactor).toBe(1.1)
    expect(result.fishYieldKg).toBeGreaterThan(0)
    expect(result.vegYieldKg).toBeGreaterThan(0)
  })

  it('should validate custom climate parameters correctly', () => {
    const validParams: WizardParams = {
      customClimate: true,
      customTemp: 20,
      customSolar: 3.5,
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const validation = validateSystemParams(validParams)
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('should reject invalid custom climate parameters', () => {
    const invalidParams: WizardParams = {
      customClimate: true,
      customTemp: 5, // Too low
      customSolar: 10, // Too high
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const validation = validateSystemParams(invalidParams)
    expect(validation.isValid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
  })

  it('should handle multiple fish species with efficiency reduction', () => {
    const singleSpecies: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const multipleSpecies: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'medium',
      fishSpecies: ['Tilapia', 'Trout', 'Bass'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const singleResult = simulate(singleSpecies)
    const multipleResult = simulate(multipleSpecies)

    // Multiple species should have lower efficiency per species
    const singleYieldPerSpecies = singleResult.fishYieldKg / 1
    const multipleYieldPerSpecies = multipleResult.fishYieldKg / 3

    expect(multipleYieldPerSpecies).toBeLessThan(singleYieldPerSpecies)
  })

  it('should apply energy source efficiency correctly', () => {
    const baseParams: WizardParams = {
      climateKey: 'temperate',
      systemType: 'nft',
      mode: 'quick',
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const gridResult = simulate({ ...baseParams, energySource: 'grid' })
    const solarResult = simulate({ ...baseParams, energySource: 'solar' })
    const generatorResult = simulate({ ...baseParams, energySource: 'generator' })

    // Solar should be more efficient than grid, generator less efficient
    expect(solarResult.dailyKWh).toBeLessThan(gridResult.dailyKWh)
    expect(generatorResult.dailyKWh).toBeGreaterThan(gridResult.dailyKWh)
  })

  it('should handle batch simulation correctly', () => {
    const paramSets: WizardParams[] = [
      {
        climateKey: 'cool',
        systemType: 'media-bed',
        mode: 'quick',
        farmSize: 'small',
        fishSpecies: ['Tilapia'],
        cropChoice: ['Lettuce'],
        budget: 'under-1000',
        energySource: 'grid'
      },
      {
        climateKey: 'tropical',
        systemType: 'dwc',
        mode: 'quick',
        farmSize: 'large',
        fishSpecies: ['Trout'],
        cropChoice: ['Tomatoes'],
        budget: 'over-20000',
        energySource: 'solar'
      }
    ]

    const results = batchSimulate(paramSets)

    expect(results).toHaveLength(2)
    expect(results[0].fishYieldKg).toBeLessThan(results[1].fishYieldKg)
    expect(results[0].vegYieldKg).toBeLessThan(results[1].vegYieldKg)
  })

  it('should calculate reasonable operating costs', () => {
    const params: WizardParams = {
      climateKey: 'subtropical',
      systemType: 'nft',
      mode: 'quick',
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce', 'Spinach'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const result = simulate(params)

    // Operating costs should be reasonable for medium system
    expect(result.monthlyOperatingCost).toBeGreaterThan(50)
    expect(result.monthlyOperatingCost).toBeLessThan(1000)
  })

  it('should validate custom mode parameters correctly', () => {
    const validParams: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'custom',
      tankVol: 800,
      bioFilterVol: 150,
      purifierVol: 200,
      sumpVol: 300,
      pipeDia: 25,
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const validation = validateSystemParams(validParams)
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('should reject invalid custom mode parameters', () => {
    const invalidParams: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'custom',
      tankVol: 50, // Too small
      bioFilterVol: 600, // Too large
      purifierVol: 5, // Too small
      sumpVol: 2000, // Too large relative to tank
      pipeDia: 60, // Too large
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const validation = validateSystemParams(invalidParams)
    expect(validation.isValid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
  })

  it('should pass validation for custom mode case (tank 800L, purifier 200L)', () => {
    const customParams: WizardParams = {
      climateKey: 'temperate',
      systemType: 'dwc',
      mode: 'custom',
      tankVol: 800,
      bioFilterVol: 120,
      purifierVol: 200,
      sumpVol: 400,
      pipeDia: 30,
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const validation = validateSystemParams(customParams)
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)

    // Should also simulate successfully
    const result = simulate(customParams)
    expect(result.fishYieldKg).toBeGreaterThan(0)
    expect(result.vegYieldKg).toBeGreaterThan(0)
  })

  it('should ensure tropical climate returns higher fishYieldKg than temperate when all else equal', () => {
    const baseParams = {
      systemType: 'media-bed' as const,
      mode: 'quick' as const,
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const tropicalResult = simulate({ ...baseParams, climateKey: 'tropical' })
    const temperateResult = simulate({ ...baseParams, climateKey: 'temperate' })

    expect(tropicalResult.fishYieldKg).toBeGreaterThan(temperateResult.fishYieldKg)
  })

  it('should handle custom farm size with proper scaling', () => {
    const smallCustom: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'custom',
      customFarmSize: 10, // 10 m²
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const largeCustom: WizardParams = {
      climateKey: 'temperate',
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'custom',
      customFarmSize: 100, // 100 m²
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'grid'
    }

    const smallResult = simulate(smallCustom)
    const largeResult = simulate(largeCustom)

    // Larger farm should produce proportionally more
    expect(largeResult.fishYieldKg).toBeGreaterThan(smallResult.fishYieldKg * 5)
    expect(largeResult.vegYieldKg).toBeGreaterThan(smallResult.vegYieldKg * 5)
    expect(largeResult.dailyWaterL).toBeGreaterThan(smallResult.dailyWaterL * 5)
  })
})