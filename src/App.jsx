import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import ProjectCreate from './pages/ProjectCreate'
import Leads from './pages/Leads'
import Campaigns from './pages/Campaigns'
import CampaignCreate from './pages/CampaignCreate'
import FollowUps from './pages/Sequences'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/create" element={<ProjectCreate />} />
          <Route path="leads" element={<Leads />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaigns/create" element={<CampaignCreate />} />
          <Route path="sequences" element={<FollowUps />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
