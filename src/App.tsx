import type { HistoryFile, StatusFile } from '../shared/types.ts'
import { Banner } from './components/Banner.tsx'
import { IncidentList } from './components/IncidentList.tsx'
import { ErrorState, LoadingState, StaleNotice } from './components/Notices.tsx'
import { ServiceRow } from './components/ServiceRow.tsx'
import { useStatusData } from './hooks/useStatusData.ts'
import type { Incident } from './lib/incidents.ts'
import { isStale } from './lib/uptime.ts'

interface AppProps {
  incidents: Incident[]
}

interface LiveStatusProps {
  status: StatusFile
  history: HistoryFile
  nowMs: number
}

function LiveStatus({ status, history, nowMs }: LiveStatusProps) {
  const today = new Date(nowMs).toISOString().slice(0, 10)
  return (
    <>
      {isStale(status.checkedAt, nowMs) && <StaleNotice />}
      <Banner overall={status.overall} checkedAt={status.checkedAt} />
      <section aria-labelledby="services-heading">
        <h2 id="services-heading" className="px-3 font-serif text-xl font-semibold lg:px-0">
          Services
        </h2>
        <ul className="mt-3 divide-y divide-line rounded-none border-y border-line bg-card lg:rounded-xl lg:border">
          {status.services.map((service) => (
            <ServiceRow key={service.id} service={service} records={history[service.id] ?? []} today={today} />
          ))}
        </ul>
      </section>
    </>
  )
}

export function App({ incidents }: AppProps) {
  const { state, nowMs, retry } = useStatusData()
  const current = incidents.filter((incident) => incident.status !== 'resolved')
  const past = incidents.filter((incident) => incident.status === 'resolved')
  const serviceNames =
    state.kind === 'ready' ? Object.fromEntries(state.status.services.map((service) => [service.id, service.name])) : {}

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-3 py-4 lg:px-4">
          <p className="flex items-center gap-2 font-serif text-lg font-semibold">
            <img src="./logo.png" alt="" width={28} height={28} className="rounded-md" />
            MySapienta
          </p>
          <h1 className="text-sm text-muted">System status</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 py-6 lg:px-4 lg:py-10">
        {state.kind === 'loading' && <LoadingState />}
        {state.kind === 'error' && <ErrorState onRetry={retry} />}
        {current.length > 0 && (
          <IncidentList id="current-incidents" heading="Current incidents" incidents={current} serviceNames={serviceNames} />
        )}
        {state.kind === 'ready' && <LiveStatus status={state.status} history={state.history} nowMs={nowMs} />}
        <IncidentList
          id="past-incidents"
          heading="Past incidents"
          incidents={past}
          serviceNames={serviceNames}
          emptyText="No incidents reported."
        />
      </main>

      <footer className="mx-auto max-w-3xl px-3 pb-10 text-sm text-muted lg:px-4">
        <a className="underline underline-offset-2 hover:text-ink" href="https://www.mysapienta.com">
          Go to mysapienta.com
        </a>
      </footer>
    </div>
  )
}
