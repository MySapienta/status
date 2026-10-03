import { useState } from 'react'
import { HISTORY_DAYS, MOBILE_HISTORY_DAYS } from '../../shared/constants.ts'
import { formatDay } from '../lib/format.ts'
import { DAY_FILL, DAY_LABEL } from '../lib/labels.ts'
import type { BarDay } from '../lib/uptime.ts'

interface UptimeBarProps {
  name: string
  days: BarDay[]
  percent: number | null
}

function describeDay(day: BarDay): string {
  const label = DAY_LABEL[day.level]
  const detail = day.uptime === null ? label : `${label}, working ${day.uptime}% of the day`
  return `${formatDay(day.date)}: ${detail}`
}

export function UptimeBar({ name, days, percent }: UptimeBarProps) {
  const [selected, setSelected] = useState<BarDay | null>(null)
  const firstMobileIndex = days.length - MOBILE_HISTORY_DAYS
  const summary =
    percent === null
      ? `No uptime data for ${name} yet`
      : `${name} was working ${percent}% of the time over the last ${HISTORY_DAYS} days`

  return (
    <div className="mt-3">
      <p className="sr-only">{summary}</p>
      <div aria-hidden="true" className="flex h-8 gap-px">
        {days.map((day, index) => (
          <button
            key={day.date}
            type="button"
            tabIndex={-1}
            title={describeDay(day)}
            onClick={() => setSelected(day)}
            className={`h-full flex-1 rounded-sm transition-opacity duration-150 hover:opacity-60 ${DAY_FILL[day.level]} ${
              index < firstMobileIndex ? 'hidden sm:block' : ''
            } ${selected?.date === day.date ? 'opacity-60' : ''}`}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>
          <span className="sm:hidden">{MOBILE_HISTORY_DAYS} days ago</span>
          <span className="hidden sm:inline">{HISTORY_DAYS} days ago</span>
        </span>
        <span>{percent === null ? 'No data yet' : `${percent}% over ${HISTORY_DAYS} days`}</span>
        <span>Today</span>
      </div>
      <p aria-live="polite" className="mt-1 min-h-4 text-xs text-ink">
        {selected ? describeDay(selected) : ''}
      </p>
    </div>
  )
}
