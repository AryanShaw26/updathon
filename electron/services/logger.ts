import { app } from 'electron'
import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export function logError(context: string, cause: unknown): void {
  const detail = cause instanceof Error ? cause.stack ?? cause.message : String(cause)
  const line = `${new Date().toISOString()} [ERROR] ${context}\n${detail}\n`

  try {
    const logDirectory = join(app.getPath('userData'), 'logs')
    mkdirSync(logDirectory, { recursive: true })
    appendFileSync(join(logDirectory, 'updathon.log'), line, 'utf8')
  } catch (logError) {
    console.error('Unable to write the Updathon log file:', logError)
  }

  console.error(line)
}
