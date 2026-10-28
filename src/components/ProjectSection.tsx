import { useEffect, useState, type FormEvent } from 'react'
import { ExternalLink, Github, Globe2, Pencil, Save } from 'lucide-react'
import type { HackathonSummary, ProjectInput } from '../../shared/types'
import { EmptyState } from './EmptyState'
import { useToast } from '../contexts/ToastContext'
import { validateOptionalUrl } from '../utils/forms'

export function ProjectSection({ hackathon, onRefresh }: { hackathon: HackathonSummary; onRefresh: () => Promise<void> }) {
  const { showToast } = useToast()
  const [editing, setEditing] = useState(!hackathon.project)
  const [projectName, setProjectName] = useState(hackathon.project?.projectName ?? '')
  const [description, setDescription] = useState(hackathon.project?.description ?? '')
  const [repositoryUrl, setRepositoryUrl] = useState(hackathon.project?.repositoryUrl ?? '')
  const [demoUrl, setDemoUrl] = useState(hackathon.project?.demoUrl ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setProjectName(hackathon.project?.projectName ?? '')
    setDescription(hackathon.project?.description ?? '')
    setRepositoryUrl(hackathon.project?.repositoryUrl ?? '')
    setDemoUrl(hackathon.project?.demoUrl ?? '')
    setEditing(!hackathon.project)
  }, [hackathon.project])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!projectName.trim()) return setError('Project name is required.')
    const urlError = validateOptionalUrl(repositoryUrl, 'Repository URL') ?? validateOptionalUrl(demoUrl, 'Live demo URL')
    if (urlError) return setError(urlError)
    setSaving(true)
    setError('')
    try {
      const input: ProjectInput = { projectName: projectName.trim(), description: description.trim(), repositoryUrl: repositoryUrl.trim(), demoUrl: demoUrl.trim() }
      await window.updathon.saveProject(hackathon.id, input)
      setEditing(false)
      showToast('Project details saved.')
      await onRefresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save project details.')
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    setProjectName(hackathon.project?.projectName ?? '')
    setDescription(hackathon.project?.description ?? '')
    setRepositoryUrl(hackathon.project?.repositoryUrl ?? '')
    setDemoUrl(hackathon.project?.demoUrl ?? '')
    setError('')
    setEditing(false)
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-950 dark:text-white'
  if (!editing && hackathon.project) return <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-ink dark:text-white">{hackathon.project.projectName}</h2><p className="mt-2 whitespace-pre-wrap text-sm text-muted">{hackathon.project.description || 'No project description.'}</p></div><button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-700"><Pencil size={15} /> Edit</button></div>
    <div className="mt-5 flex flex-wrap gap-3">{hackathon.project.repositoryUrl && <a className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-ink hover:text-accent dark:bg-slate-800 dark:text-white" href={hackathon.project.repositoryUrl} target="_blank" rel="noreferrer"><Github size={16} /> Repository <ExternalLink size={14} /></a>}{hackathon.project.demoUrl && <a className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-semibold text-accent dark:bg-violet-950/50" href={hackathon.project.demoUrl} target="_blank" rel="noreferrer"><Globe2 size={16} /> Live demo <ExternalLink size={14} /></a>}</div>
  </section>

  return <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
    {!hackathon.project && <div className="mb-5"><EmptyState icon={Github} title="No project linked" description="Add the project your team is building for this hackathon." /></div>}
    <form className="space-y-4" onSubmit={(event) => void save(event)} noValidate>
      <label className="block text-sm font-medium">Project Name *<input required maxLength={140} className={inputClass} value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Project name" /></label>
      <label className="block text-sm font-medium">Project Description<textarea rows={4} className={inputClass} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What are you building?" /></label>
      <label className="block text-sm font-medium">GitHub Repository URL<input type="url" className={inputClass} value={repositoryUrl} onChange={(event) => setRepositoryUrl(event.target.value)} placeholder="https://github.com/..." /></label>
      <label className="block text-sm font-medium">Live Demo URL<input type="url" className={inputClass} value={demoUrl} onChange={(event) => setDemoUrl(event.target.value)} placeholder="https://..." /></label>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end gap-3">{hackathon.project && <button type="button" onClick={cancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700">Cancel</button>}<button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} />{saving ? 'Saving…' : 'Save project'}</button></div>
    </form>
  </section>
}
