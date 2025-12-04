import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios interceptor to add token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const { data } = await axios.get('/auth/me');
          setUser(data.user);
        }
      } catch {
        localStorage.removeItem('token');
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const signup = async (payload) => {
    const { data } = await axios.post('/auth/signup', payload);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await axios.post('/auth/logout');
    localStorage.removeItem('token');
    setUser(null);
  };

  const deleteAccount = async () => {
    await axios.delete('/auth/delete-account');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, signup, logout, deleteAccount }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() { return useContext(AuthCtx); }
