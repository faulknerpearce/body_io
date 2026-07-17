import type { Totals } from './types.js'
import type { ValidationResult } from './validation.js'

export type PortionUnit = 'servings' | 'grams'

export interface PortionInput {
  portionUnit: PortionUnit
  portionQuantity: number
  referenceWeightGrams: number
}

export interface PortionMeta {
  portionUnit?: PortionUnit | null
  portionQuantity?: number | null
  referenceWeightGrams?: number | null
}

function parsePositiveNumber(value: unknown): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number.parseFloat(value)
        : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN
}

export function portionScaleFactor(input: PortionInput): number {
  if (input.portionUnit === 'servings') {
    return input.portionQuantity
  }
  return input.portionQuantity / input.referenceWeightGrams
}

export function scaleMacrosByPortion(base: Totals, input: PortionInput): Totals {
  const factor = portionScaleFactor(input)
  return {
    calories: Math.round(base.calories * factor),
    protein: Math.round(base.protein * factor),
    carbs: Math.round(base.carbs * factor),
    caffeine: Math.round(base.caffeine * factor),
    fat: Math.round(base.fat * factor),
    fiber: Math.round(base.fiber * factor),
  }
}

export function validatePortionInput(input: {
  portionUnit?: unknown
  portionQuantity?: unknown
  referenceWeightGrams?: unknown
}): ValidationResult<PortionInput> {
  const portionUnit = input.portionUnit
  if (portionUnit !== 'servings' && portionUnit !== 'grams') {
    return { ok: false, error: 'portionUnit must be servings or grams' }
  }

  const portionQuantity = parsePositiveNumber(input.portionQuantity)
  if (!Number.isFinite(portionQuantity)) {
    return { ok: false, error: 'portionQuantity must be greater than 0' }
  }

  const referenceWeightGrams = parsePositiveNumber(input.referenceWeightGrams)
  if (!Number.isFinite(referenceWeightGrams)) {
    return { ok: false, error: 'referenceWeightGrams must be greater than 0' }
  }

  return {
    ok: true,
    value: { portionUnit, portionQuantity, referenceWeightGrams },
  }
}

/**
 * Parse portion metadata for persistence.
 * Servings may omit reference weight; grams require a positive reference (1-serving weight).
 */
export function parsePortionMeta(
  input: Record<string, unknown>,
): {
  portionUnit: PortionUnit
  portionQuantity: number
  referenceWeightGrams: number | null
} | null {
  const portionUnit = input.portionUnit ?? input.portion_unit
  if (portionUnit !== 'servings' && portionUnit !== 'grams') {
    return null
  }

  const portionQuantity = parsePositiveNumber(input.portionQuantity ?? input.portion_quantity)
  if (!Number.isFinite(portionQuantity)) {
    return null
  }

  const referenceWeightGrams = parsePositiveNumber(
    input.referenceWeightGrams ?? input.reference_weight_grams,
  )

  if (portionUnit === 'grams') {
    if (!Number.isFinite(referenceWeightGrams)) {
      return null
    }
    return { portionUnit, portionQuantity, referenceWeightGrams }
  }

  // servings: reference weight optional
  return {
    portionUnit,
    portionQuantity,
    referenceWeightGrams: Number.isFinite(referenceWeightGrams) ? referenceWeightGrams : null,
  }
}

export function buildPortionPayload(meta: {
  portionUnit: PortionUnit
  portionQuantity: number
  referenceWeightGrams: number | null
}): {
  portion_unit: PortionUnit
  portion_quantity: number
  reference_weight_grams: number | null
} {
  return {
    portion_unit: meta.portionUnit,
    portion_quantity: meta.portionQuantity,
    reference_weight_grams: meta.referenceWeightGrams,
  }
}

export function formatPortionLabel(meta: PortionMeta): string | null {
  if (!meta.portionUnit || meta.portionQuantity == null) {
    return null
  }

  if (meta.portionUnit === 'servings') {
    const qty = meta.portionQuantity
    const label = qty === 1 ? 'serving' : 'servings'
    return `${qty} ${label}`
  }

  const grams = meta.portionQuantity
  return grams % 1 === 0 ? `${grams}g` : `${grams.toFixed(1)}g`
}

/** Macro fields stored on a food entry / log row. */
export type EntryMacroSource = Totals & {
  portionUnit?: PortionUnit | null
  portionQuantity?: number | null
  referenceWeightGrams?: number | null
}

