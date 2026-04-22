import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const urlError = searchParams.get('error');

    if (token) {
      // Save token
      localStorage.setItem('jwt_token', token);

      // Fetch user profile from the backend
      api.get('/auth/me')
        .then(response => {
          login(response.data);
          navigate('/dashboard', { replace: true });
        })
        .catch(err => {
          console.error('Failed to fetch user profile after OAuth login:', err);
          setError('Failed to fetch user profile. Please try logging in again.');
          // Clean up token just in case
          localStorage.removeItem('jwt_token');
          
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
        });
    } else {
      setError(urlError || 'Authentication failed. No token received.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  }, [searchParams, navigate, login]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f0ff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '400px' }}>
        {error ? (
          <>
            <div style={{ color: '#dc2626', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Login Error</div>
            <p style={{ color: '#4b5563', fontSize: '14px' }}>{error}</p>
            <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '20px' }}>Redirecting to login...</p>
          </>
        ) : (
          <>
            <div style={{ width: '40px', height: '40px', border: '3px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>Authenticating...</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Please wait while we log you in.</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </>
        )}
      </div>
    </div>
  );
}
