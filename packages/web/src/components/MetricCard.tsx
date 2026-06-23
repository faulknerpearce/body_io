import { cardSurface, iconTileMd } from '../lib/styles'

export interface MetricConfig {
  label: string
  value: number
  formatValue: (v: number) => string
  unit: string | null
  goal: number
  formatGoal: (g: number) => string
  color: string
  iconBg: string
  iconClass: string
  gradient: string
  rightLabel: string
  remainingSuffix: string
  remaining: (value: number, goal: number) => string
}

interface MetricCardProps {
  config: MetricConfig
}

export default function MetricCard({ config }: MetricCardProps) {
  const pct = Math.round((config.value / config.goal) * 100)
  const widthPct = Math.min(pct, 100)
  const remainingText = config.remaining(config.value, config.goal)

  return (
    <div
      style={{
        ...cardSurface,
        padding: 24,
      }}
    >
      <div className="metric-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
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
            <div style={{ display: 'flex', alignItems: 'baseline', gap: config.unit ? 4 : 0 }}>
              <span className="metric-card-value">{config.formatValue(config.value)}</span>
              {config.unit && (
                <span style={{ fontSize: 18, fontWeight: 500, color: config.color }}>
                  {config.unit}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2 }}>
            <span className="metric-card-pct" style={{ color: config.color }}>
              {pct}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: config.color }}>%</span>
          </div>
          <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: -2 }}>{config.rightLabel}</div>
        </div>
      </div>
      <div style={{ marginBottom: 4 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          <div style={{ color: '#71717a' }}>Consumed</div>
          <div style={{ fontFamily: 'monospace', color: config.color }}>
            {config.formatValue(config.value)} / {config.formatGoal(config.goal)}
          </div>
        </div>
        <div
          style={{ height: 10, backgroundColor: '#f4f4f5', borderRadius: 9999, overflow: 'hidden' }}
        >
          <div
            style={{
              height: '100%',
              background: config.gradient,
              borderRadius: 9999,
              width: `${widthPct}%`,
            }}
          />
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#a1a1aa' }}>
        Remaining: <span style={{ fontWeight: 500, color: '#3f3f46' }}>{remainingText}</span>
      </div>
    </div>
  )
}
