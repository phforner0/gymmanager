import React from 'react';
import { Dumbbell, Clock, Users, Award, Target, Utensils } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Dumbbell size={32} color="white" />,
      title: 'Equipamentos Premium',
      description: 'Máquinas importadas de última geração, área completa de peso livre e zona funcional equipada.'
    },
    {
      icon: <Clock size={32} color="white" />,
      title: 'Aberto 24 Horas',
      description: 'Treine no seu horário com acesso liberado 24/7, todos os dias da semana incluindo feriados.'
    },
    {
      icon: <Users size={32} color="white" />,
      title: 'Professores CREF',
      description: 'Equipe qualificada e certificada para garantir sua segurança e maximizar seus resultados.'
    },
    {
      icon: <Award size={32} color="white" />,
      title: 'App Exclusivo',
      description: 'Acompanhe treinos, evolução, agendamentos e tenha acesso a conteúdos exclusivos.'
    },
    {
      icon: <Target size={32} color="white" />,
      title: 'Treino Personalizado',
      description: 'Planos individualizados baseados em avaliação física completa e seus objetivos.'
    },
    {
      icon: <Utensils size={32} color="white" />,
      title: 'Nutrição Esportiva',
      description: 'Orientação nutricional especializada incluída em todos os planos premium.'
    }
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Por que escolher a Impacto?</h2>
          <p className="section-subtitle">Tecnologia, expertise e dedicação para você alcançar seus objetivos</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};