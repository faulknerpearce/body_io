import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DayNavigator from '../components/layout/DayNavigator'
import { renderWithProviders } from './testUtils'

describe('DayNavigator', () => {
  it('does not place a Today control next to the day title', () => {
    renderWithProviders(
      <DayNavigator
        date="2026-06-15"
        isToday={false}
        compact
        showTodayControl={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onGoToToday={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Jump to today' })).not.toBeInTheDocument()
    expect(screen.getByText('Monday')).toBeInTheDocument()
    expect(screen.getByText('June 15')).toBeInTheDocument()
  })

  it('shows a calendar control in the mobile dock when enabled', () => {
    const matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 639px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.stubGlobal('window', { ...window, matchMedia })

    renderWithProviders(
      <DayNavigator
        date="2026-06-15"
        isToday={false}
        compact
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onGoToToday={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Jump to today' })).toBeInTheDocument()
    expect(screen.getByRole('toolbar', { name: 'Day navigation' })).toBeInTheDocument()
  })

  it('calls onGoToToday when the mobile calendar control is clicked', async () => {
    const user = userEvent.setup()
    const onGoToToday = vi.fn()
    const matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 639px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.stubGlobal('window', { ...window, matchMedia })

    renderWithProviders(
      <DayNavigator
        date="2026-06-15"
        isToday={false}
        compact
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onGoToToday={onGoToToday}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Jump to today' }))
    expect(onGoToToday).toHaveBeenCalledTimes(1)
  })

  it('shows entry meta in non-compact mode', () => {
    renderWithProviders(
      <DayNavigator
        date="2026-06-15"
        isToday={false}
        itemCount={3}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onGoToToday={vi.fn()}
      />,
    )

    expect(screen.getByText('3 entries')).toBeInTheDocument()
  })
})
