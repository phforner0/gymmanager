import React, { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { Measurement } from '../../types';
import { Button, Badge } from '../common';
import { ValidationService } from '../../services/validation.service';

// Measurement Card Component
interface MeasurementCardProps {
  measurement: Measurement;
  previous?: Measurement;
}

export function MeasurementCard({ measurement, previous }: MeasurementCardProps) {
  const m = measurement;
  const prev = previous;
  const bmi = m.weight && m.height 
    ? (m.weight / Math.pow(m.height / 100, 2)).toFixed(1) 
    : '-';

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: 12 
      }}>
        <strong>{new Date(m.date).toLocaleDateString()}</strong>
        {prev && <span className="muted">vs anterior</span>}
      </div>
      
      <div className="grid" style={{ 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' 
      }}>
        <div>
          <div className="muted">Peso</div>
          <div style={{ fontWeight: 700 }}>
            {m.weight || '-'} kg {prev && m.weight && (
              <Badge variant={m.weight > prev.weight! ? 'warning' : 'success'}>
                {(m.weight - prev.weight!).toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
        
        <div>
          <div className="muted">Peito</div>
          <div style={{ fontWeight: 700 }}>{m.chest || '-'} cm</div>
        </div>
        
        <div>
          <div className="muted">Cintura</div>
          <div style={{ fontWeight: 700 }}>{m.waist || '-'} cm</div>
        </div>
        
        <div>
          <div className="muted">Braço</div>
          <div style={{ fontWeight: 700 }}>{m.arm || '-'} cm</div>
        </div>
        
        <div>
          <div className="muted">Coxa</div>
          <div style={{ fontWeight: 700 }}>{m.thigh || '-'} cm</div>
        </div>
        
        <div>
          <div className="muted">IMC</div>
          <div style={{ fontWeight: 700 }}>{bmi}</div>
        </div>
      </div>
      
      {m.notes && (
        <div style={{ 
          marginTop: 12, 
          padding: 8, 
          background: 'var(--glass)', 
          borderRadius: 8, 
          fontSize: '0.9rem' 
        }}>
          {m.notes}
        </div>
      )}
    </div>
  );
}

// Measurements List Component
interface MeasurementsListProps {
  measurements: Measurement[];
  onAdd: () => void;
}

export function MeasurementsList({ measurements, onAdd }: MeasurementsListProps) {
  const sorted = [...measurements].sort((a, b) => b.date - a.date);

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Medidas Corporais
        </h3>
        <Button onClick={onAdd}>
          <Plus size={16} /> Adicionar Medida
        </Button>
      </div>
      
      {sorted.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma medida registrada</p>
        </div>
      ) : (
        sorted.map((m, idx) => (
          <MeasurementCard 
            key={m.date} 
            measurement={m} 
            previous={sorted[idx + 1]} 
          />
        ))
      )}
    </div>
  );
}

// Measurement Form Component
interface MeasurementFormProps {
  onSave: (formData: any) => void;
  onCancel: () => void;
}

export function MeasurementForm({ onSave, onCancel }: MeasurementFormProps) {
  const [formData, setFormData] = useState({
    weight: '', 
    height: '', 
    chest: '', 
    waist: '', 
    arm: '', 
    thigh: '', 
    notes: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = ValidationService.validateMeasurement(formData);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    setErrors([]);
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          background: '#fee', 
          border: '1px solid #fcc', 
          borderRadius: 8, 
          color: '#c00' 
        }}>
          {errors.map((err, i) => (
            <div key={i}>• {err}</div>
          ))}
        </div>
      )}
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="measure-weight">
            Peso (kg)
          </label>
          <input 
            id="measure-weight" 
            type="number" 
            step="0.1" 
            className="input" 
            value={formData.weight} 
            onChange={e => setFormData({ ...formData, weight: e.target.value })} 
            placeholder="75.5" 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="measure-height">
            Altura (cm)
          </label>
          <input 
            id="measure-height" 
            type="number" 
            className="input" 
            value={formData.height} 
            onChange={e => setFormData({ ...formData, height: e.target.value })} 
            placeholder="175" 
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="measure-chest">
            Peito (cm)
          </label>
          <input 
            id="measure-chest" 
            type="number" 
            step="0.1" 
            className="input" 
            value={formData.chest} 
            onChange={e => setFormData({ ...formData, chest: e.target.value })} 
            placeholder="100" 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="measure-waist">
            Cintura (cm)
          </label>
          <input 
            id="measure-waist" 
            type="number" 
            step="0.1" 
            className="input" 
            value={formData.waist} 
            onChange={e => setFormData({ ...formData, waist: e.target.value })} 
            placeholder="80" 
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="measure-arm">
            Braço (cm)
          </label>
          <input 
            id="measure-arm" 
            type="number" 
            step="0.1" 
            className="input" 
            value={formData.arm} 
            onChange={e => setFormData({ ...formData, arm: e.target.value })} 
            placeholder="38" 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="measure-thigh">
            Coxa (cm)
          </label>
          <input 
            id="measure-thigh" 
            type="number" 
            step="0.1" 
            className="input" 
            value={formData.thigh} 
            onChange={e => setFormData({ ...formData, thigh: e.target.value })} 
            placeholder="55" 
          />
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="measure-notes">
          Observações
        </label>
        <textarea 
          id="measure-notes" 
          className="input" 
          rows={3} 
          value={formData.notes} 
          onChange={e => setFormData({ ...formData, notes: e.target.value })} 
        />
      </div>
      
      <Button type="submit">
        <Save size={16} /> Salvar Medida
      </Button>
    </form>
  );
}