import React, { useState, useEffect } from 'react';
import { AlertCircle, Download, Upload } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Visit, VisitFormData } from '../../types';
import { validateVisitForm } from '../../utils/validation';
import { storageService } from '../../services/storage.service';
import { TIME_SLOTS } from '../../utils/constants';

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (visit: Visit) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const VisitModal: React.FC<VisitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  showToast
}) => {
  const [formData, setFormData] = useState<VisitFormData>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', phone: '', date: '', time: '' });
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateVisitForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const visit: Visit = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    console.log('📊 Analytics Event: visit_scheduled', visit);
    console.log('🌐 POST /api/visits', visit);

    onSuccess(visit);
  };

  const handleExport = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agendamentos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Agendamentos exportados com sucesso', 'success');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        if (storageService.importData(text)) {
          showToast('Dados importados com sucesso', 'success');
        } else {
          showToast('Erro ao importar arquivo', 'error');
        }
      } catch {
        showToast('Arquivo inválido', 'error');
      }
    };
    input.click();
  };

  const actions = (
    <>
      <button className="modal-close" onClick={handleExport} aria-label="Exportar" title="Exportar agendamentos">
        <Download size={18} />
      </button>
      <button className="modal-close" onClick={handleImport} aria-label="Importar" title="Importar dados">
        <Upload size={18} />
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agendar Visita Gratuita" actions={actions}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="visit-name">Nome completo *</label>
          <input
            type="text"
            id="visit-name"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Seu nome"
            autoFocus
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="visit-email">E-mail *</label>
          <input
            type="email"
            id="visit-email"
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="seu@email.com"
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="visit-phone">Telefone *</label>
          <input
            type="tel"
            id="visit-phone"
            className="form-input"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(12) 99999-9999"
          />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="visit-date">Melhor dia *</label>
          <input
            type="date"
            id="visit-date"
            className="form-input"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.date && <div className="form-error">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="visit-time">Horário preferido *</label>
          <select
            id="visit-time"
            className="form-select"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          >
            <option value="">Selecione</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>{slot.label}</option>
            ))}
          </select>
          {errors.time && <div className="form-error">{errors.time}</div>}
        </div>

        <Button type="submit" variant="primary" fullWidth>
          Confirmar Agendamento
        </Button>
      </form>

      <div className="alert alert-info" style={{ marginTop: '16px' }}>
        <AlertCircle size={18} />
        <div style={{ fontSize: '0.85rem' }}>
          Você receberá uma confirmação por e-mail com todos os detalhes da sua visita.
        </div>
      </div>
    </Modal>
  );
};