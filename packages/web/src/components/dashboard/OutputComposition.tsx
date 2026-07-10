import type { NetBalance } from '@nutrition-tracker/shared'
import { neutrals, ZONE_CORAL } from '../../lib/design-tokens'

interface OutputCompositionProps {
  balance: NetBalance
}

/** Match Daily energy ProgressRing: size 112, stroke 10. */
const DONUT_SIZE = 112
const STROKE = 10

/** Muted gray — resting metabolism share of total burn. */
const BMR_RING = '#C7C7CC'
const ACTIVITY_COLOR = ZONE_CORAL

function compositionPercents(bmr: number, burned: number) {
  if (burned <= 0) {
    return { bmrPct: 100, activityPct: 0 }
  }
  const bmrPct = Math.round((bmr / burned) * 100)
  return { bmrPct, activityPct: 100 - bmrPct }
}

/**
 * Dominant burn mode for the donut center.
 * Resting when BMR is the larger share (including 50/50); Active when activity wins.
 */
function dominantMode(bmrPct: number, activityPct: number): {
  label: string
  pct: number
  color: string
} {
  if (activityPct > bmrPct) {
    return { label: 'Active', pct: activityPct, color: ACTIVITY_COLOR }
  }
  return { label: 'Resting', pct: bmrPct, color: BMR_RING }
}

/** Two-segment composition donut with mode label in the center. */
function CompositionDonut({
  bmrPct,
  activityPct,
  ariaLabel,
}: {
  bmrPct: number
  activityPct: number
  ariaLabel: string
}) {
  const radius = (DONUT_SIZE - STROKE) / 2
  const circumference = 2 * Math.PI * radius
  const center = DONUT_SIZE / 2

  const bmrLen = (bmrPct / 100) * circumference
  const activityLen = (activityPct / 100) * circumference
  const mode = dominantMode(bmrPct, activityPct)

  return (
    <div
      style={{
        position: 'relative',
        width: DONUT_SIZE,
        height: DONUT_SIZE,
        flexShrink: 0,
      }}
    >
      <svg
        width={DONUT_SIZE}
        height={DONUT_SIZE}
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
        role="img"
        aria-label={ariaLabel}
        style={{ display: 'block', transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f4f4f5"
          strokeWidth={STROKE}
        />
        {bmrPct > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={BMR_RING}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            strokeDasharray={`${bmrLen} ${circumference - bmrLen}`}
            strokeDashoffset={0}
            style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        )}
        {activityPct > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={ACTIVITY_COLOR}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            strokeDasharray={`${activityLen} ${circumference - activityLen}`}
            strokeDashoffset={-bmrLen}
            style={{
              transition:
                'stroke-dasharray 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          textAlign: 'center',
          lineHeight: 1.15,
          padding: 8,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: neutrals.textPrimary,
            letterSpacing: '-0.01em',
          }}
        >
          {mode.label}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: mode.color,
            fontVariantNumeric: 'tabular-nums',
            marginTop: 2,
          }}
        >
          {mode.pct}%
        </span>
      </div>
    </div>
  )
}

/**
 * Share of total daily burn: BMR (resting) vs activity.
 * Layout mirrors net energy: title + big kcal, then ring.
 */
export default function OutputComposition({ balance }: OutputCompositionProps) {
  const { bmr, activityCalories, burned } = balance
  const { bmrPct, activityPct } = compositionPercents(bmr, burned)

  const ariaLabel = `Total output ${burned} kilocalories: ${bmrPct}% BMR (${bmr}), ${activityPct}% activity (${activityCalories})`

  return (
    <div className="energy-overview-output">
      <div className="energy-overview-output-body">
        <div className="energy-overview-output-stats">
          <p className="energy-overview-section-title">Total output</p>
          <div className="energy-overview-net">
            <span className="energy-overview-net-value">{burned.toLocaleString()}</span>
            <span className="energy-overview-net-unit">kcal out</span>
          </div>
          <div className="energy-overview-output-legend">
            <div className="energy-overview-output-row">
              <span
                className="energy-overview-output-swatch"
                style={{ background: BMR_RING }}
                aria-hidden="true"
              />
              <span className="energy-overview-output-pct">{bmrPct}%</span>
              <span className="energy-overview-output-label">BMR</span>
              <span className="energy-overview-output-kcal">{bmr.toLocaleString()}</span>
            </div>
            <div className="energy-overview-output-row">
              <span
                className="energy-overview-output-swatch"
                style={{ background: ACTIVITY_COLOR }}
                aria-hidden="true"
              />
              <span className="energy-overview-output-pct">{activityPct}%</span>
              <span className="energy-overview-output-label">Activity</span>
              <span className="energy-overview-output-kcal">
                {activityCalories.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <CompositionDonut bmrPct={bmrPct} activityPct={activityPct} ariaLabel={ariaLabel} />
      </div>
    </div>
  )
}
