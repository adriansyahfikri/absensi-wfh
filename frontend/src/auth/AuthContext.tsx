import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { JwtPayload } from '../api/types';

const STORAGE_KEY = 'wfh_token';

function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const decoded = JSON.parse(json) as JwtPayload;
    if (decoded.exp * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  token: string | null;
  user: JwtPayload | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  const user = useMemo(() => (token ? decodeToken(token) : null), [token]);

  useEffect(() => {
    // A garbage or expired token decodes to null — clear it so we don't loop.
    if (token && !user) {
      setToken(null);
      return;
    }
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  }, [token, user]);

  async function login(username: string, password: string) {
    const { accessToken } = await api.post<{ accessToken: string }>('/auth/login', {
      username,
      password,
    });
    setToken(accessToken);
  }

  function logout() {
    setToken(null);
  }

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
