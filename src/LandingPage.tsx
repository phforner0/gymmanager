/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Moon, Sun, ChevronLeft, ChevronRight, Dumbbell, Clock, Users, Award, Target, Utensils, CheckCircle, Download, Upload, AlertCircle } from 'lucide-react';

// ============ TYPES ============
interface User {
  email: string;
  role: 'admin' | 'user';
}

interface Visit {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  createdAt: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ============ STORAGE SERVICE ============
class StorageService {
  getTheme(): string {
    return localStorage.getItem('gym_theme') || 'light';
  }

  setTheme(theme: string): void {
    localStorage.setItem('gym_theme', theme);
  }

  getUser(): User | null {
    const userData = localStorage.getItem('logged_user');
    return userData ? JSON.parse(userData) : null;
  }

  setUser(user: User): void {
    localStorage.setItem('logged_user', JSON.stringify(user));
  }

  clearUser(): void {
    localStorage.removeItem('logged_user');
  }

  getVisits(): Visit[] {
    const visits = localStorage.getItem('scheduled_visits');
    return visits ? JSON.parse(visits) : [];
  }

  addVisit(visit: Visit): void {
    const visits = this.getVisits();
    visits.push(visit);
    localStorage.setItem('scheduled_visits', JSON.stringify(visits));
  }

  exportData(): string {
    return JSON.stringify({
      theme: this.getTheme(),
      user: this.getUser(),
      visits: this.getVisits()
    }, null, 2);
  }

  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.theme) this.setTheme(parsed.theme);
      if (parsed.visits) localStorage.setItem('scheduled_visits', JSON.stringify(parsed.visits));
      return true;
    } catch {
      return false;
    }
  }
}

const storage = new StorageService();

// ============ AUTH SERVICE ============
const mockUsers = [
  { email: 'admin@impacto.com', password: 'admin123', role: 'admin' as const },
  { email: 'user@impacto.com', password: 'user123', role: 'user' as const }
];

function authenticate(email: string, password: string): User | null {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  return user ? { email: user.email, role: user.role } : null;
}

