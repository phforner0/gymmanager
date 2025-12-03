import React from 'react';
import { Dumbbell, FileDown, FileUp, LogOut, Menu } from 'lucide-react';
import { Button } from '../common';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onExport: () => void;
  onImport: () => void;
  onLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Header({ 
  onExport, 
  onImport, 
  onLogout, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="brand">
        <div style={{ 
          width: 40, 
          height: 40, 
          background: 'var(--accent)', 
          borderRadius: 6, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Dumbbell size={24} color="white" />
        </div>
        <div>
          <h1>Painel do Atleta</h1>
          <div className="muted">Academia Impacto</div>
        </div>
      </div>
      
      <div className="header-actions">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
        >
          <div className="theme-toggle-slider" />
        </button>
        
        <Button 
          className="ghost desktop-only" 
          onClick={onExport}
        >
          <FileDown size={16} /> Exportar
        </Button>
        
        <Button 
          className="ghost desktop-only" 
          onClick={onImport}
        >
          <FileUp size={16} /> Importar
        </Button>
        
        <Button 
          onClick={onLogout} 
          className="desktop-only"
        >
          <LogOut size={16} /> Sair
        </Button>
        
        <Button 
          onClick={() => setMobileMenuOpen(true)} 
          className="mobile-only"
        >
          <Menu size={20} />
        </Button>
      </div>
    </header>
  );
}