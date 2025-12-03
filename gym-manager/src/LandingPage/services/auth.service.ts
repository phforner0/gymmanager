// src/LandingPage/services/auth.service.ts
type SimpleUser = { email: string; role: string };

const mockUsers: Array<{ email: string; password: string; role: string }> = [
  { email: 'admin@impacto.com', password: 'admin123', role: 'admin' },
  { email: 'user@impacto.com', password: 'user123', role: 'user' }
];

export class AuthService {
  authenticate(email: string, password: string): SimpleUser | null {
    const found = mockUsers.find(u => u.email === email && u.password === password);
    if (found) {
      console.log('📊 Analytics Event: login_success', { email: found.email, role: found.role });
      // Return a minimal user object compatible with your AuthContext
      return { email: found.email, role: found.role };
    }
    console.log('📊 Analytics Event: login_failed', { email });
    return null;
  }

  getMockUsers() {
    return mockUsers.map(u => ({ email: u.email, password: u.password, role: u.role }));
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
