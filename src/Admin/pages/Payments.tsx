/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Payments: React.FC = () => {
  const { students, payments, updatePayment, showToast } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // 🔥 DEBUG: Log dos dados quando componente monta ou dados mudam
  useEffect(() => {
    console.log('💳 Payments component rendered');
    console.log('📊 Total Students:', students.length);
    console.log('📊 Total Payments:', payments.length);
    
    if (payments.length > 0) {
      console.log('💰 Sample payment:', payments[0]);
      console.log('👥 Payment student IDs:', payments.map(p => p.studentId).slice(0, 5));
      console.log('👥 Available student IDs:', students.map(s => s.id).slice(0, 5));
    }
  }, [students, payments]);

  const filteredPayments = useMemo(() => {
    console.log('🔍 Filtering payments...');
    let result = payments;

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
      console.log(`📋 After status filter (${statusFilter}):`, result.length);
    }

    if (dateStart) {
      result = result.filter(p => new Date(p.date) >= new Date(dateStart));
      console.log(`📅 After start date filter:`, result.length);
    }

    if (dateEnd) {
      result = result.filter(p => new Date(p.date) <= new Date(dateEnd));
      console.log(`📅 After end date filter:`, result.length);
    }

    const sorted = result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log('✅ Final filtered payments:', sorted.length);
    return sorted;
  }, [payments, statusFilter, dateStart, dateEnd]);

  const stats = useMemo(() => {
    const total = filteredPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pending = filteredPayments.filter(p => p.status === 'pending').length;
    const overdue = filteredPayments.filter(p => p.status === 'overdue').length;
    
    console.log('📈 Stats calculated:', { total, pending, overdue });
    return { total, pending, overdue };
  }, [filteredPayments]);

  const handleConfirmPayment = async (id: number) => {
    try {
      console.log('✅ Confirming payment:', id);
      await updatePayment(id, { status: 'paid' });
      showToast('Pagamento confirmado', 'success');
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      showToast('Erro ao confirmar pagamento', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Financeiro</h1>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {payments.length} pagamento(s) registrado(s)
        </div>
      </div>

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
            <option value="all">Todos os status ({payments.length})</option>
            <option value="paid">Pagos ({payments.filter(p => p.status === 'paid').length})</option>
            <option value="pending">Pendentes ({payments.filter(p => p.status === 'pending').length})</option>
            <option value="overdue">Vencidos ({payments.filter(p => p.status === 'overdue').length})</option>
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
                      <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                        {payments.length === 0 
                          ? 'Nenhum pagamento cadastrado no sistema'
                          : `${payments.length} pagamento(s) disponível(is), mas nenhum corresponde aos filtros aplicados`
                        }
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => {
                  const student = students.find(s => s.id === payment.studentId);
                  
                  // 🔥 DEBUG: Log para cada pagamento processado
                  if (!student) {
                    console.warn(`⚠️ Student not found for payment ${payment.id}, studentId: ${payment.studentId}`);
                  }
                  
                  return (
                    <tr key={payment.id}>
                      <td>{new Date(payment.date).toLocaleDateString('pt-BR')}</td>
                      <td>
                        {student ? (
                          <div>
                            <div style={{ fontWeight: '600' }}>{student.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>ID: {student.id}</div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ color: '#ef4444' }}>Aluno não encontrado</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Student ID: {payment.studentId}</div>
                          </div>
                        )}
                      </td>
                      <td>{payment.description}</td>
                      <td>{payment.method}</td>
                      <td style={{ fontWeight: '600' }}>R$ {payment.amount.toFixed(2)}</td>
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