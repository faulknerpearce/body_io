import type { CSSProperties } from 'react'
import { neutrals, radius } from '../../lib/design-tokens'

interface GradientMeterProps {
  /** 0–100 */
  value: number
  gradient?: string
  height?: number
  label?: string
  style?: CSSProperties
  'aria-label'?: string
}

/** Thin golden-hour style gradient pill (progress). */
export default function GradientMeter({
  value,
  gradient = 'linear-gradient(90deg, #FF6B35, #5AC8FA)',
  height = 8,
  label,
  style,
  'aria-label': ariaLabel,
}: GradientMeterProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div style={{ width: '100%', ...style }}>
      {label && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: neutrals.textMuted,
            marginBottom: 6,
          }}
        >
          {label}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel ?? label}
        style={{
          height,
          borderRadius: radius.pill,
          background: neutrals.surfaceHover,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            borderRadius: radius.pill,
            background: gradient,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  )
}
