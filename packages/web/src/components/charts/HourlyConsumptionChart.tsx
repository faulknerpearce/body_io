import { groupEntriesByHour } from '@nutrition-tracker/shared'
import { useMemo, useState } from 'react'
import type { FoodEntry } from '../../lib/entries'

interface HourlyConsumptionChartProps {
  entries: FoodEntry[]
  timeZone: string
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

function formatAxisHourLabel(hour: number): string {
  if (hour === 0) return '12a'
  if (hour < 12) return `${hour}a`
  if (hour === 12) return '12p'
  return `${hour - 12}p`
}

function formatTooltip(hour: number, entryCount: number): string {
  const countLabel = entryCount === 1 ? 'entry' : 'entries'
  return `${formatHourLabel(hour)}: ${entryCount} ${countLabel}`
}

export default function HourlyConsumptionChart({ entries, timeZone }: HourlyConsumptionChartProps) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null)
  const buckets = useMemo(() => groupEntriesByHour(entries, timeZone), [entries, timeZone])
  const maxCount = useMemo(() => Math.max(...buckets.map((bucket) => bucket.entryCount), 0), [buckets])

  const peakBucket = useMemo(() => {
    if (maxCount === 0) return null
    return buckets.reduce((peak, bucket) => (bucket.entryCount > peak.entryCount ? bucket : peak))
  }, [buckets, maxCount])

  const hoveredBucket = hoveredHour !== null ? buckets[hoveredHour] : null

  if (entries.length === 0) {
    return (
      <div
        style={{
          padding: '32px 0 8px',
          textAlign: 'center',
          color: '#a1a1aa',
          fontSize: 13,
        }}
      >
        No food logged for this day yet.
      </div>
    )
  }

  const ariaLabel = peakBucket
    ? `${entries.length} entries logged. Peak hour: ${formatHourLabel(peakBucket.hour)} with ${peakBucket.entryCount} entries.`
    : `${entries.length} entries logged.`

  return (
    <div className="hourly-chart-wrap">
      <div
        className={`hourly-chart-tooltip${hoveredBucket ? '' : ' hourly-chart-tooltip-idle'}`}
        aria-live="polite"
      >
        {hoveredBucket
          ? formatTooltip(hoveredBucket.hour, hoveredBucket.entryCount)
          : 'Hover a bar to see details'}
      </div>

      <div className="hourly-chart-scroll">
        <div role="img" aria-label={ariaLabel} className="hourly-chart-grid hourly-chart-bars">
          {buckets.map((bucket) => {
            const heightPct = maxCount > 0 ? (bucket.entryCount / maxCount) * 100 : 0
            const minHeight = bucket.entryCount > 0 ? 8 : 2
            const hasEntries = bucket.entryCount > 0
            const isHovered = hoveredHour === bucket.hour

            return (
              <div
                key={bucket.hour}
                className="hourly-chart-cell"
                tabIndex={0}
                aria-label={formatTooltip(bucket.hour, bucket.entryCount)}
                onMouseEnter={() => setHoveredHour(bucket.hour)}
                onMouseLeave={() => setHoveredHour(null)}
                onFocus={() => setHoveredHour(bucket.hour)}
                onBlur={() => setHoveredHour(null)}
              >
                <div
                  className={`hourly-chart-bar ${hasEntries ? 'hourly-chart-bar-filled' : 'hourly-chart-bar-empty'}`}
                  style={{
                    height: `${heightPct}%`,
                    minHeight,
                    filter: isHovered && hasEntries ? 'brightness(1.1)' : undefined,
                    boxShadow:
                      isHovered && hasEntries ? '0 0 12px #05966955' : undefined,
                  }}
                />
              </div>
            )
          })}
        </div>

        <div className="hourly-chart-grid hourly-chart-axis" aria-hidden="true">
          {buckets.map((bucket) => (
            <span key={bucket.hour} className="hourly-chart-axis-label">
              {formatAxisHourLabel(bucket.hour)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}