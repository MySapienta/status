import type { HealthRule, Service } from '../shared/types.ts'

const HEALTH_RULES: readonly HealthRule[] = ['ok', 'reachable']

function parseService(value: unknown): Service {
  if (typeof value !== 'object' || value === null) throw new Error('each service must be an object')
  const { id, name, url, healthy } = value as Record<string, unknown>
  if (typeof id !== 'string' || id === '') throw new Error('each service needs an id')
  if (typeof name !== 'string' || name === '') throw new Error(`${id}: name is required`)
  if (typeof url !== 'string' || !url.startsWith('https://')) throw new Error(`${id}: url must start with https://`)
  if (!HEALTH_RULES.includes(healthy as HealthRule)) throw new Error(`${id}: healthy must be "ok" or "reachable"`)
  return { id, name, url, healthy: healthy as HealthRule }
}

export function parseServices(value: unknown): Service[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error('services.json must be a non-empty list')
  const services = value.map(parseService)
  const seen = new Set<string>()
  for (const service of services) {
    if (seen.has(service.id)) throw new Error(`duplicate service id: ${service.id}`)
    seen.add(service.id)
  }
  return services
}
