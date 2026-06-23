export type AppRoute = 'dashboard' | 'inputs' | 'outputs'

export function parseHashRoute(hash: string): AppRoute {
  const path = hash.replace(/^#/, '').replace(/^\//, '')
  if (path === 'inputs') return 'inputs'
  if (path === 'outputs') return 'outputs'
  return 'dashboard'
}

export function routeHref(route: AppRoute): string {
  if (route === 'inputs') return '#/inputs'
  if (route === 'outputs') return '#/outputs'
  return '#/'
}
