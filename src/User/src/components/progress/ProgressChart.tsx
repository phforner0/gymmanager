import React, { useRef, useEffect, useState } from 'react';
import { Workout, Measurement } from '../../types';
import { Button } from '../common';

interface ProgressChartProps {
  workouts: Workout[];
  measurements: Measurement[];
}

export function ProgressChart({ workouts, measurements }: ProgressChartProps) {
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
      // Last 7 days workout chart
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000);
        const count = workouts.filter(w =>
          w.completedDates?.some(d => new Date(d).toDateString() === date.toDateString())
        ).length;
        last7Days.push({ 
          date: date.toLocaleDateString('pt-BR', { weekday: 'short' }), 
          count 
        });
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

      // Grid lines
      ctx.strokeStyle = 'rgba(128,128,128,0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding + (usableHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
      }

      // Draw bars
      last7Days.forEach((day, i) => {
        const height = (day.count / max) * usableHeight;
        const x = padding + i * (barWidth + gap) + gap / 2;
        const y = canvas.height - padding - height;

        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - padding);
        gradient.addColorStop(0, accent);
        gradient.addColorStop(1, accent + '80');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, height);

        // Value on top of bar
        ctx.fillStyle = text;
        ctx.textAlign = 'center';
        ctx.fillText(String(day.count), x + barWidth / 2, y - 20);
        
        // Day label
        ctx.fillText(day.date, x + barWidth / 2, canvas.height - padding + 10);
      });
      
    } else if (chartType === 'weight' && measurements.length > 0) {
      // Weight progression chart
      const sorted = [...measurements]
        .sort((a, b) => a.date - b.date)
        .filter(m => m.weight);
      
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

      // Grid lines and labels
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

      // Draw line chart
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

        // Draw point
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16, 
        flexWrap: 'wrap', 
        gap: 12 
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Evolução e Progresso
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button 
            className={chartType === 'workouts' ? 'sm' : 'ghost sm'} 
            onClick={() => setChartType('workouts')}
          >
            Treinos
          </Button>
          <Button 
            className={chartType === 'weight' ? 'sm' : 'ghost sm'} 
            onClick={() => setChartType('weight')} 
            disabled={measurements.filter(m => m.weight).length === 0}
          >
            Peso
          </Button>
        </div>
      </div>
      
      <div style={{ height: 250, position: 'relative' }}>
        <canvas ref={canvasRef} />
      </div>
      
      {chartType === 'weight' && measurements.length > 1 && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: 'var(--glass)', 
          borderRadius: 8 
        }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>
            Análise de Peso
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: 12 
          }}>
            {(() => {
              const sorted = [...measurements]
                .sort((a, b) => a.date - b.date)
                .filter(m => m.weight);
              
              if (sorted.length < 2) return null;
              
              const first = sorted[0].weight!;
              const last = sorted[sorted.length - 1].weight!;
              const diff = last - first;
              const avg = sorted.reduce((sum, m) => sum + m.weight!, 0) / sorted.length;
              
              return (
                <>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      Variação
                    </div>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 700, 
                      color: diff > 0 ? 'var(--warning)' : 'var(--success)' 
                    }}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)}kg
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      Média
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                      {avg.toFixed(1)}kg
                    </div>
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