import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi, userApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback(async (username, password) => {
    const { data } = await authApi.login({ username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    await authApi.register(formData);
  }, []);

  const loginWithOAuth = useCallback((provider) => {
    // Uses environment variable in production, falls back to localhost for dev
    const apiBase = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';
    const redirectUri = `${window.location.origin}/oauth2/callback`;
    window.location.href = `${apiBase}/oauth2/authorize/${provider}?redirect_uri=${redirectUri}`;
  }, []);

  const handleOAuthCallback = useCallback((token, username, role) => {
    const userData = { token, username, role };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await userApi.getProfile();
      const updated = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch {}
  }, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{
      user, token, isAdmin, isAuthenticated,
      login, register, logout, loginWithOAuth, handleOAuthCallback, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};