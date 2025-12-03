// gymmanager/src/LandingPage/services/auth.service.ts
import { supabase } from '../../lib/supabase';
import { User } from '../types';

export class AuthService {
  /**
   * Autentica usuário via Supabase
   */
  async authenticate(email: string, password: string): Promise<User | null> {
    try {
      console.log('🔐 Tentando autenticar:', email);

      // Buscar usuário na tabela users
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email, name, role, password_hash')
        .eq('email', email.toLowerCase())
        .limit(1);

      if (userError) {
        console.error('❌ Erro ao buscar usuário:', userError);
        return null;
      }

      if (!users || users.length === 0) {
        console.log('❌ Usuário não encontrado');
        return null;
      }

      const user = users[0];

      // Verificar senha
      const passwordMatch = await this.verifyPassword(password, user.password_hash);

      if (!passwordMatch) {
        console.log('❌ Senha incorreta');
        return null;
      }

      // Verificar se usuário está ativo
      if (user.role === 'inactive') {
        console.log('❌ Usuário inativo');
        return null;
      }

      console.log('✅ Login bem-sucedido:', user.email);
      console.log('📊 Analytics Event: login_success', { email: user.email, role: user.role });

      // Retornar User completo
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'admin' | 'user'
      };
    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      console.log('📊 Analytics Event: login_failed', { email });
      return null;
    }
  }

  /**
   * Cria hash de senha usando Web Crypto API
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifica se a senha corresponde ao hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * Cria um novo usuário (chamado pelo Admin ao criar Student)
   */
  async createUser(email: string, password: string, name: string, role: 'admin' | 'user' = 'user'): Promise<string | null> {
    try {
      const passwordHash = await this.hashPassword(password);

      const { data, error } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          password_hash: passwordHash,
          name,
          role
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Erro ao criar usuário:', error);
        return null;
      }

      console.log('✅ Usuário criado:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return null;
    }
  }

  /**
   * Gera senha inicial baseada no CPF
   */
  generateInitialPassword(cpf: string): string {
    // Remove caracteres não numéricos
    const cpfNumbers = cpf.replace(/\D/g, '');
    
    // Senha: "Impacto" + últimos 4 dígitos do CPF
    return `Impacto${cpfNumbers.slice(-4)}`;
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getRedirectPath(role?: string): string {
    return role === 'admin' ? '/admin' : '/user';
  }

  /**
   * Obter usuários mock para ajuda durante desenvolvimento
   */
  getMockUsers() {
    return [
      { 
        email: 'admin@impacto.com', 
        password: 'Admin@123', 
        role: 'admin',
        note: 'Acesso completo ao painel administrativo'
      }
    ];
  }
}

export const authService = new AuthService();

// backward-compatible helper
export function getRedirectPath(role?: string): string {
  return authService.getRedirectPath(role);
}