import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs: Tab[] = [
  { id: 'workouts', label: '💪 Treinos' },
  { id: 'progress', label: '📊 Progresso' },
  { id: 'measurements', label: '📏 Medidas' },
  { id: 'calendar', label: '📅 Calendário' },
  { id: 'achievements', label: '🏆 Conquistas' },
  { id: 'goals', label: '🎯 Metas' },
  { id: 'analytics', label: '📈 Analytics' },
  { id: 'tools', label: '🛠️ Ferramentas' }
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
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