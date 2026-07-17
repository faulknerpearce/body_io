import type { RefObject } from 'react'
import {
  currentTimeInputValue,
  loggedAtFromDayAndTime,
  scaleRecipeToServings,
  todayISOInTimeZone,
  type PortionUnit,
  type RecipeSummary,
  type Totals,
} from '@body-io/shared'
import { inputBase, labelBase } from '../lib/styles'

export interface RecipeLogFieldValues {
  entryDate: string
  logTime: string
  portionUnit: PortionUnit
  portionQuantity: string
  /** Grams that equal one recipe serving. Prefills from recipe; editable so grams logging always works. */
  servingWeightGrams: string
}

export interface RecipeLogSubmitOptions {
  portionUnit: PortionUnit
  portionQuantity: number
  entryDate: string
  loggedAt: string
  /** Present when logging by grams (recipe weight or user-entered weight of one serving). */
  servingWeightGrams?: number
}

export function defaultRecipeLogFieldValues(
  timeZone: string,
  recipe?: RecipeSummary | null,
): RecipeLogFieldValues {
  return {
    entryDate: todayISOInTimeZone(timeZone),
    logTime: currentTimeInputValue(timeZone),
    portionUnit: 'servings',
    portionQuantity: '1',
    servingWeightGrams: recipe?.servingWeightGrams ? String(recipe.servingWeightGrams) : '',
  }
}

export function servingWeightFromValues(values: RecipeLogFieldValues): number | null {
  const n = Number.parseFloat(values.servingWeightGrams)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function recipeLogHelperText(
  recipe: RecipeSummary | null | undefined,
  values: RecipeLogFieldValues,
): string {
  if (!recipe) return 'Select a recipe to log.'
  const batch = `Recipe makes ${recipe.defaultServings} servings per batch (${recipe.perServingTotals.calories} kcal per serving)`
  const weight = servingWeightFromValues(values)
  if (weight) {
    return `${batch} · 1 serving = ${weight}g.`
  }
  return `${batch}. Enter the weight of one serving below to log by grams.`
}

export function computeRecipeLogPreview(
  recipe: RecipeSummary | null | undefined,
  values: RecipeLogFieldValues,
): Totals | null {
  if (!recipe) return null
  const quantity = Number.parseFloat(values.portionQuantity)
  if (!Number.isFinite(quantity) || quantity <= 0) return null

  const unit: PortionUnit = values.portionUnit === 'grams' ? 'grams' : 'servings'
  const servingWeight = servingWeightFromValues(values)

  let effectiveServings: number
  if (unit === 'grams') {
    if (!servingWeight) return null
    effectiveServings = quantity / servingWeight
  } else {
    effectiveServings = quantity
  }

  if (!Number.isFinite(effectiveServings) || effectiveServings <= 0) return null
  return scaleRecipeToServings(recipe.batchTotals, recipe.defaultServings, effectiveServings)
}

export function validateRecipeLogFields(
  recipe: RecipeSummary | null | undefined,
  values: RecipeLogFieldValues,
  timeZone: string,
): { ok: true; value: RecipeLogSubmitOptions } | { ok: false; error: string } {
  if (!recipe) {
    return { ok: false, error: 'Select a recipe' }
  }

  const unit: PortionUnit = values.portionUnit === 'grams' ? 'grams' : 'servings'
  const servingWeight = servingWeightFromValues(values)

  if (unit === 'grams' && !servingWeight) {
    return {
      ok: false,
      error: 'Enter the weight of one serving (g) to log by grams.',
    }
  }

  const quantity = Number.parseFloat(values.portionQuantity)
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      ok: false,
      error: unit === 'grams' ? 'Weight must be greater than 0' : 'Servings must be greater than 0',
    }
  }

  if (!values.entryDate) {
    return { ok: false, error: 'Log date is required' }
  }

  const loggedAt = loggedAtFromDayAndTime(values.entryDate, values.logTime, timeZone)
  if (!loggedAt.ok) {
    return { ok: false, error: loggedAt.error }
  }

  return {
    ok: true,
    value: {
      portionUnit: unit,
      portionQuantity: quantity,
      entryDate: values.entryDate,
      loggedAt: loggedAt.value,
      servingWeightGrams: unit === 'grams' ? (servingWeight ?? undefined) : undefined,
    },
  }
}

