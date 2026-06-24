import { createContext, useContext, type ReactNode } from 'react'
import { zoneTokens, zoneCssVars, type ZoneId, type ZoneTokens } from '../lib/design-tokens'

const ZoneThemeContext = createContext<ZoneTokens>(zoneTokens.dashboard)

export function ZoneThemeProvider({ zone, children }: { zone: ZoneId; children: ReactNode }) {
  const tokens = zoneTokens[zone]
  return (
    <ZoneThemeContext.Provider value={tokens}>
      <div className="zone-root" data-zone={zone} style={zoneCssVars(tokens)}>
        {children}
      </div>
    </ZoneThemeContext.Provider>
  )
}

export function useZoneTheme(): ZoneTokens {
  return useContext(ZoneThemeContext)
}