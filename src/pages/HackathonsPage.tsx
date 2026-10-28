import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, CalendarDays, Plus, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import type { HackathonStatus, HackathonSummary } from '../../shared/types'
import { EmptyState } from '../components/EmptyState'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { getScheduleStatus } from '../../shared/schedule'

const filters: { label: string; value: 'ALL' | HackathonStatus }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
]

export function HackathonsPage() {
  const [hackathons, setHackathons] = useState<HackathonSummary[] | null>(null)
  const [filter, setFilter] = useState<(typeof filters)[number]['value']>('ALL')
  const [error, setError] = useState('')
  const now = useCurrentTime()

  useEffect(() => {
    window.updathon.getHackathons().then(setHackathons).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Unable to load hackathons.')
    })
  }, [])

  const visible = useMemo(() => hackathons?.filter((item) => filter === 'ALL' || getScheduleStatus(item.startDate, item.endDate, now) === filter) ?? [], [hackathons, filter, now])

  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-accent">Your workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-ink dark:text-white">My Hackathons</h1><p className="mt-2 text-muted dark:text-slate-400">Every competition, team, and milestone in one place.</p></div><Link to="/hackathons/new" className="inline-flex items-center gap-2 self-start rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17} /> Add Hackathon</Link></div>
    <div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item.value} onClick={() => setFilter(item.value)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${filter === item.value ? 'bg-accent text-white' : 'bg-white text-muted shadow-sm dark:bg-slate-900 dark:text-slate-300'}`}>{item.label}</button>)}</div>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>}
    {hackathons === null && !error ? <div className="py-20 text-center text-sm text-muted">Loading hackathons…</div> : null}
    {hackathons?.length === 0 && <div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"><EmptyState icon={Trophy} title="No hackathons yet" description="Create your first hackathon to start tracking your journey." /><div className="pb-8 text-center"><Link to="/hackathons/new" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add Hackathon</Link></div></div>}
    {hackathons && hackathons.length > 0 && visible.length === 0 && <div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"><EmptyState icon={Trophy} title={`No ${filter.toLowerCase()} hackathons`} description="Try another status filter or add a new hackathon." /></div>}
    {visible.length > 0 && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((hackathon) => {
      const status = getScheduleStatus(hackathon.startDate, hackathon.endDate, now)
      const currentRound = hackathon.rounds.find((round) => new Date(round.startDate).getTime() <= now && new Date(round.endDate).getTime() >= now)
        ?? hackathon.rounds.find((round) => new Date(round.startDate).getTime() > now)
      const completed = hackathon.tasks.filter((task) => task.status === 'COMPLETED').length
      const progress = hackathon.tasks.length ? completed / hackathon.tasks.length * 100 : 0
      const statusColors = status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50' : status === 'COMPLETED' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50'
      return <Link key={hackathon.id} to={`/hackathons/${hackathon.id}`} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-violet-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-900">
        <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-accent dark:bg-violet-950/50"><Trophy size={20} /></span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusColors}`}>{status}</span></div>
        <h2 className="mt-5 text-lg font-bold text-ink dark:text-white">{hackathon.name}</h2><p className="mt-1 text-sm text-muted dark:text-slate-400">{hackathon.organizer || 'Independent'}</p>
        <div className="mt-5 flex items-center gap-2 text-xs text-muted dark:text-slate-400"><CalendarDays size={15} />{dayjs(hackathon.startDate).format('MMM D')} — {dayjs(hackathon.endDate).format('MMM D, YYYY')}</div>
        <div className="mt-4 rounded-xl bg-canvas p-3 dark:bg-slate-800"><p className="text-xs text-muted dark:text-slate-400">{currentRound?.status === 'ACTIVE' ? 'Current round' : 'Next round'}</p><p className="mt-1 text-sm font-semibold text-ink dark:text-white">{currentRound?.name ?? 'No upcoming round'}</p></div>
        <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} /></div><span className="text-xs font-semibold text-muted">{progress.toFixed(1)}%</span></div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted"><span>{hackathon.tasks.length} tasks</span><span className="inline-flex items-center gap-1 text-accent opacity-0 transition group-hover:opacity-100">Details <ArrowUpRight size={14} /></span></div>
      </Link>
    })}</div>}
  </div>
}
