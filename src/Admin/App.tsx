import React, { useState } from 'react';
import { Activity, Menu, X } from 'lucide-react';
import { Home, Users, Calendar, Activity as ActivityIcon, CreditCard, BarChart3, Settings } from 'lucide-react';
import { AppProvider } from './context/AppContext';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Classes } from './pages/Classes';
import { Checkin } from './pages/Checkin';
import { Payments } from './pages/Payments';
import { Reports } from './pages/Reports';
import { SettingsView } from './pages/Settings';
import './styles/global.css';

export default function GymManagerApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'classes', label: 'Agenda de Aulas', icon: Calendar },
    { id: 'checkin', label: 'Check-in', icon: ActivityIcon },
    { id: 'payments', label: 'Financeiro', icon: CreditCard },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'classes': return <Classes />;
      case 'checkin': return <Checkin />;
      case 'payments': return <Payments />;
      case 'reports': return <Reports />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="app-container">
        <aside className={`sidebar ${!sidebarOpen ? 'mobile-hidden' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <Activity size={32} />
              <span>GymManager</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            {navigationItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          <div className="top-bar">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="page-content">
            {renderView()}
          </div>
        </main>
      </div>
    </AppProvider>
  );
}