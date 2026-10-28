import { contextBridge, ipcRenderer } from 'electron'
import type {
  AppNavigationRoute,
  HackathonInput,
  ProjectInput,
  RoundInput,
  TaskInput,
  TeamInput,
  TeamMemberInput,
  UpdathonApi,
} from '../shared/types'

const api: UpdathonApi = {
  onNavigate: (listener: (route: AppNavigationRoute) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, route: AppNavigationRoute) => listener(route)
    ipcRenderer.on('app:navigate', handler)
    return () => ipcRenderer.removeListener('app:navigate', handler)
  },
  getDashboardData: () => ipcRenderer.invoke('dashboard:get'),
  getHackathons: () => ipcRenderer.invoke('hackathons:list'),
  getHackathon: (id) => ipcRenderer.invoke('hackathons:get', id),
  createHackathon: (input: HackathonInput) => ipcRenderer.invoke('hackathons:create', input),
  updateHackathon: (id, input: HackathonInput) => ipcRenderer.invoke('hackathons:update', id, input),
  deleteHackathon: (id) => ipcRenderer.invoke('hackathons:delete', id),
  saveTeam: (hackathonId, input: TeamInput) => ipcRenderer.invoke('team:save', hackathonId, input),
  saveTeamMember: (teamId, input: TeamMemberInput, memberId) => ipcRenderer.invoke('team-member:save', teamId, input, memberId),
  deleteTeamMember: (memberId) => ipcRenderer.invoke('team-member:delete', memberId),
  saveProject: (hackathonId, input: ProjectInput) => ipcRenderer.invoke('project:save', hackathonId, input),
  createRound: (hackathonId, input: RoundInput) => ipcRenderer.invoke('round:create', hackathonId, input),
  updateRound: (roundId, input: RoundInput) => ipcRenderer.invoke('round:update', roundId, input),
  deleteRound: (roundId) => ipcRenderer.invoke('round:delete', roundId),
  createTask: (hackathonId, input: TaskInput) => ipcRenderer.invoke('task:create', hackathonId, input),
  updateTask: (taskId, input: TaskInput) => ipcRenderer.invoke('task:update', taskId, input),
  deleteTask: (taskId) => ipcRenderer.invoke('task:delete', taskId),
  sendTestNotification: () => ipcRenderer.invoke('notifications:test'),
  getLaunchAtStartup: () => ipcRenderer.invoke('settings:get-launch-at-startup'),
  setLaunchAtStartup: (enabled) => ipcRenderer.invoke('settings:set-launch-at-startup', enabled),
}

contextBridge.exposeInMainWorld('updathon', api)
