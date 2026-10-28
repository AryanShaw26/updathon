import { useState, type FormEvent } from 'react'
import type { RoundInput, RoundSummary } from '../../shared/types'
import { localDateTime, toDateTimeInputValue } from '../utils/forms'

export function RoundForm({ initial, onSave, onCancel }: { initial?: RoundSummary; onSave: (input: RoundInput) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [startDate, setStartDate] = useState(toDateTimeInputValue(initial?.startDate))
  const [endDate, setEndDate] = useState(toDateTimeInputValue(initial?.endDate))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return setError('Round name is required.')
    if (!startDate || !endDate) return setError('Round start and end are required.')
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) return setError('Round end must be on or after its start.')
    setSaving(true)
    setError('')
    try {
      await onSave({ name: name.trim(), description: description.trim(), startDate: localDateTime(startDate), endDate: localDateTime(endDate) })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this round.')
    } finally {
      setSaving(false)
    }
  }

  const input = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-950 dark:text-white'
  return <form className="space-y-4" onSubmit={(event) => void submit(event)} noValidate>
    <label className="block text-sm font-medium">Round Name *<input autoFocus required maxLength={120} className={input} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Prototype review" /></label>
    <label className="block text-sm font-medium">Description<textarea rows={3} className={input} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Start Date &amp; Time *<input required type="datetime-local" className={input} value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label className="block text-sm font-medium">End Date &amp; Time *<input required type="datetime-local" min={startDate || undefined} className={input} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div>
    {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
    <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700">Cancel</button><button disabled={saving} className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : initial ? 'Save changes' : 'Add round'}</button></div>
  </form>
}
