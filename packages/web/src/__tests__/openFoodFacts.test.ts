import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { lookupBarcodeProduct, ProductNotFoundError } from '../lib/openFoodFacts'

describe('lookupBarcodeProduct', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps a found product from the API proxy', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        found: true,
        product: {
          product_name: 'Almond Milk',
          brands: 'Test Brand',
          nutriments: {
            'energy-kcal_serving': 60,
            proteins_serving: 1,
            carbohydrates_serving: 8,
            fat_serving: 2.5,
          },
        },
      }),
    })

    const result = await lookupBarcodeProduct('012345678905')

    expect(fetchMock).toHaveBeenCalledWith('/api/product/012345678905')
    expect(result.entry.name).toBe('Almond Milk')
    expect(result.entry.calories).toBe(60)
    expect(result.hasCompleteNutrition).toBe(true)
  })

  it('throws ProductNotFoundError for 404 responses', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 })

    await expect(lookupBarcodeProduct('000000000000')).rejects.toBeInstanceOf(ProductNotFoundError)
  })

  it('throws a generic error for upstream failures', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: 'Product lookup failed' }),
    })

    await expect(lookupBarcodeProduct('012345678905')).rejects.toThrow('Product lookup failed')
  })
})
