import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Default pre-configured accounts
export const DEFAULT_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'Administrator',
    role: 'System Administrator',
    badge: 'HQ-ADMIN',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    username: 'analyst',
    password: 'analyst123',
    name: 'Sarah Chen',
    role: 'Lead Spatial Analyst',
    badge: 'SPATIAL-01',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    username: 'vertex_user',
    password: 'vertex2025',
    name: 'Surveyor Operator',
    role: 'GIS & Spatial Surveyor',
    badge: 'FIELD-OPS',
    avatarColor: 'from-emerald-500 to-teal-600',
  }
];

const AUTH_STORAGE_KEY = 'vertex_auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState(null);

  // Synchronize localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth session', e);
    }
  }, [user]);

  const login = useCallback(async ({ username, password, captchaInput, actualCaptcha }) => {
    setAuthError(null);

    // Validate empty inputs
    if (!username?.trim() || !password?.trim()) {
      const err = 'Please enter both username and password.';
      setAuthError(err);
      return { success: false, error: err };
    }

    if (!captchaInput?.trim()) {
      const err = 'Please enter the CAPTCHA code.';
      setAuthError(err);
      return { success: false, error: err };
    }

    // Validate CAPTCHA (case-insensitive for good user experience)
    if (captchaInput.trim().toUpperCase() !== actualCaptcha?.trim().toUpperCase()) {
      const err = 'Invalid CAPTCHA security code. Please try again.';
      setAuthError(err);
      return { success: false, error: err, errorType: 'captcha' };
    }

    // Check credentials against default accounts
    const matched = DEFAULT_USERS.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (!matched) {
      const err = 'Invalid username or password.';
      setAuthError(err);
      return { success: false, error: err, errorType: 'credentials' };
    }

    // Authentication Success
    const authSession = {
      username: matched.username,
      name: matched.name,
      role: matched.role,
      badge: matched.badge,
      avatarColor: matched.avatarColor,
      loginTime: new Date().toISOString(),
    };

    setUser(authSession);
    return { success: true, user: authSession };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthError(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    authError,
    clearAuthError,
    defaultUsers: DEFAULT_USERS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
