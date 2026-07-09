import type { HTMLAttributes, ReactNode } from 'react'
import { radius, status } from '../../lib/design-tokens'

export type AlertVariant = 'error' | 'success' | 'warning' | 'info'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  children: ReactNode
}

const variantTokens = {
  error: status.danger,
  success: status.success,
  warning: status.warning,
  info: status.info,
} as const

export default function Alert({
  variant = 'error',
  children,
  style,
  role,
  ...props
}: AlertProps) {
  const tokens = variantTokens[variant]
  const defaultRole = variant === 'error' ? 'alert' : 'status'

  return (
    <div
      className="ui-alert"
      role={role ?? defaultRole}
      style={{
        margin: 0,
        padding: '10px 12px',
        borderRadius: radius.md,
        border: `1px solid ${tokens.border}`,
        background: tokens.bg,
        color: tokens.text,
        fontSize: 13,
        lineHeight: 1.45,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
