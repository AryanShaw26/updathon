import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const createTemplate = args[0] === '--template'
const userDataPath = createTemplate
  ? join(process.cwd(), 'resources')
  : join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'updathon')
const databasePath = createTemplate
  ? join(userDataPath, 'updathon-template.db')
  : join(userDataPath, 'updathon.db')
mkdirSync(dirname(databasePath), { recursive: true })

const prismaCli = join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js')
const result = spawnSync(process.execPath, [prismaCli, ...(createTemplate ? args.slice(1) : args)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: `file:${databasePath.replace(/\\/g, '/')}`,
    ELECTRON_RUN_AS_NODE: process.versions.electron ? '1' : process.env.ELECTRON_RUN_AS_NODE,
  },
})

if (result.error) {
  console.error('Unable to run the Prisma CLI:', result.error.message)
  process.exitCode = 1
} else {
  process.exitCode = result.status ?? 1
}
