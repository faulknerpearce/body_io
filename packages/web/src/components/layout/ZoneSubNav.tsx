import { useZoneTheme } from '../../context/useZoneTheme'
import { routeHref, type AppRoute } from '../../lib/routing'

export interface ZoneSubNavItem {
  route: AppRoute
  label: string
}

interface ZoneSubNavProps {
  items: ZoneSubNavItem[]
  active: AppRoute
}

export default function ZoneSubNav({ items, active }: ZoneSubNavProps) {
  const zone = useZoneTheme()

  return (
    <nav className="zone-subnav" aria-label="Section navigation">
      {items.map((item) => {
        const isActive = active === item.route
        return (
          <a
            key={item.route}
            href={routeHref(item.route)}
            className="zone-subnav-item"
            aria-current={isActive ? 'page' : undefined}
            style={
              isActive
                ? {
                    background: zone.accent,
                    color: zone.accentText,
                  }
                : undefined
            }
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}