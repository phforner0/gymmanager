import React from 'react';
import { Dumbbell, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';

interface HeaderProps {
  scrolled: boolean;
  onLoginClick: () => void;
  onVisitClick: () => void;
  onMobileMenuToggle: () => void;
  onSectionClick: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  scrolled,
  onLoginClick,
  onVisitClick,
  onMobileMenuToggle,
  onSectionClick
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <nav className="container">
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-icon">
            <Dumbbell size={28} />
          </div>
          <div>
            <div>Academia Impacto</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--muted)' }}>
              Transforme-se hoje
            </div>
          </div>
        </div>

        <div className="nav-links">
          <a onClick={() => onSectionClick('features')}>Diferenciais</a>
          <a onClick={() => onSectionClick('pricing')}>Planos</a>
          <Button variant="ghost" onClick={onLoginClick}>
            Entrar
          </Button>
          <Button variant="primary" onClick={onVisitClick}>
            Começar Agora
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="mobile-toggle"
            onClick={onMobileMenuToggle}
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>
    </header>
  );
};