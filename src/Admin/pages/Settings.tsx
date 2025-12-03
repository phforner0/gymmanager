import React, { useState, useEffect } from 'react';
import { AlertCircle, Download, Database, RefreshCw, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { storage } from '../services/storageManager';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { students, classes, payments, checkins, showToast } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const hasUrl = import.meta.env.VITE_SUPABASE_URL;
        const hasKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        setSupabaseConnected(!!(hasUrl && hasKey));
      } catch (error) {
        console.error('Error checking Supabase connection:', error);
        setSupabaseConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      const [studentsData, classesData, paymentsData, checkinsData] = await Promise.all([
        storage.get('students'),
        storage.get('classes'),
        storage.get('payments'),
        storage.get('checkins')
      ]);

      const data = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: {
          students: studentsData || [],
          classes: classesData || [],
          payments: paymentsData || [],
          checkins: checkinsData || []
        },
        stats: {
          totalStudents: students.length,
          totalClasses: classes.length,
          totalPayments: payments.length,
          totalCheckins: checkins.length
        }
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gymmanager-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Dados exportados com sucesso', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Erro ao exportar dados', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      '⚠️ ATENÇÃO: Isso vai apagar TODOS os dados do sistema.\n\n' +
      'Esta ação não pode ser desfeita!\n\n' +
      'Deseja continuar?'
    );

    if (!confirmed) return;

    try {
      setIsClearing(true);
      
      if (typeof storage.clearDatabase === 'function') {
        await storage.clearDatabase();
      } else {
        storage.clear();
      }
      
      showToast('Dados limpos com sucesso', 'success');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error clearing data:', error);
      showToast('Erro ao limpar dados', 'error');
      setIsClearing(false);
    }
  };

  const handleReseedDatabase = async () => {
    const confirmed = window.confirm(
      '🔄 Isso vai limpar todos os dados atuais e popular o banco com dados de exemplo.\n\n' +
      'Deseja continuar?'
    );

    if (!confirmed) return;

    try {
      setIsReseeding(true);
      
      if (typeof storage.clearDatabase === 'function') {
        await storage.clearDatabase();
      } else {
        storage.clear();
      }
      
      showToast('Reiniciando sistema...', 'info');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error reseeding database:', error);
      showToast('Erro ao reiniciar banco', 'error');
      setIsReseeding(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Configurações</h1>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">Status do Sistema</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Alunos</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>{students.length}</div>
          </div>
          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Aulas</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>{classes.length}</div>
          </div>
          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Pagamentos</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>{payments.length}</div>
          </div>
          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Check-ins</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>{checkins.length}</div>
          </div>
        </div>

        <div className="alert alert-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {supabaseConnected === null ? (
              <AlertCircle size={20} />
            ) : supabaseConnected ? (
              <CheckCircle size={20} style={{ color: '#10b981' }} />
            ) : (
              <XCircle size={20} style={{ color: '#ef4444' }} />
            )}
            <div>
              <strong>
                {supabaseConnected === null 
                  ? 'Verificando conexão...'
                  : supabaseConnected 
                    ? 'Conectado ao Supabase' 
                    : 'Supabase não configurado'}
              </strong>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {supabaseConnected === null 
                  ? 'Aguarde...'
                  : supabaseConnected 
                    ? 'Dados sincronizados com banco de dados na nuvem.'
                    : 'Usando apenas localStorage. Configure as variáveis de ambiente para sincronização.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">Planos de Assinatura</h3>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          Configure os planos disponíveis para os alunos.
        </p>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plano</th>
                <th>Duração</th>
                <th>Valor Sugerido</th>
                <th>Desconto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Mensal</strong></td>
                <td>30 dias</td>
                <td>R$ 120,00</td>
                <td>-</td>
              </tr>
              <tr>
                <td><strong>Trimestral</strong></td>
                <td>90 dias</td>
                <td>R$ 320,00</td>
                <td style={{ color: '#10b981' }}>~11% off</td>
              </tr>
              <tr>
                <td><strong>Semestral</strong></td>
                <td>180 dias</td>
                <td>R$ 600,00</td>
                <td style={{ color: '#10b981' }}>~17% off</td>
              </tr>
              <tr>
                <td><strong>Anual</strong></td>
                <td>365 dias</td>
                <td>R$ 1.100,00</td>
                <td style={{ color: '#10b981' }}>~24% off</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Gerenciamento de Dados</h3>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          Faça backup, reinicie ou limpe os dados do sistema.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <Download size={24} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Exportar Dados</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Baixe um backup completo em JSON com todos os dados do sistema
              </div>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleExportData}
              disabled={isExporting}
              style={{ flexShrink: 0 }}
            >
              {isExporting ? 'Exportando...' : 'Exportar'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
            <RefreshCw size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Reiniciar com Dados de Exemplo</div>
              <div style={{ fontSize: '14px', color: '#92400e' }}>
                Limpa todos os dados e popula o banco com 50 alunos de exemplo
              </div>
            </div>
            <button 
              className="btn btn-warning" 
              onClick={handleReseedDatabase}
              disabled={isReseeding}
              style={{ flexShrink: 0 }}
            >
              {isReseeding ? 'Reiniciando...' : 'Re-seed'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fee2e2', borderRadius: '8px' }}>
            <Trash2 size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', marginBottom: '4px', color: '#dc2626' }}>Limpar Todos os Dados</div>
              <div style={{ fontSize: '14px', color: '#991b1b' }}>
                Remove permanentemente todos os dados do sistema. Esta ação NÃO pode ser desfeita!
              </div>
            </div>
            <button 
              className="btn btn-danger" 
              onClick={handleClearData}
              disabled={isClearing}
              style={{ flexShrink: 0 }}
            >
              {isClearing ? 'Limpando...' : 'Limpar Tudo'}
            </button>
          </div>
        </div>

        <div className="alert alert-info" style={{ marginTop: '16px' }}>
          <AlertCircle size={20} />
          <div>
            <strong>Dica para Desenvolvedores</strong>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Abra o console do navegador (F12) e execute{' '}
              <code style={{ 
                background: '#e5e7eb', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}>
                window.resetDatabase()
              </code>
              {' '}para um reset rápido do banco de dados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};