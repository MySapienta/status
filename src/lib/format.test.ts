import { describe, expect, test } from 'vitest'
import { formatDateTime, formatDay } from './format.ts'

describe('formatDateTime', () => {
  test('shows evening times in 12-hour format', () => {
    expect(formatDateTime('2026-10-03T22:43:00Z')).toMatch(/^3 Oct 2026, 10:43\s?pm$/i)
  })

  test('shows morning times in 12-hour format', () => {
    expect(formatDateTime('2026-10-03T09:05:00Z')).toMatch(/^3 Oct 2026, 9:05\s?am$/i)
  })
})

describe('formatDay', () => {
  test('shows a date key as a readable day', () => {
    expect(formatDay('2026-10-03')).toBe('3 Oct 2026')
  })
})
