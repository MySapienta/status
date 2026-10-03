import { describe, expect, test } from 'vitest'
import { buildBarDays, dayLevel, isStale, uptimePercent } from './uptime.ts'
import type { DayRecord } from '../../shared/types.ts'

const record = (date: string, up: number, slow: number, down: number): DayRecord => ({
  date,
  checks: up + slow + down,
  up,
  slow,
  down,
  avgMs: 100,
})

describe('dayLevel', () => {
  test('is none when there is no record', () => {
    expect(dayLevel(undefined)).toBe('none')
  })

  test('is none when the record has no checks', () => {
    expect(dayLevel(record('2026-10-03', 0, 0, 0))).toBe('none')
  })

  test('is up when at least 99% of checks answered', () => {
    expect(dayLevel(record('2026-10-03', 287, 0, 1))).toBe('up')
  })

  test('is slow when between 95% and 99% of checks answered', () => {
    expect(dayLevel(record('2026-10-03', 280, 0, 8))).toBe('slow')
  })

  test('is down when under 95% of checks answered', () => {
    expect(dayLevel(record('2026-10-03', 200, 0, 88))).toBe('down')
  })
})

describe('buildBarDays', () => {
  test('returns one entry per day ending today, oldest first', () => {
    const days = buildBarDays([], '2026-10-03', 3)
    expect(days.map((d) => d.date)).toEqual(['2026-10-01', '2026-10-02', '2026-10-03'])
  })

  test('marks days without a record as no data', () => {
    const days = buildBarDays([record('2026-10-03', 10, 0, 0)], '2026-10-03', 2)
    expect(days).toEqual([
      { date: '2026-10-02', level: 'none', uptime: null },
      { date: '2026-10-03', level: 'up', uptime: 100 },
    ])
  })

  test('rounds daily uptime to two decimals', () => {
    const [day] = buildBarDays([record('2026-10-03', 2, 0, 1)], '2026-10-03', 1)
    expect(day.uptime).toBe(66.67)
  })
})

describe('uptimePercent', () => {
  test('is null when there are no checks', () => {
    expect(uptimePercent([])).toBeNull()
  })

  test('counts slow checks as working', () => {
    expect(uptimePercent([record('2026-10-02', 5, 5, 0)])).toBe(100)
  })

  test('combines all days and rounds to two decimals', () => {
    expect(uptimePercent([record('2026-10-02', 288, 0, 0), record('2026-10-03', 280, 0, 8)])).toBe(98.61)
  })
})

describe('isStale', () => {
  const now = Date.parse('2026-10-03T12:00:00Z')

  test('is false when the last check was 19 minutes ago', () => {
    expect(isStale('2026-10-03T11:41:00Z', now)).toBe(false)
  })

  test('is true when the last check was more than 20 minutes ago', () => {
    expect(isStale('2026-10-03T11:39:00Z', now)).toBe(true)
  })
})
