/* src/LandingPage/components/modals/LoginModal.tsx */
import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
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
  const { login } = useAuth(); // OK porque o root deve envolver o app com AuthProvider

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setRemember(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('📊 Analytics Event: login_attempt', { email });

    const user = authService.authenticate(email.trim(), password);

    if (!user) {
      setError('E-mail ou senha incorretos. Use as contas demo abaixo.');
      showToast?.('E-mail ou senha incorretos.', 'error');
      return;
    }

    // Se o pai (LandingPage) forneceu onSuccess, delegamos (ele fará login/context e fechará modal).
    // Caso contrário, realizamos o login localmente via contexto.
    if (onSuccess) {
      try {
        onSuccess(user);
      } catch (err) {
        console.warn('onSuccess callback threw:', err);
      }
    } else {
      // garante persistência se nenhum callback foi passado
      login(user);
    }

    showToast?.(`Bem-vindo, ${user.email}!`, 'success');

    // Pequeno delay para mostrar o toast, então navega para a rota do admin (SPA)
    setTimeout(() => {
      const path = authService.getRedirectPath(user.role);
      showToast?.('Redirecionando...', 'info');
      // navegação SPA (sem reload)
      navigate(path);
      // tenta fechar o modal (se a parent não já fechou)
      try { onClose(); } catch {}
    }, 350);
  };

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
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Senha</label>
          <input
            type="password"
            id="login-password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span style={{ fontSize: '0.9rem' }}>Lembrar-me</span>
          </label>
          <button
            type="button"
            onClick={() => showToast?.('Funcionalidade de recuperação de senha não implementada.', 'info')}
            style={{ fontSize: '0.9rem', color: 'var(--accent)', cursor: 'pointer', background: 'transparent', border: 'none' }}
          >
            Esqueci a senha
          </button>
        </div>

        <Button type="submit" variant="primary" fullWidth>
          Entrar
        </Button>

        <Button type="button" variant="secondary" fullWidth className="mt-3" onClick={() => showToast?.('Fluxo de cadastro não implementado.', 'info')}>
          Criar conta
        </Button>
      </form>

      <div style={{ marginTop: '24px', padding: '16px', background: 'var(--glass)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--muted)' }}>
        <strong>Contas demo:</strong><br />
        Admin: admin@impacto.com / admin123<br />
        Usuário: user@impacto.com / user123
      </div>
    </Modal>
  );
};
