import React from 'react';
import { Button } from '../common/Button';
import { PRICE_PLANS } from '../../utils/constants';

interface PricingProps {
  onVisitClick: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onVisitClick }) => {
  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Planos que cabem no seu bolso</h2>
          <p className="section-subtitle">Sem taxa de matrícula • Sem fidelidade • Cancele quando quiser</p>
        </div>

        <div className="pricing-grid">
          {PRICE_PLANS.map((plan) => (
            <div key={plan.id} className={`price-card ${plan.featured ? 'featured' : ''}`}>
              <div className="price-header">
                <h3>{plan.name}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{plan.description}</p>
              </div>
              <div className="price-amount">
                R$ {plan.price}<span>{plan.period}</span>
              </div>
              <ul className="price-features">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <Button variant="primary" fullWidth onClick={onVisitClick}>
                {plan.featured ? 'Melhor Escolha' : plan.id === 'anual' ? 'Garantir Vaga' : 'Começar Agora'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};