import React, { createContext, useContext, useState, ReactNode } from 'react';

export type User = { id?: string; name?: string; email?: string; role?: string };

type AuthContextType = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = (u: User) => {
    setUser(u);
    try { localStorage.setItem('auth_user', JSON.stringify(u)); } catch {}
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem('auth_user'); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