// ============ STYLES ============
const styles = `
  :root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --muted: #6b7280;
    --text: #0f172a;
    --accent: #ef4444;
    --accent-light: #fca5a5;
    --accent-dark: #b91c1c;
    --success: #10b981;
    --info: #3b82f6;
    --warning: #f59e0b;
    --glass: rgba(255, 255, 255, 0.7);
    --glass-dark: rgba(15, 23, 42, 0.05);
    --radius: 16px;
    --shadow: 0 8px 30px rgba(2, 6, 23, 0.08);
    --shadow-lg: 0 20px 60px rgba(2, 6, 23, 0.12);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  [data-theme="dark"] {
    --bg: #0a0f1e;
    --surface: #111827;
    --muted: #9ca3af;
    --text: #f3f4f6;
    --glass: rgba(17, 24, 39, 0.8);
    --glass-dark: rgba(255, 255, 255, 0.05);
    --shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 25px 70px rgba(0, 0, 0, 0.7);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    overflow-x: hidden;
    transition: background 0.3s, color 0.3s;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Header */
  header {
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(20px);
    background: var(--glass);
    border-bottom: 1px solid var(--glass-dark);
    transition: var(--transition);
  }

  header.scrolled {
    box-shadow: var(--shadow);
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 800;
    font-size: 1.3rem;
    cursor: pointer;
  }

  .logo-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  .nav-links {
    display: flex;
    gap: 32px;
    align-items: center;
  }

  .nav-links a {
    font-weight: 500;
    position: relative;
    padding: 8px 0;
    cursor: pointer;
    transition: var(--transition);
  }

  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--accent);
    transition: width 0.3s;
  }

  .nav-links a:hover::after {
    width: 100%;
  }

  .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: var(--transition);
  font-size: 0.95rem;
  font-family: inherit;
  text-align: center;
  white-space: nowrap;
}

.btn-primary {
display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: var(--transition);
  font-size: 0.95rem;
  font-family: inherit;
  text-align: center;
  white-space: nowrap;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: var(--transition);
  font-size: 0.95rem;
  font-family: inherit;
  text-align: center;
  white-space: nowrap;
  background: var(--surface);
  border: 2px solid var(--glass-dark);
  color: var(--text);
}

.btn-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-ghost {
display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: var(--transition);
  font-size: 0.95rem;
  font-family: inherit;
  text-align: center;
  white-space: nowrap;
  background: transparent;
  color: var(--muted);
  padding: 8px 16px;
}

.btn-ghost:hover {
  color: var(--accent);
  background: var(--glass);
}

  .theme-toggle {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--surface);
    border: 2px solid var(--glass-dark);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
  }

  .theme-toggle:hover {
    border-color: var(--accent);
    transform: rotate(180deg);
  }

  .mobile-toggle {
    display: none;
    width: 48px;
    height: 48px;
    background: var(--surface);
    border: 2px solid var(--glass-dark);
    border-radius: 12px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }

  /* Mobile Menu */
  .mobile-menu {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    background: var(--surface);
    box-shadow: var(--shadow-lg);
    z-index: 200;
    transition: right 0.3s;
    padding: 80px 24px 24px;
  }

  .mobile-menu.open {
    right: 0;
  }

  .mobile-menu-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--glass);
    border: 1px solid var(--glass-dark);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-menu-links {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .mobile-menu-links a {
    padding: 12px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
  }

  .mobile-menu-links a:hover {
    background: var(--glass);
    color: var(--accent);
  }

  .mobile-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 150;
    display: none;
  }

  .mobile-backdrop.open {
    display: block;
  }

  /* Hero */
  .hero {
    padding: 80px 0;
    position: relative;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(239, 68, 68, 0.1), transparent);
    border-radius: 50%;
    animation: float 20s infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  .hero-content {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 60px;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .hero-text h1 {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 24px;
    background: linear-gradient(135deg, var(--text), var(--muted));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .highlight {
    color: var(--accent);
    -webkit-text-fill-color: var(--accent);
  }

  .hero-text p {
    font-size: 1.2rem;
    color: var(--muted);
    margin-bottom: 32px;
    line-height: 1.8;
  }

  .cta-group {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .hero-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 48px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--accent);
    display: block;
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--muted);
  }

  .hero-card {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 32px;
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
    border: 1px solid var(--glass-dark);
  }

  .hero-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--accent), var(--accent-light));
  }

  .feature-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--glass);
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 16px;
    border: 1px solid var(--glass-dark);
  }

  /* Features */
  .features {
    padding: 80px 0;
    background: var(--glass);
  }

  .section-header {
    text-align: center;
    margin-bottom: 64px;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 16px;
  }

  .section-subtitle {
    font-size: 1.1rem;
    color: var(--muted);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;
  }

  .feature-card {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 32px;
    box-shadow: var(--shadow);
    transition: var(--transition);
    border: 1px solid var(--glass-dark);
    position: relative;
    overflow: hidden;
  }

  .feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: var(--accent);
    transform: scaleX(0);
    transition: transform 0.3s;
  }

  .feature-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
  }

  .feature-card:hover::before {
    transform: scaleX(1);
  }

  .feature-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--accent), var(--accent-light));
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }

  .feature-card h3 {
    font-size: 1.3rem;
    margin-bottom: 12px;
  }

  .feature-card p {
    color: var(--muted);
    line-height: 1.7;
  }

  /* Pricing */
  .pricing {
    padding: 80px 0;
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
  }

  .price-card {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 40px 32px;
    box-shadow: var(--shadow);
    transition: var(--transition);
    border: 2px solid var(--glass-dark);
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .price-card.featured {
    border-color: var(--accent);
    transform: scale(1.05);
    box-shadow: var(--shadow-lg);
  }

  .price-card.featured::before {
    content: 'MAIS POPULAR';
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent);
    color: #fff;
    padding: 6px 20px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .price-header h3 {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }

  .price-amount {
    font-size: 3rem;
    font-weight: 800;
    color: var(--accent);
    margin: 20px 0;
  }

  .price-amount span {
    font-size: 1.2rem;
    color: var(--muted);
  }

  .price-features {
    list-style: none;
    margin: 24px 0;
    flex-grow: 1;
  }

  .price-features li {
    padding: 12px 0;
    border-bottom: 1px solid var(--glass-dark);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .price-features li::before {
    content: '✓';
    color: var(--success);
    font-weight: 700;
    font-size: 1.2rem;
  }

  /* Testimonials */
  .testimonials {
    padding: 80px 0;
    background: var(--glass);
  }

  .testimonial-slider {
    position: relative;
    max-width: 900px;
    margin: 0 auto;
  }

  .testimonial-item {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 40px;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--glass-dark);
  }

  .testimonial-text {
    font-size: 1.2rem;
    line-height: 1.8;
    margin-bottom: 24px;
    font-style: italic;
    color: var(--muted);
  }

  .testimonial-author {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .testimonial-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-light), var(--accent));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
  }

  .slider-controls {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;
  }

  .slider-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--muted);
    cursor: pointer;
    transition: var(--transition);
    border: none;
  }

  .slider-dot.active {
    background: var(--accent);
    transform: scale(1.5);
  }

  /* CTA Section */
  .cta-section {
    padding: 80px 0;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .cta-section::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(239, 68, 68, 0.15), transparent);
    border-radius: 50%;
  }

  .cta-content {
    position: relative;
    z-index: 1;
    max-width: 700px;
    margin: 0 auto;
  }

  .cta-content h2 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 24px;
  }

  /* Footer */
  footer {
    background: var(--surface);
    padding: 60px 0 24px;
    border-top: 1px solid var(--glass-dark);
  }

  .footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-col h4 {
    margin-bottom: 16px;
    font-size: 1.1rem;
  }

  .footer-links {
    list-style: none;
  }

  .footer-links li {
    margin-bottom: 12px;
  }

  .footer-links a {
    color: var(--muted);
    transition: var(--transition);
    cursor: pointer;
  }

  .footer-links a:hover {
    color: var(--accent);
  }

  .footer-bottom {
    padding-top: 24px;
    border-top: 1px solid var(--glass-dark);
    text-align: center;
    color: var(--muted);
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: 20px;
  }

  .modal-backdrop.active {
    display: flex;
  }

  .modal {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 32px;
    max-width: 500px;
    width: 100%;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--glass-dark);
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .modal-close {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--glass);
    border: 1px solid var(--glass-dark);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
  }

  .modal-close:hover {
    background: var(--accent);
    color: #fff;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .form-input, .form-select {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 2px solid var(--glass-dark);
    background: var(--surface);
    color: var(--text);
    font-family: inherit;
    transition: var(--transition);
    font-size: 0.95rem;
  }

  .form-input:focus, .form-select:focus {
    outline: none;
    border-color: var(--accent);
  }

  .form-error {
    color: var(--accent);
    font-size: 0.85rem;
    margin-top: 4px;
  }

  .alert {
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .alert-error {
    background: rgba(239, 68, 68, 0.1);
    color: var(--accent);
  }

  .alert-success {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success);
  }

  .alert-info {
    background: rgba(59, 130, 246, 0.1);
    color: var(--info);
  }

  /* Toast */
  .toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 300;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .toast {
    background: var(--surface);
    padding: 16px 20px;
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
    animation: slideIn 0.3s;
  }

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .hero-content {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .hero-text h1 {
      font-size: 2.5rem;
    }

    .nav-links {
      display: none;
    }

    .mobile-toggle {
      display: flex;
    }
  }

  @media (max-width: 768px) {
    .hero-text h1 {
      font-size: 2rem;
    }

    .hero-stats {
      grid-template-columns: 1fr;
    }

    .section-title {
      font-size: 2rem;
    }

    .cta-content h2 {
      font-size: 2rem;
    }

    .pricing-grid {
      grid-template-columns: 1fr;
    }

    .price-card.featured {
      transform: scale(1);
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .footer-grid {
      grid-template-columns: 1fr;
    }

    .cta-group {
      flex-direction: column;
    }

    .cta-group .btn {
      width: 100%;
    }
  }
`;

