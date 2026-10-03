// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { App } from './App.tsx'
import type { Incident } from './lib/incidents.ts'
import type { HistoryFile, StatusFile } from '../shared/types.ts'

const NOW = new Date('2026-10-03T12:00:00Z')

const status = (overrides: Partial<StatusFile> = {}): StatusFile => ({
  checkedAt: '2026-10-03T11:58:00.000Z',
  overall: 'operational',
  services: [
    { id: 'api', name: 'Core system', status: 'up', ms: 200 },
    { id: 'guardian', name: 'Parent portal', status: 'up', ms: 500 },
  ],
  ...overrides,
})

const history: HistoryFile = {
  api: [{ date: '2026-10-03', checks: 100, up: 100, slow: 0, down: 0, avgMs: 200 }],
  guardian: [{ date: '2026-10-03', checks: 100, up: 90, slow: 0, down: 10, avgMs: 500 }],
}

const incident = (overrides: Partial<Incident> = {}): Incident => ({
  slug: '2026-10-03-login',
  title: 'Parent portal login problems',
  status: 'investigating',
  severity: 'minor',
  services: ['guardian'],
  startedAt: '2026-10-03T11:00:00Z',
  resolvedAt: null,
  updates: [{ at: '2026-10-03T11:05:00Z', text: 'We are looking into it.' }],
  ...overrides,
})

function mockFetch(statusBody: unknown, historyBody: unknown = history, ok = true) {
  const fetchMock = vi.fn(async (url: string) => ({
    ok,
    status: ok ? 200 : 500,
    json: async () => (url.endsWith('status.json') ? statusBody : historyBody),
  }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('App', () => {
  test('shows a loading message before data arrives', () => {
    mockFetch(status())
    render(<App incidents={[]} />)
    expect(screen.getByText('Checking status')).toBeTruthy()
  })

  test('shows the all working banner and each service state', async () => {
    mockFetch(status())
    render(<App incidents={[]} />)

    expect(await screen.findByRole('heading', { name: 'All systems working' })).toBeTruthy()
    const row = screen.getByRole('heading', { name: 'Core system' }).closest('li')
    expect(within(row as HTMLElement).getByText('Working')).toBeTruthy()
    expect(within(row as HTMLElement).getByText('100% over 90 days')).toBeTruthy()
  })

  test('shows the down banner and marks the service as down', async () => {
    mockFetch(
      status({
        overall: 'outage',
        services: [{ id: 'guardian', name: 'Parent portal', status: 'down', ms: 10000 }],
      }),
    )
    render(<App incidents={[]} />)

    expect(await screen.findByRole('heading', { name: 'Some services are down' })).toBeTruthy()
    expect(screen.getByText('Down')).toBeTruthy()
  })

  test('warns when the last check is more than 20 minutes old', async () => {
    mockFetch(status({ checkedAt: '2026-10-03T11:30:00.000Z' }))
    render(<App incidents={[]} />)

    expect(await screen.findByText(/This information may be out of date/)).toBeTruthy()
  })

  test('shows an error with a retry button when data cannot be loaded', async () => {
    const fetchMock = mockFetch(status(), history, false)
    render(<App incidents={[]} />)

    expect(await screen.findByText('We could not load the status right now')).toBeTruthy()
    const callsBefore = fetchMock.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBefore)
  })

  test('shows an error when the data is malformed', async () => {
    mockFetch({ overall: 'fine' })
    render(<App incidents={[]} />)

    expect(await screen.findByText('We could not load the status right now')).toBeTruthy()
  })

  test('shows a current incident with its affected service and update', async () => {
    mockFetch(status())
    render(<App incidents={[incident()]} />)

    const section = (await screen.findByRole('heading', { name: 'Current incidents' })).closest('section')
    expect(within(section as HTMLElement).getByText('Parent portal login problems')).toBeTruthy()
    expect(within(section as HTMLElement).getByText('Looking into it')).toBeTruthy()
    expect(within(section as HTMLElement).getByText('Affects: Parent portal')).toBeTruthy()
    expect(within(section as HTMLElement).getByText('We are looking into it.')).toBeTruthy()
  })

  test('lists resolved incidents under past incidents', async () => {
    mockFetch(status())
    render(<App incidents={[incident({ status: 'resolved', resolvedAt: '2026-10-03T11:30:00Z' })]} />)

    const section = (await screen.findByRole('heading', { name: 'Past incidents' })).closest('section')
    expect(within(section as HTMLElement).getByText('Parent portal login problems')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Current incidents' })).toBeNull()
  })

  test('says there are no incidents when the list is empty', async () => {
    mockFetch(status())
    render(<App incidents={[]} />)

    expect(await screen.findByText('No incidents reported.')).toBeTruthy()
  })

  test('shows the details of a day when its bar segment is selected', async () => {
    mockFetch(status())
    render(<App incidents={[]} />)

    const row = (await screen.findByRole('heading', { name: 'Parent portal' })).closest('li') as HTMLElement
    const segments = row.querySelectorAll('button')
    fireEvent.click(segments[segments.length - 1])

    expect(within(row).getByText('3 Oct 2026: Major problems, working 90% of the day')).toBeTruthy()
  })
})
