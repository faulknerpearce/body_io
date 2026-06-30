import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DayNavigator from '../components/layout/DayNavigator'
import { renderWithProviders } from './testUtils'

describe('DayNavigator', () => {
  it('shows a Today button when viewing a historical date', () => {
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

    expect(screen.getByRole('button', { name: "Jump to today's log" })).toHaveTextContent('Today')
    expect(screen.getByText('Viewing Jun 15, 2026')).toBeInTheDocument()
  })

  it('hides the Today button when already on today', () => {
    renderWithProviders(
      <DayNavigator
        date="2026-06-30"
        isToday
        compact
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onGoToToday={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: "Jump to today's log" })).not.toBeInTheDocument()
    expect(screen.queryByText(/Viewing /)).not.toBeInTheDocument()
  })

  it('calls onGoToToday when the Today button is clicked', async () => {
    const user = userEvent.setup()
    const onGoToToday = vi.fn()

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

    await user.click(screen.getByRole('button', { name: "Jump to today's log" }))
    expect(onGoToToday).toHaveBeenCalledTimes(1)
  })

  it('shows history context in non-compact mode', () => {
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

    expect(screen.getByText('Viewing Jun 15, 2026')).toBeInTheDocument()
    expect(screen.queryByText('3 entries')).not.toBeInTheDocument()
  })
})