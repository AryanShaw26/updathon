import { useEffect, useMemo, useState } from 'react'
import { Check, Clock3, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import type { HackathonSummary, TaskInput, TaskPriority, TaskStatus, TaskSummary } from '../../shared/types'
import { EmptyState } from './EmptyState'
import { Modal } from './Modal'
import { TaskForm } from './TaskForm'
import { useToast } from '../contexts/ToastContext'

const statuses: ('ALL' | TaskStatus)[] = ['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED']
const priorities: ('ALL' | TaskPriority)[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

function Deadline({ task }: { task: TaskSummary }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  if (task.status === 'COMPLETED') return <span className="text-emerald-600">Completed</span>
  if (!task.deadline) return <span className="text-slate-400">No deadline</span>
  const remaining = dayjs(task.deadline).diff(dayjs(now))
  if (remaining <= 0) return <span className="font-semibold text-rose-600">Overdue</span>
  const days = Math.floor(remaining / 86_400_000)
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000)
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)
  return <span>{days}d {hours}h {minutes}m remaining</span>
}

function priorityStyle(priority: TaskPriority) {
  switch (priority) {
    case 'CRITICAL': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
    case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
    case 'MEDIUM': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
    case 'LOW': return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
  }
}

interface TaskManagerProps {
  hackathons: HackathonSummary[]
  initialHackathonId?: string
  onRefresh: () => Promise<void>
}

