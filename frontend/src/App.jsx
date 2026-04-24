import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler'
import Navbar from './components/Navbar'
import ResourcesPage from './pages/ResourcesPage'
import BookingsPage from './pages/BookingsPage'
import NotificationsPage from './pages/NotificationsPage'
import { NotificationProvider } from './context/NotificationContext'

// Member 3 — Incident Tickets
import TicketListPage from './pages/incidents/TicketListPage'
import CreateTicketPage from './pages/incidents/CreateTicketPage'
import TicketDetailPage from './pages/incidents/TicketDetailPage'

import { Toaster } from 'react-hot-toast'

// ── Protected Layout ─────────────────────────────────────
function AppLayout() {
  const { user } = useAuth()

  // Protect all routes inside this layout
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">
        <Routes>
          {/* Existing routes */}
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h1>Dashboard</h1>
              <p>Welcome to Smart Campus!</p>
            </div>
          } />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Tickets (merged) */}
          <Route path="/tickets" element={<TicketListPage />} />
          <Route path="/tickets/create" element={<CreateTicketPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />

          {/* Default fallback */}
          <Route path="*" element={<Navigate to="/resources" replace />} />
        </Routes>
      </div>
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App