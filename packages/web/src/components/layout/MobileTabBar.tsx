import { primaryNavRoute, routeHref, type AppRoute } from '../../lib/routing'
import { zoneTokens } from '../../lib/design-tokens'

const tabs: { route: 'dashboard' | 'inputs' | 'outputs'; label: string; icon: string }[] = [
  { route: 'dashboard', label: 'Home', icon: 'fa-house' },
  { route: 'inputs', label: 'Inputs', icon: 'fa-utensils' },
  { route: 'outputs', label: 'Outputs', icon: 'fa-heart-pulse' },
]

interface MobileTabBarProps {
  activeRoute: AppRoute
}

export default function MobileTabBar({ activeRoute }: MobileTabBarProps) {
  const active = primaryNavRoute(activeRoute)

  return (
    <nav className="mobile-tab-bar" aria-label="Main navigation">
      {tabs.map((tab) => {
        const isActive = active === tab.route
        const tokens = zoneTokens[tab.route === 'dashboard' ? 'dashboard' : tab.route]
        return (
          <a
            key={tab.route}
            href={routeHref(tab.route)}
            className="mobile-tab-bar-item"
            aria-current={isActive ? 'page' : undefined}
            style={isActive ? { color: tokens.accent } : undefined}
          >
            <i className={`fa-solid ${tab.icon}`} aria-hidden="true" />
            <span>{tab.label}</span>
          </a>
        )
      })}
    </nav>
  )
}