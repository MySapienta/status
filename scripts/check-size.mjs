import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const ASSETS_DIR = 'dist/assets'
const JS_BUDGET_BYTES = 80 * 1024

const totalBytes = readdirSync(ASSETS_DIR)
  .filter((file) => file.endsWith('.js'))
  .reduce((sum, file) => sum + gzipSync(readFileSync(join(ASSETS_DIR, file))).length, 0)

const totalKb = (totalBytes / 1024).toFixed(1)
process.stdout.write(`JavaScript: ${totalKb} kb gzipped (budget 80 kb)\n`)

if (totalBytes > JS_BUDGET_BYTES) {
  process.stderr.write('JavaScript bundle is over budget\n')
  process.exitCode = 1
}
