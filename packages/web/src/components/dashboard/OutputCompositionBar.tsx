import type { NetBalance } from '@nutrition-tracker/shared'
import { neutrals } from '../../lib/design-tokens'

interface OutputCompositionBarProps {
  balance: NetBalance
}

/** Muted gray — baseline burn (not logged activity). */
const BMR_COLOR = '#A1A1A6'
const BMR_BASE = '#C7C7CC'
/** Minimal diagonal hatch — sparse light strokes over soft gray. */
const BMR_HATCH = `repeating-linear-gradient(
  -45deg,
  ${BMR_BASE} 0 7px,
  rgba(255, 255, 255, 0.55) 7px 8px
)`

/** Burn red-orange (outputs accent) — activity share of burn. */
const ACTIVITY_COLOR = '#EA4E2E'
const ACTIVITY_GRADIENT = 'linear-gradient(90deg, #EA4E2E, #FF7A4A)'

export default function OutputCompositionBar({ balance }: OutputCompositionBarProps) {
  const { bmr, activityCalories, burned } = balance
  const bmrShare = burned > 0 ? (bmr / burned) * 100 : 100
  const activityShare = burned > 0 ? (activityCalories / burned) * 100 : 0

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: neutrals.textMuted }}>Total output</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: neutrals.textSecondary,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {burned.toLocaleString()} kcal
        </span>
      </div>

      <div
        role="img"
        aria-label={`Total output ${burned} kilocalories: BMR ${bmr} (baseline, hatched), activity ${activityCalories}`}
        style={{
          display: 'flex',
          height: 12,
          borderRadius: 9999,
          overflow: 'hidden',
          background: neutrals.surfaceHover,
        }}
      >
        <div
          style={{
            width: `${bmrShare}%`,
            background: BMR_HATCH,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          title={`BMR (baseline) ${bmr.toLocaleString()} kcal`}
        />
        {activityShare > 0 && (
          <div
            style={{
              width: `${activityShare}%`,
              background: ACTIVITY_GRADIENT,
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            title={`Activity ${activityCalories.toLocaleString()} kcal`}
          />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 16px',
          marginTop: 8,
          fontSize: 11,
          color: neutrals.textMuted,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            aria-hidden="true"
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: BMR_HATCH,
              border: `1px solid ${BMR_COLOR}`,
              flexShrink: 0,
            }}
          />
          BMR {bmr.toLocaleString()} kcal
          <span style={{ color: neutrals.textFaint }}>(resting metabolism)</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            aria-hidden="true"
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: ACTIVITY_COLOR,
              flexShrink: 0,
            }}
          />
          Activity {activityCalories.toLocaleString()} kcal
        </span>
      </div>
    </div>
  )
}
