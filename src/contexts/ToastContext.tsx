import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, X, XCircle } from 'lucide-react'

interface ToastMessage {
  id: number
  message: string
  kind: 'success' | 'error'
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastMessage['kind']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const showToast = useCallback((message: string, kind: ToastMessage['kind'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message, kind }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4000)
  }, [])
  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-5 top-5 z-[100] flex w-[min(400px,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} role="status" className={`flex items-center gap-3 rounded-xl border bg-white p-4 shadow-xl dark:bg-slate-900 ${toast.kind === 'success' ? 'border-emerald-200 dark:border-emerald-900' : 'border-rose-200 dark:border-rose-900'}`}>
            {toast.kind === 'success' ? <CheckCircle2 size={19} className="shrink-0 text-emerald-600" /> : <XCircle size={19} className="shrink-0 text-rose-600" />}
            <p className="flex-1 text-sm font-medium text-ink dark:text-white">{toast.message}</p>
            <button type="button" aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} className="text-muted"><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider.')
  return context
}
