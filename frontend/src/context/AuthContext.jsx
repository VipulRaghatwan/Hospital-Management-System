import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medflow_user');
    return saved ? JSON.parse(saved) : { id: 1, username: 'admin', role: 'Hospital Administrator' };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check session with backend if possible
    api.getMe()
      .then((data) => {
        if (data && data.authenticated && data.user) {
          setUser(data.user);
          localStorage.setItem('medflow_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Fallback to local stored session
      });
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await api.login(username, password);
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('medflow_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      // Local fallback for demo convenience if offline
      if (username === 'admin' && password === 'admin123') {
        const adminUser = { id: 1, username: 'admin', role: 'Hospital Administrator' };
        setUser(adminUser);
        localStorage.setItem('medflow_user', JSON.stringify(adminUser));
        return { success: true };
      }
      const msg = err.response?.data?.message || 'Invalid username or password';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('medflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
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
