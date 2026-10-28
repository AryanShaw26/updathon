import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AppLayout } from './layouts/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { HackathonsPage } from './pages/HackathonsPage'
import { HackathonDetailPage } from './pages/HackathonDetailPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { SettingsPage } from './pages/SettingsPage'
import { AddHackathonPage } from './pages/AddHackathonPage'
import { TasksPage } from './pages/TasksPage'
import { ToastProvider } from './contexts/ToastContext'
import { TimelinePage } from './pages/TimelinePage'

function TrayNavigation() {
  const navigate = useNavigate()

  useEffect(() => window.updathon.onNavigate((route) => navigate(route)), [navigate])

  return null
}

export function App() {
  return <ToastProvider><HashRouter><TrayNavigation /><Routes><Route element={<AppLayout />}>
    <Route index element={<DashboardPage />} />
    <Route path="hackathons" element={<HackathonsPage />} />
    <Route path="hackathons/new" element={<AddHackathonPage />} />
    <Route path="hackathons/:id" element={<HackathonDetailPage />} />
    <Route path="timeline" element={<TimelinePage />} />
    <Route path="tasks" element={<TasksPage />} />
    <Route path="notifications" element={<PlaceholderPage name="Notifications" />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="*" element={<DashboardPage />} />
  </Route></Routes></HashRouter></ToastProvider>
}
