import { useCallback, useEffect, useState } from 'react'
import { DATA_BASE_URL, REFRESH_INTERVAL_MS } from '../../shared/constants.ts'
import type { HistoryFile, StatusFile } from '../../shared/types.ts'
import { parseHistoryFile, parseStatusFile } from '../lib/parse.ts'

export type StatusDataState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; status: StatusFile; history: HistoryFile }

async function fetchJson<T>(file: string, parse: (value: unknown) => T): Promise<T> {
  const response = await fetch(`${DATA_BASE_URL}/${file}`, { cache: 'no-store' })
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
  return parse(await response.json())
}

export function useStatusData(): { state: StatusDataState; nowMs: number; retry: () => void } {
  const [state, setState] = useState<StatusDataState>({ kind: 'loading' })
  const [nowMs, setNowMs] = useState(() => Date.now())

  const load = useCallback(async () => {
    try {
      const [status, history] = await Promise.all([
        fetchJson('status.json', parseStatusFile),
        fetchJson('history.json', parseHistoryFile),
      ])
      setState({ kind: 'ready', status, history })
    } catch {
      setState((previous) => (previous.kind === 'ready' ? previous : { kind: 'error' }))
    } finally {
      setNowMs(Date.now())
    }
  }, [])

  useEffect(() => {
    void load()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void load()
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [load])

  const retry = useCallback(() => {
    setState({ kind: 'loading' })
    void load()
  }, [load])

  return { state, nowMs, retry }
}
