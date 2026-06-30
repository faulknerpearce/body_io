import { formatDayLabel, formatMonthDayLabel, formatWeekdayHeadline } from '@nutrition-tracker/shared'
import type { ReactNode } from 'react'

interface DayNavigatorProps {
  date: string
  isToday: boolean
  meta?: ReactNode
  itemCount?: number
  itemLabel?: { singular: string; plural: string }
  canGoBack?: boolean
  canGoForward?: boolean
  compact?: boolean
  onPrevious: () => void
  onNext: () => void
  onGoToToday?: () => void
}

function formatHistoryLabel(date: string): string {
  const [year, month, day] = date.split('-').map((part) => Number.parseInt(part, 10))
  const parsed = new Date(year, month - 1, day)
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DayNavigator({
  date,
  isToday,
  meta,
  itemCount = 0,
  itemLabel = { singular: 'entry', plural: 'entries' },
  canGoBack = true,
  canGoForward = false,
  compact = false,
  onPrevious,
  onNext,
  onGoToToday,
}: DayNavigatorProps) {
  const defaultMeta = `${itemCount} ${itemCount === 1 ? itemLabel.singular : itemLabel.plural}`
  const metaContent = meta ?? defaultMeta

  return (
    <div
      className={`inputs-day-nav${isToday ? ' inputs-day-nav-today' : ' inputs-day-nav-history'}${compact ? ' inputs-day-nav-compact' : ''}`}
    >
      <button
        type="button"
        className="inputs-day-nav-button"
        onClick={onPrevious}
        disabled={!canGoBack}
        aria-label="Previous day"
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </button>

      <div className="inputs-day-nav-label">
        <div className="inputs-day-nav-title-row">
          <div className="inputs-day-nav-title">
            {compact ? formatWeekdayHeadline(date) : formatDayLabel(date)}
          </div>
          {!isToday && onGoToToday && (
            <button
              type="button"
              className="inputs-day-nav-today-button"
              onClick={onGoToToday}
              aria-label="Jump to today's log"
            >
              Today
            </button>
          )}
        </div>
        {compact ? (
          <>
            <div className="inputs-day-nav-calendar">{formatMonthDayLabel(date)}</div>
            {!isToday && (
              <div className="inputs-day-nav-history-meta">Viewing {formatHistoryLabel(date)}</div>
            )}
          </>
        ) : (
          <>
            <div className="inputs-day-nav-date">{date}</div>
            <div className="inputs-day-nav-meta">
              {!isToday ? `Viewing ${formatHistoryLabel(date)}` : metaContent}
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        className="inputs-day-nav-button"
        onClick={onNext}
        disabled={!canGoForward}
        aria-label="Next day"
      >
        <i className="fa-solid fa-chevron-right" aria-hidden="true" />
      </button>
    </div>
  )
}