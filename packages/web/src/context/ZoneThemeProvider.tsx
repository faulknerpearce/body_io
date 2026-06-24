import type { ReactNode } from 'react'
import { zoneTokens, zoneCssVars, type ZoneId } from '../lib/design-tokens'
import { ZoneThemeContext } from './zone-theme-context'

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