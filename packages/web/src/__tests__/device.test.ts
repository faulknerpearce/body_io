import { afterEach, describe, expect, it, vi } from 'vitest'
import { focusIfDesktop, isTouchPrimaryDevice } from '../lib/device'

describe('isTouchPrimaryDevice', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns false when window is unavailable', () => {
    expect(isTouchPrimaryDevice()).toBe(false)
  })

  it('returns true for coarse pointer devices without hover', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true })
    vi.stubGlobal('window', { matchMedia })
    expect(isTouchPrimaryDevice()).toBe(true)
    expect(matchMedia).toHaveBeenCalledWith('(hover: none) and (pointer: coarse)')
  })

  it('returns false for desktop pointer/hover devices', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: false })
    vi.stubGlobal('window', { matchMedia })
    expect(isTouchPrimaryDevice()).toBe(false)
  })
})

describe('focusIfDesktop', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not focus on touch-primary devices', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true })
    vi.stubGlobal('window', { matchMedia })
    const focus = vi.fn()
    focusIfDesktop({ focus } as unknown as HTMLElement)
    expect(focus).not.toHaveBeenCalled()
  })

  it('focuses on desktop devices', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: false })
    vi.stubGlobal('window', { matchMedia })
    const focus = vi.fn()
    focusIfDesktop({ focus } as unknown as HTMLElement)
    expect(focus).toHaveBeenCalled()
  })

  it('ignores null elements', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: false })
    vi.stubGlobal('window', { matchMedia })
    expect(() => focusIfDesktop(null)).not.toThrow()
  })
})