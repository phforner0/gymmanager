// gymmanager/src/LandingPage/services/auth.service.ts
import { User } from '../types'; // ✅ Importar do types local

const mockUsers: Array<{ id: string; name: string; email: string; password: string; role: 'admin' | 'user' }> = [
  { id: '1', name: 'Admin Impacto', email: 'admin@impacto.com', password: 'admin123', role: 'admin' },
  { id: '2', name: 'Usuário Teste', email: 'user@impacto.com', password: 'user123', role: 'user' }
];

export class AuthService {
  authenticate(email: string, password: string): User | null {
    const found = mockUsers.find(u => u.email === email && u.password === password);
    if (found) {
      console.log('📊 Analytics Event: login_success', { email: found.email, role: found.role });
      // ✅ Retorna User completo compatível com AuthContext
      return { 
        id: found.id, 
        name: found.name, 
        email: found.email, 
        role: found.role 
      };
    }
    console.log('📊 Analytics Event: login_failed', { email });
    return null;
  }

  getMockUsers() {
    return mockUsers.map(u => ({ 
      id: u.id, 
      name: u.name, 
      email: u.email, 
      password: u.password, 
      role: u.role 
    }));
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getRedirectPath(role?: string): string {
    return role === 'admin' ? '/admin' : '/user';
  }
}

export const authService = new AuthService();

// backward-compatible helper
export function getRedirectPath(role?: string): string {
  return authService.getRedirectPath(role);
}