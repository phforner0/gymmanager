import { FormErrors, VisitFormData } from '../types';

/**
 * Validation utilities
 */

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return /^\d{10,11}$/.test(cleaned);
};

export const validateDate = (date: string): boolean => {
  if (!date) return false;
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return selectedDate >= today;
};

export const validateVisitForm = (formData: VisitFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.name.trim()) {
    errors.name = 'Nome é obrigatório';
  }

  if (!validateEmail(formData.email)) {
    errors.email = 'E-mail inválido';
  }

  if (!validatePhone(formData.phone)) {
    errors.phone = 'Telefone inválido (mínimo 10 dígitos)';
  }

  if (!formData.date) {
    errors.date = 'Data é obrigatória';
  } else if (!validateDate(formData.date)) {
    errors.date = 'Data não pode ser no passado';
  }

  if (!formData.time) {
    errors.time = 'Horário é obrigatório';
  }

  return errors;
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};