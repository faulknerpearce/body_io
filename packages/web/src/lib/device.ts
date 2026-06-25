/** Phones/tablets where focusing a text field opens the on-screen keyboard. */
export function isTouchPrimaryDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches
}

/** Focus an element on desktop only — avoids popping the mobile keyboard on modal open. */
export function focusIfDesktop(element: HTMLElement | null | undefined): void {
  if (!element || isTouchPrimaryDevice()) return
  element.focus()
}