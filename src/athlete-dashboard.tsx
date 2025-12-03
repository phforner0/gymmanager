/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useCallback, createContext, useContext, useRef } from 'react';
import { AlertCircle, Award, BarChart3, Calendar, CheckCircle, Clock, Dumbbell, Edit, FileDown, FileUp, LogOut, Moon, Plus, Save, Sun, Trash2, User, X, Search, Filter, Menu, TrendingUp, Target, Bell, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

// ============ TYPES ============
interface Profile {
  email: string;
  name: string;
  role: string;
  plan: string;
  expires: string;
  level: number;
}

interface Workout {
  id: string;
  name: string;
  day: string;
  category: string;
  exercises: string[];
  tags: string[];
  completed: boolean;
  completedDates: number[];
}

interface Measurement {
  date: number;
  weight: number | null;
  height: number | null;
  chest: number | null;
  waist: number | null;
  arm: number | null;
  thigh: number | null;
  notes: string;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  date?: number;
}

interface Goal {
  id: string;
  type: 'weight' | 'workouts' | 'streak' | 'measurements';
  target: number;
  current: number;
  deadline: number;
  title: string;
}

interface TimerSession {
  id: string;
  name: string;
  duration: number;
  startTime: number;
  endTime?: number;
}

interface UserData {
  profile: Profile;
  workouts: Workout[];
  measurements: Measurement[];
  achievements: Achievement[];
  notes: string;
  volume: number;
  streak: number;
  goals: Goal[];
  timerHistory: TimerSession[];
}

// ============ STORAGE SERVICE ============
class StorageManager {
  private storageKey = 'ai_enhanced_data_v3';
  
  getStorage(): Record<string, UserData> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  
  saveStorage(data: Record<string, UserData>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  getUserData(email: string): UserData {
    const all = this.getStorage();
    if (all[email]) return all[email];
    
    const defaultData: UserData = {
      profile: { email, name: 'Usuário Impacto', role: 'user', plan: 'Mensal', expires: '2025-12-31', level: 5 },
      workouts: [
        { id: 'w1', name: 'Peito & Tríceps', day: 'Seg', category: 'Hipertrofia', exercises: ['Supino reto 4x8', 'Supino inclinado 3x10', 'Crucifixo 3x12', 'Tríceps testa 3x12'], tags: ['peito', 'triceps'], completed: false, completedDates: [] },
        { id: 'w2', name: 'Costas & Bíceps', day: 'Qua', category: 'Hipertrofia', exercises: ['Barra fixa 4x8', 'Remada curvada 4x8', 'Pulley 3x12', 'Rosca direta 3x10'], tags: ['costas', 'biceps'], completed: true, completedDates: [Date.now() - 2 * 86400000] }
      ],
      measurements: [
        { date: Date.now() - 30 * 86400000, weight: 75, height: 175, chest: 100, waist: 80, arm: 38, thigh: 55, notes: 'Medida inicial' },
        { date: Date.now() - 60 * 86400000, weight: 77, height: 175, chest: 98, waist: 82, arm: 37, thigh: 54, notes: 'Medida anterior' }
      ],
      achievements: [
        { id: 'first', name: 'Primeiro Treino', icon: '🎯', unlocked: true, date: Date.now() - 30 * 86400000 },
        { id: 'week', name: '7 Dias Seguidos', icon: '🔥', unlocked: true, date: Date.now() - 7 * 86400000 },
        { id: 'month', name: '30 Treinos', icon: '💪', unlocked: false },
        { id: 'pr', name: 'Recorde Pessoal', icon: '🏆', unlocked: false }
      ],
      notes: '',
      volume: 0,
      streak: 7,
      goals: [
        { id: 'g1', type: 'workouts', target: 12, current: 7, deadline: Date.now() + 15 * 86400000, title: '12 treinos este mês' },
        { id: 'g2', type: 'weight', target: 80, current: 75, deadline: Date.now() + 60 * 86400000, title: 'Atingir 80kg' }
      ],
      timerHistory: []
    };
    
    all[email] = defaultData;
    this.saveStorage(all);
    return defaultData;
  }
  
  setUserData(email: string, data: UserData): void {
    const all = this.getStorage();
    all[email] = data;
    this.saveStorage(all);
  }
}

const storage = new StorageManager();

// ============ VALIDATION SERVICE ============
class ValidationService {
  static validateWorkout(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome do treino é obrigatório');
    }
    
    if (!data.exercises || data.exercises.trim().length === 0) {
      errors.push('Adicione pelo menos um exercício');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  static validateMeasurement(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const numFields = ['weight', 'height', 'chest', 'waist', 'arm', 'thigh'];
    let hasAnyValue = false;
    
    numFields.forEach(field => {
      if (data[field] && data[field].trim()) {
        const val = parseFloat(data[field]);
        if (isNaN(val) || val <= 0) {
          errors.push(`${field} deve ser um número positivo`);
        }
        hasAnyValue = true;
      }
    });
    
    if (!hasAnyValue) {
      errors.push('Preencha pelo menos uma medida');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  static validateGoal(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Título da meta é obrigatório');
    }
    
    if (!data.target || parseFloat(data.target) <= 0) {
      errors.push('Meta deve ser um número positivo');
    }
    
    if (!data.deadline) {
      errors.push('Data limite é obrigatória');
    }
    
    return { valid: errors.length === 0, errors };
  }
}

// ============ THEME CONTEXT ============
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} });

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============ HOOKS ============
function useToast() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  return { toast, showToast };
}

function useTimer() {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  return {
    timerSeconds,
    timerRunning,
    setTimerSeconds,
    setTimerRunning
  };
}

