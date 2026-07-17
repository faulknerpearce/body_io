import { describe, expect, it } from 'vitest'
import {
  entryMacrosPerServing,
  formatPortionLabel,
  portionScaleFactor,
  scaleEntryToPortion,
  scaleMacrosByPortion,
  validatePortionInput,
} from '../portionScaling.js'

describe('portionScaling', () => {
  const base = {
    calories: 200,
    protein: 20,
    carbs: 10,
    fat: 5,
    fiber: 2,
    caffeine: 0,
  }

  it('scales by servings', () => {
    expect(
      scaleMacrosByPortion(base, {
        portionUnit: 'servings',
        portionQuantity: 2,
        referenceWeightGrams: 100,
      }),
    ).toEqual({
      calories: 400,
      protein: 40,
      carbs: 20,
      fat: 10,
      fiber: 4,
      caffeine: 0,
    })
  })

  it('scales by weight relative to reference grams', () => {
    expect(
      scaleMacrosByPortion(base, {
        portionUnit: 'grams',
        portionQuantity: 150,
        referenceWeightGrams: 100,
      }),
    ).toEqual({
      calories: 300,
      protein: 30,
      carbs: 15,
      fat: 8,
      fiber: 3,
      caffeine: 0,
    })
  })

  it('computes scale factor', () => {
    expect(
      portionScaleFactor({
        portionUnit: 'grams',
        portionQuantity: 50,
        referenceWeightGrams: 100,
      }),
    ).toBe(0.5)
  })

  it('formats portion labels', () => {
    expect(
      formatPortionLabel({
        portionUnit: 'servings',
        portionQuantity: 2,
        referenceWeightGrams: 100,
      }),
    ).toBe('2 servings')
    expect(
      formatPortionLabel({
        portionUnit: 'grams',
        portionQuantity: 150,
        referenceWeightGrams: 100,
      }),
    ).toBe('150g')
  })

  it('validates portion input', () => {
    expect(
      validatePortionInput({
        portionUnit: 'grams',
        portionQuantity: 120,
        referenceWeightGrams: 100,
      }),
    ).toEqual({
      ok: true,
      value: {
        portionUnit: 'grams',
        portionQuantity: 120,
        referenceWeightGrams: 100,
      },
    })

    expect(
      validatePortionInput({
        portionUnit: 'cups',
        portionQuantity: 1,
        referenceWeightGrams: 100,
      }),
    ).toEqual({ ok: false, error: 'portionUnit must be servings or grams' })
  })

  it('derives per-serving macros from a multi-serving log', () => {
    const { perServing, allowsGrams } = entryMacrosPerServing({
      ...base,
      calories: 400,
      protein: 40,
      carbs: 20,
      fat: 10,
      fiber: 4,
      portionUnit: 'servings',
      portionQuantity: 2,
      referenceWeightGrams: 100,
    })
    expect(perServing).toEqual(base)
    expect(allowsGrams).toBe(true)
  })

  it('re-logs half a serving without changing original scale basis', () => {
    const source = {
      ...base,
      calories: 400,
      protein: 40,
      carbs: 20,
      fat: 10,
      fiber: 4,
      portionUnit: 'servings' as const,
      portionQuantity: 2,
      referenceWeightGrams: 100,
    }
    const result = scaleEntryToPortion(source, {
      portionUnit: 'servings',
      portionQuantity: 0.5,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.totals).toEqual({
      calories: 100,
      protein: 10,
      carbs: 5,
      fat: 3,
      fiber: 1,
      caffeine: 0,
    })
    expect(result.meta.portionQuantity).toBe(0.5)
  })

  it('re-logs by grams from a servings-based entry', () => {
    const source = {
      ...base,
      portionUnit: 'servings' as const,
      portionQuantity: 1,
      referenceWeightGrams: 100,
    }
    const result = scaleEntryToPortion(source, {
      portionUnit: 'grams',
      portionQuantity: 50,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.totals.calories).toBe(100)
    expect(result.meta.portionUnit).toBe('grams')
  })
})