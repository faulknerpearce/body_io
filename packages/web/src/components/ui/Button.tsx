import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useZoneTheme } from '../../context/useZoneTheme'
import { neutrals, radius, status } from '../../lib/design-tokens'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
export type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const sizeStyles: Record<ButtonSize, { padding: string; fontSize: number }> = {
  sm: { padding: '8px 14px', fontSize: 12 },
  md: { padding: '10px 18px', fontSize: 13 },
}

export default function Button({
  variant = 'primary',
  size = 'sm',
  children,
  style,
  disabled,
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  const zone = useZoneTheme()
  const sizeStyle = sizeStyles[size]

  const variantStyle =
    variant === 'primary'
      ? {
          background: zone.accent,
          color: zone.accentText,
          border: `1px solid ${zone.accent}`,
        }
      : variant === 'outline'
        ? {
            background: neutrals.surface,
            color: zone.accent,
            border: `1px solid ${zone.accent}`,
          }
        : variant === 'danger'
          ? {
              background: status.danger.bg,
              color: status.danger.textStrong,
              border: `1px solid ${status.danger.border}`,
            }
          : variant === 'ghost'
            ? {
                background: 'transparent',
                color: neutrals.textMuted,
                border: '1px solid transparent',
              }
            : {
                background: zone.cardBg,
                color: neutrals.textMuted,
                border: `1px solid ${zone.cardBorder}`,
              }

  return (
    <button
      type={type}
      className={['ui-button', className].filter(Boolean).join(' ')}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: radius.pill,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        flexShrink: 0,
        opacity: disabled ? 0.55 : 1,
        ...sizeStyle,
        ...variantStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}