// ============ UI COMPONENTS ============
function Button({ children, onClick, className = '', disabled = false, ...props }: any) {
  return (
    <button className={`btn ${className}`} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

function Badge({ children, variant = 'primary' }: { children: React.ReactNode; variant?: string }) {
  return <span className={`badge ${variant}`}>{children}</span>;
}

function Modal({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertCircle size={20} />
        {message}
      </div>
    </div>
  );
}

// ============ COMPONENTS ============
function Header({ onExport, onImport, onLogout, mobileMenuOpen, setMobileMenuOpen }: any) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <>
      <header className="header">
        <div className="brand">
          <div style={{ width: 40, height: 40, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell size={24} color="white" />
          </div>
          <div>
            <h1>Painel do Atleta</h1>
            <div className="muted">Academia Impacto</div>
          </div>
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}>
            <div className="theme-toggle-slider" />
          </button>
          <Button className="ghost desktop-only" onClick={onExport}><FileDown size={16} /> Exportar</Button>
          <Button className="ghost desktop-only" onClick={onImport}><FileUp size={16} /> Importar</Button>
          <Button onClick={onLogout} className="desktop-only"><LogOut size={16} /> Sair</Button>
          <Button onClick={() => setMobileMenuOpen(true)} className="mobile-only">
            <Menu size={20} />
          </Button>
        </div>
      </header>
      
      {mobileMenuOpen && (
        <div className="mobile-menu open">
          <div className="mobile-menu-header">
            <h2 style={{ color: 'white' }}>Menu</h2>
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>
          <div className="mobile-menu-items">
            <div className="mobile-menu-item" onClick={() => { onExport(); setMobileMenuOpen(false); }}>
              <FileDown size={20} style={{ marginRight: 8, display: 'inline' }} /> Exportar Dados
            </div>
            <div className="mobile-menu-item" onClick={() => { onImport(); setMobileMenuOpen(false); }}>
              <FileUp size={20} style={{ marginRight: 8, display: 'inline' }} /> Importar Dados
            </div>
            <div className="mobile-menu-item" onClick={() => { onLogout(); setMobileMenuOpen(false); }}>
              <LogOut size={20} style={{ marginRight: 8, display: 'inline' }} /> Sair
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ProfileCard({ profile, streak }: { profile: Profile; streak: number }) {
  return (
    <div className="card">
      <div className="profile-section">
        <div className="profile-pic">{profile.name[0]}</div>
        <div>
          <h2>{profile.name}</h2>
          <div className="muted">{profile.email}</div>
          <div style={{ marginTop: 8 }}>
            <Badge variant="primary">{profile.plan}</Badge>
            <Badge variant="info">Nível {profile.level}</Badge>
            <Badge variant="success">🔥 {streak} dias</Badge>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }} className="desktop-only">
          <div className="muted">Validade</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{profile.expires}</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, extra }: any) {
  return (
    <div className="card stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {extra}
    </div>
  );
}

function StatsGrid({ workouts, streak, volume }: any) {
  const stats = useMemo(() => {
    const total = workouts.length;
    const done = workouts.filter((w: Workout) => w.completed).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const weekAgo = Date.now() - 7 * 86400000;
    const thisWeek = workouts.filter((w: Workout) => w.completedDates?.some(d => d > weekAgo)).length;
    
    return { total, done, percent, thisWeek };
  }, [workouts]);

  return (
    <div className="grid grid-4" style={{ marginTop: 20 }}>
      <StatCard 
        label="Total de Treinos" 
        value={stats.total} 
        extra={<div className="stat-change up">↗ +{stats.thisWeek} esta semana</div>}
      />
      <StatCard 
        label="Concluídos" 
        value={stats.done} 
        extra={
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stats.percent}%` }} />
          </div>
        }
      />
      <StatCard 
        label="Sequência" 
        value={streak} 
        extra={<div className="muted">dias consecutivos</div>}
      />
      <StatCard 
        label="Volume Total" 
        value={volume.toLocaleString()} 
        extra={<div className="muted">kg levantados</div>}
      />
    </div>
  );
}

function TabNavigation({ activeTab, onTabChange }: any) {
  const tabs = [
    { id: 'workouts', label: '💪 Treinos' },
    { id: 'progress', label: '📊 Progresso' },
    { id: 'measurements', label: '📏 Medidas' },
    { id: 'calendar', label: '📅 Calendário' },
    { id: 'achievements', label: '🏆 Conquistas' },
    { id: 'goals', label: '🎯 Metas' },
    { id: 'analytics', label: '📈 Analytics' },
    { id: 'tools', label: '🛠️ Ferramentas' }
  ];

  return (
    <div className="tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function WorkoutFilters({ searchQuery, setSearchQuery, filterCategory, setFilterCategory, sortBy, setSortBy, categories }: any) {
  return (
    <div style={{ marginBottom: 20, padding: 16, background: 'var(--glass)', borderRadius: 8 }}>
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
            {categories.map((cat: string) => (
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

function WorkoutItem({ workout, onToggle, onEdit, onDelete }: any) {
  return (
    <article className="workout-item">
      <div className="workout-header">
        <div className="workout-title">{workout.name}</div>
        <Badge variant={workout.category === 'Força' ? 'warning' : workout.category === 'Cardio' ? 'info' : 'primary'}>
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
          {workout.tags.map((t: string, i: number) => <span key={i} className="tag">{t}</span>)}
        </div>
      )}
      <div className="workout-actions">
        <Button className={`sm ${workout.completed ? 'success' : 'ghost'}`} onClick={() => onToggle(workout.id)}>
          {workout.completed ? <><CheckCircle size={14} /> Concluído</> : 'Marcar'}
        </Button>
        <Button className="sm ghost" onClick={() => onEdit(workout)}>
          <Edit size={14} /> Editar
        </Button>
        <Button className="sm ghost" onClick={() => onDelete(workout.id)}>
          <Trash2 size={14} />
        </Button>
      </div>
    </article>
  );
}

function WorkoutsList({ workouts, onToggle, onEdit, onDelete, onAdd }: any) {
  if (workouts.length === 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Meus Treinos</h3>
          <Button onClick={onAdd}><Plus size={16} /> Novo Treino</Button>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Meus Treinos ({workouts.length})</h3>
        <Button onClick={onAdd}><Plus size={16} /> Novo Treino</Button>
      </div>
      {workouts.map((w: Workout) => (
        <WorkoutItem key={w.id} workout={w} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

function WorkoutForm({ workout, onSave, onCancel }: any) {
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
        <div style={{ marginBottom: 16, padding: 12, background: '#fee', border: '1px solid #fcc', borderRadius: 8, color: '#c00' }}>
          {errors.map((err, i) => <div key={i}>• {err}</div>)}
        </div>
      )}
      
      <div className="form-group">
        <label className="form-label" htmlFor="workout-name">Nome do Treino *</label>
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
          <label className="form-label" htmlFor="workout-day">Dia da Semana</label>
          <select id="workout-day" className="input" value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })}>
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="workout-category">Categoria</label>
          <select id="workout-category" className="input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
            {['Força', 'Hipertrofia', 'Cardio', 'Funcional', 'Flexibilidade'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="workout-exercises">Exercícios (um por linha) *</label>
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
        <label className="form-label" htmlFor="workout-tags">Tags (separadas por vírgula)</label>
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
        <Button type="submit"><Save size={16} /> Salvar</Button>
        <Button type="button" className="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}

function MeasurementCard({ measurement, previous }: any) {
  const m = measurement;
  const prev = previous;
  const bmi = m.weight && m.height ? (m.weight / Math.pow(m.height / 100, 2)).toFixed(1) : '-';

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <strong>{new Date(m.date).toLocaleDateString()}</strong>
        {prev && <span className="muted">vs anterior</span>}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
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
        <div><div className="muted">Peito</div><div style={{ fontWeight: 700 }}>{m.chest || '-'} cm</div></div>
        <div><div className="muted">Cintura</div><div style={{ fontWeight: 700 }}>{m.waist || '-'} cm</div></div>
        <div><div className="muted">Braço</div><div style={{ fontWeight: 700 }}>{m.arm || '-'} cm</div></div>
        <div><div className="muted">Coxa</div><div style={{ fontWeight: 700 }}>{m.thigh || '-'} cm</div></div>
        <div><div className="muted">IMC</div><div style={{ fontWeight: 700 }}>{bmi}</div></div>
      </div>
      {m.notes && (
        <div style={{ marginTop: 12, padding: 8, background: 'var(--glass)', borderRadius: 8, fontSize: '0.9rem' }}>
          {m.notes}
        </div>
      )}
    </div>
  );
}

function MeasurementsList({ measurements, onAdd }: any) {
  const sorted = [...measurements].sort((a, b) => b.date - a.date);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Medidas Corporais</h3>
        <Button onClick={onAdd}><Plus size={16} /> Adicionar Medida</Button>
      </div>
      {sorted.length === 0 ? (
        <div className="empty-state"><p>Nenhuma medida registrada</p></div>
      ) : (
        sorted.map((m, idx) => (
          <MeasurementCard key={m.date} measurement={m} previous={sorted[idx + 1]} />
        ))
      )}
    </div>
  );
}

function MeasurementForm({ onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    weight: '', height: '', chest: '', waist: '', arm: '', thigh: '', notes: ''
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
        <div style={{ marginBottom: 16, padding: 12, background: '#fee', border: '1px solid #fcc', borderRadius: 8, color: '#c00' }}>
          {errors.map((err, i) => <div key={i}>• {err}</div>)}
        </div>
      )}
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="measure-weight">Peso (kg)</label>
          <input id="measure-weight" type="number" step="0.1" className="input" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} placeholder="75.5" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="measure-height">Altura (cm)</label>
          <input id="measure-height" type="number" className="input" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} placeholder="175" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="measure-chest">Peito (cm)</label>
          <input id="measure-chest" type="number" step="0.1" className="input" value={formData.chest} onChange={e => setFormData({ ...formData, chest: e.target.value })} placeholder="100" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="measure-waist">Cintura (cm)</label>
          <input id="measure-waist" type="number" step="0.1" className="input" value={formData.waist} onChange={e => setFormData({ ...formData, waist: e.target.value })} placeholder="80" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="measure-arm">Braço (cm)</label>
          <input id="measure-arm" type="number" step="0.1" className="input" value={formData.arm} onChange={e => setFormData({ ...formData, arm: e.target.value })} placeholder="38" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="measure-thigh">Coxa (cm)</label>
          <input id="measure-thigh" type="number" step="0.1" className="input" value={formData.thigh} onChange={e => setFormData({ ...formData, thigh: e.target.value })} placeholder="55" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="measure-notes">Observações</label>
        <textarea id="measure-notes" className="input" rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
      </div>
      <Button type="submit"><Save size={16} /> Salvar Medida</Button>
    </form>
  );
}

function ProgressChart({ workouts, measurements }: { workouts: Workout[]; measurements: Measurement[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartType, setChartType] = useState<'workouts' | 'weight'>('workouts');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 250;

    const cs = getComputedStyle(document.documentElement);
    const accent = cs.getPropertyValue('--accent').trim() || '#ef4444';
    const text = cs.getPropertyValue('--text').trim() || '#0b1220';

    if (chartType === 'workouts') {
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000);
        const count = workouts.filter(w =>
          w.completedDates?.some(d => new Date(d).toDateString() === date.toDateString())
        ).length;
        last7Days.push({ date: date.toLocaleDateString('pt-BR', { weekday: 'short' }), count });
      }

      const max = Math.max(...last7Days.map(d => d.count), 1);
      const padding = 40;
      const usableWidth = canvas.width - padding * 2;
      const usableHeight = canvas.height - padding * 2;
      const barWidth = usableWidth / last7Days.length * 0.6;
      const gap = (usableWidth / last7Days.length) * 0.4;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textBaseline = 'top';
      ctx.font = '12px Inter, Arial';
      ctx.fillStyle = text;

      ctx.strokeStyle = 'rgba(128,128,128,0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding + (usableHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
      }

      last7Days.forEach((day, i) => {
        const height = (day.count / max) * usableHeight;
        const x = padding + i * (barWidth + gap) + gap / 2;
        const y = canvas.height - padding - height;

        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - padding);
        gradient.addColorStop(0, accent);
        gradient.addColorStop(1, accent + '80');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, height);

        ctx.fillStyle = text;
        ctx.textAlign = 'center';
        ctx.fillText(String(day.count), x + barWidth / 2, y - 20);
        ctx.fillText(day.date, x + barWidth / 2, canvas.height - padding + 10);
      });
    } else if (chartType === 'weight' && measurements.length > 0) {
      const sorted = [...measurements].sort((a, b) => a.date - b.date).filter(m => m.weight);
      if (sorted.length === 0) return;

      const padding = 40;
      const usableWidth = canvas.width - padding * 2;
      const usableHeight = canvas.height - padding * 2;

      const weights = sorted.map(m => m.weight!);
      const minWeight = Math.min(...weights);
      const maxWeight = Math.max(...weights);
      const range = maxWeight - minWeight || 1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '12px Inter, Arial';
      ctx.fillStyle = text;

      ctx.strokeStyle = 'rgba(128,128,128,0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding + (usableHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
        
        const value = maxWeight - (range / 5) * i;
        ctx.textAlign = 'right';
        ctx.fillText(value.toFixed(1) + 'kg', padding - 10, y - 5);
      }

      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      sorted.forEach((m, i) => {
        const x = padding + (i / (sorted.length - 1)) * usableWidth;
        const y = canvas.height - padding - ((m.weight! - minWeight) / range) * usableHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.stroke();
    }
  }, [workouts, measurements, chartType]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Evolução e Progresso</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button className={chartType === 'workouts' ? 'sm' : 'ghost sm'} onClick={() => setChartType('workouts')}>Treinos</Button>
          <Button className={chartType === 'weight' ? 'sm' : 'ghost sm'} onClick={() => setChartType('weight')} disabled={measurements.filter(m => m.weight).length === 0}>Peso</Button>
        </div>
      </div>
      
      <div style={{ height: 250, position: 'relative' }}>
        <canvas ref={canvasRef} />
      </div>
      
      {chartType === 'weight' && measurements.length > 1 && (
        <div style={{ marginTop: 16, padding: 12, background: 'var(--glass)', borderRadius: 8 }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Análise de Peso</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {(() => {
              const sorted = [...measurements].sort((a, b) => a.date - b.date).filter(m => m.weight);
              if (sorted.length < 2) return null;
              
              const first = sorted[0].weight!;
              const last = sorted[sorted.length - 1].weight!;
              const diff = last - first;
              const avg = sorted.reduce((sum, m) => sum + m.weight!, 0) / sorted.length;
              
              return (
                <>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Variação</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: diff > 0 ? 'var(--warning)' : 'var(--success)' }}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)}kg
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Média</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{avg.toFixed(1)}kg</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarView({ workouts, month, year, onPrevMonth, onNextMonth, onDayClick }: any) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const completedByDay = useMemo(() => {
    const map = new Map<number, Workout[]>();
    
    workouts.forEach((w: Workout) => {
      w.completedDates?.forEach(d => {
        const date = new Date(d);
        if (date.getMonth() === month && date.getFullYear() === year) {
          const day = date.getDate();
          if (!map.has(day)) {
            map.set(day, []);
          }
          map.get(day)!.push(w);
        }
      });
    });
    
    return map;
  }, [workouts, month, year]);

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const monthlyGoal = 12;

  const handleDayHover = (day: number, e: React.MouseEvent) => {
    setHoveredDay(day);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{monthNames[month]} {year}</h3>
        <div>
          <Button className="ghost sm" onClick={onPrevMonth}>←</Button>
          <Button className="ghost sm" onClick={onNextMonth}>→</Button>
        </div>
      </div>
      
      <div className="calendar">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="calendar-day header">{day}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = isCurrentMonth && day === today.getDate();
          const dayWorkouts = completedByDay.get(day) || [];
          const isCompleted = dayWorkouts.length > 0;
          
          return (
            <div
              key={day}
              className={`calendar-day ${isToday ? 'today' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onDayClick(day, dayWorkouts)}
              onMouseEnter={(e) => handleDayHover(day, e)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{ position: 'relative' }}
            >
              {day}
              {dayWorkouts.length > 1 && (
                <div style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'var(--accent)',
                  color: 'white',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>
                  {dayWorkouts.length}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {hoveredDay && completedByDay.get(hoveredDay) && completedByDay.get(hoveredDay)!.length > 0 && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
            background: 'var(--card)',
            padding: 12,
            borderRadius: 8,
            boxShadow: 'var(--shadow)',
            zIndex: 1000,
            minWidth: 200,
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Dia {hoveredDay}</div>
          {completedByDay.get(hoveredDay)!.map((w, idx) => (
            <div key={idx} style={{ fontSize: '0.9rem', marginBottom: 4, color: 'var(--muted)' }}>
              • {w.name}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: 16 }}>
        <div className="achievement" style={{ background: 'var(--success)', color: '#fff' }}>
          <div style={{ fontSize: '2rem' }}>🎯</div>
          <div>
            <h4>Meta do mês: {completedByDay.size}/{monthlyGoal} treinos</h4>
            <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.3)' }}>
              <div className="progress-fill" style={{ width: `${Math.min((completedByDay.size / monthlyGoal) * 100, 100)}%`, background: '#fff' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementsList({ achievements }: { achievements: Achievement[] }) {
  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Conquistas Desbloqueadas</h3>
      <div className="grid grid-2">
        {achievements.map(a => (
          <div key={a.id} className="achievement" style={{ opacity: a.unlocked ? 1 : 0.4 }}>
            <div className="achievement-icon">{a.icon}</div>
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 2 }}>
                {a.name} {a.unlocked ? '✔' : '🔒'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                {a.unlocked ? `Desbloqueado em ${new Date(a.date!).toLocaleDateString()}` : 'Continue treinando para desbloquear'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalsList({ goals, onAdd, onDelete, data }: any) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Minhas Metas</h3>
        <Button onClick={onAdd}><Plus size={16} /> Nova Meta</Button>
      </div>
      
      {goals.length === 0 ? (
        <div className="empty-state">
          <Target size={64} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
          <h3>Nenhuma meta definida</h3>
          <p>Crie metas para manter-se motivado!</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {goals.map((goal: Goal) => (
            <div key={goal.id} className="card" style={{ position: 'relative' }}>
              <button
                onClick={() => onDelete(goal.id)}
                className="btn ghost sm"
                style={{ position: 'absolute', top: 12, right: 12, padding: 6, minWidth: 'auto' }}
              >
                <Trash2 size={14} />
              </button>
              
              <h4 style={{ marginBottom: 8 }}>{goal.title}</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 12 }}>
                Prazo: {new Date(goal.deadline).toLocaleDateString()}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {goal.current}
                </span>
                <span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>
                  / {goal.target}
                </span>
              </div>
              
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                />
              </div>
              
              <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>
                {Math.round((goal.current / goal.target) * 100)}% completo
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GoalForm({ onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'workouts',
    target: '',
    deadline: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = ValidationService.validateGoal(formData);
    
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
        <div style={{ marginBottom: 16, padding: 12, background: '#fee', border: '1px solid #fcc', borderRadius: 8, color: '#c00' }}>
          {errors.map((err, i) => <div key={i}>• {err}</div>)}
        </div>
      )}
      
      <div className="form-group">
        <label className="form-label" htmlFor="goal-title">Título da Meta</label>
        <input
          id="goal-title"
          type="text"
          className="input"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Atingir 80kg"
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="goal-type">Tipo</label>
          <select
            id="goal-type"
            className="input"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="workouts">Número de Treinos</option>
            <option value="weight">Peso Corporal</option>
            <option value="streak">Sequência de Dias</option>
            <option value="measurements">Medidas</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="goal-target">Meta</label>
          <input
            id="goal-target"
            type="number"
            className="input"
            value={formData.target}
            onChange={e => setFormData({ ...formData, target: e.target.value })}
            placeholder="80"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="goal-deadline">Data Limite</label>
        <input
          id="goal-deadline"
          type="date"
          className="input"
          value={formData.deadline}
          onChange={e => setFormData({ ...formData, deadline: e.target.value })}
          required
        />
      </div>
      
      <div style={{ display: 'flex', gap: 12 }}>
        <Button type="submit"><Save size={16} /> Salvar Meta</Button>
        <Button type="button" className="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}

function AnalyticsView({ workouts, measurements }: any) {
  const analytics = useMemo(() => {
    const byDay: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    workouts.forEach((w: Workout) => {
      w.completedDates?.forEach(d => {
        const dayName = days[new Date(d).getDay()];
        byDay[dayName] = (byDay[dayName] || 0) + 1;
      });
      
      const cat = w.category || 'Geral';
      const count = w.completedDates?.length || 0;
      byCategory[cat] = (byCategory[cat] || 0) + count;
    });
    
    const bestDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
    const totalSessions = Object.values(byDay).reduce((a, b) => a + b, 0);
    const avgPerWeek = totalSessions > 0 ? (totalSessions / 4).toFixed(1) : '0';
    
    return { byDay, byCategory, bestDay, totalSessions, avgPerWeek };
  }, [workouts]);

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Análise de Desempenho</h3>
      
      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <h4 style={{ marginBottom: 12 }}>📊 Estatísticas Gerais</h4>
          <div style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
            <div><strong>Total de sessões:</strong> {analytics.totalSessions}</div>
            <div><strong>Média por semana:</strong> {analytics.avgPerWeek}</div>
            {analytics.bestDay && (
              <div><strong>Melhor dia:</strong> {analytics.bestDay[0]} ({analytics.bestDay[1]} treinos)</div>
            )}
          </div>
        </div>
        
        <div className="card">
          <h4 style={{ marginBottom: 12 }}>💪 Por Categoria</h4>
          <div style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
            {Object.entries(analytics.byCategory).map(([cat, count]) => (
              <div key={cat}>
                <strong>{cat}:</strong> {count} treinos
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="card">
        <h4 style={{ marginBottom: 12 }}>📅 Distribuição Semanal</h4>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} style={{ textAlign: 'center', minWidth: 60 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>{day}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                {analytics.byDay[day] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimerCard({ onTimerComplete, data, setData }: any) {
  const { timerSeconds, timerRunning, setTimerSeconds, setTimerRunning } = useTimer();
  const prevSecondsRef = useRef(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioContext && soundEnabled) {
      const beep = () => {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
      };
      
      if (prevSecondsRef.current > 0 && timerSeconds === 0 && !timerRunning) {
        beep();
        onTimerComplete();
        
        const session: TimerSession = {
          id: 'timer_' + Date.now(),
          name: 'Descanso',
          duration: prevSecondsRef.current,
          startTime: Date.now() - prevSecondsRef.current * 1000,
          endTime: Date.now()
        };
        setData((prev: UserData) => ({
          ...prev,
          timerHistory: [session, ...prev.timerHistory.slice(0, 9)]
        }));
      }
    }
    prevSecondsRef.current = timerSeconds;
  }, [timerSeconds, timerRunning, onTimerComplete, soundEnabled, setData]);

  const recentSessions = data.timerHistory?.slice(0, 3) || [];

  return (
    <div className="card timer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Timer de Descanso</h3>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="btn ghost sm"
          style={{ padding: 8, minWidth: 'auto' }}
        >
          <Volume2 size={16} style={{ opacity: soundEnabled ? 1 : 0.3 }} />
        </button>
      </div>
      <div className="timer-display">
        {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
      </div>
      <div className="timer-controls">
        <Button className="ghost" onClick={() => setTimerSeconds(30)}>30s</Button>
        <Button className="ghost" onClick={() => setTimerSeconds(60)}>1min</Button>
        <Button className="ghost" onClick={() => setTimerSeconds(90)}>90s</Button>
        <Button className="ghost" onClick={() => setTimerSeconds(120)}>2min</Button>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Button className="ghost" onClick={() => setTimerRunning(!timerRunning)}>
          {timerRunning ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Iniciar</>}
        </Button>
        <Button className="ghost" onClick={() => { setTimerSeconds(0); setTimerRunning(false); }}>
          <RotateCcw size={16} /> Resetar
        </Button>
      </div>
      
      {recentSessions.length > 0 && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: 8, opacity: 0.9 }}>Últimas sessões</h4>
          {recentSessions.map((session: TimerSession) => (
            <div key={session.id} style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 4 }}>
              {Math.floor(session.duration / 60)}:{String(session.duration % 60).padStart(2, '0')} - {new Date(session.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RMCalculator() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    
    if (!w || !r || r < 1) {
      alert('Preencha peso e repetições válidos');
      return;
    }
    
    const oneRM = w * (1 + r / 30);
    setResult({
      oneRM: oneRM.toFixed(1),
      p85: (oneRM * 0.85).toFixed(1),
      p75: (oneRM * 0.75).toFixed(1),
      p65: (oneRM * 0.65).toFixed(1)
    });
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>Calculadora de 1RM</h3>
      <div className="form-group">
        <label className="form-label">Peso (kg)</label>
        <input type="number" className="input" value={weight} onChange={e => setWeight(e.target.value)} placeholder="100" />
      </div>
      <div className="form-group">
        <label className="form-label">Repetições</label>
        <input type="number" className="input" value={reps} onChange={e => setReps(e.target.value)} placeholder="8" />
      </div>
      <Button onClick={calculate}>Calcular</Button>
      {result && (
        <div style={{ marginTop: 16, fontSize: '1.2rem', fontWeight: 700, textAlign: 'center' }}>
          <div style={{ color: 'var(--accent)' }}>1RM estimado: {result.oneRM} kg</div>
          <div style={{ fontSize: '0.9rem', marginTop: 8 }}>
            <div>85%: {result.p85} kg (5-6 reps)</div>
            <div>75%: {result.p75} kg (8-10 reps)</div>
            <div>65%: {result.p65} kg (12-15 reps)</div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotesCard({ notes, onNotesChange, onSave }: any) {
  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Anotações</h3>
      <textarea
        className="input"
        rows={6}
        value={notes}
        onChange={e => onNotesChange(e.target.value)}
        placeholder="Anote seus objetivos, cargas progressivas, observações..."
      />
      <Button style={{ marginTop: 12 }} onClick={onSave}>
        <Save size={16} /> Salvar Notas
      </Button>
    </div>
  );
}

// ============ MAIN DASHBOARD ============
function AthleteDashboard() {
  const userEmail = 'teste@impacto.local';
  const [data, setData] = useState<UserData>(() => storage.getUserData(userEmail));
  const [activeTab, setActiveTab] = useState('workouts');
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<{ day: number; workouts: Workout[] } | null>(null);
  const { toast, showToast } = useToast();
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => {
    storage.setUserData(userEmail, data);
  }, [data]);

  useEffect(() => {
    setData(prev => {
      const updatedGoals = prev.goals.map(goal => {
        let current = goal.current;
        
        if (goal.type === 'workouts') {
          current = prev.workouts.reduce((sum, w) => sum + (w.completedDates?.length || 0), 0);
        } else if (goal.type === 'streak') {
          current = prev.streak;
        } else if (goal.type === 'weight' && prev.measurements.length > 0) {
          current = prev.measurements[0].weight || current;
        }
        
        return { ...goal, current };
      });
      
      return { ...prev, goals: updatedGoals };
    });
  }, [data.workouts, data.streak, data.measurements]);

  const calculateStreak = useCallback((workouts: Workout[]): number => {
    const today = new Date().setHours(0, 0, 0, 0);
    let streak = 0;
    let checkDate = today;
    
    while (true) {
      const hasWorkout = workouts.some(w =>
        w.completedDates?.some(d => new Date(d).setHours(0, 0, 0, 0) === checkDate)
      );
      if (!hasWorkout) break;
      streak++;
      checkDate -= 86400000;
    }
    return streak;
  }, []);

  const checkAchievements = useCallback((currentData: UserData) => {
    const totalCompleted = currentData.workouts.reduce((sum, w) => sum + w.completedDates.length, 0);
    
    const unlocks: Achievement[] = [];
    if (totalCompleted >= 1) unlocks.push(currentData.achievements.find(a => a.id === 'first')!);
    if (currentData.streak >= 7) unlocks.push(currentData.achievements.find(a => a.id === 'week')!);
    if (totalCompleted >= 30) unlocks.push(currentData.achievements.find(a => a.id === 'month')!);
    
    unlocks.forEach(a => {
      if (a && !a.unlocked) {
        a.unlocked = true;
        a.date = Date.now();
        showToast(`🎉 Conquista desbloqueada: ${a.name}!`);
      }
    });
  }, [showToast]);

  const toggleComplete = useCallback((id: string) => {
    setData(prev => {
      const workouts = prev.workouts.map(w => {
        if (w.id === id) {
          const completed = !w.completed;
          const completedDates = completed 
            ? [...w.completedDates, Date.now()]
            : w.completedDates;
          return { ...w, completed, completedDates };
        }
        return w;
      });
      
      const volume = prev.volume + (workouts.find(w => w.id === id)?.completed ? 1000 : -1000);
      const streak = calculateStreak(workouts);
      checkAchievements({ ...prev, workouts, volume, streak });
      
      return { ...prev, workouts, volume, streak };
    });
  }, [calculateStreak, checkAchievements]);

  const saveWorkout = useCallback((formData: any) => {
    const validation = ValidationService.validateWorkout(formData);
    
    if (!validation.valid) {
      showToast('❌ ' + validation.errors[0]);
      return;
    }

    const workout: Workout = {
      id: editingWorkout?.id || 'w' + Date.now(),
      name: formData.name,
      day: formData.day,
      category: formData.category,
      exercises: formData.exercises.split('\n').map((s: string) => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map((s: string) => s.trim()).filter(Boolean),
      completed: editingWorkout?.completed || false,
      completedDates: editingWorkout?.completedDates || []
    };

    setData(prev => ({
      ...prev,
      workouts: editingWorkout
        ? prev.workouts.map(w => w.id === editingWorkout.id ? workout : w)
        : [workout, ...prev.workouts]
    }));

    setShowWorkoutModal(false);
    setEditingWorkout(null);
    showToast(editingWorkout ? '✅ Treino atualizado' : '✅ Treino criado');
  }, [editingWorkout, showToast]);

  const deleteWorkout = useCallback((id: string) => {
    if (confirm('Remover este treino?')) {
      setData(prev => ({ ...prev, workouts: prev.workouts.filter(w => w.id !== id) }));
      showToast('✅ Treino removido');
    }
  }, [showToast]);

  const saveMeasurement = useCallback((formData: any) => {
    const validation = ValidationService.validateMeasurement(formData);
    
    if (!validation.valid) {
      showToast('❌ ' + validation.errors[0]);
      return;
    }

    const measurement: Measurement = {
      date: Date.now(),
      weight: parseFloat(formData.weight) || null,
      height: parseFloat(formData.height) || null,
      chest: parseFloat(formData.chest) || null,
      waist: parseFloat(formData.waist) || null,
      arm: parseFloat(formData.arm) || null,
      thigh: parseFloat(formData.thigh) || null,
      notes: formData.notes
    };

    setData(prev => ({ ...prev, measurements: [measurement, ...prev.measurements] }));
    setShowMeasurementModal(false);
    showToast('✅ Medida registrada');
  }, [showToast]);

  const saveGoal = useCallback((formData: any) => {
    const goal: Goal = {
      id: 'g' + Date.now(),
      type: formData.type,
      target: parseFloat(formData.target),
      current: 0,
      deadline: new Date(formData.deadline).getTime(),
      title: formData.title
    };

    setData(prev => ({ ...prev, goals: [goal, ...prev.goals] }));
    setShowGoalModal(false);
    showToast('✅ Meta criada');
  }, [showToast]);

  const deleteGoal = useCallback((id: string) => {
    if (confirm('Remover esta meta?')) {
      setData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
      showToast('✅ Meta removida');
    }
  }, [showToast]);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impacto_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Dados exportados');
  }, [data, showToast]);

  const importData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        if (!imported.workouts) throw new Error('Invalid format');
        setData(imported);
        showToast('✅ Dados importados com sucesso');
      } catch {
        showToast('❌ Erro ao importar arquivo');
      }
    };
    input.click();
  }, [showToast]);

  const handleLogout = useCallback(() => {
    showToast('Logout simulado');
  }, [showToast]);

  const handleTimerComplete = useCallback(() => {
    showToast('⏰ Tempo de descanso finalizado!');
  }, [showToast]);

  const filteredWorkouts = useMemo(() => {
    let filtered = [...data.workouts];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(query) ||
        w.exercises.some(e => e.toLowerCase().includes(query)) ||
        w.tags?.some(t => t.toLowerCase().includes(query))
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(w => w.category === filterCategory);
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'day') return a.day.localeCompare(b.day);
      if (sortBy === 'recent') return (b.completedDates?.[0] || 0) - (a.completedDates?.[0] || 0);
      return 0;
    });
    
    return filtered;
  }, [data.workouts, searchQuery, filterCategory, sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(data.workouts.map(w => w.category));
    return ['all', ...Array.from(cats)];
  }, [data.workouts]);

  return (
    <div className="container">
      <Header
        onExport={exportData}
        onImport={importData}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <ProfileCard profile={data.profile} streak={data.streak} />
      
      <StatsGrid workouts={data.workouts} streak={data.streak} volume={data.volume} />

      <div className="card" style={{ marginTop: 20 }}>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'workouts' && (
          <>
            <WorkoutFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              categories={categories}
            />
            <WorkoutsList
              workouts={filteredWorkouts}
              onToggle={toggleComplete}
              onEdit={(w: Workout) => { setEditingWorkout(w); setShowWorkoutModal(true); }}
              onDelete={deleteWorkout}
              onAdd={() => { setEditingWorkout(null); setShowWorkoutModal(true); }}
            />
          </>
        )}

        {activeTab === 'progress' && <ProgressChart workouts={data.workouts} measurements={data.measurements} />}

        {activeTab === 'measurements' && (
          <MeasurementsList
            measurements={data.measurements}
            onAdd={() => setShowMeasurementModal(true)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            workouts={data.workouts}
            month={calendarMonth}
            year={calendarYear}
            onPrevMonth={() => {
              if (calendarMonth === 0) {
                setCalendarMonth(11);
                setCalendarYear(calendarYear - 1);
              } else {
                setCalendarMonth(calendarMonth - 1);
              }
            }}
            onNextMonth={() => {
              if (calendarMonth === 11) {
                setCalendarMonth(0);
                setCalendarYear(calendarYear + 1);
              } else {
                setCalendarMonth(calendarMonth + 1);
              }
            }}
            onDayClick={(day: number, workouts: Workout[]) => setSelectedCalendarDay({ day, workouts })}
          />
        )}

        {activeTab === 'achievements' && <AchievementsList achievements={data.achievements} />}

        {activeTab === 'goals' && (
          <GoalsList
            goals={data.goals}
            data={data}
            onAdd={() => setShowGoalModal(true)}
            onDelete={deleteGoal}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView workouts={data.workouts} measurements={data.measurements} />
        )}

        {activeTab === 'tools' && (
          <div>
            <div className="grid grid-2">
              <TimerCard onTimerComplete={handleTimerComplete} data={data} setData={setData} />
              <RMCalculator />
            </div>
            <NotesCard
              notes={data.notes}
              onNotesChange={(notes: string) => setData(prev => ({ ...prev, notes }))}
              onSave={() => showToast('✅ Notas salvas com sucesso!')}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
        title={editingWorkout ? 'Editar Treino' : 'Novo Treino'}
      >
        <WorkoutForm
          workout={editingWorkout}
          onSave={saveWorkout}
          onCancel={() => setShowWorkoutModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showMeasurementModal}
        onClose={() => setShowMeasurementModal(false)}
        title="Adicionar Medida"
      >
        <MeasurementForm
          onSave={saveMeasurement}
          onCancel={() => setShowMeasurementModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        title="Nova Meta"
      >
        <GoalForm
          onSave={saveGoal}
          onCancel={() => setShowGoalModal(false)}
        />
      </Modal>

      <Modal
        isOpen={selectedCalendarDay !== null}
        onClose={() => setSelectedCalendarDay(null)}
        title={`Treinos do dia ${selectedCalendarDay?.day}`}
      >
        {selectedCalendarDay && (
          <div>
            {selectedCalendarDay.workouts.length === 0 ? (
              <p>Nenhum treino realizado neste dia.</p>
            ) : (
              selectedCalendarDay.workouts.map(w => (
                <div key={w.id} style={{ marginBottom: 12, padding: 12, background: 'var(--glass)', borderRadius: 8 }}>
                  <h4>{w.name}</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: 4 }}>
                    {w.exercises.length} exercícios
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      <Toast message={toast} />
    </div>
  );
}

// ============ STYLES ============
const styles = `
  :root {
  --bg: linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%);
  --card: #ffffff;
  --muted: #64748b;
  --text: #0f172a;
  --accent: #dc2626;
  --accent-light: #fca5a5;
  --accent-dark: #991b1b;
  --success: #10b981;
  --warning: #f59e0b;
  --info: #3b82f6;
  --glass: rgba(255,255,255,0.85);
  --glass-border: rgba(255,255,255,0.18);
  --radius: 16px;
  --radius-sm: 12px;
  --shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 25px 80px rgba(15, 23, 42, 0.12);
  --shadow-hover: 0 25px 70px rgba(220, 38, 38, 0.15);
}

[data-theme='dark'] {
  --bg: linear-gradient(135deg, #0a0f1e 0%, #131827 100%);
  --card: rgba(30, 41, 59, 0.6);
  --muted: #94a3b8;
  --text: #f1f5f9;
  --glass: rgba(30, 41, 59, 0.7);
  --glass-border: rgba(148, 163, 184, 0.1);
  --shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 25px 80px rgba(0, 0, 0, 0.5);
  --shadow-hover: 0 25px 70px rgba(220, 38, 38, 0.25);
}

* { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

.container { 
  max-width: 1400px; 
  margin: 0 auto; 
  padding: 32px 24px; 
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px 24px;
  background: var(--glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow);
}

.brand { 
  display: flex; 
  gap: 14px; 
  align-items: center; 
}

.brand h1 { 
  font-size: 1.4rem; 
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand .muted { 
  font-size: 0.9rem; 
  color: var(--muted);
  font-weight: 500;
}

.header-actions { 
  display: flex; 
  gap: 10px; 
  align-items: center; 
  flex-wrap: wrap; 
}

.btn {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
  color: #fff;
  padding: 12px 20px;
  border-radius: var(--radius-sm);
  border: 0;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.25);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover { 
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.35);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}

.btn:disabled { 
  opacity: 0.5; 
  cursor: not-allowed;
  transform: none;
}

.btn.ghost { 
  background: transparent;
  border: 1.5px solid rgba(148, 163, 184, 0.3); 
  color: var(--text);
  box-shadow: none;
}

.btn.ghost:hover {
  background: var(--glass);
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.15);
}

.btn.success { 
  background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
}

.btn.success:hover {
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
}

.btn.sm { 
  padding: 8px 14px; 
  font-size: 0.85rem;
  border-radius: 10px;
}

.card {
  background: var(--glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius);
  padding: 28px;
  box-shadow: var(--shadow);
  border: 1px solid var(--glass-border);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light), var(--accent));
  opacity: 0;
  transition: opacity 0.3s;
}

.card:hover { 
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.card:hover::before {
  opacity: 1;
}

.grid { display: grid; gap: 20px; }
.grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.grid-4 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }

.stat-card { 
  text-align: center; 
  padding: 32px 24px;
  background: linear-gradient(135deg, var(--glass), var(--card));
}

.stat-value { 
  font-size: 3rem; 
  font-weight: 800; 
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 12px 0;
  line-height: 1;
}

.stat-label { 
  color: var(--muted); 
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-change { 
  font-size: 0.9rem; 
  margin-top: 8px;
  font-weight: 600;
}

.stat-change.up { 
  color: var(--success);
}

.profile-section { 
  display: flex; 
  gap: 20px; 
  align-items: center; 
}

.profile-pic { 
  width: 90px; 
  height: 90px; 
  border-radius: 20px; 
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: #fff; 
  font-size: 2.5rem; 
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
  position: relative;
}

.profile-pic::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  z-index: -1;
  opacity: 0.5;
  filter: blur(10px);
}

.badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  margin: 3px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.badge.primary { 
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
  color: #fff; 
}

.badge.success { 
  background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
  color: #fff; 
}

.badge.warning { 
  background: linear-gradient(135deg, var(--warning) 0%, #d97706 100%);
  color: #fff; 
}

.badge.info { 
  background: linear-gradient(135deg, var(--info) 0%, #2563eb 100%);
  color: #fff; 
}

.workout-item {
  padding: 20px;
  border-radius: var(--radius-sm);
  background: var(--glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid var(--glass-border);
  margin-bottom: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.workout-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--accent), var(--accent-light));
  opacity: 0;
  transition: opacity 0.3s;
}

.workout-item:hover { 
  border-color: var(--accent);
  transform: translateX(6px);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.12);
}

.workout-item:hover::before {
  opacity: 1;
}

.workout-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 10px; 
}

.workout-title { 
  font-weight: 700; 
  font-size: 1.1rem;
  color: var(--text);
}

.workout-meta { 
  display: flex; 
  gap: 16px; 
  color: var(--muted); 
  font-size: 0.875rem; 
  margin-bottom: 10px; 
  flex-wrap: wrap;
  font-weight: 500;
}

.workout-actions { 
  display: flex; 
  gap: 8px; 
  flex-wrap: wrap;
  margin-top: 12px;
}

.input, textarea, select {
  width: 100%;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px solid rgba(148, 163, 184, 0.2);
  background: var(--glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text);
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.input:hover, textarea:hover, select:hover {
  border-color: rgba(148, 163, 184, 0.4);
}

.input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  background: var(--card);
}

.form-group { 
  margin-bottom: 20px; 
}

.form-label { 
  display: block; 
  margin-bottom: 8px; 
  font-weight: 700; 
  font-size: 0.9rem;
  color: var(--text);
  letter-spacing: 0.2px;
}

.form-row { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 16px; 
}

.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 28px;
  border-bottom: 2px solid rgba(148, 163, 184, 0.15);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--accent) transparent;
}

.tabs::-webkit-scrollbar { 
  height: 6px; 
}

.tabs::-webkit-scrollbar-track {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 10px;
}

.tabs::-webkit-scrollbar-thumb { 
  background: var(--accent); 
  border-radius: 10px;
}

.tabs::-webkit-scrollbar-thumb:hover {
  background: var(--accent-dark);
}

.tab {
  padding: 14px 24px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  white-space: nowrap;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  color: var(--muted);
  font-size: 0.95rem;
  position: relative;
}

.tab::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: 10px 10px 0 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab:hover { 
  color: var(--accent);
  background: rgba(220, 38, 38, 0.05);
}

.tab.active { 
  color: var(--accent);
  font-weight: 700;
}

.tab.active::before {
  transform: translateX(-50%) scaleX(1);
}

/* Modal Styles - Enhanced Design */
.modal {
  position: fixed;
  margin: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: hidden;
}

.modal-content {
  background: var(--card);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 2px solid var(--glass-border);
  border-radius: 24px;
  padding: 0;
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.4);
  animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light), var(--accent));
  background-size: 200% 100%;
  animation: gradientShift 3s ease infinite;
}

@keyframes modalSlideUp {
  0% { 
    opacity: 0;
    transform: translateY(40px) scale(0.95); 
  }
  100% { 
    opacity: 1;
    transform: translateY(0) scale(1); 
  }
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content::-webkit-scrollbar {
  display: none;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  margin: 0;
  border-bottom: 2px solid rgba(148, 163, 184, 0.1);
  background: linear-gradient(180deg, var(--glass) 0%, transparent 100%);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.modal-header h3 {
  font-size: 1.6rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--text) 0%, var(--muted) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.5px;
}

.modal-close {
  cursor: pointer;
  background: rgba(148, 163, 184, 0.1);
  border: 2px solid rgba(148, 163, 184, 0.2);
  color: var(--muted);
  padding: 10px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.modal-close:hover {
  background: rgba(220, 38, 38, 0.15);
  border-color: var(--accent);
  color: var(--accent);
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.modal-close:active {
  transform: rotate(90deg) scale(0.95);
}

/* Modal Body - Scrollable Content */
.modal-content > form,
.modal-content > div:not(.modal-header) {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.modal-content > form::-webkit-scrollbar,
.modal-content > div:not(.modal-header)::-webkit-scrollbar {
  width: 8px;
}

.modal-content > form::-webkit-scrollbar-track,
.modal-content > div:not(.modal-header)::-webkit-scrollbar-track {
  background: rgba(148, 163, 184, 0.05);
  border-radius: 10px;
  margin: 8px 0;
}

.modal-content > form::-webkit-scrollbar-thumb,
.modal-content > div:not(.modal-header)::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.modal-content > form::-webkit-scrollbar-thumb:hover,
.modal-content > div:not(.modal-header)::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
  background-clip: padding-box;
}

/* Modal Footer Actions */
.modal-content form > div:last-child,
.modal-content > div:last-child {
  position: sticky;
  bottom: 0;
  background: linear-gradient(0deg, var(--card) 70%, transparent 100%);
  padding-top: 24px;
  margin-top: 24px;
  border-top: 2px solid rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.progress-bar {
  height: 10px;
  background: rgba(148, 163, 184, 0.15);
  border-radius: 20px;
  overflow: hidden;
  margin: 10px 0;
  position: relative;
}

.progress-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: progressShine 1.5s ease-in-out infinite;
}

@keyframes progressShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-top: 16px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid rgba(148, 163, 184, 0.15);
  background: var(--glass);
  position: relative;
  color: var(--text);
}

.calendar-day:hover { 
  background: rgba(220, 38, 38, 0.1);
  border-color: var(--accent);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.calendar-day.today { 
  border-color: var(--accent);
  border-width: 2px;
  font-weight: 800;
  background: rgba(220, 38, 38, 0.05);
}

.calendar-day.completed { 
  background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
  color: #fff;
  border-color: var(--success);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.calendar-day.completed:hover {
  transform: scale(1.08);
}

.calendar-day.header { 
  font-weight: 800;
  cursor: default;
  background: transparent;
  border: none;
  color: var(--muted);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.calendar-day.header:hover {
  transform: none;
  background: transparent;
  box-shadow: none;
}

.timer {
  text-align: center;
  padding: 40px 32px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
  border-radius: var(--radius);
  color: #fff;
  box-shadow: 0 12px 40px rgba(220, 38, 38, 0.4);
  position: relative;
  overflow: hidden;
}

.timer::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.timer-display {
  font-size: 5rem;
  font-weight: 900;
  margin: 20px 0;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.timer-controls {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.timer .btn.ghost {
  background: rgba(255, 255, 255, 0.2);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.timer .btn.ghost:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.achievement {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-radius: var(--radius-sm);
  background: var(--glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid var(--glass-border);
  margin-bottom: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.achievement:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.achievement-icon { 
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.tag {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  margin: 3px;
  background: rgba(148, 163, 184, 0.15);
  color: var(--text);
  transition: all 0.2s;
}

.tag:hover {
  background: rgba(220, 38, 38, 0.15);
  color: var(--accent);
}

.empty-state {
  text-align: center;
  padding: 60px 40px;
  color: var(--muted);
  border-radius: var(--radius);
  background: var(--glass);
  border: 2px dashed rgba(148, 163, 184, 0.2);
}

.empty-state h3 {
  margin-top: 16px;
  font-size: 1.2rem;
  font-weight: 700;
}

.empty-state p {
  margin-top: 8px;
  font-size: 0.95rem;
}

.theme-toggle {
  width: 60px;
  height: 32px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid rgba(148, 163, 184, 0.2);
}

.theme-toggle:hover {
  background: rgba(148, 163, 184, 0.3);
}

.theme-toggle-slider {
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, #fff 0%, #f1f5f9 100%);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

[data-theme='dark'] .theme-toggle { 
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
  border-color: var(--accent);
}

[data-theme='dark'] .theme-toggle-slider { 
  transform: translateX(28px);
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 18px 24px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  border: 1.5px solid var(--glass-border);
  z-index: 2000;
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 300px;
  max-width: 500px;
}

@keyframes slideInRight {
  from { 
    transform: translateX(400px); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1001;
  padding: 24px;
  animation: fadeIn 0.3s ease-out;
}

.mobile-menu.open { 
  display: block; 
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  animation: slideInDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #f1f5f9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mobile-menu-header button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-header button:hover {
  background: rgba(220, 38, 38, 0.2);
  border-color: var(--accent);
  transform: rotate(90deg) scale(1.1);
}

.mobile-menu-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeInScale 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s backwards;
}

.mobile-menu-item {
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.mobile-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.mobile-menu-item:active {
  transform: scale(0.98);
}

.mobile-menu-item:hover {
  background: rgba(220, 38, 38, 0.2);
  border-color: var(--accent);
  transform: translateX(8px);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
}

.mobile-menu-item:hover::before {
  left: 100%;
}

/* Visibility Classes */
.mobile-only { 
  display: none; 
}

.desktop-only { 
  display: inline-flex; 
}

/* Tablet Breakpoint */
@media (max-width: 1024px) {
  .container { 
    padding: 20px 16px; 
  }
  
  .grid-4 { 
    grid-template-columns: repeat(2, 1fr); 
  }
  
  .stat-value { 
    font-size: 2.5rem; 
  }
  
  .card { 
    padding: 24px; 
  }
}

/* Mobile Breakpoint */
@media (max-width: 768px) {
  .container { 
    padding: 16px 12px; 
  }
  
  .header { 
    flex-direction: row;
    align-items: center;
    padding: 16px 20px;
    gap: 12px;
  }
  
  .brand h1 { 
    font-size: 1.2rem; 
  }
  
  .brand .muted { 
    font-size: 0.8rem; 
  }
  
  .header-actions { 
    flex-wrap: nowrap;
    width: auto;
    justify-content: flex-end;
    margin-left: auto;
  }
  
  .profile-section { 
    flex-direction: column; 
    text-align: center; 
    gap: 16px;
  }
  
  .profile-section > div:last-child {
    margin-left: 0 !important;
  }
  
  .profile-pic { 
    width: 80px; 
    height: 80px; 
    font-size: 2rem; 
  }
  
  .stat-card { 
    padding: 24px 20px; 
  }
  
  .stat-value { 
    font-size: 2.2rem; 
  }
  
  .stat-label { 
    font-size: 0.85rem; 
  }
  
  .timer-display { 
    font-size: 3.5rem; 
  }
  
  .timer-controls { 
    gap: 10px; 
  }
  
  .timer-controls .btn { 
    font-size: 0.8rem;
    padding: 10px 16px;
  }
  
  .grid-4 { 
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .grid-2 { 
    grid-template-columns: 1fr; 
  }
  
  .form-row { 
    grid-template-columns: 1fr; 
  }
  
  .mobile-only { 
    display: inline-flex; 
  }
  
  .desktop-only { 
    display: none; 
  }
  
  .calendar { 
    gap: 6px; 
  }
  
  .calendar-day { 
    font-size: 0.8rem;
    border-radius: 10px;
  }
  
  .workout-item { 
    padding: 16px; 
  }
  
  .workout-title { 
    font-size: 1rem; 
  }
  
  .workout-meta { 
    font-size: 0.8rem;
    gap: 12px;
  }
  
  .workout-actions { 
    gap: 6px; 
  }
  
  .tabs { 
    gap: 4px;
    padding-bottom: 8px;
  }
  
  .tab { 
    padding: 12px 16px; 
    font-size: 0.85rem;
    border-radius: 12px 12px 0 0;
  }
  
  /* Enhanced Mobile Modal */
  .modal { 
    padding: 0;
    align-items: flex-end;
  }
  
  .modal-content { 
    max-width: 100%;
    max-height: 92vh;
    border-radius: 24px 24px 0 0;
    border-bottom: none;
    animation: slideUpMobile 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  @keyframes slideUpMobile {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .modal-header {
    padding: 24px 20px;
  }
  
  .modal-header h3 { 
    font-size: 1.4rem; 
  }
  
  .modal-content > form,
  .modal-content > div:not(.modal-header) {
    padding: 24px 20px;
  }
  
  .toast {
    bottom: 16px;
    right: 16px;
    left: 16px;
    min-width: auto;
    padding: 16px 20px;
  }
  
  .achievement { 
    padding: 16px; 
    gap: 12px;
  }
  
  .achievement-icon { 
    font-size: 2rem; 
  }
  
  .empty-state { 
    padding: 40px 24px; 
  }
  
  .empty-state h3 { 
    font-size: 1.1rem; 
  }
}

/* Small Mobile Breakpoint */
@media (max-width: 480px) {
  .brand h1 { 
    font-size: 1.1rem; 
  }
  
  .stat-value { 
    font-size: 1.8rem; 
  }
  
  .grid-4 { 
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .timer-display { 
    font-size: 2.8rem; 
  }
  
  .calendar-day { 
    font-size: 0.7rem; 
  }
  
  .profile-pic { 
    width: 70px; 
    height: 70px; 
    font-size: 1.8rem; 
  }
}

/* Focus Styles for Accessibility */
*:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
  border-radius: 6px;
}

button:focus-visible,
.btn:focus-visible {
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.2);
}

.input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15);
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .btn { 
    border: 2px solid currentColor;
    font-weight: 700;
  }
  
  .card { 
    border: 2px solid var(--text); 
  }
  
  .badge {
    border: 2px solid currentColor;
  }
  
  .input,
  textarea,
  select {
    border: 2px solid var(--text);
  }
  
  .tab.active {
    background: rgba(220, 38, 38, 0.2);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .progress-fill::after,
  .btn::before,
  .card::before,
  .mobile-menu-item::before {
    display: none;
  }
}

/* Dark Mode Adjustments for Mobile Menu */
[data-theme='dark'] .mobile-menu-header h2 {
  background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Print Styles */
@media print {
  .header-actions,
  .mobile-menu,
  .btn,
  .modal,
  .toast {
    display: none !important;
  }
  
  .container {
    max-width: 100%;
    padding: 0;
  }
  
  .card {
    page-break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ddd;
  }
  
  body {
    background: white;
    color: black;
  }
}

/* Loading States */
@keyframes skeleton {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, 
    var(--glass) 0%, 
    rgba(148, 163, 184, 0.2) 20%, 
    var(--glass) 40%, 
    var(--glass) 100%);
  background-size: 200px 100%;
  animation: skeleton 1.5s linear infinite;
  border-radius: var(--radius-sm);
}

/* Smooth Scrolling */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

/* Selection Styling */
::selection {
  background: var(--accent);
  color: white;
}

::-moz-selection {
  background: var(--accent);
  color: white;
}`;

// ============ APP COMPONENT ============
export default function App() {
  return (
    <ThemeProvider>
      <style>{styles}</style>
      <AthleteDashboard />
    </ThemeProvider>
  );
}