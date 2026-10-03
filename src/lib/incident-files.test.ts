import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { parseIncident } from './incidents.ts'

const INCIDENTS_DIR = 'incidents'
const files = readdirSync(INCIDENTS_DIR).filter((file) => file.endsWith('.md'))

test('every incident file is valid', () => {
  for (const file of files) {
    const raw = readFileSync(join(INCIDENTS_DIR, file), 'utf8')
    expect(() => parseIncident(file.replace(/\.md$/, ''), raw)).not.toThrow()
  }
})
