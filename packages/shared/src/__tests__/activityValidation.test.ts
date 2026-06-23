import { describe, expect, it } from 'vitest'
import { validateActivity } from '../activityValidation.js'

describe('validateActivity', () => {
  it('accepts a valid activity with optional fields', () => {
    const result = validateActivity({
      name: 'Morning Run',
      activityType: 'Run',
      movingTimeSeconds: 2700,
      distanceMeters: 5200,
      averageHeartrate: 145,
      maxHeartrate: 168,
      calories: 420,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.name).toBe('Morning Run')
      expect(result.value.calories).toBe(420)
    }
  })

  it('requires name, activityType, and movingTimeSeconds', () => {
    expect(validateActivity({}).ok).toBe(false)
    expect(validateActivity({ name: 'Run', activityType: 'Run' }).ok).toBe(false)
    expect(validateActivity({ name: 'Run', activityType: 'Run', movingTimeSeconds: 0 }).ok).toBe(
      false,
    )
  })
})
