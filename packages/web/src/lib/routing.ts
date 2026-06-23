export type AppRoute = 'today' | 'history'

export function parseHashRoute(hash: string = window.location.hash): AppRoute {
  const path = hash.replace(/^#/, '').replace(/^\//, '')
  return path === 'history' ? 'history' : 'today'
}

export function routeHref(route: AppRoute): string {
  return route === 'history' ? '#/history' : '#/'
}