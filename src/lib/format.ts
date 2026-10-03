const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso))
}

export function formatDay(dateKey: string): string {
  return dayFormat.format(new Date(`${dateKey}T00:00:00Z`))
}
