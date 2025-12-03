import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
    { id: 'students', label: 'Alunos', icon: Users, path: '/admin/students' },
    { id: 'classes', label: 'Agenda de Aulas', icon: Calendar, path: '/admin/classes' },
    { id: 'checkin', label: 'Check-in', icon: ActivityIcon, path: '/admin/checkin' },
    { id: 'payments', label: 'Financeiro', icon: CreditCard, path: '/admin/payments' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, path: '/admin/reports' },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/admin/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
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
                className={`nav-item ${location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin') ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
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
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="classes" element={<Classes />} />
              <Route path="checkin" element={<Checkin />} />
              <Route path="payments" element={<Payments />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<SettingsView />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </AppProvider>
  );
}