import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  helper: string
  icon: LucideIcon
  color: string
}

export function StatCard({ label, value, helper, icon: Icon, color }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted dark:text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-ink dark:text-white">{value}</p>
        </div>
        <span className={`rounded-xl p-3 ${color}`}><Icon size={20} /></span>
      </div>
      <p className="mt-4 text-xs text-muted dark:text-slate-500">{helper}</p>
    </article>
  )
}
