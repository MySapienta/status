import { HISTORY_DAYS } from '../shared/constants.ts'
import type { CheckStatus, DayRecord } from '../shared/types.ts'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export interface CheckSample {
  status: CheckStatus
  ms: number
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function rollUpDay(record: DayRecord | undefined, check: CheckSample, date: string): DayRecord {
  const base: DayRecord = record ?? { date, checks: 0, up: 0, slow: 0, down: 0, avgMs: 0 }
  const answeredBefore = base.up + base.slow
  const answered = check.status !== 'down'
  const avgMs = answered
    ? Math.round((base.avgMs * answeredBefore + check.ms) / (answeredBefore + 1))
    : base.avgMs

  return {
    date,
    checks: base.checks + 1,
    up: base.up + (check.status === 'up' ? 1 : 0),
    slow: base.slow + (check.status === 'slow' ? 1 : 0),
    down: base.down + (check.status === 'down' ? 1 : 0),
    avgMs,
  }
}

export function trimHistory(days: DayRecord[], today: string, keep: number = HISTORY_DAYS): DayRecord[] {
  const cutoffMs = new Date(`${today}T00:00:00Z`).getTime() - (keep - 1) * MS_PER_DAY
  const cutoff = toDateKey(new Date(cutoffMs))
  return days.filter((day) => day.date >= cutoff)
}

export function recordCheck(days: DayRecord[], check: CheckSample, date: string): DayRecord[] {
  const existing = days.find((day) => day.date === date)
  const updated = rollUpDay(existing, check, date)
  const others = days.filter((day) => day.date !== date)
  return trimHistory([...others, updated], date)
}
