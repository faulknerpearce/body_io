export type AppRoute = 'dashboard' | 'inputs' | 'outputs'

export function parseHashRoute(hash: string = window.location.hash): AppRoute {
  const path = hash.replace(/^#/, '').replace(/^\//, '')
  if (path === 'inputs' || path === 'history') return 'inputs'
  if (path === 'outputs') return 'outputs'
  return 'dashboard'
}

export function routeHref(route: AppRoute): string {
  if (route === 'inputs') return '#/inputs'
  if (route === 'outputs') return '#/outputs'
  return '#/'
}