import React, { useMemo } from 'react';
import { Workout, Measurement } from '../../types';

interface AnalyticsViewProps {
  workouts: Workout[];
  measurements: Measurement[];
}

export function AnalyticsView({ workouts, measurements }: AnalyticsViewProps) {
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
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
        Análise de Desempenho
      </h3>
      
      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <h4 style={{ marginBottom: 12 }}>📊 Estatísticas Gerais</h4>
          <div style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
            <div>
              <strong>Total de sessões:</strong> {analytics.totalSessions}
            </div>
            <div>
              <strong>Média por semana:</strong> {analytics.avgPerWeek}
            </div>
            {analytics.bestDay && (
              <div>
                <strong>Melhor dia:</strong> {analytics.bestDay[0]} ({analytics.bestDay[1]} treinos)
              </div>
            )}
          </div>
        </div>
        
        <div className="card">
          <h4 style={{ marginBottom: 12 }}>💪 Por Categoria</h4>
          <div style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
            {Object.entries(analytics.byCategory).length > 0 ? (
              Object.entries(analytics.byCategory).map(([cat, count]) => (
                <div key={cat}>
                  <strong>{cat}:</strong> {count} treinos
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--muted)' }}>
                Nenhum treino realizado ainda
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card">
        <h4 style={{ marginBottom: 12 }}>📅 Distribuição Semanal</h4>
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          justifyContent: 'space-around', 
          flexWrap: 'wrap' 
        }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} style={{ textAlign: 'center', minWidth: 60 }}>
              <div style={{ 
                fontSize: '0.85rem', 
                color: 'var(--muted)', 
                marginBottom: 4 
              }}>
                {day}
              </div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'var(--accent)' 
              }}>
                {analytics.byDay[day] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {measurements.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h4 style={{ marginBottom: 12 }}>📈 Evolução Corporal</h4>
          <div className="grid" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16
          }}>
            {(() => {
              const sorted = [...measurements].sort((a, b) => b.date - a.date);
              const latest = sorted[0];
              const oldest = sorted[sorted.length - 1];
              
              const changes: Array<{label: string, current: number | null, old: number | null, unit: string}> = [
                { label: 'Peso', current: latest.weight, old: oldest.weight, unit: 'kg' },
                { label: 'Peito', current: latest.chest, old: oldest.chest, unit: 'cm' },
                { label: 'Cintura', current: latest.waist, old: oldest.waist, unit: 'cm' },
                { label: 'Braço', current: latest.arm, old: oldest.arm, unit: 'cm' },
              ];
              
              return changes.map(change => {
                if (!change.current || !change.old) return null;
                
                const diff = change.current - change.old;
                const isPositive = diff > 0;
                
                return (
                  <div key={change.label}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {change.label}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                      {change.current} {change.unit}
                    </div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: isPositive ? 'var(--warning)' : 'var(--success)',
                      marginTop: 4
                    }}>
                      {isPositive ? '+' : ''}{diff.toFixed(1)} {change.unit}
                    </div>
                  </div>
                );
              }).filter(Boolean);
            })()}
          </div>
        </div>
      )}
    </div>
  );
}