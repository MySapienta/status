import type { CheckResult, HistoryFile, Service, StatusFile } from '../shared/types.ts'
import { recordCheck, toDateKey } from './history.ts'
import { overallStatus } from './overall.ts'

export interface CheckerOutput {
  status: StatusFile
  history: HistoryFile
}

export function buildOutput(
  services: Service[],
  results: CheckResult[],
  previous: HistoryFile,
  now: Date,
): CheckerOutput {
  const today = toDateKey(now)
  const resultById = new Map(results.map((result) => [result.id, result]))
  const checked = services.flatMap((service) => {
    const result = resultById.get(service.id)
    return result ? [{ service, result }] : []
  })

  const status: StatusFile = {
    checkedAt: now.toISOString(),
    overall: overallStatus(checked.map(({ result }) => result.status)),
    services: checked.map(({ service, result }) => ({
      id: service.id,
      name: service.name,
      status: result.status,
      ms: result.ms,
    })),
  }

  const history: HistoryFile = Object.fromEntries(
    checked.map(({ service, result }) => [
      service.id,
      recordCheck(previous[service.id] ?? [], { status: result.status, ms: result.ms }, today),
    ]),
  )

  return { status, history }
}
