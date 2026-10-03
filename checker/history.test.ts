import { describe, expect, test } from 'vitest'
import { recordCheck, rollUpDay, toDateKey, trimHistory } from './history.ts'
import type { DayRecord } from '../shared/types.ts'

const day = (date: string, overrides: Partial<DayRecord> = {}): DayRecord => ({
  date,
  checks: 1,
  up: 1,
  slow: 0,
  down: 0,
  avgMs: 100,
  ...overrides,
})

describe('toDateKey', () => {
  test('formats a date as a UTC day', () => {
    expect(toDateKey(new Date('2026-10-03T23:59:59Z'))).toBe('2026-10-03')
  })
})

describe('rollUpDay', () => {
  test('starts a new day record from the first check', () => {
    expect(rollUpDay(undefined, { status: 'up', ms: 200 }, '2026-10-03')).toEqual({
      date: '2026-10-03',
      checks: 1,
      up: 1,
      slow: 0,
      down: 0,
      avgMs: 200,
    })
  })

  test('adds a check to an existing day and averages response time', () => {
    const record = day('2026-10-03', { checks: 1, up: 1, avgMs: 100 })
    expect(rollUpDay(record, { status: 'slow', ms: 3100 }, '2026-10-03')).toEqual({
      date: '2026-10-03',
      checks: 2,
      up: 1,
      slow: 1,
      down: 0,
      avgMs: 1600,
    })
  })

  test('leaves the average unchanged when the check is down', () => {
    const record = day('2026-10-03', { checks: 2, up: 2, avgMs: 150 })
    const next = rollUpDay(record, { status: 'down', ms: 10000 }, '2026-10-03')
    expect(next.down).toBe(1)
    expect(next.checks).toBe(3)
    expect(next.avgMs).toBe(150)
  })

  test('does not mutate the record it was given', () => {
    const record = day('2026-10-03')
    rollUpDay(record, { status: 'up', ms: 300 }, '2026-10-03')
    expect(record.checks).toBe(1)
  })
})

describe('trimHistory', () => {
  test('keeps only the most recent days', () => {
    const days = [day('2026-09-30'), day('2026-10-01'), day('2026-10-02'), day('2026-10-03')]
    expect(trimHistory(days, '2026-10-03', 2).map((d) => d.date)).toEqual(['2026-10-02', '2026-10-03'])
  })

  test('keeps 90 days by default', () => {
    const days = [day('2026-07-05'), day('2026-07-06'), day('2026-10-03')]
    expect(trimHistory(days, '2026-10-03').map((d) => d.date)).toEqual(['2026-07-06', '2026-10-03'])
  })
})

describe('recordCheck', () => {
  test('appends a new day when none exists for the date', () => {
    const result = recordCheck([day('2026-10-02')], { status: 'up', ms: 100 }, '2026-10-03')
    expect(result.map((d) => d.date)).toEqual(['2026-10-02', '2026-10-03'])
  })

  test('updates the existing day for the date', () => {
    const result = recordCheck([day('2026-10-03')], { status: 'down', ms: 0 }, '2026-10-03')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ checks: 2, down: 1 })
  })

  test('drops days older than the retention window', () => {
    const result = recordCheck([day('2026-01-01')], { status: 'up', ms: 100 }, '2026-10-03')
    expect(result.map((d) => d.date)).toEqual(['2026-10-03'])
  })
})
