import { useCountdown } from '../hooks/useCountdown'

interface CountdownProps {
  targetDate: string
  compact?: boolean
  expiredLabel?: string
}

export function Countdown({ targetDate, compact = false, expiredLabel = 'Round Completed' }: CountdownProps) {
  const time = useCountdown(targetDate)

  if (time.expired) {
    return <span className="font-semibold text-rose-500">{expiredLabel}</span>
  }

  if (compact) {
    return (
      <span className="text-sm font-semibold text-accent">
        {time.days}d {String(time.hours).padStart(2, '0')}h {String(time.minutes).padStart(2, '0')}m
      </span>
    )
  }

  const units = [
    ['Days', time.days],
    ['Hours', time.hours],
    ['Minutes', time.minutes],
    ['Seconds', time.seconds],
  ] as const

  return (
    <div className="grid grid-cols-4 gap-3">
      {units.map(([label, value]) => (
        <div className="rounded-2xl bg-canvas px-3 py-4 text-center dark:bg-slate-800" key={label}>
          <div className="text-2xl font-bold tabular-nums text-ink dark:text-white">{String(value).padStart(2, '0')}</div>
          <div className="mt-1 text-xs text-muted dark:text-slate-400">{label}</div>
        </div>
      ))}
    </div>
  )
}
