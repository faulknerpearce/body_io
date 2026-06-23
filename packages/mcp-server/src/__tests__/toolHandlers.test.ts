import { describe, expect, it } from 'vitest'
import { isManageDayLogAction } from '../toolHandlers.js'

describe('isManageDayLogAction', () => {
  it('accepts supported actions', () => {
    expect(isManageDayLogAction('list')).toBe(true)
    expect(isManageDayLogAction('add_food')).toBe(true)
    expect(isManageDayLogAction('update_activity')).toBe(true)
    expect(isManageDayLogAction('delete_food')).toBe(true)
  })

  it('rejects unknown actions', () => {
    expect(isManageDayLogAction('edit')).toBe(false)
    expect(isManageDayLogAction(undefined)).toBe(false)
  })
})