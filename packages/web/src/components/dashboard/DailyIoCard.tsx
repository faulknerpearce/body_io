import type { NetBalance } from '@body-io/shared'
import { useMemo } from 'react'
import {
  neutrals,
  radius,
  type as typeScale,
  ZONE_BLUE,
  ZONE_CORAL,
  ZONE_GREEN,
} from '../../lib/design-tokens'
import { useMediaQuery } from '../../lib/useMediaQuery'
import DayNavigator from '../layout/DayNavigator'
import Card from '../ui/Card'
import DeviceTotalControl from './DeviceTotalControl'

interface DailyIoCardProps {
  balance: NetBalance
  date: string
  isToday: boolean
  canGoBack?: boolean
  canGoForward?: boolean
  dayLoading?: boolean
  onPrevious: () => void
  onNext: () => void
  onGoToToday: () => void
  usesWearable?: boolean
  onSaveDeviceTotal?: (kcal: number) => Promise<void>
  onClearDeviceTotal?: () => Promise<void>
}

const CHART_H = 200
const INPUT_AHEAD_RED = '#E11D48'

function pctOfMax(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}

/** Badge: net in goal → blue; else I vs O comparison. */
function ioStatusBadge(balance: NetBalance): {
  label: string
  color: string
  background: string
} {
  if (balance.status === 'in_range') {
    return {
      label: 'I/O in Range',
      color: ZONE_BLUE,
      background: 'rgba(86, 143, 235, 0.16)',
    }
  }
  if (balance.burned > balance.consumed) {
    return {
      label: 'Output > Input',
      color: ZONE_GREEN,
      background: 'rgba(19, 165, 97, 0.14)',
    }
  }
  if (balance.consumed > balance.burned) {
    return {
      label: 'Input > Output',
      color: INPUT_AHEAD_RED,
      background: 'rgba(225, 29, 72, 0.12)',
    }
  }
  return {
    label: 'Output = Input',
    color: neutrals.textMuted,
    background: neutrals.surfaceHover,
  }
}

interface GoalLine {
  key: string
  label: string
  value: number
  emphasis?: boolean
}

