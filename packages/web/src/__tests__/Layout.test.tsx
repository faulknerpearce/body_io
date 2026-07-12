import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import Layout from '../components/Layout'
import {
  createAuthContextValue,
  createMockUser,
  createProfileContextValue,
  mockProfile,
  renderWithProviders,
} from './testUtils'

vi.mock('../lib/sharedNotifications', () => ({
  fetchNewSharedCount: vi.fn().mockResolvedValue(0),
}))

import { fetchNewSharedCount } from '../lib/sharedNotifications'

describe('Layout', () => {
  beforeEach(() => {
    vi.mocked(fetchNewSharedCount).mockResolvedValue(0)
  })

  it('renders primary navigation tabs', () => {
    renderWithProviders(
      <Layout activeRoute="dashboard">
        <div>Dashboard content</div>
      </Layout>,
      { profile: createProfileContextValue() },
    )

    const topNav = document.querySelector('.app-nav-tabs') as HTMLElement
    expect(within(topNav).getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(within(topNav).getByRole('link', { name: 'Inputs' })).toBeInTheDocument()
    expect(within(topNav).getByRole('link', { name: 'Outputs' })).toBeInTheDocument()
    expect(screen.getByText('Dashboard content')).toBeInTheDocument()
  })

  it('shows the profile display name in the account menu when loaded', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Layout activeRoute="dashboard">
        <div>Content</div>
      </Layout>,
      {
        profile: createProfileContextValue({ profile: { ...mockProfile, displayName: 'Jordan' } }),
      },
    )

    await user.click(screen.getByRole('button', { name: 'Account menu' }))

    expect(screen.getByText('Jordan')).toBeInTheDocument()
  })

  it('falls back to the email prefix while the profile is loading', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Layout activeRoute="dashboard">
        <div>Content</div>
      </Layout>,
      {
        auth: createAuthContextValue({ user: createMockUser({ email: 'jordan@example.com' }) }),
        profile: createProfileContextValue({ loading: true }),
      },
    )

    await user.click(screen.getByRole('button', { name: 'Account menu' }))

    expect(screen.getByText('jordan')).toBeInTheDocument()
  })

  it('renders the Shared With Me and Profile menu items', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Layout activeRoute="dashboard">
        <div>Content</div>
      </Layout>,
      { profile: createProfileContextValue() },
    )

    await user.click(screen.getByRole('button', { name: 'Account menu' }))

    expect(screen.getByRole('menuitem', { name: 'Shared With Me' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
  })

  it('shows a badge when there are new shared items', async () => {
    vi.mocked(fetchNewSharedCount).mockResolvedValue(3)
    renderWithProviders(
      <Layout activeRoute="dashboard">
        <div>Content</div>
      </Layout>,
      { profile: createProfileContextValue() },
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Account menu, 3 new shared items' }),
      ).toBeInTheDocument()
    })
  })
})
