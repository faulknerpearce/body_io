import type { ReactNode } from 'react'
import { neutrals, radius, type } from '../../lib/design-tokens'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="ui-empty-state"
      style={{
        textAlign: 'center',
        padding: '40px 24px',
        color: neutrals.textFaint,
      }}
    >
      {icon && (
        <div
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 14px',
            borderRadius: radius.lg,
            background: 'var(--zone-accent-muted, #f4f4f5)',
            color: 'var(--zone-accent, #52525b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
          }}
          aria-hidden="true"
        >
          <i className={icon} />
        </div>
      )}
      <p
        style={{
          fontWeight: 600,
          margin: '0 0 4px 0',
          color: neutrals.textMuted,
          fontSize: type.body,
        }}
      >
        {title}
      </p>
      {description && (
        <p style={{ fontSize: type.bodySm, margin: 0, lineHeight: 1.5, maxWidth: 28 * 16, marginInline: 'auto' }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}
