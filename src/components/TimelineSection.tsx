import { CalendarClock, CircleCheck, Flag } from 'lucide-react'
import dayjs from 'dayjs'
import type { HackathonSummary } from '../../shared/types'
import { EmptyState } from './EmptyState'

export function TimelineSection({ hackathon }: { hackathon: HackathonSummary }) {
  const entries = [
    ...hackathon.rounds.map((round) => ({
      id: `round-${round.id}`,
      title: round.name,
      detail: 'Round starts',
      date: round.startDate,
      kind: 'round' as const,
      status: round.status,
    })),
    ...hackathon.rounds.map((round) => ({
      id: `round-end-${round.id}`,
      title: round.name,
      detail: 'Round deadline',
      date: round.endDate,
      kind: 'round' as const,
      status: round.status,
    })),
    ...hackathon.tasks.filter((task) => task.deadline).map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      detail: `${task.roundName ? `${task.roundName} · ` : ''}Task deadline${task.status === 'COMPLETED' ? ' · Completed' : ''}`,
      date: task.deadline!,
      kind: 'task' as const,
      status: task.status,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (entries.length === 0) return <div className="rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"><EmptyState icon={CalendarClock} title="No timeline events yet" description="Add rounds or task deadlines to build this hackathon's timeline." /></div>

  return <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
    <h2 className="font-bold text-ink dark:text-white">Timeline</h2>
    <div className="mt-5 space-y-0">{entries.map((entry, index) => <div key={entry.id} className="flex gap-4"><div className="flex flex-col items-center"><span className={`grid h-9 w-9 place-items-center rounded-full ${entry.kind === 'round' ? 'bg-violet-50 text-accent dark:bg-violet-950/50' : 'bg-sky-50 text-sky-600 dark:bg-sky-950/50'}`}>{entry.kind === 'round' ? <Flag size={16} /> : entry.status === 'COMPLETED' ? <CircleCheck size={16} /> : <CalendarClock size={16} />}</span>{index < entries.length - 1 && <span className="my-1 min-h-7 w-px flex-1 bg-slate-200 dark:bg-slate-700" />}</div><div className="min-w-0 flex-1 pb-6"><p className="text-xs font-semibold text-accent">{dayjs(entry.date).format('MMM D, YYYY · h:mm A')}</p><h3 className="mt-1 font-semibold text-ink dark:text-white">{entry.title}</h3><p className="mt-1 text-sm text-muted">{entry.detail}</p></div></div>)}</div>
  </section>
}
