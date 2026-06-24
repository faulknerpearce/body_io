interface PageStateProps {
  variant: 'loading' | 'error'
  message: string
  detail?: string
}

export function PageLoading({ message }: { message: string }) {
  return (
    <div className="page-state" role="status" aria-live="polite">
      <i className="fa-solid fa-spinner fa-spin page-state-icon" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

export function PageError({ message, detail }: { message: string; detail?: string }) {
  return (
    <div className="page-state page-state-error" role="alert">
      <i className="fa-solid fa-circle-exclamation page-state-icon" aria-hidden="true" />
      <p className="page-state-title">{message}</p>
      {detail && <p className="page-state-detail">{detail}</p>}
    </div>
  )
}

export default function PageState({ variant, message, detail }: PageStateProps) {
  if (variant === 'loading') return <PageLoading message={message} />
  return <PageError message={message} detail={detail} />
}