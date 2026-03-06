// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import ProjectCreate from './pages/ProjectCreate'
import Leads from './pages/Leads'
import LeadsImport from './pages/LeadsImport'
import Campaigns from './pages/Campaigns'
import CampaignCreate from './pages/CampaignCreate'
import CampaignDetail from './pages/CampaignDetail'
import CampaignEdit from './pages/CampaignEdit'
import FollowUps from './pages/Sequences'
import Analytics from './pages/Analytics'
import Templates from './pages/Templates'
import Settings from './pages/Settings'
import SignIn from './pages/SignIn'

// ─── Guards ──────────────────────────────────────────────────────────────────

// While Firebase resolves the auth state, show a full-screen spinner.
const AuthGate = ({ children }) => {
  const { authLoading } = useAuth()
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-[8px] animate-spin" />
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

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate>
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', borderRadius: '16px' } }} />
          <Routes>
            {/* Public */}
            <Route path="/" element={
              <PublicRoute><SignIn /></PublicRoute>
            } />

            {/* Protected dashboard shell */}
            <Route path="/dashboard" element={
              <ProtectedRoute><AppLayout /></ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/create" element={<ProjectCreate />} />
              <Route path="leads" element={<Leads />} />
              <Route path="leads/import" element={<LeadsImport />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="campaigns/:id" element={<CampaignDetail />} />
              <Route path="campaigns/:id/edit" element={<CampaignEdit />} />
              <Route path="campaigns/create" element={<CampaignCreate />} />
              <Route path="sequences" element={<FollowUps />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="templates" element={<Templates />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthGate>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
