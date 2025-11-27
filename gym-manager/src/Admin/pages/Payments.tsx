/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo } from 'react';
import { DollarSign, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Payments: React.FC = () => {
  const { students, payments, updatePayment, showToast } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const filteredPayments = useMemo(() => {
    let result = payments;

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (dateStart) {
      result = result.filter(p => new Date(p.date) >= new Date(dateStart));
    }

    if (dateEnd) {
      result = result.filter(p => new Date(p.date) <= new Date(dateEnd));
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, statusFilter, dateStart, dateEnd]);

  const stats = useMemo(() => {
    const total = filteredPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pending = filteredPayments.filter(p => p.status === 'pending').length;
    const overdue = filteredPayments.filter(p => p.status === 'overdue').length;
    return { total, pending, overdue };
  }, [filteredPayments]);

  const handleConfirmPayment = async (id: number) => {
    try {
      await updatePayment(id, { status: 'paid' });
      showToast('Pagamento confirmado', 'success');
    } catch (error) {
      showToast('Erro ao confirmar pagamento', 'error');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Financeiro</h1>

      <div className="grid grid-cols-3 mb-6">
        <div className="stat-card green">
          <div className="stat-icon green">
            <DollarSign size={24} />
          </div>
          <div className="stat-label">Receita Total</div>
          <div className="stat-value">R$ {stats.total.toFixed(2)}</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon orange">
            <Clock size={24} />
          </div>
          <div className="stat-label">Pagamentos Pendentes</div>
          <div className="stat-value">{stats.pending}</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon purple">
            <AlertCircle size={24} />
          </div>
          <div className="stat-label">Pagamentos Vencidos</div>
          <div className="stat-value">{stats.overdue}</div>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos os status</option>
            <option value="paid">Pagos</option>
            <option value="pending">Pendentes</option>
            <option value="overdue">Vencidos</option>
          </select>
          <input
            type="date"
            className="input"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            placeholder="Data inicial"
            style={{ width: 'auto' }}
          />
          <input
            type="date"
            className="input"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            placeholder="Data final"
            style={{ width: 'auto' }}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Aluno</th>
                <th>Descrição</th>
                <th>Método</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <CreditCard className="empty-icon" />
                      <div className="empty-title">Nenhum pagamento encontrado</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => {
                  const student = students.find(s => s.id === payment.studentId);
                  return (
                    <tr key={payment.id}>
                      <td>{new Date(payment.date).toLocaleDateString('pt-BR')}</td>
                      <td>{student?.name || 'Desconhecido'}</td>
                      <td>{payment.description}</td>
                      <td>{payment.method}</td>
                      <td>R$ {payment.amount.toFixed(2)}</td>
                      <td>
                        {payment.status === 'paid' ? (
                          <span className="badge badge-success">Pago</span>
                        ) : payment.status === 'pending' ? (
                          <span className="badge badge-warning">Pendente</span>
                        ) : (
                          <span className="badge badge-danger">Vencido</span>
                        )}
                      </td>
                      <td>
                        {payment.status !== 'paid' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleConfirmPayment(payment.id)}
                          >
                            Confirmar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};