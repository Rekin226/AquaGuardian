import { describe, it, expect } from 'vitest'
import { simulate, batchSimulate, WizardParams } from './simulator'

describe('Aquaponic System Simulator', () => {
  it('should calculate yields for small home system', () => {
    const params: WizardParams = {
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

    // Specific expectations for large system
    expect(result.fishYieldKg).toBeCloseTo(3400, 0) // Multiple species with efficiency loss
    expect(result.vegYieldKg).toBeCloseTo(4600, 0) // Multiple crops with synergy
    expect(result.systemEfficiency).toBe(100) // Maximum budget efficiency
  })

  it('should handle multiple fish species with efficiency reduction', () => {
    const singleSpecies: WizardParams = {
      farmSize: 'medium',
      fishSpecies: ['Tilapia'],
      cropChoice: ['Lettuce'],
      budget: '5000-20000',
      energySource: 'solar'
    }

    const multipleSpecies: WizardParams = {
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
        farmSize: 'small',
        fishSpecies: ['Tilapia'],
        cropChoice: ['Lettuce'],
        budget: 'under-1000',
        energySource: 'grid'
      },
      {
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
})