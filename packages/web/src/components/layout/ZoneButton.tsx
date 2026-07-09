import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Button, { type ButtonVariant } from '../ui/Button'

type ZoneButtonVariant = 'primary' | 'secondary' | 'danger'

interface ZoneButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ZoneButtonVariant
  children: ReactNode
}

/** Zone-aware button. Thin alias over `ui/Button` for existing call sites. */
export default function ZoneButton({
  variant = 'secondary',
  children,
  ...props
}: ZoneButtonProps) {
  const mapped: ButtonVariant =
    variant === 'primary' ? 'primary' : variant === 'danger' ? 'danger' : 'secondary'

  return (
    <Button variant={mapped} size="sm" className="zone-button" {...props}>
      {children}
    </Button>
  )
}