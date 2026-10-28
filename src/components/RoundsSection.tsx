import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import type { HackathonSummary, RoundInput, RoundSummary } from '../../shared/types'
import { Countdown } from './Countdown'
import { EmptyState } from './EmptyState'
import { Modal } from './Modal'
import { RoundForm } from './RoundForm'
import { useToast } from '../contexts/ToastContext'

function getStatus(round: RoundSummary, now: number): RoundSummary['status'] {
  if (now < new Date(round.startDate).getTime()) return 'UPCOMING'
  if (now > new Date(round.endDate).getTime()) return 'COMPLETED'
  return 'ACTIVE'
}

export function RoundsSection({ hackathon, onRefresh }: { hackathon: HackathonSummary; onRefresh: () => Promise<void> }) {
  const { showToast } = useToast()
  const [now, setNow] = useState(Date.now())
  const [editing, setEditing] = useState<RoundSummary | 'new' | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const sortedRounds = useMemo(() => [...hackathon.rounds].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()), [hackathon.rounds])
  const currentRound = sortedRounds.find((round) => getStatus(round, now) === 'ACTIVE')
  const nextRound = sortedRounds.find((round) => getStatus(round, now) === 'UPCOMING')

  const save = async (input: RoundInput) => {
    if (editing === 'new') {
      await window.updathon.createRound(hackathon.id, input)
      showToast('Round added.')
    } else if (editing) {
      await window.updathon.updateRound(editing.id, input)
      showToast('Round updated.')
    }
    setEditing(null)
    await onRefresh()
  }

  const remove = async (round: RoundSummary) => {
    if (!window.confirm(`Delete "${round.name}"? Tasks assigned to this round will remain and become unassigned.`)) return
    try {
      await window.updathon.deleteRound(round.id)
      showToast('Round deleted.')
      await onRefresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete the round.')
    }
  }

  const statusColor = (status: RoundSummary['status']) => status === 'ACTIVE'
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
    : status === 'COMPLETED'
      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'

  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-xl font-bold text-ink dark:text-white">Hackathon rounds</h2><p className="mt-1 text-sm text-muted">Round status is calculated automatically from its dates.</p></div><button onClick={() => setEditing('new')} className="inline-flex items-center gap-2 self-start rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add Round</button></div>
    {error && <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    {currentRound && <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-card dark:border-violet-900/50 dark:bg-slate-900"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-accent">Current round</p><h3 className="mt-1 text-lg font-bold text-ink dark:text-white">{currentRound.name}</h3></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor('ACTIVE')}`}>ACTIVE</span></div><p className="mt-1 text-sm text-muted">Ends {dayjs(currentRound.endDate).format('MMM D, YYYY · h:mm A')}</p><div className="mt-4"><Countdown targetDate={currentRound.endDate} /></div></section>}
    {!currentRound && nextRound && <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-bold uppercase tracking-wide text-accent">Next Round: {nextRound.name}</p><p className="mt-1 text-sm text-muted">{dayjs(nextRound.startDate).format('MMM D, YYYY · h:mm A')}</p><div className="mt-4"><Countdown targetDate={nextRound.startDate} expiredLabel="Round Started" /></div></section>}
    {sortedRounds.length === 0 ? <div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"><EmptyState icon={CalendarClock} title="No rounds added yet" description="Create the stages of this hackathon to keep deadlines and work organized." /><div className="pb-8 text-center"><button onClick={() => setEditing('new')} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add Round</button></div></div> :
      <div className="space-y-3">{sortedRounds.map((round, index) => {
        const status = getStatus(round, now)
        const upcoming = sortedRounds.find((item) => getStatus(item, now) === 'UPCOMING')
        return <article key={round.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-canvas text-sm font-bold text-muted dark:bg-slate-800">{index + 1}</span><div className="min-w-0"><h3 className="font-semibold text-ink dark:text-white">{round.name}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-muted">{round.description || 'No description'}</p><p className="mt-3 text-xs text-slate-400">{dayjs(round.startDate).format('MMM D, YYYY · h:mm A')} — {dayjs(round.endDate).format('MMM D, YYYY · h:mm A')}</p>{status === 'COMPLETED' && upcoming && upcoming.id === sortedRounds[index + 1]?.id && <p className="mt-2 text-xs font-semibold text-accent">Next Round: {upcoming.name} · {dayjs(upcoming.startDate).format('MMM D, h:mm A')}</p>}</div></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${statusColor(status)}`}>{status}</span><button aria-label={`Edit ${round.name}`} onClick={() => setEditing(round)} className="rounded-lg p-2 text-muted hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil size={16} /></button><button aria-label={`Delete ${round.name}`} onClick={() => void remove(round)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"><Trash2 size={16} /></button></div></div></article>
      })}</div>}
    {editing && <Modal title={editing === 'new' ? 'Add round' : 'Edit round'} onClose={() => setEditing(null)}><RoundForm initial={editing === 'new' ? undefined : editing} onSave={save} onCancel={() => setEditing(null)} /></Modal>}
  </div>
}
