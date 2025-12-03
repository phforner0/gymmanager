import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '../useToast'

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should initialize with null toast', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toast).toBe(null)
  })

  it('should show toast message', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showToast('Test message')
    })
    
    expect(result.current.toast).toBe('Test message')
  })

  it('should hide toast after 3 seconds', async () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showToast('Test message')
    })
    
    expect(result.current.toast).toBe('Test message')
    
    // Esperar o timer
    await act(async () => {
      vi.advanceTimersByTime(3000)
      await Promise.resolve() // Aguardar a atualização
    })
    
    expect(result.current.toast).toBe(null)
  }, 10000)

  it('should replace existing toast with new message', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showToast('First message')
    })
    
    expect(result.current.toast).toBe('First message')
    
    act(() => {
      result.current.showToast('Second message')
    })
    
    expect(result.current.toast).toBe('Second message')
  })
})