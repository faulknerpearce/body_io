import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AuthPage from '../pages/AuthPage'
import { createAuthContextValue, renderWithProviders } from './testUtils'

function getAuthForm(container: HTMLElement) {
  const form = container.querySelector('form')
  if (!form) throw new Error('Auth form not found')
  return form as HTMLElement
}

describe('AuthPage', () => {
  it('renders sign-in mode by default', () => {
    const { container } = renderWithProviders(<AuthPage />)
    const form = getAuthForm(container)

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(within(form).queryByLabelText('Display name')).not.toBeInTheDocument()
    expect(within(form).getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('switches to sign-up and shows the display name field', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<AuthPage />)

    await user.click(screen.getAllByRole('button', { name: 'Sign up' })[0]!)

    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument()
    expect(within(getAuthForm(container)).getByLabelText('Display name')).toBeInTheDocument()
  })

  it('calls signIn with email and password', async () => {
    const signIn = vi.fn().mockResolvedValue({ error: null })
    const user = userEvent.setup()
    const { container } = renderWithProviders(<AuthPage />, { auth: createAuthContextValue({ signIn }) })
    const form = getAuthForm(container)

    await user.type(within(form).getByLabelText('Email'), 'alex@example.com')
    await user.type(within(form).getByLabelText('Password'), 'secret12')
    await user.click(within(form).getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('alex@example.com', 'secret12')
    })
  })

  it('shows sign-in errors', async () => {
    const signIn = vi.fn().mockResolvedValue({ error: 'Invalid credentials' })
    const user = userEvent.setup()
    const { container } = renderWithProviders(<AuthPage />, { auth: createAuthContextValue({ signIn }) })
    const form = getAuthForm(container)

    await user.type(within(form).getByLabelText('Email'), 'alex@example.com')
    await user.type(within(form).getByLabelText('Password'), 'wrongpass')
    await user.click(within(form).getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('creates an account and shows a success message', async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null })
    const user = userEvent.setup()
    const { container } = renderWithProviders(<AuthPage />, { auth: createAuthContextValue({ signUp }) })
    const form = getAuthForm(container)

    await user.click(screen.getAllByRole('button', { name: 'Sign up' })[0]!)
    await user.type(within(form).getByLabelText('Display name'), 'Alex')
    await user.type(within(form).getByLabelText('Email'), 'alex@example.com')
    await user.type(within(form).getByLabelText('Password'), 'secret12')
    await user.click(within(form).getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith('alex@example.com', 'secret12', 'Alex')
    })
    expect(await screen.findByRole('status')).toHaveTextContent('Account created. You are signed in.')
  })
})