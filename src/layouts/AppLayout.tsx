import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  Bell, CalendarDays, CheckSquare, ChevronLeft, ChevronRight, Command, LayoutDashboard,
  Menu, Moon, Settings, Sun, Trophy, X,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'My Hackathons', to: '/hackathons', icon: Trophy },
  { label: 'Timeline', to: '/timeline', icon: CalendarDays },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare },
  { label: 'Notifications', to: '/notifications', icon: Bell },
]

export function AppLayout() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const toggleTheme = () => {
    const nextDark = !dark
    setDark(nextDark)
    document.documentElement.classList.toggle('dark', nextDark)
    localStorage.setItem('theme', nextDark ? 'dark' : 'light')
  }

  const sidebar = (
    <aside className={`flex h-full flex-col border-r border-slate-100 bg-white transition-all dark:border-slate-800 dark:bg-slate-950 ${collapsed ? 'w-[88px]' : 'w-[252px]'}`}>
      <div className="flex h-[84px] items-center gap-3 px-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-white"><Command size={21} /></span>
        {!collapsed && <span className="text-xl font-bold tracking-tight text-ink dark:text-white">Updathon</span>}
        <button className="ml-auto hidden rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:block dark:hover:bg-slate-800" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
        <button className="ml-auto rounded-lg p-1 text-slate-400 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18} /></button>
      </div>
      <div className="px-4 pt-5">
        {!collapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>}
        <nav className="space-y-1">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-violet-50 text-accent dark:bg-violet-950/50' : 'text-slate-500 hover:bg-slate-50 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'}`}
              title={collapsed ? label : undefined}>
              <Icon size={19} />{!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-slate-100 p-4 dark:border-slate-800">
        <NavLink to="/settings" onClick={() => setMobileOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${isActive ? 'bg-violet-50 text-accent dark:bg-violet-950/50' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'}`}
          title={collapsed ? 'Settings' : undefined}>
          <Settings size={19} />{!collapsed && <span>Settings</span>}
        </NavLink>
        <button onClick={toggleTheme} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900" title={collapsed ? 'Toggle theme' : undefined}>
          {dark ? <Sun size={19} /> : <Moon size={19} />}{!collapsed && <span>{dark ? 'Light theme' : 'Dark theme'}</span>}
        </button>
        {!collapsed && <div className="mt-5 flex items-center gap-3 rounded-xl bg-canvas p-3 dark:bg-slate-900"><div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-200 text-sm font-bold text-indigo-800">AS</div><div><p className="text-sm font-semibold text-ink dark:text-white">Aryan Shaw</p><p className="text-xs text-muted dark:text-slate-500">Personal workspace</p></div></div>}
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {mobileOpen && <div className="fixed inset-0 z-40 lg:hidden"><button className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /><div className="relative h-full w-[280px]">{sidebar}</div></div>}
      <div className={`min-h-screen transition-[margin] ${collapsed ? 'lg:ml-[88px]' : 'lg:ml-[252px]'}`}>
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-slate-100 bg-white/90 px-5 backdrop-blur md:px-8 dark:border-slate-800 dark:bg-slate-950/90">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-500 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button>
          <div className="hidden text-sm text-slate-400 sm:block">Personal workspace <span className="mx-2">/</span><span className="text-slate-600 dark:text-slate-300">Hackathon season</span></div>
          <div className="ml-auto flex items-center gap-3"><span className="hidden text-sm text-muted sm:block">{dayjs().format('dddd, MMMM D')}</span><div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">AS</div></div>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 lg:px-10"><Outlet /></main>
      </div>
    </div>
  )
}
