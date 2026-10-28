import { useCallback, useEffect, useState } from 'react'
import type { HackathonSummary } from '../../shared/types'
import { TaskManager } from '../components/TaskManager'

export function TasksPage() {
  const [hackathons, setHackathons] = useState<HackathonSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      setHackathons(await window.updathon.getHackathons())
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load tasks.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  return <div className="space-y-7">
    <header><p className="text-sm font-semibold text-accent">Your workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-ink dark:text-white">Tasks</h1><p className="mt-2 text-muted dark:text-slate-400">Plan and track the work across your hackathons.</p></header>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>}
    {loading ? <div className="py-20 text-center text-sm text-muted">Loading tasks…</div> : <TaskManager hackathons={hackathons} onRefresh={refresh} />}
  </div>
}
