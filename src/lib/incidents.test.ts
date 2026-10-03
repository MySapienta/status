import { describe, expect, test } from 'vitest'
import { parseIncident, sortIncidents } from './incidents.ts'

const raw = `---
title: Parent portal login problems
status: resolved
severity: minor
services: [guardian, api]
startedAt: 2026-10-03T14:00:00Z
resolvedAt: 2026-10-03T14:30:00Z
---
2026-10-03T14:05:00Z - We are looking into reports that some parents cannot sign in.

2026-10-03T14:30:00Z - Fixed. Sign-in is working again.
`

describe('parseIncident', () => {
  test('parses front matter and updates', () => {
    expect(parseIncident('2026-10-03-login', raw)).toEqual({
      slug: '2026-10-03-login',
      title: 'Parent portal login problems',
      status: 'resolved',
      severity: 'minor',
      services: ['guardian', 'api'],
      startedAt: '2026-10-03T14:00:00Z',
      resolvedAt: '2026-10-03T14:30:00Z',
      updates: [
        { at: '2026-10-03T14:05:00Z', text: 'We are looking into reports that some parents cannot sign in.' },
        { at: '2026-10-03T14:30:00Z', text: 'Fixed. Sign-in is working again.' },
      ],
    })
  })

  test('treats an empty resolvedAt as not resolved yet', () => {
    const open = raw.replace('status: resolved', 'status: investigating').replace(/resolvedAt: .*/, 'resolvedAt:')
    expect(parseIncident('x', open).resolvedAt).toBeNull()
  })

  test('throws when front matter is missing', () => {
    expect(() => parseIncident('x', 'just text')).toThrow('x: missing front matter')
  })

  test('throws when status is unknown', () => {
    expect(() => parseIncident('x', raw.replace('status: resolved', 'status: done'))).toThrow(
      'x: status must be one of investigating, identified, monitoring, resolved',
    )
  })

  test('throws when severity is unknown', () => {
    expect(() => parseIncident('x', raw.replace('severity: minor', 'severity: huge'))).toThrow(
      'x: severity must be one of minor, major',
    )
  })

  test('throws when startedAt is not a date', () => {
    expect(() => parseIncident('x', raw.replace(/startedAt: .*/, 'startedAt: today'))).toThrow(
      'x: startedAt must be an ISO date',
    )
  })

  test('throws when a resolved incident has no resolvedAt', () => {
    expect(() => parseIncident('x', raw.replace(/resolvedAt: .*/, 'resolvedAt:'))).toThrow(
      'x: resolved incidents need resolvedAt',
    )
  })

  test('throws when an update line has no timestamp', () => {
    expect(() => parseIncident('x', `${raw}Still watching.\n`)).toThrow(
      'x: each update must look like "2026-10-03T14:05:00Z - what happened"',
    )
  })

  test('throws when there are no updates', () => {
    const noUpdates = raw.slice(0, raw.lastIndexOf('---') + 4)
    expect(() => parseIncident('x', noUpdates)).toThrow('x: at least one update is required')
  })
})

describe('sortIncidents', () => {
  test('orders incidents newest first without mutating the input', () => {
    const older = parseIncident('older', raw)
    const newer = parseIncident('newer', raw.replace('startedAt: 2026-10-03T14:00:00Z', 'startedAt: 2026-10-04T09:00:00Z'))
    const input = [older, newer]

    expect(sortIncidents(input).map((i) => i.slug)).toEqual(['newer', 'older'])
    expect(input.map((i) => i.slug)).toEqual(['older', 'newer'])
  })
})
