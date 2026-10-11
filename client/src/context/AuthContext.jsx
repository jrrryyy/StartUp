import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on app mount
  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setBusiness(res.data.business);
      }
    } catch (err) {
      setUser(null);
      setBusiness(null);
      localStorage.removeItem('startup_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    const res = await api.post('/auth/login', { email, password, rememberMe });
    if (res.data.success) {
      if (res.data.accessToken) {
        localStorage.setItem('startup_token', res.data.accessToken);
      }
      setUser(res.data.user);
      setBusiness(res.data.business);
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    // If auto-logged in (rare when verification is mandatory), store token
    if (res.data.accessToken) {
      localStorage.setItem('startup_token', res.data.accessToken);
      setUser(res.data.user);
      setBusiness(res.data.business);
    }
    return res.data;
  };

  const googleLogin = async (credential, googleUser) => {
    const res = await api.post('/auth/google', { credential, googleUser });
    if (res.data.success) {
      if (res.data.accessToken) {
        localStorage.setItem('startup_token', res.data.accessToken);
      }
      setUser(res.data.user);
      setBusiness(res.data.business);
    }
    return res.data;
  };

  const verifyEmail = async (token) => {
    const res = await api.post('/auth/verify-email', { token });
    if (res.data.success) {
      if (res.data.accessToken) {
        localStorage.setItem('startup_token', res.data.accessToken);
      }
      if (res.data.user) {
        setUser(res.data.user);
        setBusiness(res.data.business);
      }
    }
    return res.data;
  };

  const resendVerification = async (email) => {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Continue client-side clear
    } finally {
      setUser(null);
      setBusiness(null);
      localStorage.removeItem('startup_token');
    }
  };

  const updateBusinessState = (updatedBusiness) => {
    setBusiness(updatedBusiness);
  };

  const isOwner = user?.role === 'owner';
  const isCashier = user?.role === 'cashier';

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        loading,
        login,
        register,
        googleLogin,
        verifyEmail,
        resendVerification,
        logout,
        checkAuth,
        updateBusinessState,
        isOwner,
        isCashier,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
