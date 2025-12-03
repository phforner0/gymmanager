import React from 'react';
import { X, FileDown, FileUp, LogOut } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onLogout: () => void;
}

export function MobileMenu({ 
  isOpen, 
  onClose, 
  onExport, 
  onImport, 
  onLogout 
}: MobileMenuProps) {
  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="mobile-menu open">
      <div className="mobile-menu-header">
        <h2 style={{ color: 'white' }}>Menu</h2>
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer' 
          }}
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="mobile-menu-items">
        <div 
          className="mobile-menu-item" 
          onClick={() => handleAction(onExport)}
        >
          <FileDown size={20} style={{ marginRight: 8, display: 'inline' }} />
          Exportar Dados
        </div>
        
        <div 
          className="mobile-menu-item" 
          onClick={() => handleAction(onImport)}
        >
          <FileUp size={20} style={{ marginRight: 8, display: 'inline' }} />
          Importar Dados
        </div>
        
        <div 
          className="mobile-menu-item" 
          onClick={() => handleAction(onLogout)}
        >
          <LogOut size={20} style={{ marginRight: 8, display: 'inline' }} />
          Sair
        </div>
      </div>
    </div>
  );
}