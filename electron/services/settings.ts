import { app } from 'electron'
import { getDatabase } from './database'

const LAUNCH_AT_STARTUP_KEY = 'launchAtStartup'

export async function getLaunchAtStartup(): Promise<boolean> {
  const setting = await getDatabase().appSetting.findUnique({
    where: { key: LAUNCH_AT_STARTUP_KEY },
  })
  return setting?.value === 'true'
}

export async function setLaunchAtStartup(enabled: boolean): Promise<void> {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath,
    args: app.isPackaged ? ['--hidden'] : [app.getAppPath(), '--hidden'],
  })
  await getDatabase().appSetting.upsert({
    where: { key: LAUNCH_AT_STARTUP_KEY },
    create: { key: LAUNCH_AT_STARTUP_KEY, value: String(enabled) },
    update: { value: String(enabled) },
  })
}
