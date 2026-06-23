export type AppRoute = 'dashboard' | 'inputs'

export function parseHashRoute(hash: string = window.location.hash): AppRoute {
  const path = hash.replace(/^#/, '').replace(/^\//, '')
  if (path === 'inputs' || path === 'history') return 'inputs'
  return 'dashboard'
}

export function routeHref(route: AppRoute): string {
  return route === 'inputs' ? '#/inputs' : '#/'
}