export function TaskManager({ hackathons, initialHackathonId, onRefresh }: TaskManagerProps) {
  const { showToast } = useToast()
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorities)[number]>('ALL')
  const [roundFilter, setRoundFilter] = useState('ALL')
  const [hackathonFilter, setHackathonFilter] = useState(initialHackathonId ?? 'ALL')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<{ hackathonId: string; task: TaskSummary } | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const allTasks = useMemo(() => hackathons.flatMap((hackathon) => hackathon.tasks.map((task) => ({
    ...task,
    hackathonId: hackathon.id,
    hackathonName: hackathon.name,
  }))), [hackathons])
  const rounds = useMemo(() => hackathons
    .filter((hackathon) => hackathonFilter === 'ALL' || hackathon.id === hackathonFilter)
    .flatMap((hackathon) => hackathon.rounds.map((round) => ({ ...round, hackathonName: hackathon.name }))), [hackathons, hackathonFilter])
  const visible = useMemo(() => allTasks.filter((task) =>
    (statusFilter === 'ALL' || task.status === statusFilter)
    && (priorityFilter === 'ALL' || task.priority === priorityFilter)
    && (roundFilter === 'ALL' || task.roundId === roundFilter)
    && (hackathonFilter === 'ALL' || task.hackathonId === hackathonFilter)
    && task.title.toLowerCase().includes(query.trim().toLowerCase()),
  ).sort((a, b) => (a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER)
    - (b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER)), [allTasks, statusFilter, priorityFilter, roundFilter, hackathonFilter, query])

  const createTask = async (hackathonId: string, input: TaskInput) => {
    await window.updathon.createTask(hackathonId, input)
    setCreating(false)
    showToast('Task created successfully.')
    await onRefresh()
  }

  const updateTask = async (hackathonId: string, taskId: string, input: TaskInput) => {
    await window.updathon.updateTask(taskId, input)
    setEditing(null)
    showToast('Task updated successfully.')
    await onRefresh()
  }

  const changeStatus = async (hackathonId: string, task: TaskSummary, status: TaskStatus) => {
    try {
      await updateTask(hackathonId, task.id, {
        title: task.title,
        description: task.description ?? '',
        roundId: task.roundId ?? '',
        priority: task.priority,
        status,
        deadline: task.deadline ?? '',
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update task status.')
    }
  }

  const deleteTask = async (task: TaskSummary) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return
    try {
      await window.updathon.deleteTask(task.id)
      showToast('Task deleted.')
      await onRefresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete task.')
    }
  }

  const selectClass = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-white'

  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-xl font-bold text-ink dark:text-white">Tasks</h2><p className="mt-1 text-sm text-muted dark:text-slate-400">{allTasks.length} task{allTasks.length === 1 ? '' : 's'} across your hackathons</p></div><button onClick={() => setCreating(true)} disabled={hackathons.length === 0} className="inline-flex items-center gap-2 self-start rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Plus size={16} /> Add Task</button></div>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}<button onClick={() => setError('')} className="ml-3 font-semibold">Dismiss</button></div>}
    <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Search task title" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <div className="flex flex-wrap gap-2">
        <select aria-label="Filter by status" className={selectClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])}>{statuses.map((status) => <option key={status} value={status}>{status === 'ALL' ? 'All statuses' : status.replace('_', ' ')}</option>)}</select>
        <select aria-label="Filter by priority" className={selectClass} value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as (typeof priorities)[number])}>{priorities.map((priority) => <option key={priority} value={priority}>{priority === 'ALL' ? 'All priorities' : priority}</option>)}</select>
        <select aria-label="Filter by round" className={selectClass} value={roundFilter} onChange={(event) => setRoundFilter(event.target.value)}><option value="ALL">All rounds</option>{rounds.map((round) => <option key={round.id} value={round.id}>{round.hackathonName} · {round.name}</option>)}</select>
        {!initialHackathonId && <select aria-label="Filter by hackathon" className={selectClass} value={hackathonFilter} onChange={(event) => { setHackathonFilter(event.target.value); setRoundFilter('ALL') }}><option value="ALL">All hackathons</option>{hackathons.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
      </div>
    </div>
    {visible.length === 0 ? <div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"><EmptyState icon={Clock3} title={allTasks.length === 0 ? 'No tasks yet' : 'No tasks match these filters'} description={allTasks.length === 0 ? 'Add a task to turn your hackathon plans into action.' : 'Try a different status, priority, round, or search term.'} />{allTasks.length === 0 && hackathons.length > 0 && <div className="pb-8 text-center"><button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add Task</button></div>}{allTasks.length === 0 && hackathons.length === 0 && <div className="pb-8 text-center"><Link to="/hackathons/new" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add Hackathon</Link></div>}</div> :
      <div className="space-y-3">{visible.map((task) => {
        const statusColors = task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : task.status === 'IN_PROGRESS' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        return <article key={task.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card md:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className={`font-semibold text-ink dark:text-white ${task.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>{task.title}</h3><span className={`rounded-md px-2 py-1 text-[10px] font-bold ${priorityStyle(task.priority)}`}>{task.priority}</span><span className={`rounded-md px-2 py-1 text-[10px] font-bold ${statusColors}`}>{task.status.replace('_', ' ')}</span></div><p className="mt-1 truncate text-sm text-muted dark:text-slate-400">{task.hackathonName}{task.roundName ? ` · ${task.roundName}` : ''}</p>{task.description && <p className="mt-1 truncate text-xs text-slate-400">{task.description}</p>}</div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted dark:text-slate-400">{task.deadline && <span>{dayjs(task.deadline).format('MMM D, h:mm A')}</span>}<Deadline task={task} /></div>
            <div className="flex items-center gap-2">
              <select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => void changeStatus(task.hackathonId, task, event.target.value as TaskStatus)} className={`${selectClass} py-1.5`}>{(['TODO', 'IN_PROGRESS', 'COMPLETED'] as const).map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select>
              {task.status !== 'COMPLETED' && <button aria-label={`Mark ${task.title} complete`} title="Mark complete" onClick={() => void changeStatus(task.hackathonId, task, 'COMPLETED')} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"><Check size={17} /></button>}
              <button aria-label={`Edit ${task.title}`} title="Edit task" onClick={() => setEditing({ hackathonId: task.hackathonId, task })} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil size={16} /></button>
              <button aria-label={`Delete ${task.title}`} title="Delete task" onClick={() => void deleteTask(task)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"><Trash2 size={16} /></button>
            </div>
          </div>
        </article>
      })}</div>}
    {creating && <Modal title="Add Task" onClose={() => setCreating(false)}><TaskForm hackathons={hackathons} hackathonId={initialHackathonId} onSubmit={createTask} onCancel={() => setCreating(false)} /></Modal>}
    {editing && <Modal title="Edit Task" onClose={() => setEditing(null)}><TaskForm hackathons={hackathons} hackathonId={editing.hackathonId} initial={editing.task} onSubmit={async (_id, input) => updateTask(editing.hackathonId, editing.task.id, input)} onCancel={() => setEditing(null)} /></Modal>}
  </div>
}
