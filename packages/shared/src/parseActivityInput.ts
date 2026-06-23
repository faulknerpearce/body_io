import { validateActivity, type ActivityInput } from './activityValidation.js'

export type ParsedActivityInput = ActivityInput

export function parseActivityInput(input: Record<string, unknown>):
  | { ok: true; value: ParsedActivityInput }
  | { ok: false; error: string } {
  const candidate: Partial<ActivityInput> = {
    name: typeof input.name === 'string' ? input.name : '',
    activityType:
      typeof input.activityType === 'string'
        ? input.activityType
        : typeof input.activity_type === 'string'
          ? input.activity_type
          : '',
    movingTimeSeconds:
      typeof input.movingTimeSeconds === 'number'
        ? Math.round(input.movingTimeSeconds)
        : typeof input.moving_time_seconds === 'number'
          ? Math.round(input.moving_time_seconds)
          : typeof input.durationMinutes === 'number'
            ? Math.round(input.durationMinutes * 60)
            : NaN,
    distanceMeters:
      input.distanceMeters === null || input.distanceMeters === undefined
        ? input.distance_meters === null || input.distance_meters === undefined
          ? input.distanceKm === null || input.distanceKm === undefined
            ? null
            : typeof input.distanceKm === 'number'
              ? Math.round(input.distanceKm * 1000)
              : null
          : typeof input.distance_meters === 'number'
            ? input.distance_meters
            : null
        : typeof input.distanceMeters === 'number'
          ? input.distanceMeters
          : null,
    averageHeartrate:
      input.averageHeartrate === null || input.averageHeartrate === undefined
        ? input.average_heartrate === null || input.average_heartrate === undefined
          ? null
          : typeof input.average_heartrate === 'number'
            ? Math.round(input.average_heartrate)
            : null
        : typeof input.averageHeartrate === 'number'
          ? Math.round(input.averageHeartrate)
          : null,
    maxHeartrate:
      input.maxHeartrate === null || input.maxHeartrate === undefined
        ? input.max_heartrate === null || input.max_heartrate === undefined
          ? null
          : typeof input.max_heartrate === 'number'
            ? Math.round(input.max_heartrate)
            : null
        : typeof input.maxHeartrate === 'number'
          ? Math.round(input.maxHeartrate)
          : null,
    calories:
      input.calories === null || input.calories === undefined
        ? null
        : typeof input.calories === 'number'
          ? Math.round(input.calories)
          : null,
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