import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', fullName: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register, loginWithOAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-grid">
        <div className="auth-hero">
          <div className="auth-hero-content">
            <div className="auth-logo">
              <span className="auth-logo-icon">🛍</span>
              <span className="auth-logo-text">ShopWise</span>
            </div>
            <h1 className="auth-hero-title">
              Join millions<br />
              <em>of shoppers</em>
            </h1>
            <p className="auth-hero-sub">
              Create your free account and start exploring the best deals across every category.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['🔒 Secure JWT + OAuth2 authentication', '🛡 Role-based access control', '📦 16+ product categories', '⚡ Fast, modern React interface'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 15 }}>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-form-container fade-in-up">
            <h2 className="auth-form-title">Create account</h2>
            <p className="auth-form-sub">Start your ShopWise journey today</p>

            <div className="sso-buttons">
              <button className="sso-btn" onClick={() => loginWithOAuth('google')}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.3 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-2.7-11.3-6.6l-6.6 4.9C9.7 39.6 16.4 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C41.3 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
                </svg>
                Sign up with Google
              </button>
            </div>

            <div className="auth-divider"><span>or register with email</span></div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange}
                  className="form-input" placeholder="Your full name" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input name="username" value={form.username} onChange={handleChange}
                    className="form-input" placeholder="username" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" value={form.email} onChange={handleChange}
                    type="email" className="form-input" placeholder="you@example.com" required />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" value={form.password} onChange={handleChange}
                  type="password" className="form-input" placeholder="Minimum 6 characters" required minLength={6} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                {loading ? <span className="spinner" style={{width:18,height:18,borderWidth:2}} /> : null}
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
