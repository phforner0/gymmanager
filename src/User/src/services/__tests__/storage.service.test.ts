import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storage } from '../storage.service' // ← Remova o ./
import { Storage } from '../../types'

describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should get empty storage initially', () => {
    const result = storage.getStorage()
    expect(result).toEqual({})
  })

  it('should save and retrieve storage', () => {
    const testData: Storage = { 
      'test@email.com': { 
        profile: { 
          email: 'test@email.com', 
          name: 'Test',
          role: 'user',
          plan: 'Mensal',
          expires: '2025-12-31',
          level: 1
        },
        workouts: [],
        measurements: [],
        achievements: [],
        notes: '',
        volume: 0,
        streak: 0,
        goals: [],
        timerHistory: []
      } 
    }
    
    storage.saveStorage(testData)
    const result = storage.getStorage()
    
    expect(result).toEqual(testData)
  })

  it('should get user data with defaults', () => {
    const userData = storage.getUserData('test@email.com')
    
    expect(userData).toHaveProperty('profile')
    expect(userData).toHaveProperty('workouts')
    expect(userData).toHaveProperty('measurements')
    expect(userData).toHaveProperty('achievements')
    expect(userData.profile.email).toBe('test@email.com')
  })

  it('should set user data', () => {
    const testUserData = storage.getUserData('test@email.com')
    testUserData.notes = 'Test notes'
    
    storage.setUserData('test@email.com', testUserData)
    const retrieved = storage.getUserData('test@email.com')
    
    expect(retrieved.notes).toBe('Test notes')
  })

  it('should handle localStorage errors gracefully', () => {
    vi.spyOn(globalThis.Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage error')
    })
    
    const result = storage.getStorage()
    expect(result).toEqual({})
  })
})