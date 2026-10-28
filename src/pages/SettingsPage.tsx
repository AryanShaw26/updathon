import { useEffect, useState } from 'react'
import { Bell, Check, LoaderCircle, MonitorCog } from 'lucide-react'

export function SettingsPage() {
  const [launch, setLaunch] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notificationState, setNotificationState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    window.updathon.getLaunchAtStartup()
      .then(setLaunch)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load settings.'))
      .finally(() => setLoading(false))
  }, [])

  const updateLaunch = async (enabled: boolean) => {
    setSaving(true)
    setError('')
    try {
      await window.updathon.setLaunchAtStartup(enabled)
      setLaunch(enabled)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this setting.')
    } finally {
      setSaving(false)
    }
  }

  const testNotification = async () => {
    setNotificationState('sending')
    setError('')
    try {
      await window.updathon.sendTestNotification()
      setNotificationState('success')
      window.setTimeout(() => setNotificationState('idle'), 3000)
    } catch (cause) {
      setNotificationState('error')
      setError(cause instanceof Error ? cause.message : 'Unable to send a desktop notification.')
    }
  }

  return <div className="mx-auto max-w-3xl space-y-7">
    <div><p className="text-sm font-semibold text-accent">Preferences</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-ink dark:text-white">Settings</h1><p className="mt-2 text-muted dark:text-slate-400">Adjust how Updathon works on your desktop.</p></div>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
    <section className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"><div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800"><h2 className="font-bold text-ink dark:text-white">Desktop</h2><p className="mt-1 text-sm text-muted">Startup and notification preferences</p></div>
      <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800"><span className="rounded-xl bg-violet-50 p-3 text-accent dark:bg-violet-950/50"><MonitorCog size={20} /></span><div className="flex-1"><p className="text-sm font-semibold text-ink dark:text-white">Launch Updathon when Windows starts</p><p className="mt-1 text-xs text-muted">When enabled, Updathon starts in the background tray. This setting is off by default.</p></div><button type="button" role="switch" aria-checked={launch} disabled={loading || saving} onClick={() => void updateLaunch(!launch)} className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${launch ? 'bg-accent' : 'bg-slate-200 dark:bg-slate-700'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${launch ? 'left-[22px]' : 'left-0.5'}`} /></button></div>
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center"><span className="rounded-xl bg-sky-50 p-3 text-sky-600 dark:bg-sky-950/50"><Bell size={20} /></span><div className="flex-1"><p className="text-sm font-semibold text-ink dark:text-white">Test desktop notifications</p><p className="mt-1 text-xs text-muted">Send a native notification to confirm notifications are available.</p></div><button onClick={() => void testNotification()} disabled={notificationState === 'sending'} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">{notificationState === 'sending' ? <LoaderCircle size={16} className="animate-spin" /> : notificationState === 'success' ? <Check size={16} /> : <Bell size={16} />}{notificationState === 'success' ? 'Notification sent' : 'Test Notification'}</button></div>
    </section>
    <div className="rounded-xl bg-violet-50 p-4 text-sm text-violet-800 dark:bg-violet-950/40 dark:text-violet-200"><strong>Privacy first.</strong> Hackathon data and preferences are stored locally in a SQLite database on this device.</div>
  </div>
}
