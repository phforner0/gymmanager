// ============ src/services/__tests__/validation.service.test.ts ============
import { describe, it, expect } from 'vitest'
import { ValidationService } from '../validation.service'

describe('ValidationService', () => {
  describe('validateWorkout', () => {
    it('should validate correct workout data', () => {
      const data = {
        name: 'Test Workout',
        exercises: 'Supino 4x8\nAgachamento 3x10'
      }
      
      const result = ValidationService.validateWorkout(data)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail when name is empty', () => {
      const data = {
        name: '',
        exercises: 'Supino 4x8'
      }
      
      const result = ValidationService.validateWorkout(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Nome do treino é obrigatório')
    })

    it('should fail when exercises is empty', () => {
      const data = {
        name: 'Test Workout',
        exercises: ''
      }
      
      const result = ValidationService.validateWorkout(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Adicione pelo menos um exercício')
    })

    it('should fail when both name and exercises are empty', () => {
      const data = {
        name: '',
        exercises: ''
      }
      
      const result = ValidationService.validateWorkout(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
    })
  })

  describe('validateMeasurement', () => {
    it('should validate correct measurement data', () => {
      const data = {
        weight: '75',
        height: '175',
        chest: '',
        waist: '',
        arm: '',
        thigh: ''
      }
      
      const result = ValidationService.validateMeasurement(data)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail when all fields are empty', () => {
      const data = {
        weight: '',
        height: '',
        chest: '',
        waist: '',
        arm: '',
        thigh: ''
      }
      
      const result = ValidationService.validateMeasurement(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Preencha pelo menos uma medida')
    })

    it('should fail when value is negative', () => {
      const data = {
        weight: '-75',
        height: '',
        chest: '',
        waist: '',
        arm: '',
        thigh: ''
      }
      
      const result = ValidationService.validateMeasurement(data)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('deve ser um número positivo')
    })

    it('should fail when value is not a number', () => {
      const data = {
        weight: 'abc',
        height: '',
        chest: '',
        waist: '',
        arm: '',
        thigh: ''
      }
      
      const result = ValidationService.validateMeasurement(data)
      expect(result.valid).toBe(false)
    })
  })

  describe('validateGoal', () => {
    it('should validate correct goal data', () => {
      const data = {
        title: 'Test Goal',
        target: '12',
        deadline: '2025-12-31'
      }
      
      const result = ValidationService.validateGoal(data)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail when title is empty', () => {
      const data = {
        title: '',
        target: '12',
        deadline: '2025-12-31'
      }
      
      const result = ValidationService.validateGoal(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Título da meta é obrigatório') // ← CORRETO
    })

    it('should fail when target is zero or negative', () => {
      const data = {
        title: 'Test Goal',
        target: '0',
        deadline: '2025-12-31'
      }
      
      const result = ValidationService.validateGoal(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Meta deve ser um número positivo')
    })

    it('should fail when deadline is empty', () => {
      const data = {
        title: 'Test Goal',
        target: '12',
        deadline: ''
      }
      
      const result = ValidationService.validateGoal(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Data limite é obrigatória')
    })
  })
})
