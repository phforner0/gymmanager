import React from 'react';
import { Button } from '../common/Button';
import { GYM_STATS } from '../../utils/constants';

interface HeroProps {
  onVisitClick: () => void;
  onLoginClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onVisitClick, onLoginClick }) => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text fade-in">
            <h1>
              Transforme seu <span className="highlight">corpo</span>, mude sua <span className="highlight">vida</span>
            </h1>
            <p>
              A melhor academia de Taubaté com equipamentos de última geração, professores certificados e ambiente
              motivador. Sua jornada fitness começa aqui.
            </p>

            <div className="cta-group">
              <Button variant="primary" onClick={onVisitClick}>
                🎯 Agendar Visita Gratuita
              </Button>
              <Button variant="secondary" onClick={onLoginClick}>
                Já sou aluno
              </Button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">{GYM_STATS.activeStudents}</span>
                <span className="stat-label">Alunos Ativos</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{GYM_STATS.yearsExperience}</span>
                <span className="stat-label">Anos de Experiência</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{GYM_STATS.satisfaction}</span>
                <span className="stat-label">Satisfação</span>
              </div>
            </div>
          </div>

          <div className="hero-visual fade-in">
            <div className="hero-card">
              <span className="feature-badge">🔥 Oferta Especial</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Primeiro mês com 50% OFF</h3>
              <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                Matricule-se agora e ganhe avaliação física gratuita + plano de treino personalizado
              </p>

              <div style={{ background: 'var(--glass)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span>✓ Acesso 24/7</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>Incluído</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span>✓ App exclusivo</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>Incluído</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ Conteúdos exclusivos</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>Incluído</span>
                </div>
              </div>

              <Button variant="primary" fullWidth onClick={onVisitClick}>
                Garantir Desconto
              </Button>
              <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                Vagas limitadas • Sem taxa de matrícula
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};