import { validateActivity, type ActivityInput } from './activityValidation.js'

export type ParsedActivityInput = ActivityInput

/**
 * Read a numeric field, preferring the camelCase key, then the snake_case key,
 * and finally (optionally) a value to multiply by a scale factor. Returns null
 * for missing/invalid values. Used to normalise MCP snake_case payloads
 * alongside the web client's camelCase payloads.
 */
function readNumber(
  input: Record<string, unknown>,
  camel: string,
  snake: string,
  scale = 1,
): number | null {
  if (input[camel] === null || input[camel] === undefined) {
    if (input[snake] === null || input[snake] === undefined) return null
    return typeof input[snake] === 'number' ? Math.round(input[snake] * scale) : null
  }
  return typeof input[camel] === 'number' ? Math.round(input[camel] * scale) : null
}

function readRoundedNumber(
  input: Record<string, unknown>,
  camel: string,
  snake: string,
): number | null {
  return readNumber(input, camel, snake, 1)
}

function readString(input: Record<string, unknown>, camel: string, snake: string): string {
  if (typeof input[camel] === 'string') return input[camel]
  if (typeof input[snake] === 'string') return input[snake]
  return ''
}

export function parseActivityInput(
  input: Record<string, unknown>,
): { ok: true; value: ParsedActivityInput } | { ok: false; error: string } {
  // movingTimeSeconds accepts minutes (web modal) or seconds (MCP).
  const movingTimeSeconds =
    readNumber(input, 'movingTimeSeconds', 'moving_time_seconds') ??
    (typeof input.durationMinutes === 'number' ? Math.round(input.durationMinutes * 60) : NaN)

  const candidate: Partial<ActivityInput> = {
    name: typeof input.name === 'string' ? input.name : '',
    activityType: readString(input, 'activityType', 'activity_type'),
    movingTimeSeconds,
    distanceMeters:
      readNumber(input, 'distanceMeters', 'distance_meters') ??
      (input.distanceKm === null || input.distanceKm === undefined
        ? null
        : typeof input.distanceKm === 'number'
          ? Math.round(input.distanceKm * 1000)
          : null),
    averageHeartrate: readRoundedNumber(input, 'averageHeartrate', 'average_heartrate'),
    maxHeartrate: readRoundedNumber(input, 'maxHeartrate', 'max_heartrate'),
    calories: readRoundedNumber(input, 'calories', 'calories'),
  }

  return validateActivity(candidate)
}

export function buildActivityInsertPayload(
  input: ParsedActivityInput,
  id: string,
  userId: string,
  activityDate: string,
): {
  id: string
  user_id: string
  name: string
  activity_type: string
  activity_date: string
  distance_meters: number | null
  moving_time_seconds: number
  average_heartrate: number | null
  max_heartrate: number | null
  calories: number | null
} {
  return {
    id,
    user_id: userId,
    name: input.name,
    activity_type: input.activityType,
    activity_date: activityDate,
    distance_meters: input.distanceMeters,
    moving_time_seconds: input.movingTimeSeconds,
    average_heartrate: input.averageHeartrate,
    max_heartrate: input.maxHeartrate,
    calories: input.calories,
  }
}

export function buildActivityUpdatePayload(input: ParsedActivityInput): {
  name: string
  activity_type: string
  distance_meters: number | null
  moving_time_seconds: number
  average_heartrate: number | null
  max_heartrate: number | null
  calories: number | null
} {
  return {
    name: input.name,
    activity_type: input.activityType,
    distance_meters: input.distanceMeters,
    moving_time_seconds: input.movingTimeSeconds,
    average_heartrate: input.averageHeartrate,
    max_heartrate: input.maxHeartrate,
    calories: input.calories,
  }
}
