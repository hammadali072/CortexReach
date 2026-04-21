// src/App.jsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

import AppLayout from './components/layout/appLayout/appLayout'
import DashboardPage from './pages/dashboard-page'
import ProjectsPage from './pages/projects-page'
import ProjectDetailPage from './pages/project-detail-page'
import ProjectCreatePage from './pages/project-create-page'
import LeadsPage from './pages/leads-page'
import LeadsImportPage from './pages/leads-import-page'
import CampaignsPage from './pages/campaigns-page'
import CampaignCreatePage from './pages/campaign-create-page'
import CampaignDetailPage from './pages/campaign-detail-page'
import CampaignEditPage from './pages/campaign-edit-page'
import TemplatesPage from './pages/templates-page'
import SettingsPage from './pages/settings-page'
import SignInPage from './pages/sign-in-page'

// ─── Guards & Utilities ──────────────────────────────────────────────────────

// Automatically scroll back to top of page on route change.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// While Firebase resolves the auth state, show a full-screen spinner.
const AuthGate = ({ children }) => {
  const { authLoading } = useAuth()
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading CortexReach...</p>
        </div>
      </div>
    )
  }
  return children
}

// Redirect to dashboard if already logged in (public-only route).
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth()
  return currentUser ? <Navigate to="/dashboard" replace /> : children
}

// Redirect to sign-in if not authenticated.
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/" replace />
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthGate>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', borderRadius: '16px' } }} />
        <Routes>
          <Route path="/" element={
            <PublicRoute><SignInPage /></PublicRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute><AppLayout /></ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="projects/create" element={<ProjectCreatePage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="leads/import" element={<LeadsImportPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="campaigns/:id/edit" element={<CampaignEditPage />} />
            <Route path="campaigns/create" element={<CampaignCreatePage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  )
}

export default App
