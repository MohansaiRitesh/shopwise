import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { isAdmin, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '', email: '', bio: '', phone: '', avatarUrl: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await userApi.getProfile();
        setProfile(data);
        setProfileForm({
          fullName: data.fullName || '',
          email: data.email || '',
          bio: data.bio || '',
          phone: data.phone || '',
          avatarUrl: data.avatarUrl || ''
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleProfileChange = (e) =>
    setProfileForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const { data } = await userApi.updateProfile(profileForm);
      setProfile(data);
      await refreshProfile();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePwChange = (e) =>
    setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    try {
      await userApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return (
    <div className="dashboard">
      <Navbar />
      <div className="page-loader" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  const avatarUrl = profile?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'U')}&size=200&background=6366f1&color=fff`;

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="dashboard">
      <Navbar />
      <div className="profile-body container">

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="profile-sidebar fade-in">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrap">
              <img src={avatarUrl} alt="avatar" className="profile-avatar" />
              <div className={`profile-role-dot ${isAdmin ? 'admin' : 'user'}`} />
            </div>
            <h2 className="profile-name">{profile?.fullName || profile?.username}</h2>
            <p className="profile-username">@{profile?.username}</p>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
              {isAdmin ? '👑 Administrator' : '👤 Shopper'}
            </span>
            {profile?.provider && (
              <div className="profile-provider">
                <span>SSO via {profile.provider}</span>
              </div>
            )}
          </div>

          <div className="profile-meta">
            {profile?.email && (
              <div className="meta-item">
                <span className="meta-icon">✉️</span>
                <span>{profile.email}</span>
              </div>
            )}
            {profile?.phone && (
              <div className="meta-item">
                <span className="meta-icon">📞</span>
                <span>{profile.phone}</span>
              </div>
            )}
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>Joined {joinedDate}</span>
            </div>
          </div>

          {profile?.bio && (
            <div className="profile-bio">
              <p>{profile.bio}</p>
            </div>
          )}

          <button className="btn btn-outline w-full" style={{ justifyContent: 'center' }}
            onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </aside>

        {/* ── Main content ──────────────────────────────────── */}
        <main className="profile-main fade-in">
          {/* Tabs */}
          <div className="profile-tabs">
            {['profile', 'security', 'account'].map(tab => (
              <button key={tab}
                className={`tab-btn ${activeTab === tab ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab)}>
                {tab === 'profile' ? '👤 Profile' : tab === 'security' ? '🔒 Security' : '⚙️ Account'}
              </button>
            ))}
          </div>

          {/* ── Profile Tab ─────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="card fade-in">
              <h3 className="tab-section-title">Personal Information</h3>
              <p className="tab-section-sub">Update your profile details and public information.</p>

              <form onSubmit={handleProfileSave} className="profile-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input name="fullName" value={profileForm.fullName}
                      onChange={handleProfileChange} className="form-input"
                      placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input name="email" value={profileForm.email}
                      onChange={handleProfileChange} type="email" className="form-input"
                      placeholder="you@example.com" />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input name="phone" value={profileForm.phone}
                      onChange={handleProfileChange} className="form-input"
                      placeholder="+91 98765 43210" />
                  </div>
                  <div className="form-group">
                    <label>Avatar URL</label>
                    <input name="avatarUrl" value={profileForm.avatarUrl}
                      onChange={handleProfileChange} className="form-input"
                      placeholder="https://…/photo.jpg" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea name="bio" value={profileForm.bio}
                    onChange={handleProfileChange} className="form-input" rows={3}
                    placeholder="Tell us a bit about yourself…" />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                    {profileSaving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
                    {profileSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Security Tab ────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="card fade-in">
              <h3 className="tab-section-title">Change Password</h3>
              <p className="tab-section-sub">
                {profile?.provider
                  ? 'You signed in with SSO. Password change is not available for OAuth2 accounts.'
                  : 'Use a strong password with at least 6 characters.'}
              </p>

              {profile?.provider ? (
                <div className="sso-notice">
                  <span className="sso-notice-icon">🔗</span>
                  <div>
                    <strong>Connected via {profile.provider}</strong>
                    <p>Your account authentication is managed by your SSO provider.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePwSave} className="profile-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input name="currentPassword" value={pwForm.currentPassword}
                      onChange={handlePwChange} type="password" className="form-input"
                      placeholder="Your current password" required />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>New Password</label>
                      <input name="newPassword" value={pwForm.newPassword}
                        onChange={handlePwChange} type="password" className="form-input"
                        placeholder="New password" required minLength={6} />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input name="confirm" value={pwForm.confirm}
                        onChange={handlePwChange} type="password" className="form-input"
                        placeholder="Confirm new password" required minLength={6} />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                      {pwSaving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
                      {pwSaving ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── Account Tab ─────────────────────────────────── */}
          {activeTab === 'account' && (
            <div className="card fade-in">
              <h3 className="tab-section-title">Account Settings</h3>
              <p className="tab-section-sub">Manage your account preferences and role information.</p>

              <div className="account-info-grid">
                <div className="account-info-item">
                  <div className="account-info-label">Username</div>
                  <div className="account-info-value">@{profile?.username}</div>
                </div>
                <div className="account-info-item">
                  <div className="account-info-label">Account Role</div>
                  <div className="account-info-value">
                    <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
                      {isAdmin ? '👑 Admin' : '👤 User'}
                    </span>
                  </div>
                </div>
                <div className="account-info-item">
                  <div className="account-info-label">Auth Method</div>
                  <div className="account-info-value">
                    {profile?.provider ? `SSO — ${profile.provider}` : 'Local (username + password)'}
                  </div>
                </div>
                <div className="account-info-item">
                  <div className="account-info-label">Member Since</div>
                  <div className="account-info-value">{joinedDate}</div>
                </div>
              </div>

              <div className="rbac-explainer">
                <h4>Your Access Level</h4>
                {isAdmin ? (
                  <ul className="access-list">
                    <li className="access-yes">✅ View all products</li>
                    <li className="access-yes">✅ Create new products</li>
                    <li className="access-yes">✅ Edit existing products</li>
                    <li className="access-yes">✅ Delete products</li>
                    <li className="access-yes">✅ View all users</li>
                  </ul>
                ) : (
                  <ul className="access-list">
                    <li className="access-yes">✅ View all products</li>
                    <li className="access-yes">✅ Search and filter products</li>
                    <li className="access-no">🚫 Create products (Admin only)</li>
                    <li className="access-no">🚫 Edit products (Admin only)</li>
                    <li className="access-no">🚫 Delete products (Admin only)</li>
                  </ul>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
