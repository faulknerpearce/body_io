import { formatDayLabel, formatMonthDayLabel, formatWeekdayHeadline } from '@nutrition-tracker/shared'
import { useEffect, useState, type ReactNode } from 'react'
import GoToTodayButton from './GoToTodayButton'

interface DayNavigatorProps {
  date: string
  isToday: boolean
  meta?: ReactNode
  itemCount?: number
  itemLabel?: { singular: string; plural: string }
  canGoBack?: boolean
  canGoForward?: boolean
  compact?: boolean
  /** Keep arrows inline (e.g. embedded in a card) instead of the mobile floating dock. */
  disableMobileDock?: boolean
  onPrevious: () => void
  onNext: () => void
  onGoToToday?: () => void
}

function useMobileDayNavDock(): boolean {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia('(max-width: 639px)').matches
  })

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const mediaQuery = window.matchMedia('(max-width: 639px)')
    const onChange = () => setMobile(mediaQuery.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  return mobile
}

function NavArrowButton({
  direction,
  disabled,
  onClick,
  className,
}: {
  direction: 'previous' | 'next'
  disabled?: boolean
  onClick: () => void
  className?: string
}) {
  const isPrevious = direction === 'previous'

  return (
    <button
      type="button"
      className={className ?? 'inputs-day-nav-button'}
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrevious ? 'Previous day' : 'Next day'}
    >
      <i className={`fa-solid fa-chevron-${isPrevious ? 'left' : 'right'}`} aria-hidden="true" />
    </button>
  )
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
  disableMobileDock = false,
  onPrevious,
  onNext,
  onGoToToday,
}: DayNavigatorProps) {
  const mobileDock = useMobileDayNavDock() && !disableMobileDock
  const defaultMeta = `${itemCount} ${itemCount === 1 ? itemLabel.singular : itemLabel.plural}`
  const metaContent = meta ?? defaultMeta
  const headline = compact ? formatWeekdayHeadline(date) : formatDayLabel(date)
  const showToday = !isToday && Boolean(onGoToToday)

  return (
    <>
      <div
        className={`inputs-day-nav${isToday ? ' inputs-day-nav-today' : ' inputs-day-nav-history'}${compact ? ' inputs-day-nav-compact' : ''}${mobileDock ? ' inputs-day-nav-mobile-header' : ''}`}
      >
        {!mobileDock && (
          <NavArrowButton direction="previous" disabled={!canGoBack} onClick={onPrevious} />
        )}

        <div className="inputs-day-nav-label">
          <div className="inputs-day-nav-title-row">
            <div className="inputs-day-nav-title">{headline}</div>
            {showToday && !mobileDock && onGoToToday && (
              <GoToTodayButton onClick={onGoToToday} />
            )}
          </div>
          {compact ? (
            <div className="inputs-day-nav-calendar">{formatMonthDayLabel(date)}</div>
          ) : (
            <>
              <div className="inputs-day-nav-date">{date}</div>
              <div className="inputs-day-nav-meta">{metaContent}</div>
            </>
          )}
        </div>

        {!mobileDock && (
          <NavArrowButton direction="next" disabled={!canGoForward} onClick={onNext} />
        )}
      </div>

      {mobileDock && (
        <div className="inputs-day-nav-mobile-dock" role="toolbar" aria-label="Day navigation">
          {showToday && onGoToToday ? <GoToTodayButton onClick={onGoToToday} /> : <span />}
          <div className="inputs-day-nav-mobile-arrows">
            <NavArrowButton
              direction="previous"
              disabled={!canGoBack}
              onClick={onPrevious}
              className="inputs-day-nav-button inputs-day-nav-button-floating"
            />
            <NavArrowButton
              direction="next"
              disabled={!canGoForward}
              onClick={onNext}
              className="inputs-day-nav-button inputs-day-nav-button-floating"
            />
          </div>
        </div>
      )}
    </>
  )
}