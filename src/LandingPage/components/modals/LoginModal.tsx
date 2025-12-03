// gymmanager/src/LandingPage/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { TestCredentials } from './TestCredentials'; // 🧪 REMOVER EM PRODUÇÃO

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar campos
      if (!email || !password) {
        setError('Preencha todos os campos');
        return;
      }

      if (!authService.validateEmail(email)) {
        setError('Email inválido');
        return;
      }

      // Autenticar
      const user = await authService.authenticate(email, password);

      if (!user) {
        setError('Email ou senha incorretos');
        return;
      }

      // Login bem-sucedido
      login(user);
      
      // Redirecionar baseado no role
      const redirectPath = authService.getRedirectPath(user.role);
      navigate(redirectPath);
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 20
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 40,
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: 32
        }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8
          }}>
            Impacto Gym
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: 14
          }}>
            Faça login para continuar
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              color: '#dc2626',
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8
            }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 24,
          textAlign: 'center',
          fontSize: 12,
          color: '#9ca3af'
        }}>
          <p>Não tem acesso?</p>
          <p style={{ marginTop: 4 }}>
            Entre em contato com o administrador
          </p>
        </div>
      </div>

      {/* 🧪 COMPONENTE DE TESTE - REMOVER EM PRODUÇÃO */}
      {import.meta.env.DEV && <TestCredentials />}
    </div>
  );
};