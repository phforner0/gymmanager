/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { ClassSchedule } from '../types';

export const Classes: React.FC = () => {
  const { classes, addClass, updateClass, deleteClass, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSchedule | null>(null);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const groupedClasses = useMemo(() => {
    const grouped: Record<number, ClassSchedule[]> = {};
    for (let i = 0; i < 7; i++) {
      grouped[i] = classes.filter(c => c.dayOfWeek === i);
    }
    return grouped;
  }, [classes]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Agenda de Aulas</h1>
        <button className="btn btn-primary" onClick={() => { setEditingClass(null); setIsModalOpen(true); }}>
          <Plus size={20} />
          Nova Aula
        </button>
      </div>

      <div className="card">
        <div className="calendar-grid">
          {weekDays.map((day, idx) => (
            <div key={idx} className="calendar-header">{day}</div>
          ))}
          {weekDays.map((_, idx) => (
            <div key={idx} className="calendar-cell">
              {groupedClasses[idx]?.map(cls => (
                <div
                  key={cls.id}
                  className="class-item"
                  onClick={() => { setEditingClass(cls); setIsModalOpen(true); }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{cls.name}</div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>
                    {cls.startTime} - {cls.endTime}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>
                    {cls.instructor}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px' }}>
                    {cls.enrolled}/{cls.capacity} vagas
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingClass(null); }}
        classData={editingClass}
        onSave={async (data) => {
          try {
            if (editingClass) {
              await updateClass(editingClass.id, data);
              showToast('Aula atualizada com sucesso', 'success');
            } else {
              await addClass(data);
              showToast('Aula criada com sucesso', 'success');
            }
            setIsModalOpen(false);
            setEditingClass(null);
          } catch (error) {
            showToast('Erro ao salvar aula', 'error');
          }
        }}
        onDelete={editingClass ? async () => {
          if (window.confirm('Tem certeza que deseja excluir esta aula?')) {
            try {
              await deleteClass(editingClass.id);
              showToast('Aula excluída com sucesso', 'success');
              setIsModalOpen(false);
              setEditingClass(null);
            } catch (error) {
              showToast('Erro ao excluir aula', 'error');
            }
          }
        } : undefined}
      />
    </div>
  );
};

const ClassModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  classData: ClassSchedule | null;
  onSave: (data: any) => void;
  onDelete?: () => void;
}> = ({ isOpen, onClose, classData, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    dayOfWeek: 1,
    startTime: '06:00',
    endTime: '07:00',
    capacity: 20,
    enrolled: 0,
    description: ''
  });

  useEffect(() => {
    if (classData) {
      setFormData(classData);
    } else {
      setFormData({
        name: '',
        instructor: '',
        dayOfWeek: 1,
        startTime: '06:00',
        endTime: '07:00',
        capacity: 20,
        enrolled: 0,
        description: ''
      });
    }
  }, [classData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={classData ? 'Editar Aula' : 'Nova Aula'}
      footer={
        <>
          {onDelete && (
            <button className="btn btn-danger" onClick={onDelete} style={{ marginRight: 'auto' }}>
              <Trash2 size={18} />
              Excluir
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Salvar</button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Nome da Aula</label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Instrutor</label>
          <input
            type="text"
            className="input"
            value={formData.instructor}
            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Dia da Semana</label>
          <select
            className="input"
            value={formData.dayOfWeek}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
          >
            <option value={0}>Domingo</option>
            <option value={1}>Segunda</option>
            <option value={2}>Terça</option>
            <option value={3}>Quarta</option>
            <option value={4}>Quinta</option>
            <option value={5}>Sexta</option>
            <option value={6}>Sábado</option>
          </select>
        </div>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="label">Horário Início</label>
            <input
              type="time"
              className="input"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Horário Fim</label>
            <input
              type="time"
              className="input"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="label">Capacidade</label>
            <input
              type="number"
              min="1"
              className="input"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Inscritos</label>
            <input
              type="number"
              min="0"
              className="input"
              value={formData.enrolled}
              onChange={(e) => setFormData({ ...formData, enrolled: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Descrição</label>
          <textarea
            className="input"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição da aula..."
          />
        </div>
      </form>
    </Modal>
  );
};