import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ProfilePage from '../pages/ProfilePage'
import { createProfileContextValue, mockProfile, renderWithProviders } from './testUtils'

describe('ProfilePage', () => {
  it('shows a loading state while the profile is fetched', () => {
    renderWithProviders(<ProfilePage />, {
      profile: createProfileContextValue({ loading: true }),
    })

    expect(screen.getByRole('status')).toHaveTextContent('Loading profile...')
  })

  it('renders the profile form with the current display name', () => {
    renderWithProviders(<ProfilePage />, {
      profile: createProfileContextValue(),
    })

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByLabelText('Display name')).toHaveValue('Alex')
  })

  it('saves profile updates', async () => {
    const updateProfile = vi.fn().mockResolvedValue({ error: null })
    const user = userEvent.setup()
    renderWithProviders(<ProfilePage />, {
      profile: createProfileContextValue({ updateProfile }),
    })

    await user.clear(screen.getByLabelText('Display name'))
    await user.type(screen.getByLabelText('Display name'), 'Jordan')
    const saveButtons = screen.getAllByRole('button', { name: 'Save Profile' })
    await user.click(saveButtons[0])

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Jordan',
          age: mockProfile.age,
          heightCm: mockProfile.heightCm,
          weightKg: mockProfile.weightKg,
        }),
      )
    })
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('shows validation errors from updateProfile', async () => {
    const updateProfile = vi.fn().mockResolvedValue({ error: 'Display name is required' })
    const user = userEvent.setup()
    renderWithProviders(<ProfilePage />, {
      profile: createProfileContextValue({ updateProfile }),
    })

    const saveButtons = screen.getAllByRole('button', { name: 'Save Profile' })
    await user.click(saveButtons[0])

    expect(await screen.findByRole('alert')).toHaveTextContent('Display name is required')
  })
})
