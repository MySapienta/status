import { SLOW_THRESHOLD_MS } from '../shared/constants.ts'
import type { CheckStatus, HealthRule, ProbeOutcome } from '../shared/types.ts'

function isHealthy(httpStatus: number, rule: HealthRule): boolean {
  if (rule === 'reachable') return httpStatus < 500
  return httpStatus >= 200 && httpStatus < 300
}

export function classify(outcome: ProbeOutcome, rule: HealthRule): CheckStatus {
  if (outcome.httpStatus === null) return 'down'
  if (!isHealthy(outcome.httpStatus, rule)) return 'down'
  return outcome.ms >= SLOW_THRESHOLD_MS ? 'slow' : 'up'
}
