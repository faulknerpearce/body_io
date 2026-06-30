import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import GoToTodayButton from '../components/layout/GoToTodayButton'
import { renderWithProviders } from './testUtils'

describe('GoToTodayButton', () => {
  it('renders a Today pill and handles clicks', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    renderWithProviders(<GoToTodayButton onClick={onClick} />)

    const button = screen.getByRole('button', { name: "Jump to today's log" })
    expect(button).toHaveTextContent('Today')

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})