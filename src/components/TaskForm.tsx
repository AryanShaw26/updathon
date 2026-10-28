import { useState, type FormEvent } from 'react'
import type { HackathonSummary, TaskInput, TaskPriority, TaskStatus, TaskSummary } from '../../shared/types'
import { localDateTime, toDateTimeInputValue } from '../utils/forms'

const priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED']

interface TaskFormProps {
  hackathons: HackathonSummary[]
  hackathonId?: string
  initial?: TaskSummary
  onSubmit: (hackathonId: string, input: TaskInput) => Promise<void>
  onCancel: () => void
}

export function TaskForm({ hackathons, hackathonId, initial, onSubmit, onCancel }: TaskFormProps) {
  const [selectedHackathon, setSelectedHackathon] = useState(hackathonId ?? hackathons[0]?.id ?? '')
  const selected = hackathons.find((item) => item.id === selectedHackathon)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [roundId, setRoundId] = useState(initial?.roundId ?? '')
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'MEDIUM')
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'TODO')
  const [deadline, setDeadline] = useState(toDateTimeInputValue(initial?.deadline))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) return setError('Task title is required.')
    if (!selectedHackathon) return setError('Choose a hackathon for this task.')
    if (roundId && !selected?.rounds.some((round) => round.id === roundId)) return setError('Choose a round in this hackathon.')
    setError('')
    setSaving(true)
    try {
      await onSubmit(selectedHackathon, {
        title: title.trim(),
        description: description.trim(),
        roundId,
        priority,
        status,
        deadline: localDateTime(deadline),
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this task.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300'

  return <form className="space-y-4" onSubmit={(event) => void submit(event)} noValidate>
    {!hackathonId && <label className={labelClass}>Hackathon <span className="text-rose-500">*</span><select className={inputClass} value={selectedHackathon} onChange={(event) => { setSelectedHackathon(event.target.value); setRoundId('') }}><option value="">Select a hackathon</option>{hackathons.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
    <label className={labelClass}>Task Title <span className="text-rose-500">*</span><input autoFocus required maxLength={160} className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to be done?" /></label>
    <label className={labelClass}>Description<textarea rows={3} className={inputClass} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add context or details" /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>Round<select className={inputClass} value={roundId} onChange={(event) => setRoundId(event.target.value)}><option value="">No round</option>{selected?.rounds.map((round) => <option key={round.id} value={round.id}>{round.name}</option>)}</select></label>
      <label className={labelClass}>Priority<select className={inputClass} value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>{priorities.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label className={labelClass}>Deadline<input type="datetime-local" className={inputClass} value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
      <label className={labelClass}>Status<select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>{statuses.map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select></label>
    </div>
    {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
    <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Cancel</button><button disabled={saving} className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : initial ? 'Save changes' : 'Create task'}</button></div>
  </form>
}
