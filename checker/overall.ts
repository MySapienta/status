import type { CheckStatus, OverallStatus } from '../shared/types.ts'

export function overallStatus(statuses: CheckStatus[]): OverallStatus {
  if (statuses.includes('down')) return 'outage'
  if (statuses.includes('slow')) return 'degraded'
  return 'operational'
}
