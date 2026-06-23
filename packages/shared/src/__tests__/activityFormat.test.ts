import { describe, expect, it } from 'vitest'
import { formatDistance, formatDuration } from '../activityFormat.js'

describe('activityFormat', () => {
  it('formats durations', () => {
    expect(formatDuration(0)).toBe('0m')
    expect(formatDuration(2700)).toBe('45m')
    expect(formatDuration(4500)).toBe('1h 15m')
    expect(formatDuration(7200)).toBe('2h')
  })

  it('formats distances', () => {
    expect(formatDistance(null)).toBe('—')
    expect(formatDistance(850)).toBe('850 m')
    expect(formatDistance(5200)).toBe('5.2 km')
  })
})
