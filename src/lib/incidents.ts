export const INCIDENT_STATUSES = ['investigating', 'identified', 'monitoring', 'resolved'] as const
export const INCIDENT_SEVERITIES = ['minor', 'major'] as const

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number]
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number]

export interface IncidentUpdate {
  at: string
  text: string
}

export interface Incident {
  slug: string
  title: string
  status: IncidentStatus
  severity: IncidentSeverity
  services: string[]
  startedAt: string
  resolvedAt: string | null
  updates: IncidentUpdate[]
}

const FRONT_MATTER = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/
const UPDATE_LINE = /^(\S+) - (.+)$/

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value))
}

function parseFields(slug: string, block: string): Record<string, string> {
  const lines = block.split('\n').filter((line) => line.trim() !== '')
  return Object.fromEntries(
    lines.map((line) => {
      const separator = line.indexOf(':')
      if (separator < 0) throw new Error(`${slug}: front matter line "${line}" needs a colon`)
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
    }),
  )
}

function parseList(value: string | undefined): string[] {
  if (!value) return []
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '')
}

function parseUpdates(slug: string, body: string): IncidentUpdate[] {
  const lines = body.split('\n').map((line) => line.trim()).filter((line) => line !== '')
  return lines.map((line) => {
    const match = UPDATE_LINE.exec(line)
    if (!match || !isIsoDate(match[1])) {
      throw new Error(`${slug}: each update must look like "2026-10-03T14:05:00Z - what happened"`)
    }
    return { at: match[1], text: match[2] }
  })
}

export function parseIncident(slug: string, raw: string): Incident {
  const match = FRONT_MATTER.exec(raw.replace(/\r\n/g, '\n'))
  if (!match) throw new Error(`${slug}: missing front matter`)
  const fields = parseFields(slug, match[1])

  if (!fields.title) throw new Error(`${slug}: title is required`)
  if (!INCIDENT_STATUSES.includes(fields.status as IncidentStatus)) {
    throw new Error(`${slug}: status must be one of ${INCIDENT_STATUSES.join(', ')}`)
  }
  if (!INCIDENT_SEVERITIES.includes(fields.severity as IncidentSeverity)) {
    throw new Error(`${slug}: severity must be one of ${INCIDENT_SEVERITIES.join(', ')}`)
  }
  if (!fields.startedAt || !isIsoDate(fields.startedAt)) throw new Error(`${slug}: startedAt must be an ISO date`)
  if (fields.resolvedAt && !isIsoDate(fields.resolvedAt)) throw new Error(`${slug}: resolvedAt must be an ISO date`)
  if (fields.status === 'resolved' && !fields.resolvedAt) throw new Error(`${slug}: resolved incidents need resolvedAt`)

  const updates = parseUpdates(slug, match[2])
  if (updates.length === 0) throw new Error(`${slug}: at least one update is required`)

  return {
    slug,
    title: fields.title,
    status: fields.status as IncidentStatus,
    severity: fields.severity as IncidentSeverity,
    services: parseList(fields.services),
    startedAt: fields.startedAt,
    resolvedAt: fields.resolvedAt ? fields.resolvedAt : null,
    updates,
  }
}

export function sortIncidents(incidents: Incident[]): Incident[] {
  return [...incidents].sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
}
