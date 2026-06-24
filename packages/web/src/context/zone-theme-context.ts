import { createContext } from 'react'
import { zoneTokens, type ZoneTokens } from '../lib/design-tokens'

export const ZoneThemeContext = createContext<ZoneTokens>(zoneTokens.dashboard)