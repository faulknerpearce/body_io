import type { ReactNode } from 'react'
import { useZoneTheme } from '../../context/useZoneTheme'

interface CatalogRowProps {
  icon: string
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  actions: ReactNode
  onView?: () => void
}

export default function CatalogRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  actions,
  onView,
}: CatalogRowProps) {
  const zone = useZoneTheme()

  return (
    <div className="catalog-row">
      <button
        type="button"
        className="catalog-row-main"
        onClick={onView}
        disabled={!onView}
        style={onView ? undefined : { cursor: 'default' }}
      >
        <div className="catalog-row-icon" style={{ background: iconBg }}>
          <i className={`fa-solid ${icon}`} style={{ color: iconColor }} aria-hidden="true" />
        </div>
        <div className="catalog-row-text">
          <div className="catalog-row-title">{title}</div>
          <div className="catalog-row-subtitle">{subtitle}</div>
        </div>
        {onView && (
          <i
            className="fa-solid fa-chevron-right catalog-row-chevron"
            style={{ color: zone.eyebrow }}
            aria-hidden="true"
          />
        )}
      </button>
      <div className="catalog-row-actions">{actions}</div>
    </div>
  )
}