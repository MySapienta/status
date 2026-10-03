import { describe, expect, test } from 'vitest'
import { parseHistoryFile, parseStatusFile } from './parse.ts'

const status = {
  checkedAt: '2026-10-03T12:00:00.000Z',
  overall: 'operational',
  services: [{ id: 'api', name: 'Core system', status: 'up', ms: 200 }],
}
const dayRecord = { date: '2026-10-03', checks: 2, up: 2, slow: 0, down: 0, avgMs: 150 }

describe('parseStatusFile', () => {
  test('returns the status file when it is valid', () => {
    expect(parseStatusFile(status)).toEqual(status)
  })

  test('throws when overall is not a known value', () => {
    expect(() => parseStatusFile({ ...status, overall: 'fine' })).toThrow('Invalid status data')
  })

  test('throws when checkedAt is not a date', () => {
    expect(() => parseStatusFile({ ...status, checkedAt: 'yesterday' })).toThrow('Invalid status data')
  })

  test('throws when a service has an unknown status', () => {
    const bad = { ...status, services: [{ ...status.services[0], status: 'broken' }] }
    expect(() => parseStatusFile(bad)).toThrow('Invalid status data')
  })

  test('throws when the value is not an object', () => {
    expect(() => parseStatusFile('<html>')).toThrow('Invalid status data')
  })
})

describe('parseHistoryFile', () => {
  test('returns the history when it is valid', () => {
    expect(parseHistoryFile({ api: [dayRecord] })).toEqual({ api: [dayRecord] })
  })

  test('accepts an empty history', () => {
    expect(parseHistoryFile({})).toEqual({})
  })

  test('throws when a day has a malformed date', () => {
    expect(() => parseHistoryFile({ api: [{ ...dayRecord, date: '03/10/2026' }] })).toThrow('Invalid history data')
  })

  test('throws when a count is not a number', () => {
    expect(() => parseHistoryFile({ api: [{ ...dayRecord, checks: '2' }] })).toThrow('Invalid history data')
  })
})
