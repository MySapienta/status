import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import type { HistoryFile } from '../shared/types.ts'
import { buildOutput } from './output.ts'
import { checkService } from './probe.ts'
import { parseServices } from './services.ts'

const dataDir = process.env.DATA_DIR ?? 'data'
const historyPath = join(dataDir, 'history.json')
const statusPath = join(dataDir, 'status.json')

async function readHistory(): Promise<HistoryFile> {
  try {
    return JSON.parse(await readFile(historyPath, 'utf8')) as HistoryFile
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}
    throw error
  }
}

async function main(): Promise<void> {
  const services = parseServices(JSON.parse(await readFile('services.json', 'utf8')))
  const deps = {
    fetcher: (url: string, init: RequestInit) => fetch(url, init),
    sleep: async (ms: number) => {
      await sleep(ms)
    },
    now: () => new Date(),
  }

  const results = await Promise.all(services.map((service) => checkService(service, deps)))
  for (const result of results) {
    const detail = result.error ? ` (${result.error})` : ''
    process.stdout.write(`${result.id}: ${result.status} ${result.ms}ms${detail}\n`)
  }

  const { status, history } = buildOutput(services, results, await readHistory(), new Date())
  await mkdir(dataDir, { recursive: true })
  await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`)
  await writeFile(historyPath, `${JSON.stringify(history)}\n`)
}

main().catch((error: unknown) => {
  process.stderr.write(`checker failed: ${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
