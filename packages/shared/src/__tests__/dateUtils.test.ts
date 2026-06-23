import { describe, expect, it } from 'vitest'
import { formatDayLabel, offsetDateISO, parseISODate, todayISO } from '../dateUtils.js'

describe('todayISO', () => {
  it('formats a date as YYYY-MM-DD using local components', () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(todayISO(new Date(2026, 11, 31))).toBe('2026-12-31')
    expect(todayISO(new Date(2026, 8, 9))).toBe('2026-09-09')
  })

  it('zero-pads single-digit months and days', () => {
    expect(todayISO(new Date(2026, 0, 1))).toBe('2026-01-01')
    expect(todayISO(new Date(2026, 8, 1))).toBe('2026-09-01')
  })

  it('uses the local date (not UTC)', () => {
    const localMidnight = new Date(2026, 5, 22, 0, 0, 0)
    expect(todayISO(localMidnight)).toBe('2026-06-22')
  })
})

describe('parseISODate', () => {
  it('parses YYYY-MM-DD into a local Date', () => {
    const date = parseISODate('2026-06-22')
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(5)
    expect(date.getDate()).toBe(22)
  })
})

describe('offsetDateISO', () => {
  it('returns an ISO date N days before the reference date', () => {
    const ref = new Date(2026, 5, 23)
    expect(offsetDateISO(1, ref)).toBe('2026-06-22')
    expect(offsetDateISO(30, ref)).toBe('2026-05-24')
  })
})

describe('formatDayLabel', () => {
  const now = new Date(2026, 5, 23)

  it('labels today and yesterday relative to now', () => {
    expect(formatDayLabel('2026-06-23', now)).toBe('Today')
    expect(formatDayLabel('2026-06-22', now)).toBe('Yesterday')
  })

  it('formats other dates with weekday and month', () => {
    expect(formatDayLabel('2026-06-15', now)).toBe('Monday, Jun 15')
  })
})
