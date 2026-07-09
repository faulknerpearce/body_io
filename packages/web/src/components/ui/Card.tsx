import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { neutrals, radius, shadow } from '../../lib/design-tokens'

export type CardTone = 'neutral' | 'zone'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone
  padded?: boolean
  children: ReactNode
}

export default function Card({
  tone = 'neutral',
  padded = false,
  children,
  style,
  className,
  ...props
}: CardProps) {
  const toneStyle: CSSProperties =
    tone === 'zone'
      ? {
          background: 'var(--zone-card-bg, #ffffff)',
          border: '1px solid var(--zone-card-border, rgba(28,28,30,0.06))',
        }
      : {
          background: neutrals.surface,
          border: `1px solid ${neutrals.border}`,
        }

  return (
    <div
      className={['ui-card', className].filter(Boolean).join(' ')}
      style={{
        borderRadius: radius.xxl,
        boxShadow: shadow.elevated,
        overflow: 'hidden',
        padding: padded ? 24 : undefined,
        ...toneStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
