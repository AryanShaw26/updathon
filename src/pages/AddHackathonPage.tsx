import { ArrowLeft, Trophy } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { HackathonForm } from '../components/HackathonForm'
import { useToast } from '../contexts/ToastContext'

export function AddHackathonPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  return <div className="mx-auto max-w-2xl space-y-6">
    <Link to="/hackathons" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent"><ArrowLeft size={16} /> Back to hackathons</Link>
    <section className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800"><div className="flex items-center gap-3"><span className="rounded-xl bg-violet-50 p-3 text-accent dark:bg-violet-950/50"><Trophy size={20} /></span><div><h1 className="text-xl font-bold text-ink dark:text-white">Add Hackathon</h1><p className="mt-1 text-sm text-muted">Create an event to start tracking your progress.</p></div></div></div>
      <div className="p-6"><HackathonForm onSubmit={async (input) => {
        const hackathon = await window.updathon.createHackathon(input)
        showToast('Hackathon created successfully.')
        navigate(`/hackathons/${hackathon.id}`, { replace: true })
      }} /></div>
    </section>
  </div>
}
