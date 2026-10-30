import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authApi, subscribeAuthEvent } from '../services/api';

const AuthContext = createContext(null);

export function decodeJwt(token) {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('auth_access_token') || null);
  const [refreshTokenVal, setRefreshTokenVal] = useState(() => localStorage.getItem('auth_refresh_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenTimeLeft, setTokenTimeLeft] = useState(null);

  // Decoded payload
  const decodedToken = useMemo(() => decodeJwt(accessToken), [accessToken]);

  // Expiration countdown effect
  useEffect(() => {
    if (!decodedToken?.exp) {
      setTokenTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const remaining = decodedToken.exp - nowInSeconds;
      setTokenTimeLeft(remaining > 0 ? remaining : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [decodedToken]);

  // Sync state with storage helper
  const saveAuthSession = useCallback((userData, access, refresh) => {
    setUser(userData);
    setAccessToken(access);
    if (userData) localStorage.setItem('auth_user', JSON.stringify(userData));
    if (access) localStorage.setItem('auth_access_token', access);
    if (refresh) {
      setRefreshTokenVal(refresh);
      localStorage.setItem('auth_refresh_token', refresh);
    }
  }, []);

  const clearAuthSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshTokenVal(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_refresh_token');
  }, []);

  // Listen to axios interceptor events
  useEffect(() => {
    const unsubscribe = subscribeAuthEvent((event, data) => {
      if (event === 'TOKEN_REFRESHED' && data?.accessToken) {
        setAccessToken(data.accessToken);
      } else if (event === 'LOGOUT') {
        clearAuthSession();
      }
    });
    return unsubscribe;
  }, [clearAuthSession]);

  // Initial session verification
  useEffect(() => {
    async function verifyInitialSession() {
      const token = localStorage.getItem('auth_access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        setUser(res.data.user);
        localStorage.setItem('auth_user', JSON.stringify(res.data.user));
      } catch (err) {
        // If access token failed, try silent refresh
        try {
          const storedRefresh = localStorage.getItem('auth_refresh_token');
          const refreshRes = await authApi.refresh({ refreshToken: storedRefresh });
          saveAuthSession(refreshRes.data.user, refreshRes.data.accessToken, storedRefresh);
        } catch {
          clearAuthSession();
        }
      } finally {
        setIsLoading(false);
      }
    }

    verifyInitialSession();
  }, [saveAuthSession, clearAuthSession]);

  // Login method
  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user: userData, accessToken: access, refreshToken: refresh } = res.data;
    saveAuthSession(userData, access, refresh);
    return res.data;
  };

  // Register method
  const register = async (name, email, password, role = 'user') => {
    const res = await authApi.register({ name, email, password, role });
    const { user: userData, accessToken: access, refreshToken: refresh } = res.data;
    saveAuthSession(userData, access, refresh);
    return res.data;
  };

  // Logout method
  const logout = async () => {
    try {
      await authApi.logout({ refreshToken: refreshTokenVal });
    } catch (e) {
      console.warn('Backend logout notification skipped:', e.message);
    } finally {
      clearAuthSession();
    }
  };

  // Manual silent refresh trigger (for educational playground)
  const forceRefreshToken = async () => {
    const res = await authApi.refresh({ refreshToken: refreshTokenVal });
    setAccessToken(res.data.accessToken);
    localStorage.setItem('auth_access_token', res.data.accessToken);
    return res.data;
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.user);
      localStorage.setItem('auth_user', JSON.stringify(res.data.user));
    } catch (e) {
      console.error('Failed to reload user:', e);
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken: refreshTokenVal,
    role: user?.role || null,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    decodedToken,
    tokenTimeLeft,
    login,
    register,
    logout,
    refreshUser,
    forceRefreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

