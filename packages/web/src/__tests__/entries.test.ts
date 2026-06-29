import { beforeEach, describe, expect, it, vi } from 'vitest'

const USER_ID = 'user-abc'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

import { deleteEntry, fetchEntries, FOOD_ENTRY_DELETE_FORBIDDEN } from '../lib/entries'

function mockQueryChain(result: { data: unknown; error: { message: string } | null }) {
  const chain = {
    eq: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    order: vi.fn(() => chain),
    select: vi.fn(async () => result),
  }
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({
    data: { user: { id: USER_ID } },
    error: null,
  })
})

describe('fetchEntries', () => {
  it('filters to the signed-in user', async () => {
    const chain = mockQueryChain({ data: [], error: null })
    mockFrom.mockReturnValue({ select: vi.fn(() => chain) })

    await fetchEntries('2026-06-27')

    expect(mockFrom).toHaveBeenCalledWith('food_entries')
    expect(chain.eq).toHaveBeenCalledWith('user_id', USER_ID)
    expect(chain.eq).toHaveBeenCalledWith('entry_date', '2026-06-27')
  })
})

describe('deleteEntry', () => {
  it('throws when no row is deleted', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(async () => ({ data: [], error: null })),
        })),
      })),
    })

    await expect(deleteEntry('entry-1')).rejects.toThrow(FOOD_ENTRY_DELETE_FORBIDDEN)
  })

  it('succeeds when a row is deleted', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(async () => ({ data: [{ id: 'entry-1' }], error: null })),
        })),
      })),
    })

    await expect(deleteEntry('entry-1')).resolves.toBeUndefined()
  })
})