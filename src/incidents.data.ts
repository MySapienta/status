import { parseIncident, sortIncidents } from './lib/incidents.ts'
import type { Incident } from './lib/incidents.ts'

const files = import.meta.glob<string>('../incidents/*.md', { query: '?raw', import: 'default', eager: true })

function slugFromPath(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1).replace(/\.md$/, '')
}

export const incidents: Incident[] = sortIncidents(
  Object.entries(files).map(([path, raw]) => parseIncident(slugFromPath(path), raw)),
)
