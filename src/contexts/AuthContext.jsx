import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, prosumerAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {

    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        if (parsedUser.role === 'Prosumer') {
          try {
            const response = await prosumerAPI.getProfile();
            if (response.success) {

              const userWithRole = { ...response.data, role: parsedUser.role };
              setUser(userWithRole);
              localStorage.setItem('user', JSON.stringify(userWithRole));
            }
          } catch (error) {

            logout();
          }
        }

      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);

      if (response.success) {
        const { token, userId, role } = response.data;

        setToken(token);
        localStorage.setItem('token', token);

        if (role === 'Prosumer') {
          try {
            const profileResponse = await prosumerAPI.getProfile();
            if (profileResponse.success) {

              const userWithRole = { ...profileResponse.data, role };
              setUser(userWithRole);
              localStorage.setItem('user', JSON.stringify(userWithRole));
            } else {

              const basicUser = { id: userId, email, role };
              setUser(basicUser);
              localStorage.setItem('user', JSON.stringify(basicUser));
            }
          } catch (error) {

            const basicUser = { id: userId, email, role };
            setUser(basicUser);
            localStorage.setItem('user', JSON.stringify(basicUser));
          }
        } else {

          const basicUser = { id: userId, email, role };
          setUser(basicUser);
          localStorage.setItem('user', JSON.stringify(basicUser));
        }

        return { success: true, role };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const isProsumer = () => {
    const role = (user?.role || '').toLowerCase().replace(/[\s_]+/g, '');
    return role === 'prosumer';
  };
  const isBackoffice = () => {
    const role = (user?.role || '').toLowerCase().replace(/[\s_]+/g, '');
    return role === 'backoffice' || role === 'admin';
  };
  const isGridOperator = () => {
    const role = (user?.role || '').toLowerCase().replace(/[\s_]+/g, '');
    return role === 'gridoperator' || role === 'operator';
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isProsumer,
    isBackoffice,
    isGridOperator,
    isAuthenticated: !!user,
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