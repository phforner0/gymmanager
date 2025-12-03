/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Download, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { Student } from '../types';

export const Students: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    let result = students;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.phone.includes(query)
      );
    }

    if (statusFilter === 'active') {
      result = result.filter(s => s.status === 'active');
    } else if (statusFilter === 'inactive') {
      result = result.filter(s => s.status === 'inactive');
    } else if (statusFilter === 'overdue') {
      result = result.filter(s => s.paymentStatus === 'overdue');
    }

    return result;
  }, [students, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja arquivar este aluno?')) return;
    try {
      await deleteStudent(id);
      showToast('Aluno arquivado com sucesso', 'success');
    } catch (error) {
      showToast('Erro ao arquivar aluno', 'error');
    }
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'CPF', 'Status', 'Plano', 'Mensalidade'];
    const rows = filteredStudents.map(s => [
      s.name, s.email, s.phone, s.cpf,
      s.status === 'active' ? 'Ativo' : 'Inativo',
      s.plan, `R$ ${s.monthlyFee.toFixed(2)}`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alunos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV exportado com sucesso', 'success');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Gestão de Alunos</h1>
        <button className="btn btn-primary" onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}>
          <Plus size={20} />
          Novo Aluno
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">Todos os status</option>
            <option value="active">Apenas Ativos</option>
            <option value="inactive">Apenas Inativos</option>
            <option value="overdue">Inadimplentes</option>
          </select>
          <button className="btn btn-secondary" onClick={exportCSV}>
            <Download size={18} />
            Exportar CSV
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Plano</th>
                <th>Mensalidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Users className="empty-icon" />
                      <div className="empty-title">Nenhum aluno encontrado</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(student => (
                  <tr key={student.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">{student.name.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{student.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>ID: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>
                      {student.paymentStatus === 'overdue' ? (
                        <span className="badge badge-danger">Inadimplente</span>
                      ) : student.status === 'active' ? (
                        <span className="badge badge-success">Ativo</span>
                      ) : (
                        <span className="badge badge-warning">Inativo</span>
                      )}
                    </td>
                    <td>{student.plan}</td>
                    <td>R$ {student.monthlyFee.toFixed(2)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="icon-btn" onClick={() => handleEdit(student)} aria-label="Editar">
                          <Edit size={18} />
                        </button>
                        <button className="icon-btn danger" onClick={() => handleDelete(student.id)} aria-label="Arquivar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingStudent(null); }}
        student={editingStudent}
        onSave={async (data) => {
          try {
            if (editingStudent) {
              await updateStudent(editingStudent.id, data);
              showToast('Aluno atualizado com sucesso', 'success');
            } else {
              await addStudent(data);
              showToast('Aluno adicionado com sucesso', 'success');
            }
            setIsModalOpen(false);
            setEditingStudent(null);
          } catch (error) {
            showToast('Erro ao salvar aluno', 'error');
          }
        }}
      />
    </div>
  );
};

const StudentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSave: (data: any) => void;
}> = ({ isOpen, onClose, student, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    plan: 'Mensal',
    monthlyFee: 120,
    status: 'active' as 'active' | 'inactive',
    paymentStatus: 'pending' as 'paid' | 'pending' | 'overdue', // 🔥 ADICIONADO
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        paymentStatus: student.paymentStatus || 'pending' // 🔥 GARANTIR VALOR VÁLIDO
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        birthDate: '',
        plan: 'Mensal',
        monthlyFee: 120,
        status: 'active',
        paymentStatus: 'pending', // 🔥 VALOR PADRÃO
        notes: ''
      });
    }
    setErrors({});
  }, [student, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Email inválido';
    if (!formData.phone?.replace(/\D/g, '').match(/^\d{10,11}$/)) newErrors.phone = 'Telefone inválido';
    if (!formData.cpf?.replace(/\D/g, '').match(/^\d{11}$/)) newErrors.cpf = 'CPF inválido';
    if (!formData.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log('🔍 Submitting form data:', formData); // 🔥 DEBUG
      onSave(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? 'Editar Aluno' : 'Novo Aluno'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Salvar</button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Nome completo *</label>
          <input
            type="text"
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="label">Email *</label>
            <input
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="label">Telefone *</label>
            <input
              type="tel"
              className={`input ${errors.phone ? 'input-error' : ''}`}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="label">CPF *</label>
            <input
              type="text"
              className={`input ${errors.cpf ? 'input-error' : ''}`}
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              placeholder="000.000.000-00"
            />
            {errors.cpf && <div className="error-message">{errors.cpf}</div>}
          </div>

          <div className="form-group">
            <label className="label">Data de Nascimento *</label>
            <input
              type="date"
              className={`input ${errors.birthDate ? 'input-error' : ''}`}
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
            {errors.birthDate && <div className="error-message">{errors.birthDate}</div>}
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="label">Plano</label>
            <select
              className="input"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            >
              <option>Mensal</option>
              <option>Trimestral</option>
              <option>Semestral</option>
              <option>Anual</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Mensalidade (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={formData.monthlyFee}
              onChange={(e) => setFormData({ ...formData, monthlyFee: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="label">Status</label>
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          {/* 🔥 NOVO CAMPO: Status de Pagamento */}
          <div className="form-group">
            <label className="label">Status de Pagamento</label>
            <select
              className="input"
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'paid' | 'pending' | 'overdue' })}
            >
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="overdue">Atrasado</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Observações</label>
          <textarea
            className="input"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Informações adicionais..."
          />
        </div>
      </form>
    </Modal>
  );
};