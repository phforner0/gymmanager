/* gymmanager/src/LandingPage/components/modals/LoginModal.tsx */
import React, { useState, useEffect } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { authService } from '../../services/auth.service';
import type { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: User) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  showToast
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setRemember(false);
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('📊 Analytics Event: login_attempt', { email: email.trim() });

      // Validações básicas
      if (!email.trim() || !password) {
        setError('Preencha todos os campos');
        setLoading(false);
        return;
      }

      if (!authService.validateEmail(email.trim())) {
        setError('Email inválido');
        setLoading(false);
        return;
      }

      // Autenticar via Supabase
      const user = await authService.authenticate(email.trim(), password);

      if (!user) {
        setError('E-mail ou senha incorretos');
        showToast?.('E-mail ou senha incorretos', 'error');
        setLoading(false);
        return;
      }

      // Login bem-sucedido
      console.log('✅ Login realizado:', user.email, user.role);
      
      // Usar callback se fornecido, senão fazer login direto
      if (onSuccess) {
        onSuccess(user);
      } else {
        login(user);
      }

      showToast?.(`Bem-vindo, ${user.name}!`, 'success');

      // Fechar modal e redirecionar
      onClose();
      
      setTimeout(() => {
        const path = authService.getRedirectPath(user.role);
        showToast?.('Redirecionando...', 'info');
        navigate(path);
      }, 300);

    } catch (err) {
      console.error('❌ Erro no login:', err);
      setError('Erro ao fazer login. Tente novamente.');
      showToast?.('Erro ao fazer login', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Credenciais de exemplo
  const mockUsers = authService.getMockUsers();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Entrar na sua conta">
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            className="alert alert-error"
            role="alert"
            style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="login-email">E-mail</label>
          <input
            type="email"
            id="login-email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoFocus
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Senha</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              className="form-input"
              style={{ paddingRight: 40 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                padding: 4
              }}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer' 
          }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={loading}
            />
            <span style={{ fontSize: '0.9rem' }}>Lembrar-me</span>
          </label>
          <button
            type="button"
            onClick={() => showToast?.(
              'Entre em contato com o administrador para recuperar sua senha', 
              'info'
            )}
            style={{ 
              fontSize: '0.9rem', 
              color: 'var(--accent)', 
              cursor: 'pointer', 
              background: 'transparent', 
              border: 'none' 
            }}
            disabled={loading}
          >
            Esqueci a senha
          </button>
        </div>

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      {/* Credenciais de Teste */}
      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: 'var(--glass)', 
        borderRadius: '8px', 
        fontSize: '0.85rem', 
        color: 'var(--muted)' 
      }}>
        <div style={{ 
          fontWeight: 700, 
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          🧪 Credenciais de Teste
        </div>
        
        {mockUsers.map((user, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: 2 }}>
              {user.note}
            </div>
            <div>
              <strong>Email:</strong> {user.email}<br />
              <strong>Senha:</strong> {user.password}
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail(user.email);
                setPassword(user.password);
              }}
              style={{
                marginTop: 4,
                padding: '4px 8px',
                fontSize: '0.75rem',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Usar estas credenciais
            </button>
          </div>
        ))}
        
        <div style={{ 
          marginTop: 12, 
          paddingTop: 12, 
          borderTop: '1px solid rgba(0,0,0,0.1)',
          fontSize: '0.75rem'
        }}>
          <strong>💡 Para Alunos:</strong><br />
          Após o cadastro pelo admin, use seu email e a senha inicial fornecida (formato: Impacto + últimos 4 dígitos do CPF)
        </div>
      </div>
    </Modal>
  );
};