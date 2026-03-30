import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// URL бэкенда для API-запросов.
// В Vite переменные окружения доступны через import.meta.env.
// Содержимое задаётся в файле frontend/.env как VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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

  // Сохраняем данные пользователя и JWT в localStorage,
  // чтобы пользователь оставался залогинен при перезагрузке страницы.
  const saveAuth = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    localStorage.setItem('authToken', accessToken);
  };

  // Очистка авторизации: удаляем токен и данные пользователя.
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
