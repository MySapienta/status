interface ErrorStateProps {
  onRetry: () => void
}

export function LoadingState() {
  return (
    <section aria-busy="true" className="rounded-none border-y border-line bg-card px-3 py-8 lg:rounded-xl lg:border lg:px-5">
      <p role="status" className="text-sm text-muted">
        Checking status
      </p>
      <div aria-hidden="true" className="mt-4 space-y-3">
        <div className="h-8 animate-pulse rounded-sm bg-empty motion-reduce:animate-none" />
        <div className="h-8 animate-pulse rounded-sm bg-empty motion-reduce:animate-none" />
        <div className="h-8 animate-pulse rounded-sm bg-empty motion-reduce:animate-none" />
      </div>
    </section>
  )
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <section role="alert" className="rounded-none border-y border-line bg-card px-3 py-8 lg:rounded-xl lg:border lg:px-5">
      <h2 className="font-serif text-xl font-semibold">We could not load the status right now</h2>
      <p className="mt-1 text-sm text-muted">Check your internet connection, then try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 active:opacity-80"
      >
        Try again
      </button>
    </section>
  )
}

export function StaleNotice() {
  return (
    <p role="status" className="rounded-none border-y border-slow bg-slow-soft px-3 py-3 text-sm text-slow-strong lg:rounded-xl lg:border lg:px-5">
      This information may be out of date. Our status checks have not run for a while.
    </p>
  )
}
