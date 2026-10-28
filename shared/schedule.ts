import type { HackathonStatus } from './types'

export function getScheduleStatus(startDate: Date | string, endDate: Date | string, now = Date.now()): HackathonStatus {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  if (now < start) return 'UPCOMING'
  if (now > end) return 'COMPLETED'
  return 'ACTIVE'
}
