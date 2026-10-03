import { formatDateTime } from '../lib/format.ts'
import type { Incident } from '../lib/incidents.ts'
import { INCIDENT_STATUS_LABEL } from '../lib/labels.ts'

interface IncidentListProps {
  id: string
  heading: string
  incidents: Incident[]
  serviceNames: Record<string, string>
  emptyText?: string
}

function affectedServices(incident: Incident, serviceNames: Record<string, string>): string {
  return incident.services.map((id) => serviceNames[id] ?? id).join(', ')
}

export function IncidentList({ id, heading, incidents, serviceNames, emptyText }: IncidentListProps) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="px-3 font-serif text-xl font-semibold lg:px-0">
        {heading}
      </h2>
      {incidents.length === 0 ? (
        <p className="mt-2 px-3 text-sm text-muted lg:px-0">{emptyText}</p>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-none border-y border-line bg-card lg:rounded-xl lg:border">
          {incidents.map((incident) => (
            <li key={incident.slug} className="px-3 py-4 lg:px-5">
              <article>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="font-medium">{incident.title}</h3>
                  <span className="text-sm font-semibold text-ink">{INCIDENT_STATUS_LABEL[incident.status]}</span>
                </div>
                <p className="mt-1 text-xs text-muted">Started {formatDateTime(incident.startedAt)}</p>
                {incident.services.length > 0 && (
                  <p className="mt-1 text-xs text-muted">Affects: {affectedServices(incident, serviceNames)}</p>
                )}
                <ol className="mt-3 space-y-2 border-l-2 border-line pl-3">
                  {[...incident.updates].reverse().map((update) => (
                    <li key={update.at}>
                      <p className="text-sm">{update.text}</p>
                      <p className="text-xs text-muted">{formatDateTime(update.at)}</p>
                    </li>
                  ))}
                </ol>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
