export type HackathonStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RoundStatus = HackathonStatus
export type AppNavigationRoute = '/' | '/notifications' | '/settings'

export interface TeamMember {
  id: string
  name: string
  email: string | null
  role: string | null
}

export interface ProjectSummary {
  id: string
  projectName: string
  description: string | null
  repositoryUrl: string | null
  demoUrl: string | null
}

export interface TaskSummary {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  deadline: string | null
  completedAt: string | null
  roundId: string | null
  roundName?: string | null
}

export interface NotificationSettingSummary {
  id: string
  enabled: boolean
  notificationTime: string
  notificationType: 'DEADLINE' | 'ROUND_START' | 'ROUND_END' | 'CUSTOM'
  taskId: string | null
  roundId: string | null
}

export interface RoundSummary {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  status: RoundStatus
}

export interface HackathonSummary {
  id: string
  name: string
  organizer: string | null
  description: string | null
  website: string | null
  startDate: string
  endDate: string
  status: HackathonStatus
  rounds: RoundSummary[]
  tasks: TaskSummary[]
  team: { id: string; teamName: string; members: TeamMember[] } | null
  project: ProjectSummary | null
  notifications: NotificationSettingSummary[]
}

export interface DashboardData {
  hackathons: HackathonSummary[]
  pendingTasks: number
}

export interface HackathonInput {
  name: string
  organizer: string
  description: string
  website: string
  startDate: string
  endDate: string
}

export interface TeamInput {
  teamName: string
}

export interface TeamMemberInput {
  name: string
  email: string
  role: string
}

export interface ProjectInput {
  projectName: string
  description: string
  repositoryUrl: string
  demoUrl: string
}

export interface RoundInput {
  name: string
  description: string
  startDate: string
  endDate: string
}

export interface TaskInput {
  title: string
  description: string
  roundId: string
  status: TaskStatus
  priority: TaskPriority
  deadline: string
}

export interface UpdathonApi {
  onNavigate: (listener: (route: AppNavigationRoute) => void) => () => void
  getDashboardData: () => Promise<DashboardData>
  getHackathons: () => Promise<HackathonSummary[]>
  getHackathon: (id: string) => Promise<HackathonSummary | null>
  createHackathon: (input: HackathonInput) => Promise<HackathonSummary>
  updateHackathon: (id: string, input: HackathonInput) => Promise<HackathonSummary>
  deleteHackathon: (id: string) => Promise<void>
  saveTeam: (hackathonId: string, input: TeamInput) => Promise<{ id: string; teamName: string; members: TeamMember[] }>
  saveTeamMember: (teamId: string, input: TeamMemberInput, memberId?: string) => Promise<TeamMember>
  deleteTeamMember: (memberId: string) => Promise<void>
  saveProject: (hackathonId: string, input: ProjectInput) => Promise<ProjectSummary>
  createRound: (hackathonId: string, input: RoundInput) => Promise<RoundSummary>
  updateRound: (roundId: string, input: RoundInput) => Promise<RoundSummary>
  deleteRound: (roundId: string) => Promise<void>
  createTask: (hackathonId: string, input: TaskInput) => Promise<TaskSummary>
  updateTask: (taskId: string, input: TaskInput) => Promise<TaskSummary>
  deleteTask: (taskId: string) => Promise<void>
  sendTestNotification: () => Promise<void>
  getLaunchAtStartup: () => Promise<boolean>
  setLaunchAtStartup: (enabled: boolean) => Promise<void>
}
