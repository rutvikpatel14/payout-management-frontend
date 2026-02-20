'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from '@/lib/api';

const TOKEN_KEY = 'payout_token';
const USER_KEY = 'payout_user';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ error?: string; message?: string }>;
  logout: () => void;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      const u = localStorage.getItem(USER_KEY);
      if (t && u) {
        setTokenState(t);
        setUserState(JSON.parse(u) as User);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    try {
      if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
      else localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  }, []);

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { api } = await import('@/lib/api');
      const res = await api.login(email, password);
      if (res.error) return { error: res.error, message: res.message };
      if (res.data?.token && res.data?.user) {
        setToken(res.data.token);
        setUser(res.data.user);
        return {};
      }
      return { error: 'Login failed', message: 'Unknown error' };
    },
    [setToken, setUser]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken, setUser]);

  const value: AuthContextValue = {
    user: hydrated ? user : null,
    token: hydrated ? token : null,
    login,
    logout,
    setUser,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
