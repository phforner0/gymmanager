import React, { useState, useMemo } from 'react';
import { Workout } from '../../types';
import { Button } from '../common';

interface CalendarViewProps {
  workouts: Workout[];
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (day: number, workouts: Workout[]) => void;
}

export function CalendarView({ 
  workouts, 
  month, 
  year, 
  onPrevMonth, 
  onNextMonth, 
  onDayClick 
}: CalendarViewProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16, 
        flexWrap: 'wrap', 
        gap: 12 
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          {monthNames[month]} {year}
        </h3>
        <div>
          <Button className="ghost sm" onClick={onPrevMonth}>←</Button>
          <Button className="ghost sm" onClick={onNextMonth}>→</Button>
        </div>
      </div>
      
      <div className="calendar">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="calendar-day header">{day}</div>
        ))}
        
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        
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
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Dia {hoveredDay}
          </div>
          {completedByDay.get(hoveredDay)!.map((w, idx) => (
            <div 
              key={idx} 
              style={{ 
                fontSize: '0.9rem', 
                marginBottom: 4, 
                color: 'var(--muted)' 
              }}
            >
              • {w.name}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: 16 }}>
        <div 
          className="achievement" 
          style={{ background: 'var(--success)', color: '#fff' }}
        >
          <div style={{ fontSize: '2rem' }}>🎯</div>
          <div>
            <h4>Meta do mês: {completedByDay.size}/{monthlyGoal} treinos</h4>
            <div 
              className="progress-bar" 
              style={{ background: 'rgba(255,255,255,0.3)' }}
            >
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${Math.min((completedByDay.size / monthlyGoal) * 100, 100)}%`, 
                  background: '#fff' 
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}