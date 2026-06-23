import { formatDayLabel, goals, sumTotals } from '@nutrition-tracker/shared'
import { useEffect, useState } from 'react'
import FoodLogSection from '../components/FoodLogSection'
import MetricCard from '../components/MetricCard'
import {
  fetchPriorDaySummaries,
  updateEntry,
  type DaySummary,
  type NewFoodEntry,
} from '../lib/entries'
import { buildMetricConfigs } from '../lib/metrics'

function formatRange(low: number, high: number, unit: string): string {
  return `${low.toLocaleString()}–${high.toLocaleString()} ${unit}`
}

function formatCompactTotals(day: DaySummary): string {
  const { totals } = day
  return `${totals.calories.toLocaleString()} kcal · ${totals.protein}g protein · ${totals.carbs}g carbs · ${totals.caffeine}mg caffeine`
}

export default function HistoryPage() {
  const [days, setDays] = useState<DaySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  async function persistUpdate(id: string, input: NewFoodEntry) {
    const updated = await updateEntry(id, input)
    setDays((prev) =>
      prev.map((day) => {
        const entries = day.entries.map((entry) => (entry.id === id ? updated : entry))
        return entries === day.entries ? day : { ...day, entries, totals: sumTotals(entries) }
      }),
    )
  }

  useEffect(() => {
    fetchPriorDaySummaries()
      .then((data) => {
        setDays(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load history')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{ textAlign: 'center', padding: '80px 20px', color: '#a1a1aa' }}
      >
        <i
          className="fa-solid fa-spinner fa-spin"
          style={{ fontSize: 32, marginBottom: 12, display: 'block' }}
        />
        Loading history...
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" style={{ textAlign: 'center', padding: '80px 20px', color: '#dc2626' }}>
        <i
          className="fa-solid fa-circle-exclamation"
          style={{ fontSize: 32, marginBottom: 12, display: 'block' }}
        />
        <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Failed to load history</p>
        <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '1.5px',
            color: '#134e4b',
            textTransform: 'uppercase',
            margin: '0 0 4px 0',
          }}
        >
          History
        </p>
        <h2
          style={{
            fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
            fontSize: 36,
            margin: 0,
            fontWeight: 600,
            letterSpacing: '-0.03em',
          }}
        >
          Prior Days
        </h2>
        <p style={{ fontSize: 12, color: '#71717a', margin: '8px 0 0 0' }}>
          Daily totals for the last 30 days. Targets:{' '}
          {formatRange(goals.calories.low, goals.calories.high, 'kcal')} •{' '}
          {formatRange(goals.protein.low, goals.protein.high, 'g protein')}
        </p>
      </div>

      {days.length === 0 ? (
        <div
          style={{
            background: 'white',
            border: '1px solid #e4e4e7',
            borderRadius: 24,
            padding: '48px 24px',
            textAlign: 'center',
            color: '#a1a1aa',
          }}
        >
          <i
            className="fa-solid fa-calendar-days"
            style={{ fontSize: 32, marginBottom: 12, display: 'block' }}
          />
          <p style={{ fontWeight: 500, margin: '0 0 4px 0', color: '#52525b' }}>
            No prior days logged yet
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>
            Food you log today will show up here tomorrow.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {days.map((day) => {
            const expanded = expandedDate === day.date
            return (
              <div
                key={day.date}
                style={{
                  background: 'white',
                  border: '1px solid #e4e4e7',
                  borderRadius: 24,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedDate(expanded ? null : day.date)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '20px 24px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                      {formatDayLabel(day.date)}
                    </div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>{day.date}</div>
                    <div
                      style={{
                        fontSize: 13,
                        color: '#3f3f46',
                        marginTop: 8,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatCompactTotals(day)}
                    </div>
                    <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 4 }}>
                      {day.entries.length} {day.entries.length === 1 ? 'entry' : 'entries'}
                    </div>
                  </div>
                  <i
                    className="fa-solid fa-chevron-down"
                    style={{
                      color: '#71717a',
                      fontSize: 14,
                      transition: 'transform 0.2s ease',
                      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                    }}
                  />
                </button>

                {expanded && (
                  <div style={{ padding: '0 24px 24px', borderTop: '1px solid #f4f4f5' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 16,
                        paddingTop: 20,
                        marginBottom: 24,
                      }}
                    >
                      {buildMetricConfigs(day.entries).map((m) => (
                        <MetricCard key={m.label} config={m} />
                      ))}
                    </div>
                    <FoodLogSection
                      entries={day.entries}
                      onEdit={persistUpdate}
                      readOnly
                      title={`${formatDayLabel(day.date)} Food Log`}
                      subtitle="Tap edit to update entries from this day"
                      defaultExpanded
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}