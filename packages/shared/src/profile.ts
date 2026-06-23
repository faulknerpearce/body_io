import { parseNutritionGoals, type NutritionGoals } from './goals.js'
import type { ValidationResult } from './validation.js'

export interface UserBodyStats {
  age: number | null
  heightCm: number | null
  weightKg: number | null
}

export interface UserProfile extends UserBodyStats {
  displayName: string
  nutritionGoals: NutritionGoals
}

export interface ProfileUpdate {
  displayName?: string
  age?: number | null
  heightCm?: number | null
  weightKg?: number | null
  nutritionGoals?: NutritionGoals
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseOptionalInt(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null
  return Math.round(raw)
}

function parseOptionalWeight(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null
  return Math.round(raw * 10) / 10
}

export function mapProfileRow(row: {
  display_name: string
  nutrition_goals: unknown
  age?: number | null
  height_cm?: number | null
  weight_kg?: number | string | null
}): UserProfile {
  const weightRaw = row.weight_kg
  const weightKg =
    weightRaw === null || weightRaw === undefined
      ? null
      : typeof weightRaw === 'number'
        ? weightRaw
        : Number.parseFloat(String(weightRaw))

  return {
    displayName: row.display_name,
    nutritionGoals: parseNutritionGoals(row.nutrition_goals),
    age: row.age ?? null,
    heightCm: row.height_cm ?? null,
    weightKg: Number.isFinite(weightKg) ? weightKg : null,
  }
}

export function validateBodyStats(input: UserBodyStats): ValidationResult<UserBodyStats> {
  if (input.age !== null) {
    if (!Number.isInteger(input.age) || input.age < 13 || input.age > 120) {
      return { ok: false, error: 'Age must be between 13 and 120' }
    }
  }

  if (input.heightCm !== null) {
    if (!Number.isInteger(input.heightCm) || input.heightCm < 100 || input.heightCm > 250) {
      return { ok: false, error: 'Height must be between 100 and 250 cm' }
    }
  }

  if (input.weightKg !== null) {
    if (!Number.isFinite(input.weightKg) || input.weightKg < 30 || input.weightKg > 300) {
      return { ok: false, error: 'Weight must be between 30 and 300 kg' }
    }
  }

  return { ok: true, value: input }
}

export function validateProfileUpdate(input: ProfileUpdate): ValidationResult<ProfileUpdate> {
  if (input.displayName !== undefined) {
    const trimmed = input.displayName.trim()
    if (trimmed === '') {
      return { ok: false, error: 'Display name is required' }
    }
    if (trimmed.length > 80) {
      return { ok: false, error: 'Display name must be 80 characters or fewer' }
    }
  }

  if (input.age !== undefined && input.age !== null) {
    if (!Number.isInteger(input.age) || input.age < 13 || input.age > 120) {
      return { ok: false, error: 'Age must be between 13 and 120' }
    }
  }

  if (input.heightCm !== undefined && input.heightCm !== null) {
    if (!Number.isInteger(input.heightCm) || input.heightCm < 100 || input.heightCm > 250) {
      return { ok: false, error: 'Height must be between 100 and 250 cm' }
    }
  }

  if (input.weightKg !== undefined && input.weightKg !== null) {
    if (!Number.isFinite(input.weightKg) || input.weightKg < 30 || input.weightKg > 300) {
      return { ok: false, error: 'Weight must be between 30 and 300 kg' }
    }
  }

  return { ok: true, value: input }
}

export function parseBodyStatsInput(input: Record<string, unknown>): UserBodyStats {
  return {
    age: parseOptionalInt(input.age),
    heightCm: parseOptionalInt(input.heightCm ?? input.height_cm),
    weightKg: parseOptionalWeight(input.weightKg ?? input.weight_kg),
  }
}

export function buildProfileUpdatePayload(input: ProfileUpdate): {
  display_name?: string
  age?: number | null
  height_cm?: number | null
  weight_kg?: number | null
  nutrition_goals?: NutritionGoals
} {
  const payload: {
    display_name?: string
    age?: number | null
    height_cm?: number | null
    weight_kg?: number | null
    nutrition_goals?: NutritionGoals
  } = {}

  if (input.displayName !== undefined) {
    payload.display_name = input.displayName.trim()
  }
  if (input.age !== undefined) payload.age = input.age
  if (input.heightCm !== undefined) payload.height_cm = input.heightCm
  if (input.weightKg !== undefined) payload.weight_kg = input.weightKg
  if (input.nutritionGoals !== undefined) payload.nutrition_goals = input.nutritionGoals

  return payload
}

export function mergeProfileRow(
  current: UserProfile,
  row: Record<string, unknown> | null | undefined,
): UserProfile {
  if (!isRecord(row)) return current
  return mapProfileRow({
    display_name:
      typeof row.display_name === 'string' ? row.display_name : current.displayName,
    nutrition_goals: row.nutrition_goals ?? current.nutritionGoals,
    age: row.age === undefined ? current.age : (row.age as number | null),
    height_cm: row.height_cm === undefined ? current.heightCm : (row.height_cm as number | null),
    weight_kg: row.weight_kg === undefined ? current.weightKg : (row.weight_kg as number | null),
  })
}