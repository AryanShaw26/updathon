import { app } from 'electron'
import { PrismaClient } from '@prisma/client'
import { constants, copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

let prisma: PrismaClient | undefined

export function getDatabase(): PrismaClient {
  if (!prisma) {
    const userDataPath = app.getPath('userData')
    const databasePath = join(userDataPath, 'updathon.db')
    if (!existsSync(databasePath)) {
      const templatePath = app.isPackaged
        ? join(process.resourcesPath, 'updathon-template.db')
        : join(app.getAppPath(), 'resources', 'updathon-template.db')
      if (!existsSync(templatePath)) {
        throw new Error(`The SQLite database template is missing: ${templatePath}`)
      }
      mkdirSync(userDataPath, { recursive: true })
      try {
        copyFileSync(templatePath, databasePath, constants.COPYFILE_EXCL)
      } catch (error) {
        if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) {
          throw error
        }
      }
    }
    process.env.DATABASE_URL = `file:${databasePath.replace(/\\/g, '/')}`
    prisma = new PrismaClient()
  }
  return prisma
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    prisma = undefined
  }
}
