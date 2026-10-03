export type CheckStatus = 'up' | 'slow' | 'down'
export type OverallStatus = 'operational' | 'degraded' | 'outage'
export type HealthRule = 'ok' | 'reachable'

export interface Service {
  id: string
  name: string
  url: string
  healthy: HealthRule
}

export interface ProbeOutcome {
  httpStatus: number | null
  ms: number
  error?: string
}

export interface CheckResult {
  id: string
  status: CheckStatus
  ms: number
  checkedAt: string
  error?: string
}

export interface DayRecord {
  date: string
  checks: number
  up: number
  slow: number
  down: number
  avgMs: number
}

export interface ServiceStatus {
  id: string
  name: string
  status: CheckStatus
  ms: number
}

export interface StatusFile {
  checkedAt: string
  overall: OverallStatus
  services: ServiceStatus[]
}

export type HistoryFile = Record<string, DayRecord[]>
