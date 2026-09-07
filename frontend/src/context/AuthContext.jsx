import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('careerpilot_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore session on initial load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          // Token invalid or user not found
          logout();
        }
      } catch (error) {
        console.error('Failed to restore user session:', error.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success && response.data?.token) {
        const receivedToken = response.data.token;
        const receivedUser = response.data.user;

        localStorage.setItem('careerpilot_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Invalid credentials',
      };
    }
  };

  // Register handler
  const register = async ({ name, email, password, role }) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      });

      if (response.success && response.data?.token) {
        const receivedToken = response.data.token;
        const receivedUser = response.data.user;

        localStorage.setItem('careerpilot_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('careerpilot_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
