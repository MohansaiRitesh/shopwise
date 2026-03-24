import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * OAuth2Callback — handles the redirect from Spring after SSO login.
 * Spring redirects to /oauth2/callback?token=...&username=...&role=...
 * We store the JWT and redirect to the dashboard.
 */
export default function OAuth2Callback() {
  const [params] = useSearchParams();
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const username = params.get('username');
    const role = params.get('role');

    if (token) {
      handleOAuthCallback(token, username, role);
      toast.success(`Welcome, ${username}!`);
      navigate('/dashboard', { replace: true });
    } else {
      toast.error('SSO login failed. Please try again.');
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="page-loader">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Completing sign in…</p>
      </div>
    </div>
  );
}
