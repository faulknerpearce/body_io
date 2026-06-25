import { describe, expect, it, vi } from 'vitest'
import {
  buildOpenFoodFactsUrl,
  lookupOpenFoodFactsProduct,
  normalizeBarcode,
  normalizeBarcodeParam,
} from '../productLookup.js'

describe('normalizeBarcode', () => {
  it('strips non-digit characters', () => {
    expect(normalizeBarcode('0 3600-029145-2')).toBe('0036000291452')
  })

  it('converts UPC-A (12 digits) to EAN-13 with a leading zero', () => {
    expect(normalizeBarcode('036000291452')).toBe('0036000291452')
    expect(normalizeBarcode('123456789012')).toBe('0123456789012')
  })

  it('accepts EAN-13 and EAN-8 barcodes without changing length', () => {
    expect(normalizeBarcode('0036000291452')).toBe('0036000291452')
    expect(normalizeBarcode('96385074')).toBe('96385074')
  })

  it('rejects codes that are too short or too long', () => {
    expect(normalizeBarcode('1234567')).toBeNull()
    expect(normalizeBarcode('1'.repeat(15))).toBeNull()
    expect(normalizeBarcode('')).toBeNull()
  })
})

describe('normalizeBarcodeParam', () => {
  it('accepts valid barcodes', () => {
    expect(normalizeBarcodeParam('0036000291452')).toBe('0036000291452')
  })

  it('uses the first value when params are an array', () => {
    expect(normalizeBarcodeParam(['036000291452', 'ignored'])).toBe('0036000291452')
  })

  it('rejects invalid barcodes', () => {
    expect(normalizeBarcodeParam('abc')).toBeNull()
    expect(normalizeBarcodeParam('1234567')).toBeNull()
    expect(normalizeBarcodeParam(undefined)).toBeNull()
  })
})

describe('buildOpenFoodFactsUrl', () => {
  it('builds a v2 product URL with requested fields', () => {
    const url = buildOpenFoodFactsUrl('0036000291452')
    expect(url).toContain('world.openfoodfacts.org/api/v2/product/0036000291452.json')
    expect(url).toContain('product_name')
    expect(url).toContain('nutriments')
  })
})

describe('lookupOpenFoodFactsProduct', () => {
  it('returns a found product', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 1,
        product: { product_name: 'Granola' },
      }),
    })

    const result = await lookupOpenFoodFactsProduct('0036000291452', fetchFn)

    expect(result).toEqual({
      ok: true,
      found: true,
      product: { product_name: 'Granola' },
    })
    expect(fetchFn).toHaveBeenCalledOnce()
  })

  it('returns not found when OFF status is not 1', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 0 }),
    })

    const result = await lookupOpenFoodFactsProduct('000000000000', fetchFn)
    expect(result).toEqual({ ok: true, found: false })
  })

  it('returns upstream_failed when OFF responds with an error status', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false })

    const result = await lookupOpenFoodFactsProduct('0036000291452', fetchFn)
    expect(result).toEqual({ ok: false, error: 'upstream_failed' })
  })

  it('returns network_error when fetch throws', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('offline'))

    const result = await lookupOpenFoodFactsProduct('0036000291452', fetchFn)
    expect(result).toEqual({ ok: false, error: 'network_error' })
  })
})
