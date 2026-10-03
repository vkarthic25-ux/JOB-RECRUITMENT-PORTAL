import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('talent_ai_token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user and profile
  const fetchCurrentUser = useCallback(async () => {
    const currentToken = localStorage.getItem('talent_ai_token');
    if (!currentToken) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Authentication token verification failed:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('talent_ai_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        await fetchCurrentUser();
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  // Register handler
  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      if (res.data.success) {
        localStorage.setItem('talent_ai_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        await fetchCurrentUser();
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please check your details.',
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('talent_ai_token');
    localStorage.removeItem('talent_ai_user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  // 1-Click Quick Demo Login Helper
  const quickLogin = async (role = 'candidate') => {
    let email = 'candidate@example.com';
    if (role === 'recruiter') email = 'recruiter@example.com';
    if (role === 'admin') email = 'admin@example.com';

    return await login(email, 'Password123!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        isAuthenticated: !!user,
        isCandidate: user?.role === 'candidate',
        isRecruiter: user?.role === 'recruiter',
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        quickLogin,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
