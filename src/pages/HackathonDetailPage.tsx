import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import type { HackathonSummary } from '../../shared/types'
import { Countdown } from '../components/Countdown'
import { EmptyState } from '../components/EmptyState'
import { HackathonForm } from '../components/HackathonForm'
import { Modal } from '../components/Modal'
import { NotificationsSection } from '../components/NotificationsSection'
import { ProjectSection } from '../components/ProjectSection'
import { RoundsSection } from '../components/RoundsSection'
import { TaskManager } from '../components/TaskManager'
import { TeamSection } from '../components/TeamSection'
import { TimelineSection } from '../components/TimelineSection'
import { useToast } from '../contexts/ToastContext'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { getScheduleStatus } from '../../shared/schedule'

const tabs = ['Overview', 'Team', 'Project', 'Rounds', 'Tasks', 'Timeline', 'Notifications'] as const
type Tab = (typeof tabs)[number]

export function HackathonDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [hackathon, setHackathon] = useState<HackathonSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('Overview')
  const [editing, setEditing] = useState(false)
  const now = useCurrentTime(1000)

  const refresh = useCallback(async () => {
    try {
      const current = await window.updathon.getHackathon(id)
      setHackathon(current)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load this hackathon.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { setLoading(true); void refresh() }, [refresh])

  const rounds = useMemo(() => hackathon ? [...hackathon.rounds].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) : [], [hackathon])
  const currentRound = rounds.find((round) => round.status !== 'COMPLETED'
    && new Date(round.startDate).getTime() <= now && new Date(round.endDate).getTime() >= now)
  const nextRound = rounds.find((round) => round.status !== 'COMPLETED' && new Date(round.startDate).getTime() > now)
  const completedRound = rounds.filter((round) => round.status === 'COMPLETED' || new Date(round.endDate).getTime() < now).at(-1)
  const countdownRound = currentRound ?? nextRound ?? completedRound
  const completedTasks = hackathon?.tasks.filter((task) => task.status === 'COMPLETED').length ?? 0
  const totalTasks = hackathon?.tasks.length ?? 0
  const progress = totalTasks ? completedTasks / totalTasks * 100 : 0
  const upcomingTask = hackathon?.tasks
    .filter((task) => task.status !== 'COMPLETED' && task.deadline && new Date(task.deadline).getTime() >= Date.now())
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0]

  if (loading) return <div className="py-24 text-center text-sm text-muted">Loading hackathon…</div>
  if (error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}<button onClick={() => void refresh()} className="ml-3 font-semibold underline">Retry</button></div>
  if (!hackathon) return <div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"><EmptyState icon={CalendarDays} title="Hackathon not found" description="This event may have been removed or the link may be incorrect." /><div className="pb-8 text-center"><Link to="/hackathons" className="text-sm font-semibold text-accent">Back to hackathons</Link></div></div>

  const deleteHackathon = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this hackathon? This will also remove its team, project, rounds, tasks and notification settings.')
    if (!confirmed) return
    try {
      await window.updathon.deleteHackathon(hackathon.id)
      showToast('Hackathon deleted.')
      navigate('/hackathons', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete this hackathon.')
    }
  }

  const hackathonStatus = getScheduleStatus(hackathon.startDate, hackathon.endDate, now)
  const statusColor = hackathonStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : hackathonStatus === 'COMPLETED' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'

  return <div className="space-y-7">
    <Link to="/hackathons" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent"><ArrowLeft size={16} /> All hackathons</Link>
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card md:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start"><div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold tracking-tight text-ink dark:text-white">{hackathon.name}</h1><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${statusColor}`}>{hackathonStatus}</span></div>
        <p className="mt-2 text-muted dark:text-slate-400">{hackathon.organizer || 'Independent'}{hackathon.description ? ` · ${hackathon.description}` : ''}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted dark:text-slate-400"><span className="inline-flex items-center gap-2"><CalendarDays size={16} />{dayjs(hackathon.startDate).format('MMM D')} — {dayjs(hackathon.endDate).format('MMM D, YYYY')}</span>{hackathon.website && <a className="text-accent" href={hackathon.website} target="_blank" rel="noreferrer">Event website</a>}</div>
        <div className="mt-5 flex flex-wrap gap-2"><button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-ink dark:border-slate-700 dark:text-white"><Pencil size={15} /> Edit Hackathon</button><button onClick={() => void deleteHackathon()} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30"><Trash2 size={15} /> Delete</button></div>
      </div>
      <div className="min-w-[220px] rounded-xl bg-canvas p-4 dark:bg-slate-800"><div className="flex items-end justify-between"><div><p className="text-xs text-muted dark:text-slate-400">Task progress</p><p className="mt-1 text-2xl font-bold text-ink dark:text-white">{progress.toFixed(1)}%</p></div><p className="text-xs text-muted">{completedTasks} / {totalTasks} completed</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress}%` }} /></div></div>
      </div>
    </section>
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">{tabs.map((name) => <button key={name} onClick={() => setTab(name)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${tab === name ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink dark:text-slate-400 dark:hover:text-white'}`}>{name}</button>)}</nav>
    {tab === 'Overview' && <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between"><div><h2 className="font-bold text-ink dark:text-white">{currentRound ? 'Current round' : nextRound ? 'Next round' : 'Round countdown'}</h2><p className="mt-1 text-sm text-muted dark:text-slate-400">{countdownRound ? `${countdownRound.name} · deadline ${dayjs(countdownRound.endDate).format('MMM D, YYYY · h:mm A')}` : 'No rounds have been added yet.'}</p></div><button onClick={() => setTab('Rounds')} className="inline-flex items-center gap-1 text-xs font-semibold text-accent"><Plus size={14} /> Round</button></div>{countdownRound && <div className="mt-5"><Countdown targetDate={countdownRound.endDate} /></div>}{!currentRound && nextRound && <p className="mt-3 text-sm font-medium text-accent">Next Round: {nextRound.name} · {dayjs(nextRound.startDate).format('MMM D, YYYY · h:mm A')}</p>}</section>
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><h2 className="font-bold text-ink dark:text-white">Upcoming deadline</h2><button onClick={() => setTab('Tasks')} className="text-xs font-semibold text-accent">All tasks</button></div>{upcomingTask ? <div className="mt-4 rounded-xl bg-canvas p-4 dark:bg-slate-800"><p className="font-semibold text-ink dark:text-white">{upcomingTask.title}</p><p className="mt-1 text-sm text-muted">{upcomingTask.roundName ?? 'Unassigned round'}</p><p className="mt-3 text-xs font-medium text-accent">{dayjs(upcomingTask.deadline).format('MMM D, YYYY · h:mm A')}</p></div> : <p className="mt-4 text-sm text-muted">No upcoming task deadlines.</p>}</section>
      </div>
      <section className="grid gap-3 sm:grid-cols-3">
        <button onClick={() => setEditing(true)} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-card dark:border-slate-800 dark:bg-slate-900"><Pencil size={18} className="text-accent" /><span><span className="block text-sm font-semibold text-ink dark:text-white">Edit Hackathon</span><span className="text-xs text-muted">Update event details</span></span></button>
        <button onClick={() => setTab('Tasks')} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-card dark:border-slate-800 dark:bg-slate-900"><Plus size={18} className="text-accent" /><span><span className="block text-sm font-semibold text-ink dark:text-white">Add Task</span><span className="text-xs text-muted">Plan your next step</span></span></button>
        <button onClick={() => setTab('Rounds')} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-card dark:border-slate-800 dark:bg-slate-900"><Plus size={18} className="text-accent" /><span><span className="block text-sm font-semibold text-ink dark:text-white">Add Round</span><span className="text-xs text-muted">Build the event timeline</span></span></button>
      </section>
    </div>}
    {tab === 'Team' && <TeamSection hackathon={hackathon} onRefresh={refresh} />}
    {tab === 'Project' && <ProjectSection hackathon={hackathon} onRefresh={refresh} />}
    {tab === 'Rounds' && <RoundsSection hackathon={hackathon} onRefresh={refresh} />}
    {tab === 'Tasks' && <TaskManager hackathons={[hackathon]} initialHackathonId={hackathon.id} onRefresh={refresh} />}
    {tab === 'Timeline' && <TimelineSection hackathon={hackathon} />}
    {tab === 'Notifications' && <NotificationsSection hackathon={hackathon} />}
    {editing && <Modal title="Edit Hackathon" onClose={() => setEditing(false)} wide><HackathonForm initial={hackathon} onCancel={() => setEditing(false)} onSubmit={async (input) => { await window.updathon.updateHackathon(hackathon.id, input); setEditing(false); showToast('Hackathon updated.'); await refresh() }} /></Modal>}
  </div>
}
