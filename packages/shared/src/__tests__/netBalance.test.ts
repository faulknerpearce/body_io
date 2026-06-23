import { describe, expect, it } from 'vitest'
import { computeNetBalance } from '../netBalance.js'

describe('computeNetBalance', () => {
  const low = 2800
  const high = 3200

  it('computes net calories as consumed minus burned', () => {
    const balance = computeNetBalance(2400, 520, low, high)
    expect(balance.net).toBe(1880)
    expect(balance.consumed).toBe(2400)
    expect(balance.burned).toBe(520)
  })

  it('reports under target when net is below low', () => {
    const balance = computeNetBalance(2000, 0, low, high)
    expect(balance.status).toBe('under')
    expect(balance.remainingToLow).toBe(800)
    expect(balance.contextMessage).toContain('800')
  })

  it('reports in range when net is between low and high', () => {
    const balance = computeNetBalance(3000, 0, low, high)
    expect(balance.status).toBe('in_range')
    expect(balance.contextMessage).toContain('Within')
  })

  it('reports over target when net exceeds high', () => {
    const balance = computeNetBalance(3500, 0, low, high)
    expect(balance.status).toBe('over')
    expect(balance.overHighBy).toBe(300)
    expect(balance.contextMessage).toContain('300')
  })

  it('handles no activities logged', () => {
    const balance = computeNetBalance(1500, 0, low, high)
    expect(balance.burned).toBe(0)
    expect(balance.net).toBe(1500)
  })
})