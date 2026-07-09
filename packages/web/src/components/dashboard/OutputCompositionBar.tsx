import type { NetBalance } from '@nutrition-tracker/shared'
import { neutrals } from '../../lib/design-tokens'

interface OutputCompositionBarProps {
  balance: NetBalance
}

/** Soft lavender (theme dusk accent) — BMR share of burn. */
const BMR_COLOR = '#9B8EC4'
const BMR_GRADIENT = 'linear-gradient(90deg, #8B7EB8, #B5A8D9)'

/** Soft teal (outputs / cool sky) — activity share of burn. */
const ACTIVITY_COLOR = '#2F8A9B'
const ACTIVITY_GRADIENT = 'linear-gradient(90deg, #2F8A9B, #5BA3B0)'

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
        aria-label={`Total output ${burned} kilocalories: BMR ${bmr}, activity ${activityCalories}`}
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
            background: BMR_GRADIENT,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          title={`BMR ${bmr.toLocaleString()} kcal`}
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
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: BMR_COLOR,
              flexShrink: 0,
            }}
          />
          BMR {bmr.toLocaleString()} kcal
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: ACTIVITY_COLOR,
              flexShrink: 0,
            }}
          />
          Activity {activityCalories.toLocaleString()} kcal
        </span>
      </div>
      <p style={{ fontSize: 11, color: neutrals.textFaint, margin: '6px 0 0 0', lineHeight: 1.4 }}>
        Composition of today&apos;s burn — not compared to a target.
      </p>
    </div>
  )
}
