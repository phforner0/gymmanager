/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { MobileMenu } from '../components/layout/MobileMenu';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { Features } from '../components/sections/Features';
import { Pricing } from '../components/sections/Pricing';
import { Testimonials } from '../components/sections/Testimonials';
import { CTASection } from '../components/sections/CTASection';
import { LoginModal } from '../components/modals/LoginModal';
import { VisitModal } from '../components/modals/VisitModal';
import { ToastContainer } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { useScrolled } from '../hooks/useScrolled';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storage.service';
import { Visit } from '../types';

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  
  const scrolled = useScrolled(100);
  const { toasts, showToast } = useToast();
  const { login } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoginSuccess = (user: any) => {
    login(user);
    setLoginModalOpen(false);
  };

  const handleVisitSuccess = (visit: Visit) => {
    storageService.addVisit(visit);
    showToast('Agendamento confirmado! Entraremos em contato.', 'success');
    setVisitModalOpen(false);
  };

  return (
    <>
      <Header
        scrolled={scrolled}
        onLoginClick={() => setLoginModalOpen(true)}
        onVisitClick={() => setVisitModalOpen(true)}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onSectionClick={scrollToSection}
      />

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLoginClick={() => setLoginModalOpen(true)}
        onVisitClick={() => setVisitModalOpen(true)}
        onSectionClick={scrollToSection}
      />

      <Hero
        onVisitClick={() => setVisitModalOpen(true)}
        onLoginClick={() => setLoginModalOpen(true)}
      />

      <Features />

      <Pricing onVisitClick={() => setVisitModalOpen(true)} />

      <Testimonials />

      <CTASection onVisitClick={() => setVisitModalOpen(true)} />

      <Footer
        onLoginClick={() => setLoginModalOpen(true)}
        onVisitClick={() => setVisitModalOpen(true)}
        onSectionClick={scrollToSection}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        showToast={showToast}
      />

      <VisitModal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        onSuccess={handleVisitSuccess}
        showToast={showToast}
      />

      <ToastContainer toasts={toasts} />
    </>
  );
};