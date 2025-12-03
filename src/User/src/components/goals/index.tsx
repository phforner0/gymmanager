import React, { useState, useRef, useEffect } from 'react';
import { Plus, Save, Trash2, Target, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { Goal, UserData, TimerSession } from '../../types';
import { Button } from '../common';
import { ValidationService } from '../../services/validation.service';
import { useTimer } from '../../hooks/useTimer';

// ============ GOALS COMPONENTS ============

interface GoalsListProps {
  goals: Goal[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function GoalsList({ goals, onAdd, onDelete }: GoalsListProps) {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Minhas Metas</h3>
        <Button onClick={onAdd}>
          <Plus size={16} /> Nova Meta
        </Button>
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
                style={{ 
                  position: 'absolute', 
                  top: 12, 
                  right: 12, 
                  padding: 6, 
                  minWidth: 'auto' 
                }}
              >
                <Trash2 size={14} />
              </button>
              
              <h4 style={{ marginBottom: 8 }}>{goal.title}</h4>
              <div style={{ 
                fontSize: '0.85rem', 
                color: 'var(--muted)', 
                marginBottom: 12 
              }}>
                Prazo: {new Date(goal.deadline).toLocaleDateString()}
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: 8 
              }}>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  color: 'var(--accent)' 
                }}>
                  {goal.current}
                </span>
                <span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>
                  / {goal.target}
                </span>
              </div>
              
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ 
                    width: `${Math.min((goal.current / goal.target) * 100, 100)}%` 
                  }}
                />
              </div>
              
              <div style={{ 
                marginTop: 8, 
                fontSize: '0.85rem', 
                color: 'var(--muted)' 
              }}>
                {Math.round((goal.current / goal.target) * 100)}% completo
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface GoalFormProps {
  onSave: (formData: any) => void;
  onCancel: () => void;
}

export function GoalForm({ onSave, onCancel }: GoalFormProps) {
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
        <label className="form-label" htmlFor="goal-title">
          Título da Meta
        </label>
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
        <label className="form-label" htmlFor="goal-deadline">
          Data Limite
        </label>
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
        <Button type="submit">
          <Save size={16} /> Salvar Meta
        </Button>
        <Button type="button" className="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// ============ TOOLS COMPONENTS ============

interface TimerCardProps {
  onTimerComplete: () => void;
  data: UserData;
  setData: React.Dispatch<React.SetStateAction<UserData>>;
}

export function TimerCard({ onTimerComplete, data, setData }: TimerCardProps) {
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
      }}>
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
        {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
        {String(timerSeconds % 60).padStart(2, '0')}
      </div>
      
      <div className="timer-controls">
        <Button className="ghost" onClick={() => setTimerSeconds(30)}>30s</Button>
        <Button className="ghost" onClick={() => setTimerSeconds(60)}>1min</Button>
        <Button className="ghost" onClick={() => setTimerSeconds(90)}>90s</Button>
        <Button className="ghost" onClick={() => setTimerSeconds(120)}>2min</Button>
      </div>
      
      <div style={{ 
        marginTop: 16, 
        display: 'flex', 
        gap: 12, 
        justifyContent: 'center' 
      }}>
        <Button 
          className="ghost" 
          onClick={() => setTimerRunning(!timerRunning)}
        >
          {timerRunning ? (
            <><Pause size={16} /> Pausar</>
          ) : (
            <><Play size={16} /> Iniciar</>
          )}
        </Button>
        <Button 
          className="ghost" 
          onClick={() => { 
            setTimerSeconds(0); 
            setTimerRunning(false); 
          }}
        >
          <RotateCcw size={16} /> Resetar
        </Button>
      </div>
      
      {recentSessions.length > 0 && (
        <div style={{ 
          marginTop: 20, 
          paddingTop: 16, 
          borderTop: '1px solid rgba(255,255,255,0.2)' 
        }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: 8, opacity: 0.9 }}>
            Últimas sessões
          </h4>
          {recentSessions.map((session: TimerSession) => (
            <div 
              key={session.id} 
              style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 4 }}
            >
              {Math.floor(session.duration / 60)}:
              {String(session.duration % 60).padStart(2, '0')} - 
              {new Date(session.startTime).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RMCalculator() {
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
        <input 
          type="number" 
          className="input" 
          value={weight} 
          onChange={e => setWeight(e.target.value)} 
          placeholder="100" 
        />
      </div>
      <div className="form-group">
        <label className="form-label">Repetições</label>
        <input 
          type="number" 
          className="input" 
          value={reps} 
          onChange={e => setReps(e.target.value)} 
          placeholder="8" 
        />
      </div>
      <Button onClick={calculate}>Calcular</Button>
      {result && (
        <div style={{ 
          marginTop: 16, 
          fontSize: '1.2rem', 
          fontWeight: 700, 
          textAlign: 'center' 
        }}>
          <div style={{ color: 'var(--accent)' }}>
            1RM estimado: {result.oneRM} kg
          </div>
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

interface NotesCardProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
}

export function NotesCard({ notes, onNotesChange, onSave }: NotesCardProps) {
  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
        Anotações
      </h3>
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