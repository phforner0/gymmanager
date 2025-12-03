/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo } from 'react';
import { Search, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Checkin: React.FC = () => {
  const { students, checkins, addCheckin, removeCheckin, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const recentCheckins = useMemo(() => {
    return [...checkins]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [checkins]);

  const handleCheckin = async (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (student.status === 'inactive') {
      showToast('Este aluno está inativo', 'error');
      return;
    }

    if (student.paymentStatus === 'overdue') {
      if (!window.confirm(`${student.name} está com pagamento em atraso. Continuar?`)) {
        return;
      }
    }

    try {
      await addCheckin(studentId);
      showToast(`Check-in realizado: ${student.name}`, 'success');
      setSearchQuery('');
    } catch (error) {
      showToast('Erro ao realizar check-in', 'error');
    }
  };

  const handleUndoCheckin = async (id: number) => {
    try {
      await removeCheckin(id);
      showToast('Check-in desfeito', 'success');
    } catch (error) {
      showToast('Erro ao desfazer check-in', 'error');
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return students
      .filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.id.toString().includes(query)
      )
      .slice(0, 5);
  }, [students, searchQuery]);

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Sistema de Check-in</h1>

      <div className="grid grid-cols-2">
        <div className="card">
          <h3 className="card-title">Buscar Aluno</h3>
          <div className="form-group">
            <div className="search-box" style={{ maxWidth: '100%' }}>
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Digite nome, email ou ID..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {filteredStudents.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleCheckin(student.id)}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar">{student.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {student.email} • ID: {student.id}
                        </div>
                      </div>
                    </div>
                    {student.paymentStatus === 'overdue' && (
                      <span className="badge badge-danger">Inadimplente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && filteredStudents.length === 0 && (
            <div className="empty-state">
              <div className="empty-title">Nenhum aluno encontrado</div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Últimos Check-ins</h3>
          {recentCheckins.length === 0 ? (
            <div className="empty-state">
              <Clock className="empty-icon" />
              <div className="empty-title">Nenhum check-in hoje</div>
            </div>
          ) : (
            <div>
              {recentCheckins.map(checkin => {
                const student = students.find(s => s.id === checkin.studentId);
                if (!student) return null;
                return (
                  <div
                    key={checkin.id}
                    style={{
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={20} color="#10b981" />
                        <div>
                          <div style={{ fontWeight: '600' }}>{student.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {new Date(checkin.timestamp).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleUndoCheckin(checkin.id)}
                      >
                        Desfazer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};