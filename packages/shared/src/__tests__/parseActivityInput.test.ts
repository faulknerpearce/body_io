import { describe, expect, it } from 'vitest'
import { parseActivityInput } from '../parseActivityInput.js'

describe('parseActivityInput', () => {
  it('parses MCP-style durationMinutes and distanceKm', () => {
    const result = parseActivityInput({
      name: 'Lunch Walk',
      activityType: 'Walk',
      durationMinutes: 30,
      distanceKm: 2.5,
      calories: 180,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.movingTimeSeconds).toBe(1800)
      expect(result.value.distanceMeters).toBe(2500)
      expect(result.value.calories).toBe(180)
    }
  })

  it('parses direct movingTimeSeconds from the web client', () => {
    const result = parseActivityInput({
      name: 'Intervals',
      activityType: 'Run',
      movingTimeSeconds: 2400,
      distanceMeters: 8000,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.movingTimeSeconds).toBe(2400)
      expect(result.value.distanceMeters).toBe(8000)
    }
  })
})