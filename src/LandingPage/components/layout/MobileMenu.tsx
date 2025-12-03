import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../common/Button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onVisitClick: () => void;
  onSectionClick: (id: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onLoginClick,
  onVisitClick,
  onSectionClick
}) => {
  const handleSectionClick = (id: string) => {
    onSectionClick(id);
    onClose();
  };

  const handleLoginClick = () => {
    onClose();
    onLoginClick();
  };

  const handleVisitClick = () => {
    onClose();
    onVisitClick();
  };

  return (
    <>
      <div 
        className={`mobile-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
      />
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <button className="mobile-menu-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="mobile-menu-links">
          <a onClick={() => handleSectionClick('features')}>Diferenciais</a>
          <a onClick={() => handleSectionClick('pricing')}>Planos</a>
          <Button variant="ghost" fullWidth onClick={handleLoginClick}>
            Entrar
          </Button>
          <Button variant="primary" fullWidth onClick={handleVisitClick}>
            Começar Agora
          </Button>
        </div>
      </div>
    </>
  );
};