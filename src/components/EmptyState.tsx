import type { LucideIcon } from 'lucide-react'

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="rounded-2xl bg-violet-50 p-4 text-accent dark:bg-violet-950/50"><Icon size={24} /></span>
      <h3 className="mt-4 font-semibold text-ink dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted dark:text-slate-400">{description}</p>
    </div>
  )
}
