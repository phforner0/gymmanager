import React from 'react';
import { Achievement } from '../../types';

interface AchievementsListProps {
  achievements: Achievement[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
        Conquistas Desbloqueadas
      </h3>
      
      <div className="grid grid-2">
        {achievements.map(achievement => (
          <div 
            key={achievement.id} 
            className="achievement" 
            style={{ opacity: achievement.unlocked ? 1 : 0.4 }}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 2 }}>
                {achievement.name} {achievement.unlocked ? '✓' : '🔒'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                {achievement.unlocked 
                  ? `Desbloqueado em ${new Date(achievement.date!).toLocaleDateString()}` 
                  : 'Continue treinando para desbloquear'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}