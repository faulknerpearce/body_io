import { hourInTimeZone } from './dateUtils.js'
import type { FoodEntry } from './types.js'

export interface HourlyBucket {
  hour: number
  entryCount: number
}

export function groupEntriesByHour(
  entries: readonly Pick<FoodEntry, 'loggedAt'>[],
  timeZone: string,
): HourlyBucket[] {
  const counts = Array.from({ length: 24 }, () => 0)

  for (const entry of entries) {
    const hour = hourInTimeZone(entry.loggedAt, timeZone)
    if (hour >= 0 && hour < 24) {
      counts[hour]++
    }
  }

  return counts.map((entryCount, hour) => ({ hour, entryCount }))
}