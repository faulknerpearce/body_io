import type { ReactNode } from 'react'
import { useZoneTheme } from '../../context/useZoneTheme'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
}

export default function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  const zone = useZoneTheme()

  return (
    <header className="page-header">
      <div className="page-header-main">
        <p className="page-header-eyebrow" style={{ color: zone.eyebrow }}>
          {eyebrow}
        </p>
        <h1 className="page-header-title">{title}</h1>
        {description && <p className="page-header-description">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  )
}