import { useEffect, useState } from 'react'
import { CalendarClock, CalendarDays, Flag } from 'lucide-react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import type { HackathonSummary } from '../../shared/types'
import { EmptyState } from '../components/EmptyState'

export function TimelinePage() {
  const [hackathons, setHackathons] = useState<HackathonSummary[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    window.updathon.getHackathons().then(setHackathons).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Unable to load your timeline.')
    })
  }, [])

  const entries = (hackathons ?? []).flatMap((hackathon) => [
    ...hackathon.rounds.flatMap((round) => [
      { id: `${round.id}-start`, hackathon, title: round.name, description: 'Round starts', date: round.startDate, icon: Flag },
      { id: `${round.id}-end`, hackathon, title: round.name, description: 'Round deadline', date: round.endDate, icon: Flag },
    ]),
    ...hackathon.tasks.filter((task) => task.deadline).map((task) => ({
      id: task.id,
      hackathon,
      title: task.title,
      description: `${task.roundName ? `${task.roundName} · ` : ''}Task deadline${task.status === 'COMPLETED' ? ' · Completed' : ''}`,
      date: task.deadline!,
      icon: CalendarClock,
    })),
  ]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return <div className="space-y-7">
    <header><p className="text-sm font-semibold text-accent">Your workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-ink dark:text-white">Timeline</h1><p className="mt-2 text-muted dark:text-slate-400">Rounds and deadlines across all your hackathons.</p></header>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>}
    {hackathons === null && !error ? <div className="py-20 text-center text-sm text-muted">Loading timeline…</div> : null}
    {entries.length === 0 && hackathons?.length === 0 && <div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"><EmptyState icon={CalendarDays} title="No timeline events yet" description="Create a hackathon and add rounds or task deadlines to see your upcoming milestones." /><div className="pb-8 text-center"><Link to="/hackathons/new" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white">Add Hackathon</Link></div></div>}
    {entries.length === 0 && hackathons && hackathons.length > 0 && <div className="rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"><EmptyState icon={CalendarDays} title="No timeline events yet" description="Add a round or set a task deadline to build this timeline." /></div>}
    {entries.length > 0 && <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900"><div className="space-y-0">{entries.map((entry, index) => {
      const Icon = entry.icon
      return <div key={entry.id} className="flex gap-4"><div className="flex flex-col items-center"><span className="grid h-10 w-10 place-items-center rounded-full bg-violet-50 text-accent dark:bg-violet-950/50"><Icon size={17} /></span>{index < entries.length - 1 && <span className="my-1 min-h-7 w-px flex-1 bg-slate-200 dark:bg-slate-700" />}</div><div className="min-w-0 flex-1 pb-6"><p className="text-xs font-semibold text-accent">{dayjs(entry.date).format('MMM D, YYYY · h:mm A')}</p><h2 className="mt-1 font-semibold text-ink dark:text-white">{entry.title}</h2><p className="mt-1 text-sm text-muted">{entry.description}</p><Link to={`/hackathons/${entry.hackathon.id}`} className="mt-1 inline-block text-xs text-accent hover:underline">{entry.hackathon.name}</Link></div></div>
    })}</div></section>}
  </div>
}
