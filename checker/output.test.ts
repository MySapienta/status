import { describe, expect, test } from 'vitest'
import { buildOutput } from './output.ts'
import type { CheckResult, HistoryFile, Service } from '../shared/types.ts'

const services: Service[] = [
  { id: 'api', name: 'Core system', url: 'https://api.example.test', healthy: 'ok' },
  { id: 'admin', name: 'School staff', url: 'https://admin.example.test', healthy: 'ok' },
]
const now = new Date('2026-10-03T12:00:00Z')
const results: CheckResult[] = [
  { id: 'api', status: 'up', ms: 200, checkedAt: now.toISOString() },
  { id: 'admin', status: 'down', ms: 10000, checkedAt: now.toISOString(), error: 'timeout' },
]

describe('buildOutput', () => {
  test('builds the status file with overall status and service names', () => {
    const { status } = buildOutput(services, results, {}, now)

    expect(status).toEqual({
      checkedAt: '2026-10-03T12:00:00.000Z',
      overall: 'outage',
      services: [
        { id: 'api', name: 'Core system', status: 'up', ms: 200 },
        { id: 'admin', name: 'School staff', status: 'down', ms: 10000 },
      ],
    })
  })

  test('adds today to each service history', () => {
    const { history } = buildOutput(services, results, {}, now)

    expect(history.api).toEqual([{ date: '2026-10-03', checks: 1, up: 1, slow: 0, down: 0, avgMs: 200 }])
    expect(history.admin[0]).toMatchObject({ date: '2026-10-03', checks: 1, down: 1 })
  })

  test('keeps earlier days and drops services that are no longer configured', () => {
    const previous: HistoryFile = {
      api: [{ date: '2026-10-02', checks: 288, up: 288, slow: 0, down: 0, avgMs: 180 }],
      removed: [{ date: '2026-10-02', checks: 1, up: 1, slow: 0, down: 0, avgMs: 1 }],
    }

    const { history } = buildOutput(services, results, previous, now)

    expect(history.api.map((d) => d.date)).toEqual(['2026-10-02', '2026-10-03'])
    expect(history.removed).toBeUndefined()
  })

  test('does not mutate the previous history', () => {
    const previous: HistoryFile = { api: [] }
    buildOutput(services, results, previous, now)
    expect(previous.api).toEqual([])
  })
})
