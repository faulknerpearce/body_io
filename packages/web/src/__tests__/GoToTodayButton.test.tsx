import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import GoToTodayButton from '../components/layout/GoToTodayButton'
import { renderWithProviders } from './testUtils'

describe('GoToTodayButton', () => {
  it('is dormant on today and does not fire click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    renderWithProviders(<GoToTodayButton onClick={onClick} isToday />)

    const button = screen.getByRole('button', { name: 'Viewing today' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('go-to-today-icon-dormant')

    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('activates away from today and handles clicks', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    renderWithProviders(<GoToTodayButton onClick={onClick} isToday={false} />)

    const button = screen.getByRole('button', { name: 'Jump to today' })
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass('go-to-today-icon-active')

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
