import type { Activity, ActivityTotals } from './types.js'

export function sumActivityTotals(activities: readonly Activity[]): ActivityTotals {
  return activities.reduce(
    (acc, activity) => ({
      calories: acc.calories + (activity.calories ?? 0),
      movingTimeSeconds: acc.movingTimeSeconds + activity.movingTimeSeconds,
      distanceMeters: acc.distanceMeters + (activity.distanceMeters ?? 0),
    }),
    { calories: 0, movingTimeSeconds: 0, distanceMeters: 0 },
  )
}
