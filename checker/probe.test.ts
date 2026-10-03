import { describe, expect, test, vi } from 'vitest'
import { checkService } from './probe.ts'
import type { Fetcher } from './probe.ts'
import type { Service } from '../shared/types.ts'

const service: Service = { id: 'api', name: 'Core system', url: 'https://example.test/health', healthy: 'ok' }
const now = () => new Date('2026-10-03T12:00:00Z')

function deps(fetcher: Fetcher) {
  return { fetcher, sleep: vi.fn(async () => {}), now }
}

describe('checkService', () => {
  test('reports up without retrying when the first request succeeds', async () => {
    const fetcher = vi.fn<Fetcher>(async () => ({ status: 200 }))
    const d = deps(fetcher)

    const result = await checkService(service, d)

    expect(result).toMatchObject({ id: 'api', status: 'up', checkedAt: '2026-10-03T12:00:00.000Z' })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(d.sleep).not.toHaveBeenCalled()
  })

  test('retries once and reports up when the second request succeeds', async () => {
    const fetcher = vi
      .fn<Fetcher>()
      .mockRejectedValueOnce(new Error('connection reset'))
      .mockResolvedValueOnce({ status: 200 })
    const d = deps(fetcher)

    const result = await checkService(service, d)

    expect(result.status).toBe('up')
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(d.sleep).toHaveBeenCalledWith(5000)
  })

  test('reports down with the error when both requests fail', async () => {
    const fetcher = vi.fn<Fetcher>(async () => {
      throw new Error('timeout')
    })

    const result = await checkService(service, deps(fetcher))

    expect(result.status).toBe('down')
    expect(result.error).toBe('timeout')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  test('reports down when both responses are 503', async () => {
    const fetcher = vi.fn<Fetcher>(async () => ({ status: 503 }))

    const result = await checkService(service, deps(fetcher))

    expect(result.status).toBe('down')
    expect(result.error).toBe('HTTP 503')
  })

  test('sends a request with a timeout signal and follows redirects', async () => {
    const fetcher = vi.fn<Fetcher>(async () => ({ status: 200 }))

    await checkService(service, deps(fetcher))

    const init = fetcher.mock.calls[0][1]
    expect(init.redirect).toBe('follow')
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })
})
