import React from 'react'
import Lottie from 'lottie-react'
import loginAnimation from '../assets/Login.json'

export default function LoginPage() {
  const doGoogleLogin = () => {
    window.location.href = 'http://localhost:8082/oauth2/authorization/google'
  }

  return (
    <div className="login-page-container">
      {/* Left Panel */}
      <div className="login-left" style={{ position: 'relative' }}>
        {/* Background Decorative Blobs */}
        <div className="bg-blob bg-blob-1 animate-fade-up"></div>
        <div className="bg-blob bg-blob-2 animate-fade-up delay-300"></div>

        <div className="login-logo animate-fade-up" style={{ position: 'relative', zIndex: 10 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="10" height="10" fill="#6d4bbf" />
            <rect x="12" width="10" height="10" fill="#a482dd" />
            <rect y="12" width="10" height="10" fill="#8b5cf6" />
          </svg>
          Smart Campus Hub
        </div>

        <div className="login-form-wrapper" style={{ alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          
          <div className="login-badge animate-fade-up delay-100">
            Hub Access Portal
          </div>

          <h1 className="login-title animate-fade-up delay-100" style={{ fontSize: '42px', marginBottom: '12px' }}>
            Welcome to Campus
          </h1>
          
          <p className="login-subtitle animate-fade-up delay-200" style={{ fontSize: '16px', marginBottom: '40px', maxWidth: '320px', lineHeight: '1.5' }}>
            Sign in with your university account to access resources, bookings, and campus services.
          </p>

          <div className="animate-fade-up delay-300" style={{ width: '100%' }}>
            <button type="button" onClick={doGoogleLogin} className="btn-google-premium">
              <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="social-proof animate-fade-up delay-300">
            <div className="avatar-group">
              <div className="avatar" style={{ backgroundImage: 'url(https://i.pravatar.cc/100?img=1)' }}></div>
              <div className="avatar" style={{ backgroundImage: 'url(https://i.pravatar.cc/100?img=5)' }}></div>
              <div className="avatar" style={{ backgroundImage: 'url(https://i.pravatar.cc/100?img=8)' }}></div>
              <div className="avatar" style={{ backgroundImage: 'url(https://i.pravatar.cc/100?img=12)' }}></div>
            </div>
            <div className="social-text">
              Join <strong>5,000+</strong> students and faculty
            </div>
          </div>

        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        
        {/* Floating Glass Widget 1 */}
        <div className="glass-widget widget-1">
          <div className="glass-widget-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="glass-widget-content">
            <h4>Resource Booked</h4>
            <p>Study Room A confirmed</p>
          </div>
        </div>

        {/* Floating Glass Widget 2 */}
        <div className="glass-widget widget-2">
          <div className="glass-widget-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <div className="glass-widget-content">
            <h4>Campus News</h4>
            <p>3 New Announcements</p>
          </div>
        </div>

        <div className="login-lottie-container" style={{ position: 'relative', zIndex: 10 }}>
          {typeof Lottie === 'function' ? (
            <Lottie animationData={loginAnimation} loop={true} />
          ) : Lottie && typeof Lottie.default === 'function' ? (
            <Lottie.default animationData={loginAnimation} loop={true} />
          ) : (
            <div>Loading animation...</div>
          )}
        </div>
      </div>
    </div>
  )
}
