import { useState, type FormEvent } from 'react'
import type { HackathonInput, HackathonSummary } from '../../shared/types'
import { localDateEnd, localDateStart, toDateInputValue, validateOptionalUrl } from '../utils/forms'

interface HackathonFormProps {
  initial?: HackathonSummary
  onSubmit: (input: HackathonInput) => Promise<void>
  onCancel?: () => void
}

export function HackathonForm({ initial, onSubmit, onCancel }: HackathonFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [organizer, setOrganizer] = useState(initial?.organizer ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [website, setWebsite] = useState(initial?.website ?? '')
  const [startDate, setStartDate] = useState(toDateInputValue(initial?.startDate))
  const [endDate, setEndDate] = useState(toDateInputValue(initial?.endDate))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!name.trim()) return setError('Hackathon name is required.')
    if (!startDate || !endDate) return setError('Start date and end date are required.')
    if (endDate < startDate) return setError('End date must be on or after the start date.')
    const urlError = validateOptionalUrl(website, 'Website')
    if (urlError) return setError(urlError)

    setSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        organizer: organizer.trim(),
        description: description.trim(),
        website: website.trim(),
        startDate: localDateStart(startDate),
        endDate: localDateEnd(endDate),
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this hackathon.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300'

  return <form className="space-y-4" onSubmit={(event) => void submit(event)} noValidate>
    <label className={labelClass}>Hackathon Name <span className="text-rose-500">*</span><input autoFocus required maxLength={120} className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Build for Tomorrow" /></label>
    <label className={labelClass}>Organizer<input className={inputClass} value={organizer} onChange={(event) => setOrganizer(event.target.value)} placeholder="Organization or host" /></label>
    <label className={labelClass}>Description<textarea rows={3} className={inputClass} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this hackathon about?" /></label>
    <label className={labelClass}>Website<input type="url" className={inputClass} value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>Start Date <span className="text-rose-500">*</span><input type="date" required className={inputClass} value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
      <label className={labelClass}>End Date <span className="text-rose-500">*</span><input type="date" required min={startDate || undefined} className={inputClass} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
    </div>
    {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
    <div className="flex justify-end gap-3 pt-2">
      {onCancel && <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Cancel</button>}
      <button disabled={saving} className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : initial ? 'Save changes' : 'Create hackathon'}</button>
    </div>
  </form>
}
