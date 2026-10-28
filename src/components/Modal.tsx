import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

export function Modal({ title, onClose, children, wide = false }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section role="dialog" aria-modal="true" aria-label={title} className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900 ${wide ? 'max-w-2xl' : 'max-w-xl'}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-ink dark:text-white">{title}</h2>
          <button type="button" aria-label="Close dialog" onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </section>
    </div>
  )
}
