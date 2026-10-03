import { describe, expect, test } from 'vitest'
import { parseServices } from './services.ts'

const valid = { id: 'api', name: 'Core system', url: 'https://api.example.test/health', healthy: 'ok' }

describe('parseServices', () => {
  test('returns the services when the list is valid', () => {
    expect(parseServices([valid])).toEqual([valid])
  })

  test('throws when the value is not a list', () => {
    expect(() => parseServices({})).toThrow('services.json must be a non-empty list')
  })

  test('throws when a service has a non-https url', () => {
    expect(() => parseServices([{ ...valid, url: 'http://api.example.test' }])).toThrow('api: url must start with https://')
  })

  test('throws when a service has an unknown health rule', () => {
    expect(() => parseServices([{ ...valid, healthy: 'maybe' }])).toThrow('api: healthy must be "ok" or "reachable"')
  })

  test('throws when two services share an id', () => {
    expect(() => parseServices([valid, valid])).toThrow('duplicate service id: api')
  })
})
