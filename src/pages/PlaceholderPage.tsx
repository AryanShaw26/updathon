import { Bell, CalendarDays, CheckSquare } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'

const content = {
  Timeline: { icon: CalendarDays, description: 'Milestones and important dates from your hackathons will appear here.' },
  Tasks: { icon: CheckSquare, description: 'A unified view of tasks from all your hackathons is coming soon.' },
  Notifications: { icon: Bell, description: 'Deadline and round reminders will be managed here.' },
}

export function PlaceholderPage({ name }: { name: keyof typeof content }) {
  const { icon, description } = content[name]
  return <div className="space-y-7"><div><p className="text-sm font-semibold text-accent">Your workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-ink dark:text-white">{name}</h1><p className="mt-2 text-muted dark:text-slate-400">{description}</p></div><div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"><EmptyState icon={icon} title={`${name} view is ready for your data`} description="This section is part of your workspace foundation. Management tools will be added in a future update." /></div></div>
}
