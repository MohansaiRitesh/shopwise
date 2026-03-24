import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Navbar.css';

export default function Navbar({ onSearch }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVal, setSearchVal] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchVal.trim());
  };

  const avatarUrl = user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'U')}&background=6366f1&color=fff`;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Brand */}
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">🛍</span>
          <span className="brand-name">ShopWise</span>
        </Link>

        {/* Search */}
        {location.pathname === '/dashboard' && (
          <form className="navbar-search" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search products, brands…"
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                if (e.target.value === '' && onSearch) onSearch('');
              }}
            />
            {searchVal && (
              <button type="button" className="search-clear"
                onClick={() => { setSearchVal(''); if (onSearch) onSearch(''); }}>✕</button>
            )}
          </form>
        )}

        {/* Right actions */}
        <div className="navbar-right">
          {isAdmin && (
            <span className="badge badge-admin" style={{ padding: '4px 12px' }}>
              👑 Admin
            </span>
          )}

          <div className="navbar-avatar-wrap" onClick={() => setMenuOpen(!menuOpen)}>
            <img src={avatarUrl} alt="avatar" className="navbar-avatar" />
            <span className="navbar-username">{user?.username}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>▾</span>
          </div>

          {menuOpen && (
            <div className="navbar-dropdown">
              <div className="dropdown-header">
                <img src={avatarUrl} alt="avatar" className="dropdown-avatar" />
                <div>
                  <div className="dropdown-name">{user?.fullName || user?.username}</div>
                  <div className="dropdown-role">{isAdmin ? 'Administrator' : 'Shopper'}</div>
                </div>
              </div>
              <div className="dropdown-divider" />
              <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                👤 My Profile
              </Link>
              <div className="dropdown-divider" />
              <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                🚪 Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
