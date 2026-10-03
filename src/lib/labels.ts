import type { CheckStatus, OverallStatus } from '../../shared/types.ts'
import type { IncidentStatus } from './incidents.ts'
import type { DayLevel } from './uptime.ts'

export const OVERALL_LABEL: Record<OverallStatus, string> = {
  operational: 'All systems working',
  degraded: 'Some services are slow or having problems',
  outage: 'Some services are down',
}

export const OVERALL_TONE: Record<OverallStatus, string> = {
  operational: 'border-up bg-up-soft text-up-strong',
  degraded: 'border-slow bg-slow-soft text-slow-strong',
  outage: 'border-down bg-down-soft text-down-strong',
}

export const SERVICE_LABEL: Record<CheckStatus, string> = {
  up: 'Working',
  slow: 'Slow',
  down: 'Down',
}

export const SERVICE_TONE: Record<CheckStatus, string> = {
  up: 'text-up-strong',
  slow: 'text-slow-strong',
  down: 'text-down-strong',
}

export const DAY_FILL: Record<DayLevel, string> = {
  up: 'bg-up',
  slow: 'bg-slow',
  down: 'bg-down',
  none: 'bg-empty',
}

export const DAY_LABEL: Record<DayLevel, string> = {
  up: 'No problems',
  slow: 'Some problems',
  down: 'Major problems',
  none: 'No data',
}

export const INCIDENT_STATUS_LABEL: Record<IncidentStatus, string> = {
  investigating: 'Looking into it',
  identified: 'Cause found',
  monitoring: 'Fixed, still watching',
  resolved: 'Resolved',
}
