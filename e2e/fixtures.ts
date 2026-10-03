import type { CheckStatus, DayRecord, HistoryFile, StatusFile } from '../shared/types.ts'

export const FIXED_NOW = new Date('2026-10-03T12:00:00Z')

const MS_PER_DAY = 24 * 60 * 60 * 1000
const CHECKS_PER_DAY = 288
const DAYS_OF_HISTORY = 90

const SERVICES = [
  { id: 'admin', name: 'School staff' },
  { id: 'guardian', name: 'Parent portal' },
  { id: 'portal', name: 'Student portal' },
  { id: 'apply', name: 'Admissions' },
  { id: 'website', name: 'Website' },
  { id: 'api', name: 'Core system' },
  { id: 'media', name: 'Files and photos' },
]

function dayRecord(daysAgo: number, down: number): DayRecord {
  const date = new Date(FIXED_NOW.getTime() - daysAgo * MS_PER_DAY).toISOString().slice(0, 10)
  return { date, checks: CHECKS_PER_DAY, up: CHECKS_PER_DAY - down, slow: 0, down, avgMs: 400 }
}

function historyFor(badDays: Record<number, number>): DayRecord[] {
  return Array.from({ length: DAYS_OF_HISTORY }, (_, index) => {
    const daysAgo = DAYS_OF_HISTORY - 1 - index
    return dayRecord(daysAgo, badDays[daysAgo] ?? 0)
  })
}

function statusFile(statuses: Record<string, CheckStatus>, overall: StatusFile['overall']): StatusFile {
  return {
    checkedAt: new Date(FIXED_NOW.getTime() - 2 * 60 * 1000).toISOString(),
    overall,
    services: SERVICES.map((service) => ({ ...service, status: statuses[service.id] ?? 'up', ms: 400 })),
  }
}

export interface Scenario {
  name: string
  heading: string
  status: StatusFile
  history: HistoryFile
}

const healthyHistory: HistoryFile = Object.fromEntries(SERVICES.map((service) => [service.id, historyFor({})]))

export const scenarios: Scenario[] = [
  {
    name: 'all-working',
    heading: 'All systems working',
    status: statusFile({}, 'operational'),
    history: healthyHistory,
  },
  {
    name: 'one-down',
    heading: 'Some services are down',
    status: statusFile({ guardian: 'down' }, 'outage'),
    history: { ...healthyHistory, guardian: historyFor({ 0: 40, 12: 6, 30: 120 }) },
  },
]