// ============ MAIN APP ============
export default function AcademiaImpactoLanding() {
  const [theme, setTheme] = useState(storage.getTheme());
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: 'Perdi 15kg em 4 meses com o acompanhamento da equipe. O ambiente é incrível e os professores sempre motivam. Melhor decisão que tomei!',
      author: 'Carlos Pereira',
      avatar: 'CP',
      info: 'Aluno há 8 meses • Plano Anual'
    },
    {
      text: 'As aulas de HIIT são incríveis! Nunca pensei que conseguiria me exercitar com tanta intensidade. A estrutura é de primeiro mundo.',
      author: 'Rafaela Santos',
      avatar: 'RS',
      info: 'Aluna há 1 ano • Plano Trimestral'
    },
    {
      text: 'Consegui ganhar 8kg de massa magra em 6 meses. O acompanhamento nutricional fez toda diferença. Recomendo demais!',
      author: 'Paulo Oliveira',
      avatar: 'PO',
      info: 'Aluno há 6 meses • Plano Mensal'
    }
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLoginModalOpen(false);
        setVisitModalOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      {/* Header */}
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
            <a onClick={() => scrollToSection('features')}>Diferenciais</a>
            <a onClick={() => scrollToSection('pricing')}>Planos</a>
            <button className="btn-ghost" onClick={() => setLoginModalOpen(true)}>
              Entrar
            </button>
            <button className="btn-primary" onClick={() => setVisitModalOpen(true)}>
              Começar Agora
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-backdrop ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>
          <X size={20} />
        </button>
        <div className="mobile-menu-links">
          <a onClick={() => scrollToSection('features')}>Diferenciais</a>
          <a onClick={() => scrollToSection('pricing')}>Planos</a>
          <button className="btn-ghost" style={{ width: '100%' }} onClick={() => { setMobileMenuOpen(false); setLoginModalOpen(true); }}>
            Entrar
          </button>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => { setMobileMenuOpen(false); setVisitModalOpen(true); }}>
            Começar Agora
          </button>
        </div>
      </div>

      {/* Hero */}
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
                <button className="btn-primary" onClick={() => setVisitModalOpen(true)}>
                  🎯 Agendar Visita Gratuita
                </button>
                <button className="btn-secondary" onClick={() => setLoginModalOpen(true)}>
                  Já sou aluno
                </button>
              </div>

              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">2.500+</span>
                  <span className="stat-label">Alunos Ativos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">15</span>
                  <span className="stat-label">Anos de Experiência</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">98%</span>
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

                <button className="btn-primary" style={{ width: '100%' }} onClick={() => setVisitModalOpen(true)}>
                  Garantir Desconto
                </button>
                <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Vagas limitadas • Sem taxa de matrícula
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Por que escolher a Impacto?</h2>
            <p className="section-subtitle">Tecnologia, expertise e dedicação para você alcançar seus objetivos</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Dumbbell size={32} color="white" />
              </div>
              <h3>Equipamentos Premium</h3>
              <p>Máquinas importadas de última geração, área completa de peso livre e zona funcional equipada.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={32} color="white" />
              </div>
              <h3>Aberto 24 Horas</h3>
              <p>Treine no seu horário com acesso liberado 24/7, todos os dias da semana incluindo feriados.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} color="white" />
              </div>
              <h3>Professores CREF</h3>
              <p>Equipe qualificada e certificada para garantir sua segurança e maximizar seus resultados.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Award size={32} color="white" />
              </div>
              <h3>App Exclusivo</h3>
              <p>Acompanhe treinos, evolução, agendamentos e tenha acesso a conteúdos exclusivos.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Target size={32} color="white" />
              </div>
              <h3>Treino Personalizado</h3>
              <p>Planos individualizados baseados em avaliação física completa e seus objetivos.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Utensils size={32} color="white" />
              </div>
              <h3>Nutrição Esportiva</h3>
              <p>Orientação nutricional especializada incluída em todos os planos premium.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Planos que cabem no seu bolso</h2>
            <p className="section-subtitle">Sem taxa de matrícula • Sem fidelidade • Cancele quando quiser</p>
          </div>

          <div className="pricing-grid">
            <div className="price-card">
              <div className="price-header">
                <h3>Mensal</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Flexibilidade total</p>
              </div>
              <div className="price-amount">
                R$ 149<span>/mês</span>
              </div>
              <ul className="price-features">
                <li>Acesso ilimitado 24/7</li>
                <li>App com treinos</li>
                <li>Área de musculação</li>
                <li>Vestiários e armários</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => setVisitModalOpen(true)}>
                Começar Agora
              </button>
            </div>

            <div className="price-card featured">
              <div className="price-header">
                <h3>Trimestral</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Mais economia</p>
              </div>
              <div className="price-amount">
                R$ 399<span>/3 meses</span>
              </div>
              <ul className="price-features">
                <li>Tudo do plano Mensal</li>
                <li>Economia de 10%</li>
                <li>Avaliação física gratuita</li>
                <li>Plano de treino personalizado</li>
                <li>Consultoria nutricional</li>
                <li>Suporte prioritário</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => setVisitModalOpen(true)}>
                Melhor Escolha
              </button>
            </div>

            <div className="price-card">
              <div className="price-header">
                <h3>Anual</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Máximo benefício</p>
              </div>
              <div className="price-amount">
                R$ 1.299<span>/ano</span>
              </div>
              <ul className="price-features">
                <li>Tudo do plano Trimestral</li>
                <li>Economia de 27%</li>
                <li>2 sessões de personal</li>
                <li>Acompanhamento mensal</li>
                <li>Acesso a eventos exclusivos</li>
                <li>1 guest pass por mês</li>
                <li>Toalha e shaker grátis</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => setVisitModalOpen(true)}>
                Garantir Vaga
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">O Que Nossos Alunos Dizem</h2>
            <p className="section-subtitle">Histórias reais de transformação</p>
          </div>

          <div className="testimonial-slider">
            <div className="testimonial-item">
              <div className="testimonial-text">"{testimonials[currentTestimonial].text}"</div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{testimonials[currentTestimonial].avatar}</div>
                <div>
                  <h4>{testimonials[currentTestimonial].author}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {testimonials[currentTestimonial].info}
                  </p>
                </div>
              </div>
            </div>

            <div className="slider-controls">
              {testimonials.map((_, idx) => (
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

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Pronto para sua transformação?</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--muted)', marginBottom: '32px' }}>
              Agende sua visita gratuita e conheça nossa estrutura. Sem compromisso!
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                style={{ fontSize: '1.1rem', padding: '16px 32px' }}
                onClick={() => setVisitModalOpen(true)}
              >
                Agendar Visita Gratuita
              </button>
              <button className="btn-secondary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
                Falar com Consultor
              </button>
            </div>
            <p style={{ marginTop: '24px', color: 'var(--muted)', fontSize: '0.9rem' }}>
              📞 (12) 3633-9999 • 📧 contato@impacto.com.br
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                <li><a onClick={() => scrollToSection('features')}>Diferenciais</a></li>
                <li><a onClick={() => scrollToSection('pricing')}>Planos</a></li>
                <li><a onClick={() => setLoginModalOpen(true)}>Área do Aluno</a></li>
                <li><a onClick={() => setVisitModalOpen(true)}>Agendar Visita</a></li>
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
                <li>📍 Rua Emílio Winther, 123 - Centro</li>
                <li>📞 (12) 3633-9999</li>
                <li>📧 contato@impacto.com.br</li>
                <li>⏰ Aberto 24 horas</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 Academia Impacto. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={(user) => {
          storage.setUser(user);
          showToast(`Bem-vindo, ${user.email}!`, 'success');
          setLoginModalOpen(false);
          
          // Simulate redirect
          setTimeout(() => {
            const path = user.role === 'admin' ? '/painel_admin' : '/painel_usuario';
            showToast(`Redirecionando para ${path}...`, 'info');
            // In production: window.location.href = path;
            console.log(`🔗 Navigation to: ${path}`);
          }, 1000);
        }}
        showToast={showToast}
      />

      {/* Visit Modal */}
      <VisitModal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        onSuccess={(visit) => {
          storage.addVisit(visit);
          showToast('Agendamento confirmado! Entraremos em contato.', 'success');
          setVisitModalOpen(false);
        }}
        showToast={showToast}
      />

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            {toast.type === 'success' && <CheckCircle size={20} color="var(--success)" />}
            {toast.type === 'error' && <AlertCircle size={20} color="var(--accent)" />}
            {toast.type === 'info' && <AlertCircle size={20} color="var(--info)" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ============ LOGIN MODAL COMPONENT ============
function LoginModal({ isOpen, onClose, onSuccess, showToast }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  showToast: (message: string, type: Toast['type']) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setRemember(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Track analytics (mock)
    console.log('📊 Analytics Event: login_attempt', { email });

    const user = authenticate(email, password);

    if (!user) {
      setError('E-mail ou senha incorretos. Use as contas demo abaixo.');
      console.log('📊 Analytics Event: login_failed', { email });
      return;
    }

    if (remember) {
      storage.setUser(user);
    }

    console.log('📊 Analytics Event: login_success', { email, role: user.role });
    onSuccess(user);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Entrar na sua conta</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">E-mail</label>
            <input
              type="email"
              id="login-email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Senha</label>
            <input
              type="password"
              id="login-password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span style={{ fontSize: '0.9rem' }}>Lembrar-me</span>
            </label>
            <a style={{ fontSize: '0.9rem', color: 'var(--accent)', cursor: 'pointer' }}>
              Esqueci a senha
            </a>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
            Entrar
          </button>
          <button type="button" className="btn-secondary" style={{ width: '100%' }}>
            Criar conta
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--glass)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--muted)' }}>
          <strong>Contas demo:</strong><br />
          Admin: admin@impacto.com / admin123<br />
          Usuário: user@impacto.com / user123
        </div>
      </div>
    </div>
  );
}

// ============ VISIT MODAL COMPONENT ============
function VisitModal({ isOpen, onClose, onSuccess, showToast }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (visit: Visit) => void;
  showToast: (message: string, type: Toast['type']) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', phone: '', date: '', time: '' });
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'E-mail inválido';
    if (!formData.phone.replace(/\D/g, '').match(/^\d{10,11}$/)) newErrors.phone = 'Telefone inválido';
    if (!formData.date) newErrors.date = 'Data é obrigatória';
    if (!formData.time) newErrors.time = 'Horário é obrigatório';

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) newErrors.date = 'Data não pode ser no passado';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const visit: Visit = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    // Track analytics (mock)
    console.log('📊 Analytics Event: visit_scheduled', visit);

    // Mock API call
    console.log('🌐 POST /api/visits', visit);
    
    onSuccess(visit);
  };

  const handleExport = () => {
    const visits = storage.getVisits();
    const data = JSON.stringify(visits, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agendamentos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Agendamentos exportados com sucesso', 'success');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        if (storage.importData(text)) {
          showToast('Dados importados com sucesso', 'success');
        } else {
          showToast('Erro ao importar arquivo', 'error');
        }
      } catch {
        showToast('Arquivo inválido', 'error');
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Agendar Visita Gratuita</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="modal-close" onClick={handleExport} aria-label="Exportar" title="Exportar agendamentos">
              <Download size={18} />
            </button>
            <button className="modal-close" onClick={handleImport} aria-label="Importar" title="Importar dados">
              <Upload size={18} />
            </button>
            <button className="modal-close" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="visit-name">Nome completo *</label>
            <input
              type="text"
              id="visit-name"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Seu nome"
              autoFocus
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="visit-email">E-mail *</label>
            <input
              type="email"
              id="visit-email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="visit-phone">Telefone *</label>
            <input
              type="tel"
              id="visit-phone"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(12) 99999-9999"
            />
            {errors.phone && <div className="form-error">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="visit-date">Melhor dia *</label>
            <input
              type="date"
              id="visit-date"
              className="form-input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.date && <div className="form-error">{errors.date}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="visit-time">Horário preferido *</label>
            <select
              id="visit-time"
              className="form-select"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            >
              <option value="">Selecione</option>
              <option value="manha">Manhã (6h - 12h)</option>
              <option value="tarde">Tarde (12h - 18h)</option>
              <option value="noite">Noite (18h - 22h)</option>
            </select>
            {errors.time && <div className="form-error">{errors.time}</div>}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Confirmar Agendamento
          </button>
        </form>

        <div className="alert alert-info" style={{ marginTop: '16px' }}>
          <AlertCircle size={18} />
          <div style={{ fontSize: '0.85rem' }}>
            Você receberá uma confirmação por e-mail com todos os detalhes da sua visita.
          </div>
        </div>
      </div>
    </div>
  );
}