import { HISTORY_DAYS, STALE_AFTER_MS } from '../../shared/constants.ts'
import type { DayRecord } from '../../shared/types.ts'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const GOOD_DAY_RATIO = 0.99
const MINOR_PROBLEM_RATIO = 0.95

export type DayLevel = 'up' | 'slow' | 'down' | 'none'

export interface BarDay {
  date: string
  level: DayLevel
  uptime: number | null
}

function roundPercent(ratio: number): number {
  return Math.round(ratio * 10000) / 100
}

function answeredRatio(record: DayRecord): number {
  return (record.up + record.slow) / record.checks
}

export function dayLevel(record: DayRecord | undefined): DayLevel {
  if (!record || record.checks === 0) return 'none'
  const ratio = answeredRatio(record)
  if (ratio >= GOOD_DAY_RATIO) return 'up'
  if (ratio >= MINOR_PROBLEM_RATIO) return 'slow'
  return 'down'
}

export function buildBarDays(records: DayRecord[], today: string, count: number = HISTORY_DAYS): BarDay[] {
  const byDate = new Map(records.map((record) => [record.date, record]))
  const todayMs = new Date(`${today}T00:00:00Z`).getTime()

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(todayMs - (count - 1 - index) * MS_PER_DAY).toISOString().slice(0, 10)
    const record = byDate.get(date)
    const hasChecks = record !== undefined && record.checks > 0
    return {
      date,
      level: dayLevel(record),
      uptime: hasChecks ? roundPercent(answeredRatio(record)) : null,
    }
  })
}

export function uptimePercent(records: DayRecord[]): number | null {
  const checks = records.reduce((sum, record) => sum + record.checks, 0)
  if (checks === 0) return null
  const answered = records.reduce((sum, record) => sum + record.up + record.slow, 0)
  return roundPercent(answered / checks)
}

export function isStale(checkedAt: string, nowMs: number): boolean {
  return nowMs - Date.parse(checkedAt) > STALE_AFTER_MS
}
