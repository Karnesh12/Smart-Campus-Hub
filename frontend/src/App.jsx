import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler'
import TicketListPage from './pages/incidents/TicketListPage'
import CreateTicketPage from './pages/incidents/CreateTicketPage'
import TicketDetailPage from './pages/incidents/TicketDetailPage'
import Navbar from './components/Navbar'

// ── Layout — sidebar wrapper for protected pages ──────────
const Layout = ({ children }) => (
  <div className="layout">
    <Navbar />
    <div className="main-content">
      {children}
    </div>
  </div>
)

// ── Temporary Dashboard ───────────────────────────────────
const Dashboard = () => (
  <Layout>
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>
      <p>Welcome to Smart Campus! You have successfully logged in.</p>
    </div>
  </Layout>
)

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Public routes — no sidebar */}
          <Route path="/"                element={<Navigate to="/login" replace />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Protected routes — with sidebar */}
          <Route path="/dashboard"      element={<Dashboard />} />

          {/* Member 3 — Incident Tickets */}
          <Route path="/tickets"        element={<Layout><TicketListPage /></Layout>} />
          <Route path="/tickets/create" element={<Layout><CreateTicketPage /></Layout>} />
          <Route path="/tickets/:id"    element={<Layout><TicketDetailPage /></Layout>} />

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App