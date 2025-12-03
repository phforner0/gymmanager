import { ValidationResult } from '../types';

export class ValidationService {
  static validateWorkout(data: any): ValidationResult {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome do treino é obrigatório');
    }
    
    if (!data.exercises || data.exercises.trim().length === 0) {
      errors.push('Adicione pelo menos um exercício');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  static validateMeasurement(data: any): ValidationResult {
    const errors: string[] = [];
    
    const numFields = ['weight', 'height', 'chest', 'waist', 'arm', 'thigh'];
    let hasAnyValue = false;
    
    numFields.forEach(field => {
      if (data[field] && data[field].trim()) {
        const val = parseFloat(data[field]);
        if (isNaN(val) || val <= 0) {
          errors.push(`${field} deve ser um número positivo`);
        }
        hasAnyValue = true;
      }
    });
    
    if (!hasAnyValue) {
      errors.push('Preencha pelo menos uma medida');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  static validateGoal(data: any): ValidationResult {
    const errors: string[] = [];
    
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Título da meta é obrigatório');
    }
    
    if (!data.target || parseFloat(data.target) <= 0) {
      errors.push('Meta deve ser um número positivo');
    }
    
    if (!data.deadline) {
      errors.push('Data limite é obrigatória');
    }
    
    return { valid: errors.length === 0, errors };
  }
}