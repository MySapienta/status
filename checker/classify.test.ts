import { describe, expect, test } from 'vitest'
import { classify } from './classify.ts'

describe('classify', () => {
  test('returns up for a fast 200 response', () => {
    expect(classify({ httpStatus: 200, ms: 400 }, 'ok')).toBe('up')
  })

  test('returns slow when a healthy response takes 3 seconds or more', () => {
    expect(classify({ httpStatus: 200, ms: 3000 }, 'ok')).toBe('slow')
  })

  test('returns down when there was no response', () => {
    expect(classify({ httpStatus: null, ms: 10000, error: 'timeout' }, 'ok')).toBe('down')
  })

  test('returns down for a 503 under the ok rule', () => {
    expect(classify({ httpStatus: 503, ms: 200 }, 'ok')).toBe('down')
  })

  test('returns down for a 404 under the ok rule', () => {
    expect(classify({ httpStatus: 404, ms: 200 }, 'ok')).toBe('down')
  })

  test('returns up for a 404 under the reachable rule', () => {
    expect(classify({ httpStatus: 404, ms: 200 }, 'reachable')).toBe('up')
  })

  test('returns down for a 502 under the reachable rule', () => {
    expect(classify({ httpStatus: 502, ms: 200 }, 'reachable')).toBe('down')
  })
})
