import { describe, it, expect } from 'vitest'
import { simulate, batchSimulate, WizardParams, validateSystemParams } from './simulator'

describe('Aquaponic System Simulator', () => {
  it('should calculate yields for small home system', () => {
    const params: WizardParams = {
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

    // Specific expectations for small system
    expect(result.fishYieldKg).toBeCloseTo(45, 0) // Single tilapia species
    expect(result.vegYieldKg).toBeCloseTo(47.3, 1) // Lettuce + spinach with synergy
    expect(result.dailyWaterL).toBe(65) // Base 50L + crop/fish factors
    expect(result.dailyKWh).toBe(2.7) // Base 2.5kWh + complexity
  })

  it('should calculate yields for large commercial system', () => {
    const params: WizardParams = {
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
  })

  it('should handle multiple fish species with efficiency reduction', () => {
    const singleSpecies: WizardParams = {
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'solar'
    }

    const multipleSpecies: WizardParams = {
      systemType: 'media-bed',
      mode: 'quick',
      farmSize: 'medium',
      fishSpecies: ['Tilapia', 'Trout', 'Bass'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'solar'
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
        systemType: 'media-bed',
        mode: 'quick',
        farmSize: 'small',
        fishSpecies: ['Tilapia'],
        cropChoice: ['Lettuce'],
        budget: 'under-1000',
        energySource: 'grid'
      },
      {
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
})