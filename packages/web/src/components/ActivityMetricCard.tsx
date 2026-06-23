import type { ActivityMetricConfig } from '../lib/activityMetrics'

interface ActivityMetricCardProps {
  config: ActivityMetricConfig
}

export default function ActivityMetricCard({ config }: ActivityMetricCardProps) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e4e4e7',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            background: config.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
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