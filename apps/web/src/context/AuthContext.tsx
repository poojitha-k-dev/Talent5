'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@talent5/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session in local storage / cookies on mount
    const savedToken = localStorage.getItem('talent5_token');
    const savedUser = localStorage.getItem('talent5_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        // Asynchronously verify token validity with server
        fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => {
            if (res.status === 401) {
              // Token expired or invalid on server: clear session
              setToken(null);
              setUser(null);
              localStorage.removeItem('talent5_token');
              localStorage.removeItem('talent5_user');
              document.cookie = 'talent5_token=; path=/; max-age=0; SameSite=Lax';
            } else if (res.ok) {
              return res.json();
            }
          })
          .then((data) => {
            if (data?.data?.user) {
              setUser(data.data.user);
              localStorage.setItem('talent5_user', JSON.stringify(data.data.user));
            }
          })
          .catch(() => {
            // Keep optimistic session if offline / network error
          });
      } catch {
        localStorage.removeItem('talent5_token');
        localStorage.removeItem('talent5_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('talent5_token', newToken);
    localStorage.setItem('talent5_user', JSON.stringify(newUser));
    document.cookie = `talent5_token=${newToken}; path=/; max-age=604800; SameSite=Lax`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('talent5_token');
    localStorage.removeItem('talent5_user');
    document.cookie = 'talent5_token=; path=/; max-age=0; SameSite=Lax';
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.user) {
          setUser(data.data.user);
          localStorage.setItem('talent5_user', JSON.stringify(data.data.user));
        }
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
