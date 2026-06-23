import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ICON,
  DEFAULT_ICON_BG,
  DEFAULT_ICON_COLOR,
  iconOptions,
} from '../icons.js'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

describe('iconOptions', () => {
  it('is a non-empty list of valid icon options', () => {
    expect(iconOptions.length).toBeGreaterThanOrEqual(20)
    for (const opt of iconOptions) {
      expect(opt.icon).toMatch(/^fa-[\w-]+$/)
      expect(opt.label).toBeTruthy()
      expect(opt.bg).toMatch(HEX_COLOR)
      expect(opt.color).toMatch(HEX_COLOR)
    }
  })

  it('has unique icon classes and unique labels', () => {
    const icons = iconOptions.map((o) => o.icon)
    const labels = iconOptions.map((o) => o.label)
    expect(new Set(icons).size).toBe(icons.length)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('covers common food and drink categories', () => {
    const icons = new Set(iconOptions.map((o) => o.icon))
    // Beverages
    expect(icons.has('fa-coffee')).toBe(true)
    expect(icons.has('fa-glass-water')).toBe(true)
    // Proteins
    expect(icons.has('fa-drumstick-bite')).toBe(true)
    expect(icons.has('fa-egg')).toBe(true)
    expect(icons.has('fa-fish')).toBe(true)
    // Fruits/veg
    expect(icons.has('fa-apple-alt')).toBe(true)
    expect(icons.has('fa-carrot')).toBe(true)
    // Grains
    expect(icons.has('fa-burger')).toBe(true)
    expect(icons.has('fa-pizza-slice')).toBe(true)
    // Sweets
    expect(icons.has('fa-ice-cream')).toBe(true)
    // Energy
    expect(icons.has('fa-bolt')).toBe(true)
  })

  it('DEFAULT_ICON points at the first option', () => {
    expect(iconOptions[0].icon).toBe(DEFAULT_ICON)
  })

  it('exposes the default bg and color hex values', () => {
    expect(DEFAULT_ICON_BG).toMatch(HEX_COLOR)
    expect(DEFAULT_ICON_COLOR).toMatch(HEX_COLOR)
  })
})