export default function DailyIoCard({
  balance,
  date,
  isToday,
  canGoBack = true,
  canGoForward = false,
  dayLoading = false,
  onPrevious,
  onNext,
  onGoToToday,
  usesWearable = false,
  onSaveDeviceTotal,
  onClearDeviceTotal,
}: DailyIoCardProps) {
  const isMobile = useMediaQuery('(max-width: 639px)')
  const { consumed, burned, goalLow, goalHigh, bmr } = balance
  const target = (goalLow + goalHigh) / 2
  // Full-day BMR always — not time-prorated (that made "today" look like ~923 midday)
  const bmrLine = Math.round(bmr)

  const leftAxisW = isMobile ? 40 : 44
  const rightAxisW = isMobile ? 40 : 64
  const barW = isMobile ? 48 : 56
  const barGap = isMobile ? 28 : 40
  /** Keep bars clear of axis number chips on the plot edges */
  const plotPadX = isMobile ? 10 : 16

  const chartMax = useMemo(
    () => Math.max(consumed, burned, goalHigh, bmrLine, 1) * 1.08,
    [consumed, burned, goalHigh, bmrLine],
  )

  const goalLines: GoalLine[] = useMemo(
    () => [
      { key: 'high', label: 'High', value: goalHigh },
      { key: 'target', label: 'Target', value: target, emphasis: true },
      { key: 'low', label: 'Low', value: goalLow },
    ],
    [goalHigh, goalLow, target],
  )

  /** Spaced positions (px from top) for left-axis labels so they never overlap on mobile. */
  const spacedLabelPositions = useMemo(() => {
    const MIN_GAP = 26
    const positions = goalLines.map((line) => ({
      key: line.key,
      rawPx: CHART_H - (pctOfMax(line.value, chartMax) / 100) * CHART_H,
    }))
    positions.sort((a, b) => a.rawPx - b.rawPx)
    const adjusted: { key: string; px: number }[] = []
    for (const p of positions) {
      const last = adjusted[adjusted.length - 1]
      const minPx = last ? last.px + MIN_GAP : 0
      adjusted.push({ key: p.key, px: Math.max(p.rawPx, minPx) })
    }
    return adjusted
  }, [goalLines, chartMax])

  const status = ioStatusBadge(balance)
  const inputH = pctOfMax(consumed, chartMax)
  const outputH = pctOfMax(burned, chartMax)
  const bmrBottom = pctOfMax(bmrLine, chartMax)

  const ariaLabel = [
    `In versus out: ${consumed.toLocaleString()} kilocalories in, ${burned.toLocaleString()} out.`,
    status.label,
    `BMR reference ${bmrLine.toLocaleString()} kilocalories.`,
  ].join(' ')

  return (
    <Card tone="neutral" style={{ padding: isMobile ? '14px 12px' : '16px 18px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 8,
        }}
      >
        <p
          style={{
            fontSize: typeScale.eyebrow,
            fontWeight: 600,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            color: neutrals.textPrimary,
            margin: 0,
          }}
        >
          In vs out
        </p>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: radius.pill,
            background: status.background,
            color: status.color,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {status.label}
        </span>
      </div>

      <div className="energy-day-nav" style={{ marginBottom: 14 }}>
        <DayNavigator
          date={date}
          isToday={isToday}
          compact
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onPrevious={onPrevious}
          onNext={onNext}
          onGoToToday={onGoToToday}
          itemLabel={{ singular: 'log day', plural: 'log days' }}
        />
      </div>

      <div
        style={{
          opacity: dayLoading ? 0.55 : 1,
          transition: 'opacity 0.15s ease',
          pointerEvents: dayLoading ? 'none' : undefined,
        }}
      >
        <div
          role="img"
          aria-label={ariaLabel}
          style={{
            display: 'grid',
            gridTemplateColumns: `${leftAxisW}px minmax(0, 1fr) ${rightAxisW}px`,
            gap: isMobile ? 4 : 6,
            alignItems: 'stretch',
          }}
        >
          {/* Left y-axis: High / Target / Low names (+ values on mobile) */}
          <div style={{ position: 'relative', height: CHART_H }}>
            {goalLines.map((line) => {
              const spaced = spacedLabelPositions.find((p) => p.key === line.key)
              const bottomPx = spaced ? CHART_H - spaced.px : 0
              return (
                <div
                  key={line.key}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: bottomPx,
                    transform: 'translateY(50%)',
                    textAlign: 'right',
                    paddingRight: 2,
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: 9,
                      fontWeight: line.emphasis ? 700 : 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: line.emphasis ? ZONE_BLUE : neutrals.textFaint,
                      lineHeight: 1.15,
                    }}
                  >
                    {line.label}
                  </span>
                  {isMobile && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: 10,
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: line.emphasis ? ZONE_BLUE : neutrals.textMuted,
                        marginTop: 1,
                        lineHeight: 1,
                      }}
                    >
                      {Math.round(line.value).toLocaleString()}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Plot */}
          <div
            style={{
              position: 'relative',
              height: CHART_H,
              minWidth: 0,
              borderLeft: `1px solid ${neutrals.borderStrong}`,
              borderRight: `1px solid ${neutrals.borderStrong}`,
              borderBottom: `1px solid ${neutrals.borderStrong}`,
            }}
          >
            {/* Goal dashed lines; desktop shows kcal just right of the line */}
            {goalLines.map((line) => {
              const bottom = pctOfMax(line.value, chartMax)
              return (
                <div
                  key={line.key}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: `${bottom}%`,
                    transform: 'translateY(50%)',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                >
                  <div
                    title={`${line.label}: ${Math.round(line.value).toLocaleString()} kcal`}
                    style={{
                      borderTop: line.emphasis
                        ? `2px solid ${ZONE_BLUE}`
                        : `1px dashed ${neutrals.borderStrong}`,
                      opacity: line.emphasis ? 0.95 : 0.75,
                    }}
                  />
                  {!isMobile && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 6,
                        top: 0,
                        transform: 'translateY(-50%)',
                        fontSize: 10,
                        fontWeight: line.emphasis ? 700 : 600,
                        fontVariantNumeric: 'tabular-nums',
                        color: line.emphasis ? ZONE_BLUE : neutrals.textMuted,
                        background: 'rgba(255,255,255,0.92)',
                        padding: '0 3px',
                        borderRadius: 2,
                        lineHeight: 1.2,
                      }}
                    >
                      {Math.round(line.value).toLocaleString()}
                    </span>
                  )}
                </div>
              )
            })}

            {/* BMR dashed line (label + value on right axis) */}
            <div
              title={`BMR: ${bmrLine.toLocaleString()} kcal`}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${bmrBottom}%`,
                borderTop: `1px dashed ${neutrals.textFaint}`,
                opacity: 0.9,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: barGap,
                paddingLeft: plotPadX,
                paddingRight: plotPadX,
                zIndex: 2,
              }}
            >
              <div style={{ width: barW, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <div
                  style={{
                    width: '100%',
                    height: `${inputH}%`,
                    minHeight: consumed > 0 ? 4 : 0,
                    borderRadius: `${radius.sm}px ${radius.sm}px 0 0`,
                    background: `linear-gradient(180deg, ${ZONE_GREEN}ee 0%, ${ZONE_GREEN} 100%)`,
                    boxShadow: `0 2px 8px ${ZONE_GREEN}33`,
                    transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
              <div style={{ width: barW, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <div
                  style={{
                    width: '100%',
                    height: `${outputH}%`,
                    minHeight: burned > 0 ? 4 : 0,
                    borderRadius: `${radius.sm}px ${radius.sm}px 0 0`,
                    background: `linear-gradient(180deg, ${ZONE_CORAL}ee 0%, ${ZONE_CORAL} 100%)`,
                    boxShadow: `0 2px 8px ${ZONE_CORAL}33`,
                    transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right y-axis: desktop = value left of "BMR"; mobile = BMR then value below (like left axis) */}
          <div style={{ position: 'relative', height: CHART_H }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${bmrBottom}%`,
                transform: 'translateY(50%)',
                paddingLeft: isMobile ? 3 : 4,
              }}
            >
              {isMobile ? (
                <>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: neutrals.textFaint,
                      lineHeight: 1.15,
                    }}
                  >
                    BMR
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 10,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      color: neutrals.textMuted,
                      marginTop: 1,
                      lineHeight: 1,
                    }}
                  >
                    {bmrLine.toLocaleString()}
                  </span>
                </>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'baseline',
                    gap: 5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      color: neutrals.textSecondary,
                      lineHeight: 1,
                    }}
                  >
                    {bmrLine.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: neutrals.textFaint,
                      lineHeight: 1,
                    }}
                  >
                    BMR
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bar labels under the plot */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `${leftAxisW}px minmax(0, 1fr) ${rightAxisW}px`,
            gap: isMobile ? 4 : 6,
            marginTop: 8,
          }}
        >
          <div />
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: barGap,
              paddingLeft: plotPadX,
              paddingRight: plotPadX,
            }}
          >
            <BarCaption label="Input" value={consumed} color={ZONE_GREEN} width={barW} />
            <BarCaption label="Output" value={burned} color={ZONE_CORAL} width={barW} />
          </div>
          <div />
        </div>

        <p
          style={{
            margin: '12px 0 0',
            fontSize: 12,
            color: neutrals.textMuted,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {burned > consumed ? (
            <>
              Burning more than you ate · net{' '}
              <strong style={{ color: neutrals.textSecondary }}>
                {balance.net.toLocaleString()}
              </strong>{' '}
              kcal
            </>
          ) : consumed > burned ? (
            <>
              Eating more than you burned · net{' '}
              <strong style={{ color: neutrals.textSecondary }}>
                {balance.net.toLocaleString()}
              </strong>{' '}
              kcal
            </>
          ) : (
            <>Input and output match</>
          )}
        </p>

        {usesWearable && onSaveDeviceTotal && onClearDeviceTotal && (
          <div style={{ marginTop: 12 }}>
            <DeviceTotalControl
              key={`${date}-${balance.deviceTotal ?? 'none'}`}
              deviceTotal={balance.deviceTotal}
              bmr={balance.bmr}
              activityCalories={balance.activityCalories}
              dayLoading={dayLoading}
              onSave={onSaveDeviceTotal}
              onClear={onClearDeviceTotal}
            />
          </div>
        )}
      </div>
    </Card>
  )
}

function BarCaption({
  label,
  value,
  color,
  width,
}: {
  label: string
  value: number
  color: string
  width: number
}) {
  return (
    <div
      style={{
        width: width + 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: neutrals.textPrimary,
          letterSpacing: '-0.02em',
        }}
      >
        {value.toLocaleString()}
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color,
        }}
      >
        {label}
      </span>
    </div>
  )
}
