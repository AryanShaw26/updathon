import { useState } from 'react'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import type { HackathonSummary, TeamMember, TeamMemberInput } from '../../shared/types'
import { EmptyState } from './EmptyState'
import { Modal } from './Modal'
import { useToast } from '../contexts/ToastContext'

function MemberForm({ initial, onSave, onCancel }: { initial?: TeamMember; onSave: (input: TeamMemberInput) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [role, setRole] = useState(initial?.role ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return setError('Member name is required.')
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address.')
    setSaving(true)
    setError('')
    try {
      await onSave({ name: name.trim(), email: email.trim(), role: role.trim() })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this team member.')
    } finally {
      setSaving(false)
    }
  }

  const input = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-950 dark:text-white'
  return <form className="space-y-4" onSubmit={(event) => void submit(event)} noValidate>
    <label className="block text-sm font-medium">Name *<input autoFocus className={input} value={name} onChange={(event) => setName(event.target.value)} /></label>
    <label className="block text-sm font-medium">Email<input type="email" className={input} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
    <label className="block text-sm font-medium">Role<input className={input} value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Design, Engineering" /></label>
    {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
    <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancel</button><button disabled={saving} className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white">{saving ? 'Saving…' : initial ? 'Save member' : 'Add member'}</button></div>
  </form>
}

export function TeamSection({ hackathon, onRefresh }: { hackathon: HackathonSummary; onRefresh: () => Promise<void> }) {
  const { showToast } = useToast()
  const [teamName, setTeamName] = useState(hackathon.team?.teamName ?? '')
  const [memberModal, setMemberModal] = useState<TeamMember | 'new' | null>(null)
  const [error, setError] = useState('')
  const [savingTeam, setSavingTeam] = useState(false)

  const saveTeam = async () => {
    if (!teamName.trim()) {
      setError('Team name is required.')
      return null
    }
    setSavingTeam(true)
    setError('')
    try {
      const team = await window.updathon.saveTeam(hackathon.id, { teamName: teamName.trim() })
      await onRefresh()
      return team
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save the team.')
      return null
    } finally {
      setSavingTeam(false)
    }
  }

  const saveMember = async (input: TeamMemberInput) => {
    const team = await saveTeam()
    if (!team) throw new Error('Save a team name before adding members.')
    await window.updathon.saveTeamMember(team.id, input, memberModal !== 'new' ? memberModal?.id : undefined)
    setMemberModal(null)
    showToast(memberModal === 'new' ? 'Team member added.' : 'Team member updated.')
    await onRefresh()
  }

  const removeMember = async (member: TeamMember) => {
    if (!window.confirm(`Remove ${member.name} from this team?`)) return
    try {
      await window.updathon.deleteTeamMember(member.id)
      showToast('Team member removed.')
      await onRefresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to remove this team member.')
    }
  }

  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end"><label className="block flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">Team Name<input maxLength={100} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Name your team" /></label><div className="flex gap-2"><button onClick={() => void saveTeam()} disabled={savingTeam} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-ink dark:border-slate-700 dark:text-white">{savingTeam ? 'Saving…' : 'Save team'}</button><button onClick={() => setMemberModal('new')} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add member</button></div></div>
      {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}
    </section>
    {hackathon.team?.members.length ? <div className="grid gap-3 sm:grid-cols-2">{hackathon.team.members.map((member) => <article key={member.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-50 font-bold text-accent dark:bg-violet-950/50">{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><div className="min-w-0 flex-1"><h3 className="truncate font-semibold text-ink dark:text-white">{member.name}</h3><p className="truncate text-sm text-muted">{member.role || member.email || 'Team member'}</p>{member.email && member.role && <p className="truncate text-xs text-slate-400">{member.email}</p>}</div><button aria-label={`Edit ${member.name}`} onClick={() => setMemberModal(member)} className="rounded-lg p-2 text-muted hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil size={16} /></button><button aria-label={`Remove ${member.name}`} onClick={() => void removeMember(member)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"><Trash2 size={16} /></button></article>)}</div> : <div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"><EmptyState icon={Users} title="No team members yet" description="Add teammates to keep your collaborators and their roles organized." /><div className="pb-8 text-center"><button onClick={() => setMemberModal('new')} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add member</button></div></div>}
    {memberModal && <Modal title={memberModal === 'new' ? 'Add team member' : 'Edit team member'} onClose={() => setMemberModal(null)}><MemberForm initial={memberModal === 'new' ? undefined : memberModal} onSave={saveMember} onCancel={() => setMemberModal(null)} /></Modal>}
  </div>
}
