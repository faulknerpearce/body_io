import { useState, type ReactNode } from 'react'
import { neutrals } from '../../lib/design-tokens'
import Card from '../ui/Card'

interface CollapsiblePanelProps {
  title: string
  subtitle?: string
  defaultExpanded?: boolean
  children: ReactNode
}

export default function CollapsiblePanel({
  title,
  subtitle,
  defaultExpanded = false,
  children,
}: CollapsiblePanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <Card tone="neutral">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="log-section-header-toggle"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: '20px 24px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              color: neutrals.textSubtle,
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: neutrals.textFaint }}>{subtitle}</div>
          )}
        </div>
        <i
          className="fa-solid fa-chevron-down"
          style={{
            color: neutrals.textSubtle,
            fontSize: 14,
            transition: 'transform 0.2s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
            marginLeft: 16,
          }}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div
          className="log-section-content"
          style={{
            padding: '0 24px 24px',
            borderTop: `1px solid ${neutrals.surfaceHover}`,
          }}
        >
          {children}
        </div>
      )}
    </Card>
  )
}