interface RecipeLogFieldsProps {
  recipe: RecipeSummary | null | undefined
  timeZone: string
  values: RecipeLogFieldValues
  onChange: (patch: Partial<RecipeLogFieldValues>) => void
  idPrefix?: string
  /** When false, hides the green macro preview (parent may render its own). Default true. */
  showPreview?: boolean
  quantityInputRef?: RefObject<HTMLInputElement | null>
}

export default function RecipeLogFields({
  recipe,
  timeZone,
  values,
  onChange,
  idPrefix = 'recipe-log',
  showPreview = true,
  quantityInputRef,
}: RecipeLogFieldsProps) {
  const effectiveUnit: PortionUnit = values.portionUnit === 'grams' ? 'grams' : 'servings'
  const preview = showPreview ? computeRecipeLogPreview(recipe, values) : null
  const today = todayISOInTimeZone(timeZone)
  const recipeDefinedWeight = Boolean(recipe?.servingWeightGrams)

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor={`${idPrefix}-date`} style={labelBase}>
          Log date
        </label>
        <input
          id={`${idPrefix}-date`}
          type="date"
          value={values.entryDate}
          max={today}
          onChange={(e) => onChange({ entryDate: e.target.value || values.entryDate })}
          style={inputBase}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={`${idPrefix}-time`} style={labelBase}>
          Log time
        </label>
        <input
          id={`${idPrefix}-time`}
          type="time"
          value={values.logTime}
          onChange={(e) => onChange({ logTime: e.target.value })}
          style={inputBase}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={`${idPrefix}-serving-weight`} style={labelBase}>
          Weight of 1 serving (g)
        </label>
        <input
          id={`${idPrefix}-serving-weight`}
          type="number"
          min="1"
          step="1"
          value={values.servingWeightGrams}
          onChange={(e) => onChange({ servingWeightGrams: e.target.value })}
          placeholder="e.g. 250"
          style={inputBase}
        />
        <p style={{ fontSize: 12, color: '#a1a1aa', margin: '6px 0 0 0' }}>
          {recipeDefinedWeight
            ? 'From the recipe definition — adjust if your portion of the dish differs.'
            : 'How many grams is one serving of this recipe? Needed to log by weight.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['servings', 'grams'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange({ portionUnit: value })}
            style={{
              padding: '8px 14px',
              borderRadius: 9999,
              border: effectiveUnit === value ? '1px solid var(--zone-accent)' : '1px solid #e4e4e7',
              background: effectiveUnit === value ? 'var(--zone-accent)' : 'white',
              color: effectiveUnit === value ? 'white' : '#52525b',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {value === 'servings' ? 'Servings' : 'Weight (g)'}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={`${idPrefix}-portion`} style={labelBase}>
          {effectiveUnit === 'grams'
            ? 'How many grams did you have?'
            : 'How many servings did you have?'}
        </label>
        <input
          id={`${idPrefix}-portion`}
          ref={quantityInputRef}
          type="number"
          min={effectiveUnit === 'grams' ? '1' : '0.25'}
          step={effectiveUnit === 'grams' ? '1' : '0.25'}
          value={values.portionQuantity}
          onChange={(e) => onChange({ portionQuantity: e.target.value })}
          style={inputBase}
        />
        <p style={{ fontSize: 12, color: '#a1a1aa', margin: '6px 0 0 0' }}>
          {recipeLogHelperText(recipe, values)}
        </p>
      </div>

      {preview && (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 16,
            background: '#ecfdf5',
            color: '#065f46',
            fontSize: 13,
          }}
        >
          This will add {preview.calories} kcal, {preview.protein}g protein, {preview.carbs}g carbs
          {preview.fat > 0 ? `, ${preview.fat}g fat` : ''}.
        </div>
      )}
    </>
  )
}
