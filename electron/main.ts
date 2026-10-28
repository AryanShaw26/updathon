import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, Notification, Tray } from 'electron'
import { join } from 'node:path'
import type { Hackathon, TaskPriority, TaskStatus } from '@prisma/client'
import { disconnectDatabase, getDatabase } from './services/database'
import { sendTestNotification } from './services/notifications'
import { getLaunchAtStartup, setLaunchAtStartup } from './services/settings'
import type {
  DashboardData,
  HackathonSummary,
  RoundSummary,
  TaskSummary,
  TeamMember,
} from '../shared/types'
import { getScheduleStatus } from '../shared/schedule'
import type { AppNavigationRoute } from '../shared/types'
import { logError } from './services/logger'

app.setPath('userData', join(app.getPath('appData'), 'updathon'))
app.setAppUserModelId('com.updathon.app')

const hasSingleInstanceLock = app.requestSingleInstanceLock()
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
let showedTrayNotice = false
let showWindowWhenReady = !process.argv.includes('--hidden')

function serializeHackathon(hackathon: Hackathon): HackathonSummary {
  return {
    id: hackathon.id,
    name: hackathon.name,
    organizer: hackathon.organizer,
    description: hackathon.description,
    website: hackathon.website,
    startDate: hackathon.startDate.toISOString(),
    endDate: hackathon.endDate.toISOString(),
    status: getScheduleStatus(hackathon.startDate, hackathon.endDate),
    rounds: [],
    tasks: [],
    team: null,
    project: null,
    notifications: [],
  }
}

async function loadHackathons(): Promise<HackathonSummary[]> {
  const records = await getDatabase().hackathon.findMany({
    include: {
      rounds: { orderBy: { startDate: 'asc' } },
      tasks: { include: { round: { select: { name: true } } }, orderBy: { deadline: 'asc' } },
      team: { include: { members: true } },
      project: true,
      notifications: { orderBy: { notificationTime: 'asc' } },
    },
    orderBy: { startDate: 'asc' },
  })

  return records.map((item) => ({
    ...serializeHackathon(item),
    rounds: item.rounds.map((round) => ({
      id: round.id,
      name: round.name,
      description: round.description,
      startDate: round.startDate.toISOString(),
      endDate: round.endDate.toISOString(),
      status: getScheduleStatus(round.startDate, round.endDate),
    })),
    tasks: item.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline?.toISOString() ?? null,
      completedAt: task.completedAt?.toISOString() ?? null,
      roundId: task.roundId,
      roundName: task.round?.name ?? null,
    })),
    team: item.team
      ? {
          id: item.team.id,
          teamName: item.team.teamName,
          members: item.team.members.map(({ id, name, email, role }) => ({ id, name, email, role })),
        }
      : null,
    project: item.project
      ? {
          id: item.project.id,
          projectName: item.project.projectName,
          description: item.project.description,
          repositoryUrl: item.project.repositoryUrl,
          demoUrl: item.project.demoUrl,
        }
      : null,
    notifications: item.notifications.map((notification) => ({
      id: notification.id,
      enabled: notification.enabled,
      notificationTime: notification.notificationTime.toISOString(),
      notificationType: notification.notificationType,
      taskId: notification.taskId,
      roundId: notification.roundId,
    })),
  }))
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

function requiredText(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${label} is required.`)
  }
  return value.trim()
}

function optionalText(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') throw new TypeError(`${label} must be text.`)
  return value.trim() || null
}

function dateValue(value: unknown, label: string): Date {
  if (typeof value !== 'string' || value.length === 0) throw new TypeError(`${label} is required.`)
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) throw new TypeError(`${label} must be a valid date.`)
  return date
}

function optionalDate(value: unknown, label: string): Date | null {
  return value === undefined || value === null || value === '' ? null : dateValue(value, label)
}

function validatedUrl(value: unknown, label: string): string | null {
  const text = optionalText(value, label)
  if (!text) return null
  let url: URL
  try {
    url = new URL(text)
  } catch {
    throw new TypeError(`${label} must be a valid URL.`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError(`${label} must start with http:// or https://.`)
  }
  return url.toString()
}

function parseHackathonInput(value: unknown) {
  const input = objectValue(value, 'Hackathon')
  const startDate = dateValue(input.startDate, 'Start date')
  const endDate = dateValue(input.endDate, 'End date')
  if (endDate < startDate) throw new TypeError('End date must be on or after the start date.')
  return {
    name: requiredText(input.name, 'Hackathon name'),
    organizer: optionalText(input.organizer, 'Organizer'),
    description: optionalText(input.description, 'Description'),
    website: validatedUrl(input.website, 'Website'),
    startDate,
    endDate,
    status: getScheduleStatus(startDate, endDate),
  }
}

