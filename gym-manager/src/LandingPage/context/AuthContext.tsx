// src/LandingPage/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';

export type User = { 
  id: string;
  name: string; 
  email: string; 
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário do sessionStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = sessionStorage.getItem('auth_user');
        if (raw) {
          const stored = JSON.parse(raw);
          setUser(stored);
          
          // Validar se usuário ainda existe no Supabase
          const { data } = await supabase
            .from('users')
            .select('id, email, name, role')
            .eq('id', stored.id)
            .single();

          if (!data) {
            // Usuário não existe mais, fazer logout
            sessionStorage.removeItem('auth_user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar usuário:', error);
        sessionStorage.removeItem('auth_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (u: User) => {
    setUser(u);
    try { 
      sessionStorage.setItem('auth_user', JSON.stringify(u)); 
    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error);
    }
  };

  const logout = () => {
    setUser(null);
    try { 
      sessionStorage.removeItem('auth_user'); 
    } catch (error) {
      console.error('❌ Erro ao remover usuário:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};