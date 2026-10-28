import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarClock, CheckSquare, CirclePlus, Clock3, Flag, Plus, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import type { DashboardData, HackathonSummary, TaskSummary } from '../../shared/types'
import { StatCard } from '../components/StatCard'
import { EmptyState } from '../components/EmptyState'
import { formatRemaining } from '../utils/countdown'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { getScheduleStatus } from '../../shared/schedule'

function getCurrentRound(hackathon: HackathonSummary) {
  const now = Date.now()
  return hackathon.rounds.find((round) => new Date(round.startDate).getTime() <= now && new Date(round.endDate).getTime() >= now)
    ?? hackathon.rounds.find((round) => new Date(round.startDate).getTime() > now)
}

function taskSort(a: TaskSummary, b: TaskSummary) {
  return (a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER)
    - (b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER)
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const now = useCurrentTime()

  useEffect(() => {
    window.updathon.getDashboardData().then(setData).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Unable to load dashboard data.')
    })
  }, [])

  if (error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</div>
  if (!data) return <div className="py-24 text-center text-sm text-muted">Loading your workspace…</div>

  const active = data.hackathons.filter((item) => getScheduleStatus(item.startDate, item.endDate, now) === 'ACTIVE')
  const upcoming = data.hackathons.filter((item) => getScheduleStatus(item.startDate, item.endDate, now) === 'UPCOMING')
  const tasks = data.hackathons.flatMap((item) => item.tasks.filter((task) => task.status !== 'COMPLETED').map((task) => ({ ...task, hackathonName: item.name })))
    .filter((task) => task.deadline)
    .sort(taskSort)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="mb-2 text-sm font-semibold text-accent">{dayjs().format('dddd, MMMM D')}</p><h1 className="text-3xl font-bold tracking-tight text-ink dark:text-white">Good evening, Aryan</h1><p className="mt-2 text-muted dark:text-slate-400">Stay ahead of your hackathons.</p></div>
        <Link to="/hackathons/new" className="inline-flex items-center gap-2 self-start rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 md:self-auto"><Plus size={17} /> Add Hackathon</Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Hackathons" value={data.hackathons.length} helper="Across your workspace" icon={Trophy} color="bg-violet-50 text-accent dark:bg-violet-950/50" />
        <StatCard label="Active Hackathons" value={active.length} helper="Currently in progress" icon={Flag} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" />
        <StatCard label="Upcoming Hackathons" value={upcoming.length} helper="Ready for your next sprint" icon={CalendarClock} color="bg-amber-50 text-amber-600 dark:bg-amber-950/40" />
        <StatCard label="Pending Tasks" value={data.pendingTasks} helper="Tasks still to be completed" icon={CheckSquare} color="bg-sky-50 text-sky-600 dark:bg-sky-950/40" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 md:px-6"><div><h2 className="font-bold text-ink dark:text-white">Active Hackathons</h2><p className="mt-1 text-sm text-muted dark:text-slate-400">Your current competitions</p></div><Link to="/hackathons" className="flex items-center gap-1 text-sm font-semibold text-accent">View all <ArrowRight size={15} /></Link></div>
          {data.hackathons.length === 0 ? <EmptyState icon={Trophy} title="No hackathons yet" description="Create your first hackathon to start tracking your journey." /> : active.length === 0 ? <EmptyState icon={Trophy} title="No active hackathons yet" description="Your in-progress competitions will appear here." /> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{active.map((hackathon) => {
            const currentRound = getCurrentRound(hackathon)
            const pending = hackathon.tasks.filter((task) => task.status !== 'COMPLETED').length
            const progress = hackathon.tasks.length === 0 ? 0 : Math.round(((hackathon.tasks.length - pending) / hackathon.tasks.length) * 100)
            return <Link key={hackathon.id} to={`/hackathons/${hackathon.id}`} className="block p-5 transition hover:bg-slate-50/80 md:px-6 dark:hover:bg-slate-800/40">
              <div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold text-ink dark:text-white">{hackathon.name}</h3><p className="mt-1 text-sm text-muted dark:text-slate-400">{hackathon.organizer || 'Independent'}</p></div><ArrowUpRight size={17} className="text-slate-400" /></div>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted dark:text-slate-400"><span>{currentRound ? `Current round · ${currentRound.name}` : 'No current round'}</span>{currentRound && <span className="font-medium text-accent">{formatRemaining(currentRound.endDate)}</span>}<span>{pending} pending {pending === 1 ? 'task' : 'tasks'}</span></div>
              <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} /></div><span className="w-9 text-right text-xs font-semibold text-muted">{progress}%</span></div>
            </Link>
          })}</div>}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 md:px-6"><div><h2 className="font-bold text-ink dark:text-white">Upcoming Deadlines</h2><p className="mt-1 text-sm text-muted dark:text-slate-400">Keep your next steps in sight</p></div><Clock3 size={18} className="text-slate-400" /></div>
          {tasks.length === 0 ? <EmptyState icon={CalendarClock} title="Nothing due soon" description="Tasks with deadlines will appear here, sorted by what’s coming up next." /> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{tasks.map((task) => <div key={task.id} className="flex items-start gap-3 px-5 py-4 md:px-6"><span className={`mt-1 h-2 w-2 rounded-full ${task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-500' : 'bg-amber-400'}`} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink dark:text-white">{task.title}</p><p className="mt-1 truncate text-xs text-muted dark:text-slate-400">{task.hackathonName}</p><p className="mt-2 text-xs text-slate-400">{dayjs(task.deadline).format('MMM D, h:mm A')} · {new Date(task.deadline!).getTime() < now ? 'Overdue' : formatRemaining(task.deadline!)}</p></div><span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50'}`}>{task.priority}</span></div>)}</div>}
        </div>
      </section>

      <section><div className="mb-4"><h2 className="font-bold text-ink dark:text-white">Quick actions</h2><p className="mt-1 text-sm text-muted dark:text-slate-400">Keep your hackathon workspace up to date</p></div><div className="grid gap-3 sm:grid-cols-3">
        <Link to="/hackathons/new" className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"><span className="rounded-xl bg-violet-50 p-3 text-accent dark:bg-violet-950/50"><CirclePlus size={18} /></span><span className="flex-1"><span className="block text-sm font-semibold text-ink dark:text-white">Add Hackathon</span><span className="text-xs text-muted">Start tracking an event</span></span><ArrowDownRight size={16} className="text-slate-400" /></Link>
        <Link to="/tasks" className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"><span className="rounded-xl bg-sky-50 p-3 text-sky-600 dark:bg-sky-950/50"><CheckSquare size={18} /></span><span className="flex-1"><span className="block text-sm font-semibold text-ink dark:text-white">Add Task</span><span className="text-xs text-muted">Plan your next step</span></span><ArrowDownRight size={16} className="text-slate-400" /></Link>
        <Link to="/timeline" className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"><span className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/50"><CalendarClock size={18} /></span><span className="flex-1"><span className="block text-sm font-semibold text-ink dark:text-white">Add Round</span><span className="text-xs text-muted">Shape your timeline</span></span><ArrowDownRight size={16} className="text-slate-400" /></Link>
      </div></section>
    </div>
  )
}
