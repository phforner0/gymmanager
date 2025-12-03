import React, { useMemo } from 'react';
import { Workout } from '../../types';

interface StatCardProps {
  label: string;
  value: number | string;
  extra?: React.ReactNode;
}

function StatCard({ label, value, extra }: StatCardProps) {
  return (
    <div className="card stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {extra}
    </div>
  );
}

interface StatsGridProps {
  workouts: Workout[];
  streak: number;
  volume: number;
}

export function StatsGrid({ workouts, streak, volume }: StatsGridProps) {
  const stats = useMemo(() => {
    const total = workouts.length;
    const done = workouts.filter(w => w.completed).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const weekAgo = Date.now() - 7 * 86400000;
    const thisWeek = workouts.filter(w => 
      w.completedDates?.some(d => d > weekAgo)
    ).length;
    
    return { total, done, percent, thisWeek };
  }, [workouts]);

  return (
    <div className="grid grid-4" style={{ marginTop: 20 }}>
      <StatCard 
        label="Total de Treinos" 
        value={stats.total} 
        extra={
          <div className="stat-change up">
            ↗ +{stats.thisWeek} esta semana
          </div>
        }
      />
      
      <StatCard 
        label="Concluídos" 
        value={stats.done} 
        extra={
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${stats.percent}%` }} 
            />
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