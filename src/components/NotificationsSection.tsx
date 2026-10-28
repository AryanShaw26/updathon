import { Bell, CalendarClock } from 'lucide-react'
import dayjs from 'dayjs'
import type { HackathonSummary } from '../../shared/types'
import { EmptyState } from './EmptyState'

export function NotificationsSection({ hackathon }: { hackathon: HackathonSummary }) {
  if (hackathon.notifications.length === 0) return <div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"><EmptyState icon={Bell} title="No reminders configured" description="Deadline and round reminders can be connected here in a future notifications update." /></div>
  return <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900"><h2 className="font-bold text-ink dark:text-white">Notification settings</h2><p className="mt-1 text-sm text-muted">Reminder rules associated with this hackathon.</p><div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{hackathon.notifications.map((item) => <div key={item.id} className="flex items-center gap-3 py-4"><CalendarClock size={18} className="text-accent" /><div className="flex-1"><p className="text-sm font-semibold text-ink dark:text-white">{item.notificationType.replace('_', ' ')}</p><p className="mt-1 text-xs text-muted">{dayjs(item.notificationTime).format('MMM D, YYYY · h:mm A')}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${item.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.enabled ? 'Enabled' : 'Disabled'}</span></div>)}</div></section>
}
