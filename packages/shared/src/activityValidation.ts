import type { ValidationResult } from './validation.js'

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function isNonNegativeNumber(v: unknown): v is number {
  return isFiniteNumber(v) && v >= 0
}

function isPositiveInteger(v: unknown): v is number {
  return isFiniteNumber(v) && Number.isInteger(v) && v > 0
}

export interface ActivityInput {
  name: string
  activityType: string
  movingTimeSeconds: number
  distanceMeters: number | null
  averageHeartrate: number | null
  maxHeartrate: number | null
  calories: number | null
}

export function validateActivity(input: Partial<ActivityInput>): ValidationResult<ActivityInput> {
  if (typeof input.name !== 'string' || input.name.trim() === '') {
    return { ok: false, error: 'name is required' }
  }
  if (typeof input.activityType !== 'string' || input.activityType.trim() === '') {
    return { ok: false, error: 'activityType is required' }
  }
  if (!isPositiveInteger(input.movingTimeSeconds)) {
    return { ok: false, error: 'movingTimeSeconds is required and must be a positive integer' }
  }
  if (input.distanceMeters !== undefined && input.distanceMeters !== null) {
    if (!isNonNegativeNumber(input.distanceMeters)) {
      return { ok: false, error: 'distanceMeters must be a non-negative number' }
    }
  }
  if (input.averageHeartrate !== undefined && input.averageHeartrate !== null) {
    if (!isPositiveInteger(input.averageHeartrate)) {
      return { ok: false, error: 'averageHeartrate must be a positive integer' }
    }
  }
  if (input.maxHeartrate !== undefined && input.maxHeartrate !== null) {
    if (!isPositiveInteger(input.maxHeartrate)) {
      return { ok: false, error: 'maxHeartrate must be a positive integer' }
    }
  }
  if (input.calories !== undefined && input.calories !== null) {
    if (!isNonNegativeNumber(input.calories)) {
      return { ok: false, error: 'calories must be a non-negative number' }
    }
  }

  return {
    ok: true,
    value: {
      name: input.name.trim(),
      activityType: input.activityType.trim(),
      movingTimeSeconds: input.movingTimeSeconds,
      distanceMeters: input.distanceMeters ?? null,
      averageHeartrate: input.averageHeartrate ?? null,
      maxHeartrate: input.maxHeartrate ?? null,
      calories: input.calories ?? null,
    },
  }
}
