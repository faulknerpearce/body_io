import type { ActivityMetricConfig } from '../lib/activityMetrics'
import { cardSurface, iconTileMd } from '../lib/styles'

interface ActivityMetricCardProps {
  config: ActivityMetricConfig
}

export default function ActivityMetricCard({ config }: ActivityMetricCardProps) {
  return (
    <div
      style={{
        ...cardSurface,
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            ...iconTileMd,
            background: config.iconBg,
          }}
        >
          <i
            className={`fa-solid ${config.iconClass}`}
            style={{ color: config.color, fontSize: 22 }}
          ></i>
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#71717a', fontWeight: 500 }}>{config.label}</div>
          <div
            style={{
              fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
              fontSize: 36,
              fontWeight: 600,
              lineHeight: 1.1,
              color: '#18181b',
            }}
          >
            {config.value}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#a1a1aa' }}>{config.detail}</div>
    </div>
  )
}
