import React, { useState } from 'react';
import { Search, Filter, CheckCircle, Edit, Trash2, Plus, Save, Dumbbell } from 'lucide-react';
import { Workout } from '../../types';
import { Button, Badge } from '../common';
import { ValidationService } from '../../services/validation.service';

// Workout Filters Component
interface WorkoutFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  categories: string[];
}

export function WorkoutFilters({ 
  searchQuery, 
  setSearchQuery, 
  filterCategory, 
  setFilterCategory, 
  sortBy, 
  setSortBy, 
  categories 
}: WorkoutFiltersProps) {
  return (
    <div style={{ 
      marginBottom: 20, 
      padding: 16, 
      background: 'var(--glass)', 
      borderRadius: 8 
    }}>
      <div className="form-row" style={{ gap: 12, alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
          <label className="form-label" htmlFor="search-workouts">
            <Search size={14} style={{ display: 'inline', marginRight: 4 }} />
            Buscar
          </label>
          <input
            id="search-workouts"
            type="text"
            className="input"
            placeholder="Nome, exercício, tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <label className="form-label" htmlFor="filter-category">
            <Filter size={14} style={{ display: 'inline', marginRight: 4 }} />
            Categoria
          </label>
          <select
            id="filter-category"
            className="input"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Todas' : cat}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <label className="form-label" htmlFor="sort-by">Ordenar</label>
          <select
            id="sort-by"
            className="input"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="name">Nome</option>
            <option value="day">Dia</option>
            <option value="recent">Mais recentes</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Workout Item Component
interface WorkoutItemProps {
  workout: Workout;
  onToggle: (id: string) => void;
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
}

export function WorkoutItem({ workout, onToggle, onEdit, onDelete }: WorkoutItemProps) {
  const categoryVariant = 
    workout.category === 'Força' ? 'warning' : 
    workout.category === 'Cardio' ? 'info' : 
    'primary';

  return (
    <article className="workout-item">
      <div className="workout-header">
        <div className="workout-title">{workout.name}</div>
        <Badge variant={categoryVariant}>
          {workout.category || 'Geral'}
        </Badge>
      </div>
      
      <div className="workout-meta">
        <span>📅 {workout.day}</span>
        <span>💪 {workout.exercises?.length || 0} exercícios</span>
        <span>{workout.completedDates?.length || 0}x realizado</span>
      </div>
      
      {workout.tags?.length > 0 && (
        <div style={{ margin: '8px 0' }}>
          {workout.tags.map((t, i) => (
            <span key={i} className="tag">{t}</span>
          ))}
        </div>
      )}
      
      <div className="workout-actions">
        <Button 
          className={`sm ${workout.completed ? 'success' : 'ghost'}`} 
          onClick={() => onToggle(workout.id)}
        >
          {workout.completed ? (
            <>
              <CheckCircle size={14} /> Concluído
            </>
          ) : (
            'Marcar'
          )}
        </Button>
        
        <Button 
          className="sm ghost" 
          onClick={() => onEdit(workout)}
        >
          <Edit size={14} /> Editar
        </Button>
        
        <Button 
          className="sm ghost" 
          onClick={() => onDelete(workout.id)}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </article>
  );
}

// Workouts List Component
interface WorkoutsListProps {
  workouts: Workout[];
  onToggle: (id: string) => void;
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function WorkoutsList({ 
  workouts, 
  onToggle, 
  onEdit, 
  onDelete, 
  onAdd 
}: WorkoutsListProps) {
  if (workouts.length === 0) {
    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 16 
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Meus Treinos
          </h3>
          <Button onClick={onAdd}>
            <Plus size={16} /> Novo Treino
          </Button>
        </div>
        
        <div className="empty-state">
          <Dumbbell size={64} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
          <h3>Nenhum treino ainda</h3>
          <p>Crie seu primeiro treino para começar!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Meus Treinos ({workouts.length})
        </h3>
        <Button onClick={onAdd}>
          <Plus size={16} /> Novo Treino
        </Button>
      </div>
      
      {workouts.map(w => (
        <WorkoutItem 
          key={w.id} 
          workout={w} 
          onToggle={onToggle} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}

// Workout Form Component
interface WorkoutFormProps {
  workout: Workout | null;
  onSave: (formData: any) => void;
  onCancel: () => void;
}

export function WorkoutForm({ workout, onSave, onCancel }: WorkoutFormProps) {
  const [formData, setFormData] = useState({
    name: workout?.name || '',
    day: workout?.day || 'Seg',
    category: workout?.category || 'Hipertrofia',
    exercises: workout?.exercises.join('\n') || '',
    tags: workout?.tags.join(', ') || ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = ValidationService.validateWorkout(formData);
    
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
      
      <div className="form-group">
        <label className="form-label" htmlFor="workout-name">
          Nome do Treino *
        </label>
        <input
          id="workout-name"
          type="text"
          className="input"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Peito & Tríceps"
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="workout-day">
            Dia da Semana
          </label>
          <select 
            id="workout-day" 
            className="input" 
            value={formData.day} 
            onChange={e => setFormData({ ...formData, day: e.target.value })}
          >
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="workout-category">
            Categoria
          </label>
          <select 
            id="workout-category" 
            className="input" 
            value={formData.category} 
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            {['Força', 'Hipertrofia', 'Cardio', 'Funcional', 'Flexibilidade'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="workout-exercises">
          Exercícios (um por linha) *
        </label>
        <textarea
          id="workout-exercises"
          className="input"
          rows={6}
          value={formData.exercises}
          onChange={e => setFormData({ ...formData, exercises: e.target.value })}
          placeholder="Supino reto 4x8&#10;Supino inclinado 3x10&#10;Crucifixo 3x12"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="workout-tags">
          Tags (separadas por vírgula)
        </label>
        <input
          id="workout-tags"
          type="text"
          className="input"
          value={formData.tags}
          onChange={e => setFormData({ ...formData, tags: e.target.value })}
          placeholder="peito, triceps, hipertrofia"
        />
      </div>
      
      <div style={{ display: 'flex', gap: 12 }}>
        <Button type="submit">
          <Save size={16} /> Salvar
        </Button>
        <Button type="button" className="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}