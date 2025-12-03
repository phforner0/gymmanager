// gymmanager/src/components/TestCredentials.tsx
import React, { useState } from 'react';
import { Info, Copy, Check, Eye, EyeOff } from 'lucide-react';

/**
 * Componente para exibir credenciais de teste
 * Útil durante desenvolvimento - REMOVER EM PRODUÇÃO
 */
export const TestCredentials: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const credentials = [
    {
      role: 'Admin',
      email: 'admin@impacto.com',
      password: 'Admin@123',
      access: '/admin',
      color: '#ef4444'
    }
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGeneratePassword = (cpf: string) => {
    const cpfNumbers = cpf.replace(/\D/g, '');
    return `Impacto${cpfNumbers.slice(-4)}`;
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      maxWidth: 400,
      zIndex: 9998
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Info size={20} />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
          🧪 Credenciais de Teste
        </h3>
      </div>

      <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 16 }}>
        Use estas credenciais para testar o sistema
      </div>

      {/* Toggle Show Passwords */}
      <button
        onClick={() => setShowPasswords(!showPasswords)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: 6,
          padding: '6px 12px',
          color: 'white',
          cursor: 'pointer',
          fontSize: 12,
          marginBottom: 12,
          width: '100%',
          justifyContent: 'center'
        }}
      >
        {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
        {showPasswords ? 'Ocultar Senhas' : 'Mostrar Senhas'}
      </button>

      {credentials.map((cred, idx) => (
        <div
          key={idx}
          style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            opacity: 0.8,
            marginBottom: 8,
            color: cred.color
          }}>
            {cred.role}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 4 }}>Email</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 4,
              padding: '6px 8px'
            }}>
              <code style={{ flex: 1, fontSize: 12 }}>{cred.email}</code>
              <button
                onClick={() => copyToClipboard(cred.email, `email-${idx}`)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {copied === `email-${idx}` ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 4 }}>Senha</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 4,
              padding: '6px 8px'
            }}>
              <code style={{ flex: 1, fontSize: 12 }}>
                {showPasswords ? cred.password : '••••••••'}
              </code>
              <button
                onClick={() => copyToClipboard(cred.password, `pass-${idx}`)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {copied === `pass-${idx}` ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Access */}
          <div style={{
            fontSize: 10,
            opacity: 0.7,
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            Acesso: <code>{cred.access}</code>
          </div>
        </div>
      ))}

      {/* Password Generator */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        padding: 12,
        marginTop: 12
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
          🔑 Gerador de Senha para Alunos
        </div>
        <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 8 }}>
          Senha = "Impacto" + últimos 4 dígitos do CPF
        </div>
        <input
          type="text"
          placeholder="Digite o CPF"
          maxLength={14}
          style={{
            width: '100%',
            padding: '6px 8px',
            borderRadius: 4,
            border: 'none',
            background: 'rgba(0,0,0,0.2)',
            color: 'white',
            fontSize: 12,
            marginBottom: 8
          }}
          onChange={(e) => {
            const cpf = e.target.value.replace(/\D/g, '');
            if (cpf.length >= 4) {
              const password = handleGeneratePassword(cpf);
              const result = document.getElementById('password-result');
              if (result) result.textContent = `Senha: ${password}`;
            }
          }}
        />
        <div
          id="password-result"
          style={{
            fontSize: 11,
            fontWeight: 700,
            textAlign: 'center',
            padding: 6,
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 4
          }}
        >
          -
        </div>
      </div>

      <div style={{
        fontSize: 10,
        opacity: 0.6,
        marginTop: 12,
        textAlign: 'center'
      }}>
        ⚠️ Remover este componente em produção
      </div>
    </div>
  );
};