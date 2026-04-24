import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler'
import Navbar from './components/Navbar'
import ResourcesPage from './pages/ResourcesPage'
import BookingsPage from './pages/BookingsPage'
import { Toaster } from 'react-hot-toast'

//  Layout with Navbar
function AppLayout() {
  const { user } = useAuth()

  // protect routes
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="*" element={<Navigate to="/resources" replace />} />
        </Routes>
      </div>
    </div>
  )
}

// Main App
function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Protected (with Navbar) */}
          <Route path="/*" element={<AppLayout />} />

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App