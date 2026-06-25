/** Phones/tablets where focusing a text field opens the on-screen keyboard. */
export function isTouchPrimaryDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches
}