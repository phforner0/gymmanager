import React from 'react';
import { AlertCircle, Download } from 'lucide-react';
import { storage } from '../services/storageManager';

export const SettingsView: React.FC = () => {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Configurações</h1>

      <div className="card">
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
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mensal</td>
                <td>30 dias</td>
                <td>R$ 120,00</td>
              </tr>
              <tr>
                <td>Trimestral</td>
                <td>90 dias</td>
                <td>R$ 320,00</td>
              </tr>
              <tr>
                <td>Semestral</td>
                <td>180 dias</td>
                <td>R$ 600,00</td>
              </tr>
              <tr>
                <td>Anual</td>
                <td>365 dias</td>
                <td>R$ 1.100,00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Sistema</h3>
        <div className="alert alert-info">
          <AlertCircle size={20} />
          <div>
            <strong>Dados armazenados localmente</strong>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Todos os dados estão sendo salvos no localStorage do seu navegador.
              Para migração futura, exporte os dados regularmente.
            </p>
          </div>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => {
            const data = {
              students: storage.get('students'),
              classes: storage.get('classes'),
              payments: storage.get('payments'),
              checkins: storage.get('checkins')
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `gymmanager-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}>
            <Download size={18} />
            Exportar Dados
          </button>
          <button className="btn btn-danger" onClick={() => {
            if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita!')) {
              storage.clear();
              window.location.reload();
            }
          }}>
            Limpar Dados
          </button>
        </div>
      </div>
    </div>
  );
};