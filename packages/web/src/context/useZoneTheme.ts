import { useContext } from 'react'
import { ZoneThemeContext } from './zone-theme-context'
import type { ZoneTokens } from '../lib/design-tokens'

export function useZoneTheme(): ZoneTokens {
  return useContext(ZoneThemeContext)
}