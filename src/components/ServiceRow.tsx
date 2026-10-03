import type { DayRecord, ServiceStatus } from '../../shared/types.ts'
import { SERVICE_LABEL, SERVICE_TONE } from '../lib/labels.ts'
import { buildBarDays, uptimePercent } from '../lib/uptime.ts'
import { UptimeBar } from './UptimeBar.tsx'

interface ServiceRowProps {
  service: ServiceStatus
  records: DayRecord[]
  today: string
}

export function ServiceRow({ service, records, today }: ServiceRowProps) {
  return (
    <li className="px-3 py-4 lg:px-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-medium">{service.name}</h3>
        <span className={`text-sm font-semibold ${SERVICE_TONE[service.status]}`}>
          {SERVICE_LABEL[service.status]}
        </span>
      </div>
      <UptimeBar name={service.name} days={buildBarDays(records, today)} percent={uptimePercent(records)} />
    </li>
  )
}