function parseRoundInput(value: unknown) {
  const input = objectValue(value, 'Round')
  const startDate = dateValue(input.startDate, 'Round start')
  const endDate = dateValue(input.endDate, 'Round end')
  if (endDate < startDate) throw new TypeError('Round end must be on or after its start.')
  return {
    name: requiredText(input.name, 'Round name'),
    description: optionalText(input.description, 'Description'),
    startDate,
    endDate,
    status: getScheduleStatus(startDate, endDate),
  }
}

function parseTaskInput(value: unknown) {
  const input = objectValue(value, 'Task')
  const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED']
  const priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  if (!statuses.includes(input.status as TaskStatus)) throw new TypeError('Choose a valid task status.')
  if (!priorities.includes(input.priority as TaskPriority)) throw new TypeError('Choose a valid task priority.')
  return {
    title: requiredText(input.title, 'Task title'),
    description: optionalText(input.description, 'Description'),
    roundId: optionalText(input.roundId, 'Round'),
    status: input.status as TaskStatus,
    priority: input.priority as TaskPriority,
    deadline: optionalDate(input.deadline, 'Deadline'),
  }
}

function serializeRound(round: { id: string; name: string; description: string | null; startDate: Date; endDate: Date }): RoundSummary {
  return {
    id: round.id,
    name: round.name,
    description: round.description,
    startDate: round.startDate.toISOString(),
    endDate: round.endDate.toISOString(),
    status: getScheduleStatus(round.startDate, round.endDate),
  }
}

function serializeTask(task: {
  id: string; title: string; description: string | null; status: TaskStatus; priority: TaskPriority
  deadline: Date | null; completedAt: Date | null; roundId: string | null; round: { name: string } | null
}): TaskSummary {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    deadline: task.deadline?.toISOString() ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    roundId: task.roundId,
    roundName: task.round?.name ?? null,
  }
}

function assertId(id: unknown, label: string): string {
  if (typeof id !== 'string' || id.trim().length === 0) throw new TypeError(`${label} id is required.`)
  return id
}

