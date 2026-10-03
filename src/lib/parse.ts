import type {
  CheckStatus,
  DayRecord,
  HistoryFile,
  OverallStatus,
  ServiceStatus,
  StatusFile,
} from '../../shared/types.ts'

const CHECK_STATUSES: readonly string[] = ['up', 'slow', 'down']
const OVERALL_STATUSES: readonly string[] = ['operational', 'degraded', 'outage']
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isServiceStatus(value: unknown): value is ServiceStatus {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    CHECK_STATUSES.includes(value.status as CheckStatus) &&
    isCount(value.ms)
  )
}

function isDayRecord(value: unknown): value is DayRecord {
  return (
    isObject(value) &&
    typeof value.date === 'string' &&
    DATE_KEY.test(value.date) &&
    isCount(value.checks) &&
    isCount(value.up) &&
    isCount(value.slow) &&
    isCount(value.down) &&
    isCount(value.avgMs)
  )
}

export function parseStatusFile(value: unknown): StatusFile {
  const valid =
    isObject(value) &&
    typeof value.checkedAt === 'string' &&
    !Number.isNaN(Date.parse(value.checkedAt)) &&
    OVERALL_STATUSES.includes(value.overall as OverallStatus) &&
    Array.isArray(value.services) &&
    value.services.every(isServiceStatus)
  if (!valid) throw new Error('Invalid status data')
  return value as unknown as StatusFile
}

export function parseHistoryFile(value: unknown): HistoryFile {
  const valid =
    isObject(value) && Object.values(value).every((days) => Array.isArray(days) && days.every(isDayRecord))
  if (!valid) throw new Error('Invalid history data')
  return value as HistoryFile
}
