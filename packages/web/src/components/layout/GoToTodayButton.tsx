interface GoToTodayButtonProps {
  onClick: () => void
  className?: string
}

export default function GoToTodayButton({ onClick, className }: GoToTodayButtonProps) {
  return (
    <button
      type="button"
      className={className ? `inputs-day-nav-today-button ${className}` : 'inputs-day-nav-today-button'}
      onClick={onClick}
      aria-label="Jump to today's log"
    >
      Today
    </button>
  )
}