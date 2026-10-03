import { REQUEST_TIMEOUT_MS, RETRY_DELAY_MS, USER_AGENT } from '../shared/constants.ts'
import type { CheckResult, ProbeOutcome, Service } from '../shared/types.ts'
import { classify } from './classify.ts'

export interface FetcherInit {
  signal: AbortSignal
  redirect: 'follow'
  cache: 'no-store'
  headers: Record<string, string>
}

export type Fetcher = (url: string, init: FetcherInit) => Promise<{ status: number }>

export interface ProbeDeps {
  fetcher: Fetcher
  sleep: (ms: number) => Promise<void>
  now: () => Date
}

async function probeOnce(url: string, fetcher: Fetcher): Promise<ProbeOutcome> {
  const startedAt = performance.now()
  const elapsed = () => Math.round(performance.now() - startedAt)
  try {
    const response = await fetcher(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      redirect: 'follow',
      cache: 'no-store',
      headers: { 'user-agent': USER_AGENT },
    })
    return { httpStatus: response.status, ms: elapsed() }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { httpStatus: null, ms: elapsed(), error: message }
  }
}

function describeFailure(outcome: ProbeOutcome): string {
  return outcome.error ?? `HTTP ${outcome.httpStatus}`
}

export async function checkService(service: Service, deps: ProbeDeps): Promise<CheckResult> {
  const first = await probeOnce(service.url, deps.fetcher)
  const needsRetry = classify(first, service.healthy) === 'down'
  if (needsRetry) await deps.sleep(RETRY_DELAY_MS)
  const outcome = needsRetry ? await probeOnce(service.url, deps.fetcher) : first
  const status = classify(outcome, service.healthy)

  return {
    id: service.id,
    status,
    ms: outcome.ms,
    checkedAt: deps.now().toISOString(),
    ...(status === 'down' ? { error: describeFailure(outcome) } : {}),
  }
}
