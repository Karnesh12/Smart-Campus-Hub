import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const API_BASE = 'http://localhost:8082';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const urlError = searchParams.get('error')

    if (token) {
      // Store token
      localStorage.setItem('jwt_token', token)

      // OPTIONAL but recommended: set header for this session
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Fetch user profile
      api.get('/auth/me')
        .then(res => {
          login(res.data)
          navigate('/dashboard', { replace: true })
        })
        .catch(err => {
          console.error('Failed to fetch user profile after OAuth login:', err)

          setError('Failed to fetch user profile. Please try logging in again.')

          // Cleanup
          localStorage.removeItem('jwt_token')
          delete api.defaults.headers.common['Authorization']

          setTimeout(() => {
            navigate('/login', { replace: true })
          }, 3000)
        })

    } else {
      setError(urlError || 'Authentication failed. No token received.')

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
    }
  }, [searchParams, navigate, login])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f0ff',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        {error ? (
          <>
            <div style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '10px' }}>
              Login Error
            </div>
            <p>{error}</p>
            <p style={{ fontSize: '12px', marginTop: '20px' }}>
              Redirecting to login...
            </p>
          </>
        ) : (
          <>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #8b5cf6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <h2>Authenticating...</h2>
            <p>Please wait while we log you in.</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </>
        )}
      </div>
    </div>
  )
}