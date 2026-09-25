import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, prosumerAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Verify token is still valid by fetching profile (only for Prosumers)
        if (parsedUser.role === 'Prosumer') {
          try {
            const response = await prosumerAPI.getProfile();
            if (response.success) {
              // Merge profile data with role to preserve role information
              const userWithRole = { ...response.data, role: parsedUser.role };
              setUser(userWithRole);
              localStorage.setItem('user', JSON.stringify(userWithRole));
            }
          } catch (error) {
            // Token is invalid, clear storage
            logout();
          }
        }
        // For Backoffice and GridOperator, we trust the stored user data since they don't have a profile endpoint
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
        
        // For prosumers, fetch profile data
        if (role === 'Prosumer') {
          try {
            const profileResponse = await prosumerAPI.getProfile();
            if (profileResponse.success) {
              // Merge profile data with role to preserve role information
              const userWithRole = { ...profileResponse.data, role };
              setUser(userWithRole);
              localStorage.setItem('user', JSON.stringify(userWithRole));
            } else {
              // Fallback to basic user info if profile fetch fails
              const basicUser = { id: userId, email, role };
              setUser(basicUser);
              localStorage.setItem('user', JSON.stringify(basicUser));
            }
          } catch (error) {
            // Fallback to basic user info if profile fetch fails
            const basicUser = { id: userId, email, role };
            setUser(basicUser);
            localStorage.setItem('user', JSON.stringify(basicUser));
          }
        } else {
          // For other roles, store basic user info
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

  const isProsumer = () => user?.role === 'Prosumer';
  const isBackoffice = () => user?.role === 'Backoffice';
  const isGridOperator = () => user?.role === 'GridOperator';

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