/**
 * Derive "macros for one serving" from a logged entry so re-logging can scale
 * by servings or grams without mutating the original row.
 *
 * - servings log: divide stored macros by portionQuantity
 * - grams log with reference weight: convert grams → serving macros
 * - missing meta: treat the whole entry as one serving
 */
export function entryMacrosPerServing(source: EntryMacroSource): {
  perServing: Totals
  referenceWeightGrams: number | null
  allowsGrams: boolean
} {
  const qty =
    source.portionQuantity != null &&
    Number.isFinite(source.portionQuantity) &&
    source.portionQuantity > 0
      ? source.portionQuantity
      : null
  const ref =
    source.referenceWeightGrams != null &&
    Number.isFinite(source.referenceWeightGrams) &&
    source.referenceWeightGrams > 0
      ? source.referenceWeightGrams
      : null

  const raw: Totals = {
    calories: source.calories,
    protein: source.protein,
    carbs: source.carbs,
    fat: source.fat,
    fiber: source.fiber,
    caffeine: source.caffeine,
  }

  if (source.portionUnit === 'servings' && qty) {
    return {
      perServing: {
        calories: raw.calories / qty,
        protein: raw.protein / qty,
        carbs: raw.carbs / qty,
        fat: raw.fat / qty,
        fiber: raw.fiber / qty,
        caffeine: raw.caffeine / qty,
      },
      referenceWeightGrams: ref,
      allowsGrams: ref != null,
    }
  }

  if (source.portionUnit === 'grams' && qty) {
    // Stored macros are for `qty` grams. Convert to one serving if ref weight known.
    if (ref) {
      const perGram = {
        calories: raw.calories / qty,
        protein: raw.protein / qty,
        carbs: raw.carbs / qty,
        fat: raw.fat / qty,
        fiber: raw.fiber / qty,
        caffeine: raw.caffeine / qty,
      }
      return {
        perServing: {
          calories: perGram.calories * ref,
          protein: perGram.protein * ref,
          carbs: perGram.carbs * ref,
          fat: perGram.fat * ref,
          fiber: perGram.fiber * ref,
          caffeine: perGram.caffeine * ref,
        },
        referenceWeightGrams: ref,
        allowsGrams: true,
      }
    }
    // No serving weight — treat the logged weight as "1 serving" of that size.
    return {
      perServing: raw,
      referenceWeightGrams: qty,
      allowsGrams: true,
    }
  }

  return {
    perServing: raw,
    referenceWeightGrams: ref,
    allowsGrams: ref != null,
  }
}

/** Scale a prior entry to a new portion; returns rounded macros + portion meta for insert. */
export function scaleEntryToPortion(
  source: EntryMacroSource,
  portion: { portionUnit: PortionUnit; portionQuantity: number; servingWeightGrams?: number },
):
  | {
      ok: true
      totals: Totals
      meta: {
        portionUnit: PortionUnit
        portionQuantity: number
        referenceWeightGrams: number | null
      }
    }
  | { ok: false; error: string } {
  const { perServing, referenceWeightGrams } = entryMacrosPerServing(source)
  const unit = portion.portionUnit
  const qty = portion.portionQuantity

  if (!Number.isFinite(qty) || qty <= 0) {
    return {
      ok: false,
      error: unit === 'grams' ? 'Weight must be greater than 0' : 'Servings must be greater than 0',
    }
  }

  const ref = portion.servingWeightGrams ?? referenceWeightGrams
  if (unit === 'grams' && (!ref || ref <= 0)) {
    return { ok: false, error: 'Enter the weight of one serving (g) to log by grams.' }
  }

  if (unit === 'servings') {
    const totals = {
      calories: Math.round(perServing.calories * qty),
      protein: Math.round(perServing.protein * qty),
      carbs: Math.round(perServing.carbs * qty),
      fat: Math.round(perServing.fat * qty),
      fiber: Math.round(perServing.fiber * qty),
      caffeine: Math.round(perServing.caffeine * qty),
    }
    return {
      ok: true,
      totals,
      meta: {
        portionUnit: 'servings',
        portionQuantity: qty,
        referenceWeightGrams: ref && ref > 0 ? ref : null,
      },
    }
  }

  // grams
  const validated = validatePortionInput({
    portionUnit: 'grams',
    portionQuantity: qty,
    referenceWeightGrams: ref,
  })
  if (!validated.ok) return validated

  return {
    ok: true,
    totals: scaleMacrosByPortion(perServing, validated.value),
    meta: {
      portionUnit: 'grams',
      portionQuantity: qty,
      referenceWeightGrams: validated.value.referenceWeightGrams,
    },
  }
}