function registerIpcHandlers(): void {
  ipcMain.handle('dashboard:get', async (): Promise<DashboardData> => {
    const hackathons = await loadHackathons()
    return {
      hackathons,
      pendingTasks: hackathons.reduce(
        (total, hackathon) => total + hackathon.tasks.filter((task) => task.status !== 'COMPLETED').length,
        0,
      ),
    }
  })
  ipcMain.handle('hackathons:list', loadHackathons)
  ipcMain.handle('hackathons:get', async (_event, id: unknown) => {
    const validId = assertId(id, 'Hackathon')
    return (await loadHackathons()).find((hackathon) => hackathon.id === validId) ?? null
  })
  ipcMain.handle('hackathons:create', async (_event, value: unknown) => {
    const record = await getDatabase().hackathon.create({ data: parseHackathonInput(value) })
    return (await loadHackathons()).find((hackathon) => hackathon.id === record.id)!
  })
  ipcMain.handle('hackathons:update', async (_event, id: unknown, value: unknown) => {
    const recordId = assertId(id, 'Hackathon')
    await getDatabase().hackathon.update({ where: { id: recordId }, data: parseHackathonInput(value) })
    return (await loadHackathons()).find((hackathon) => hackathon.id === recordId)!
  })
  ipcMain.handle('hackathons:delete', async (_event, id: unknown) => {
    await getDatabase().hackathon.delete({ where: { id: assertId(id, 'Hackathon') } })
  })
  ipcMain.handle('team:save', async (_event, hackathonId: unknown, value: unknown) => {
    const parentId = assertId(hackathonId, 'Hackathon')
    const input = objectValue(value, 'Team')
    const team = await getDatabase().team.upsert({
      where: { hackathonId: parentId },
      create: { hackathonId: parentId, teamName: requiredText(input.teamName, 'Team name') },
      update: { teamName: requiredText(input.teamName, 'Team name') },
      include: { members: true },
    })
    return { id: team.id, teamName: team.teamName, members: team.members.map(({ id, name, email, role }) => ({ id, name, email, role })) }
  })
  ipcMain.handle('team-member:save', async (_event, teamId: unknown, value: unknown, memberId?: unknown) => {
    const parentId = assertId(teamId, 'Team')
    const input = objectValue(value, 'Team member')
    const data = {
      name: requiredText(input.name, 'Member name'),
      email: optionalText(input.email, 'Email'),
      role: optionalText(input.role, 'Role'),
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new TypeError('Enter a valid email address.')
    }
    const db = getDatabase()
    let member
    if (typeof memberId === 'string' && memberId) {
      const existing = await db.teamMember.findUniqueOrThrow({ where: { id: memberId }, select: { teamId: true } })
      if (existing.teamId !== parentId) throw new TypeError('Team member does not belong to this team.')
      member = await db.teamMember.update({ where: { id: memberId }, data })
    } else {
      member = await db.teamMember.create({ data: { ...data, teamId: parentId } })
    }
    return { id: member.id, name: member.name, email: member.email, role: member.role } satisfies TeamMember
  })
  ipcMain.handle('team-member:delete', async (_event, memberId: unknown) => {
    await getDatabase().teamMember.delete({ where: { id: assertId(memberId, 'Team member') } })
  })
  ipcMain.handle('project:save', async (_event, hackathonId: unknown, value: unknown) => {
    const parentId = assertId(hackathonId, 'Hackathon')
    const input = objectValue(value, 'Project')
    const data = {
      projectName: requiredText(input.projectName, 'Project name'),
      description: optionalText(input.description, 'Description'),
      repositoryUrl: validatedUrl(input.repositoryUrl, 'Repository URL'),
      demoUrl: validatedUrl(input.demoUrl, 'Live demo URL'),
    }
    const project = await getDatabase().project.upsert({
      where: { hackathonId: parentId },
      create: { hackathonId: parentId, ...data },
      update: data,
    })
    return {
      id: project.id,
      projectName: project.projectName,
      description: project.description,
      repositoryUrl: project.repositoryUrl,
      demoUrl: project.demoUrl,
    }
  })
  ipcMain.handle('round:create', async (_event, hackathonId: unknown, value: unknown) => {
    const round = await getDatabase().hackathonRound.create({
      data: { hackathonId: assertId(hackathonId, 'Hackathon'), ...parseRoundInput(value) },
    })
    return serializeRound(round)
  })
  ipcMain.handle('round:update', async (_event, roundId: unknown, value: unknown) => {
    const round = await getDatabase().hackathonRound.update({
      where: { id: assertId(roundId, 'Round') },
      data: parseRoundInput(value),
    })
    return serializeRound(round)
  })
  ipcMain.handle('round:delete', async (_event, roundId: unknown) => {
    await getDatabase().hackathonRound.delete({ where: { id: assertId(roundId, 'Round') } })
  })
  ipcMain.handle('task:create', async (_event, hackathonId: unknown, value: unknown) => {
    const parentId = assertId(hackathonId, 'Hackathon')
    const input = parseTaskInput(value)
    if (input.roundId) {
      const round = await getDatabase().hackathonRound.findUniqueOrThrow({ where: { id: input.roundId }, select: { hackathonId: true } })
      if (round.hackathonId !== parentId) throw new TypeError('The selected round belongs to a different hackathon.')
    }
    const task = await getDatabase().task.create({
      data: {
        hackathonId: parentId,
        ...input,
        completedAt: input.status === 'COMPLETED' ? new Date() : null,
      },
      include: { round: { select: { name: true } } },
    })
    return serializeTask(task)
  })
  ipcMain.handle('task:update', async (_event, taskId: unknown, value: unknown) => {
    const recordId = assertId(taskId, 'Task')
    const input = parseTaskInput(value)
    const db = getDatabase()
    const existing = await db.task.findUniqueOrThrow({ where: { id: recordId }, select: { completedAt: true, hackathonId: true } })
    if (input.roundId) {
      const round = await db.hackathonRound.findUniqueOrThrow({ where: { id: input.roundId }, select: { hackathonId: true } })
      if (round.hackathonId !== existing.hackathonId) throw new TypeError('The selected round belongs to a different hackathon.')
    }
    const task = await db.task.update({
      where: { id: recordId },
      data: {
        ...input,
        completedAt: input.status === 'COMPLETED' ? existing.completedAt ?? new Date() : null,
      },
      include: { round: { select: { name: true } } },
    })
    return serializeTask(task)
  })
  ipcMain.handle('task:delete', async (_event, taskId: unknown) => {
    await getDatabase().task.delete({ where: { id: assertId(taskId, 'Task') } })
  })
  ipcMain.handle('notifications:test', () => {
    try {
      sendTestNotification()
    } catch (error) {
      logError('Unable to send a desktop notification', error)
      throw error
    }
  })
  ipcMain.handle('settings:get-launch-at-startup', getLaunchAtStartup)
  ipcMain.handle('settings:set-launch-at-startup', async (_event, enabled: unknown) => {
    if (typeof enabled !== 'boolean') {
      throw new TypeError('The launch-at-startup value must be a boolean.')
    }
    await setLaunchAtStartup(enabled)
  })
}

function iconPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'icons', 'updathon.png')
    : join(app.getAppPath(), 'resources', 'icons', 'updathon.png')
}

function showWindow(route?: AppNavigationRoute): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    showWindowWhenReady = true
    createWindow()
  }
  const window = mainWindow
  if (!window) return

  showWindowWhenReady = true
  if (route) {
    const navigate = () => {
      if (!window.isDestroyed()) window.webContents.send('app:navigate', route)
    }
    if (window.webContents.isLoading()) window.webContents.once('did-finish-load', navigate)
    else navigate()
  }

  if (window.isMinimized()) window.restore()
  window.show()
  window.focus()
}

function showTrayNotice(): void {
  tray?.setToolTip('Updathon is still running in the system tray. Right-click for options.')
  if (showedTrayNotice || !Notification.isSupported()) return

  try {
    const notification = new Notification({
      title: 'Updathon',
      body: 'Updathon is still running in the system tray.',
    })
    notification.on('click', () => showWindow())
    notification.show()
    showedTrayNotice = true
  } catch (error) {
    logError('Unable to show the system-tray notification', error)
  }
}

function createTray(): void {
  const icon = nativeImage.createFromPath(iconPath()).resize({ width: 16, height: 16 })
  if (icon.isEmpty()) throw new Error(`The system-tray icon could not be loaded: ${iconPath()}`)

  tray = new Tray(icon)
  tray.setToolTip('Updathon')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Updathon', click: () => showWindow('/') },
    { type: 'separator' },
    { label: 'Notifications', click: () => showWindow('/notifications') },
    { label: 'Settings', click: () => showWindow('/settings') },
    { type: 'separator' },
    { label: 'Quit Updathon', click: () => app.quit() },
  ]))
  tray.on('double-click', () => showWindow('/'))
  tray.on('click', () => showWindow('/'))
}

function createWindow(): void {
  if (mainWindow && !mainWindow.isDestroyed()) return

  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1040,
    minHeight: 700,
    show: false,
    center: true,
    resizable: true,
    backgroundColor: '#f5f6fa',
    title: 'Updathon',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  mainWindow = window

  window.once('ready-to-show', () => {
    if (showWindowWhenReady) window.show()
  })
  window.on('close', (event) => {
    if (isQuitting || !tray) return
    event.preventDefault()
    window.hide()
    showTrayNotice()
  })
  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null
  })
  window.webContents.on('render-process-gone', (_event, details) => {
    logError('The renderer process exited', new Error(`Reason: ${details.reason}; exit code: ${details.exitCode}`))
  })

  const loadPromise = process.env.ELECTRON_RENDERER_URL
    ? window.loadURL(process.env.ELECTRON_RENDERER_URL)
    : window.loadFile(join(__dirname, '../renderer/index.html'))
  void loadPromise.catch((error: unknown) => logError('Unable to load the application window', error))
}

function showStartupError(error: unknown): void {
  logError('Failed to start Updathon', error)
  dialog.showErrorBox(
    'Unable to start Updathon',
    'Updathon could not open its local data. Your saved data has not been deleted. Restart the application and check the local log at %APPDATA%\\updathon\\logs\\updathon.log.',
  )
  app.quit()
}

if (hasSingleInstanceLock) {
  app.on('second-instance', () => showWindow('/'))

  app.whenReady().then(() => {
    getDatabase()
    registerIpcHandlers()
    createTray()
    createWindow()

    app.on('activate', () => showWindow('/'))
  }).catch(showStartupError)
} else {
  app.quit()
}

app.on('before-quit', () => {
  isQuitting = true
  tray?.destroy()
  tray = null
  void disconnectDatabase().catch((error: unknown) => logError('Unable to close the SQLite database cleanly', error))
})

app.on('window-all-closed', () => {
  if (!tray && process.platform !== 'darwin') app.quit()
})

process.on('unhandledRejection', (reason: unknown) => {
  logError('Unhandled background operation failure', reason)
})
