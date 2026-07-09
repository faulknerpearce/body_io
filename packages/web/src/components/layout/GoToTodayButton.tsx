interface GoToTodayButtonProps {
  onClick: () => void
  /** When true, icon is dormant (muted, not interactive). */
  isToday?: boolean
  className?: string
}

/**
 * Calendar control to jump back to today.
 * Dormant on the current day; activates (accent + clickable) on historical days.
 */
export default function GoToTodayButton({
  onClick,
  isToday = false,
  className,
}: GoToTodayButtonProps) {
  return (
    <button
      type="button"
      className={[
        'go-to-today-icon',
        isToday ? 'go-to-today-icon-dormant' : 'go-to-today-icon-active',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={isToday ? undefined : onClick}
      disabled={isToday}
      aria-label={isToday ? "Viewing today" : "Jump to today"}
      title={isToday ? 'Today' : 'Jump to today'}
    >
      <i className="fa-regular fa-calendar" aria-hidden="true" />
    </button>
  )
}
