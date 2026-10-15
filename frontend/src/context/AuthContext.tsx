import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role?: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('opscopilot_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('opscopilot_token');
      if (savedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired, clearing token');
          localStorage.removeItem('opscopilot_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
    }
  };

  const register = async (name: string, email: string, pass: string, role = 'sre_engineer') => {
    const res = await api.register(name, email, pass, role);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
    }
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
