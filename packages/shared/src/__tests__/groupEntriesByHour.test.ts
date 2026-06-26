import { describe, expect, it } from 'vitest'
import { groupEntriesByHour } from '../groupEntriesByHour.js'
import type { FoodEntry } from '../types.js'

function makeEntry(loggedAt: string): Pick<FoodEntry, 'loggedAt'> {
  return { loggedAt }
}

describe('groupEntriesByHour', () => {
  it('returns 24 buckets with zero counts for empty input', () => {
    const buckets = groupEntriesByHour([], 'UTC')
    expect(buckets).toHaveLength(24)
    expect(buckets.every((bucket) => bucket.entryCount === 0)).toBe(true)
    expect(buckets.map((bucket) => bucket.hour)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    ])
  })

  it('counts entries in the correct UTC hour', () => {
    const buckets = groupEntriesByHour(
      [
        makeEntry('2026-06-22T08:15:00Z'),
        makeEntry('2026-06-22T08:45:00Z'),
        makeEntry('2026-06-22T12:00:00Z'),
      ],
      'UTC',
    )

    expect(buckets[8].entryCount).toBe(2)
    expect(buckets[12].entryCount).toBe(1)
    expect(buckets[7].entryCount).toBe(0)
  })

  it('buckets by local hour in a non-UTC timezone', () => {
    const buckets = groupEntriesByHour(
      [makeEntry('2026-06-22T15:00:00Z')],
      'America/Los_Angeles',
    )

    expect(buckets[8].entryCount).toBe(1)
  })
})