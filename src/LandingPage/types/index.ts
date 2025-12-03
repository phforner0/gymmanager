// gymmanager/src/LandingPage/types/index.ts
// ============ USER TYPES ============
export interface User {
  id: string; // ✅ Remova o "?"
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// ============ VISIT TYPES ============
export interface Visit {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  createdAt: string;
}

export interface VisitFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
}

// ============ TOAST TYPES ============
export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ============ TESTIMONIAL TYPES ============
export interface Testimonial {
  text: string;
  author: string;
  avatar: string;
  info: string;
}

// ============ PRICE PLAN TYPES ============
export interface PricePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  featured?: boolean;
  badge?: string;
}

// ============ FORM ERRORS ============
export type FormErrors = Record<string, string>;

// ============ MOCK USER ============
export interface MockUser {
  email: string;
  password: string;
  role: 'admin' | 'user';
}