import { describe, expect, test } from 'vitest'
import { overallStatus } from './overall.ts'

describe('overallStatus', () => {
  test('is operational when every service is up', () => {
    expect(overallStatus(['up', 'up'])).toBe('operational')
  })

  test('is degraded when a service is slow and none are down', () => {
    expect(overallStatus(['up', 'slow'])).toBe('degraded')
  })

  test('is outage when any service is down', () => {
    expect(overallStatus(['up', 'slow', 'down'])).toBe('outage')
  })

  test('is operational for an empty list', () => {
    expect(overallStatus([])).toBe('operational')
  })
})
