import type { Activity, ActivityRow } from './types.js'

export function mapActivityRow(row: ActivityRow): Activity {
  return {
    id: row.id,
    name: row.name,
    activityType: row.activity_type,
    activityDate: row.activity_date,
    distanceMeters: row.distance_meters,
    movingTimeSeconds: row.moving_time_seconds,
    averageHeartrate: row.average_heartrate,
    maxHeartrate: row.max_heartrate,
    calories: row.calories,
  }
}