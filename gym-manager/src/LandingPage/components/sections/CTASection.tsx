import React from 'react';
import { Button } from '../common/Button';
import { CONTACT_INFO } from '../../utils/constants';

interface CTASectionProps {
  onVisitClick: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onVisitClick }) => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2>Pronto para sua transformação?</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--muted)', marginBottom: '32px' }}>
            Agende sua visita gratuita e conheça nossa estrutura. Sem compromisso!
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              onClick={onVisitClick}
            >
              Agendar Visita Gratuita
            </Button>
            <Button variant="secondary">
              Falar com Consultor
            </Button>
          </div>
          <p style={{ marginTop: '24px', color: 'var(--muted)', fontSize: '0.9rem' }}>
            📞 {CONTACT_INFO.phone} • 📧 {CONTACT_INFO.email}
          </p>
        </div>
      </div>
    </section>
  );
};