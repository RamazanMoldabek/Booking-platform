


import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from './apiConfig';




const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('authUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  
  
  const saveAuth = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    localStorage.setItem('authToken', accessToken);
  };

  
  const clearAuth = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common.Authorization;
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, payload);
      saveAuth(response.data.user, response.data.token);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, payload);
      saveAuth(response.data.user, response.data.token);
      return response;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout: clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
