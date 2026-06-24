import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useZoneTheme } from '../../context/useZoneTheme'

type ZoneButtonVariant = 'primary' | 'secondary' | 'danger'

interface ZoneButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ZoneButtonVariant
  children: ReactNode
}

export default function ZoneButton({
  variant = 'secondary',
  children,
  style,
  ...props
}: ZoneButtonProps) {
  const zone = useZoneTheme()

  const variantStyle =
    variant === 'primary'
      ? { background: zone.accent, color: zone.accentText, border: `1px solid ${zone.accent}` }
      : variant === 'danger'
        ? { background: '#fff1f2', color: '#b91c1c', border: '1px solid #fecaca' }
        : { background: zone.cardBg, color: '#52525b', border: `1px solid ${zone.cardBorder}` }

  return (
    <button type="button" className="zone-button" style={{ ...variantStyle, ...style }} {...props}>
      {children}
    </button>
  )
}