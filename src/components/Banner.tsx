import type { OverallStatus } from '../../shared/types.ts'
import { formatDateTime } from '../lib/format.ts'
import { OVERALL_LABEL, OVERALL_TONE } from '../lib/labels.ts'

interface BannerProps {
  overall: OverallStatus
  checkedAt: string
}

export function Banner({ overall, checkedAt }: BannerProps) {
  return (
    <section
      aria-labelledby="overall-heading"
      className={`rounded-none border-y px-3 py-5 lg:rounded-xl lg:border lg:px-5 ${OVERALL_TONE[overall]}`}
    >
      <h2 id="overall-heading" className="font-serif text-2xl font-semibold lg:text-3xl">
        {OVERALL_LABEL[overall]}
      </h2>
      <p className="mt-1 text-sm">Last checked {formatDateTime(checkedAt)}</p>
    </section>
  )
}
