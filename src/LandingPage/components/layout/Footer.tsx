import React from 'react';
import { Dumbbell } from 'lucide-react';
import { CONTACT_INFO } from '../../utils/constants';

interface FooterProps {
  onLoginClick: () => void;
  onVisitClick: () => void;
  onSectionClick: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onLoginClick,
  onVisitClick,
  onSectionClick
}) => {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="logo" style={{ marginBottom: '16px' }}>
              <div className="logo-icon">
                <Dumbbell size={24} />
              </div>
              <div>Academia Impacto</div>
            </div>
            <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
              Transformando vidas através do fitness há 15 anos.
            </p>
          </div>

          <div className="footer-col">
            <h4>Links Rápidos</h4>
            <ul className="footer-links">
              <li><a onClick={() => onSectionClick('features')}>Diferenciais</a></li>
              <li><a onClick={() => onSectionClick('pricing')}>Planos</a></li>
              <li><a onClick={onLoginClick}>Área do Aluno</a></li>
              <li><a onClick={onVisitClick}>Agendar Visita</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Suporte</h4>
            <ul className="footer-links">
              <li><a>Central de Ajuda</a></li>
              <li><a>Perguntas Frequentes</a></li>
              <li><a>Política de Privacidade</a></li>
              <li><a>Termos de Uso</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contato</h4>
            <ul className="footer-links" style={{ listStyle: 'none' }}>
              <li>📍 {CONTACT_INFO.address}</li>
              <li>📞 {CONTACT_INFO.phone}</li>
              <li>📧 {CONTACT_INFO.email}</li>
              <li>⏰ {CONTACT_INFO.hours}</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Academia Impacto. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};