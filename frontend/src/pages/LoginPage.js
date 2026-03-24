import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, loginWithOAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      toast.success(`Welcome back, ${data.fullName || data.username}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setForm(role === 'admin'
      ? { username: 'admin', password: 'Admin@123' }
      : { username: 'user', password: 'User@123' });
  };

  return (
    <div className="auth-bg">
      <div className="auth-grid">
        {/* Left panel */}
        <div className="auth-hero">
          <div className="auth-hero-content">
            <div className="auth-logo">
              <span className="auth-logo-icon">🛍</span>
              <span className="auth-logo-text">ShopWise</span>
            </div>
            <h1 className="auth-hero-title">
              Your smart<br />
              <em>shopping hub</em>
            </h1>
            <p className="auth-hero-sub">
              Millions of products. Role-based access control. Secure SSO login.
            </p>
            <div className="auth-demo-cards">
              <button className="demo-card" onClick={() => fillDemo('admin')}>
                <span className="demo-icon">👑</span>
                <div>
                  <div className="demo-label">Admin Account</div>
                  <div className="demo-creds">admin / Admin@123</div>
                </div>
              </button>
              <button className="demo-card" onClick={() => fillDemo('user')}>
                <span className="demo-icon">👤</span>
                <div>
                  <div className="demo-label">User Account</div>
                  <div className="demo-creds">user / User@123</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-panel">
          <div className="auth-form-container fade-in-up">
            <h2 className="auth-form-title">Sign in</h2>
            <p className="auth-form-sub">Enter your credentials or use SSO</p>

            {/* SSO Buttons */}
            <div className="sso-buttons">
              <button className="sso-btn" onClick={() => loginWithOAuth('google')}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.3 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-2.7-11.3-6.6l-6.6 4.9C9.7 39.6 16.4 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C41.3 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
                </svg>
                Continue with Google
              </button>
              <button className="sso-btn" onClick={() => loginWithOAuth('github')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.71c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.12 2.5.35 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12C22 6.48 17.52 2 12 2z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div className="auth-divider"><span>or sign in with username</span></div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  name="username" value={form.username} onChange={handleChange}
                  className="form-input" placeholder="Enter your username"
                  required autoComplete="username"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  name="password" value={form.password} onChange={handleChange}
                  type="password" className="form-input" placeholder="Enter your password"
                  required autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                {loading ? <span className="spinner" style={{width:18,height:18,borderWidth:2}} /> : null}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
