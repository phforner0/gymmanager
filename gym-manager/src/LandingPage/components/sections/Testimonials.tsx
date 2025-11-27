import React, { useState, useEffect } from 'react';
import { TESTIMONIALS } from '../../utils/constants';

export const Testimonials: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentItem = TESTIMONIALS[currentTestimonial];

  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">O Que Nossos Alunos Dizem</h2>
          <p className="section-subtitle">Histórias reais de transformação</p>
        </div>

        <div className="testimonial-slider">
          <div className="testimonial-item">
            <div className="testimonial-text">"{currentItem.text}"</div>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{currentItem.avatar}</div>
              <div>
                <h4>{currentItem.author}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {currentItem.info}
                </p>
              </div>
            </div>
          </div>

          <div className="slider-controls">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                className={`slider-dot ${currentTestimonial === idx ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(idx)}
                aria-label={`Depoimento ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};