import type { ReactNode } from 'react'
import { ZoneThemeProvider } from '../../context/ZoneThemeProvider'
import type { ZoneId } from '../../lib/design-tokens'

interface PageShellProps {
  zone: ZoneId
  wide?: boolean
  children: ReactNode
}

export default function PageShell({ zone, wide = false, children }: PageShellProps) {
  return (
    <ZoneThemeProvider zone={zone}>
      <div className={wide ? 'page-shell page-shell-wide' : 'page-shell'}>{children}</div>
    </ZoneThemeProvider>
  )
}