export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

export function getCountdownParts(targetDate: Date | string, now = Date.now()): CountdownParts {
  const remainingMs = new Date(targetDate).getTime() - now
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    expired: remainingMs <= 0,
  }
}

export function formatRemaining(targetDate: Date | string, now = Date.now()): string {
  const countdown = getCountdownParts(targetDate, now)
  if (countdown.expired) return 'Ended'
  if (countdown.days > 0) return `${countdown.days}d ${countdown.hours}h left`
  if (countdown.hours > 0) return `${countdown.hours}h ${countdown.minutes}m left`
  return `${countdown.minutes}m left`
}
