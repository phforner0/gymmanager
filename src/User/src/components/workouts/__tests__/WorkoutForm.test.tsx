// ============ src/components/workouts/__tests__/WorkoutForm.test.tsx ============
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import { WorkoutForm } from '../index'
import { mockWorkout } from '../../../test/mockData'

describe('WorkoutForm Component', () => {
  const mockHandlers = {
    onSave: vi.fn(),
    onCancel: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all form fields', () => {
    render(<WorkoutForm workout={null} {...mockHandlers} />)
    
    expect(screen.getByLabelText(/nome do treino/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dia da semana/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/exercícios/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
  })

  it('should populate form when editing existing workout', () => {
    render(<WorkoutForm workout={mockWorkout} {...mockHandlers} />)
    
    expect(screen.getByDisplayValue(mockWorkout.name)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockWorkout.day)).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<WorkoutForm workout={null} {...mockHandlers} />)
    
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)
    
    const nameInput = screen.getByLabelText(/nome do treino/i)
    expect(nameInput).toBeInvalid()
  })

  it('should call onSave with form data when valid', async () => {
    const user = userEvent.setup()
    render(<WorkoutForm workout={null} {...mockHandlers} />)
    
    await user.type(screen.getByLabelText(/nome do treino/i), 'Novo Treino')
    await user.type(screen.getByLabelText(/exercícios/i), 'Supino 4x8\nAgachamento 3x10')
    
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)
    
    expect(mockHandlers.onSave).toHaveBeenCalled()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<WorkoutForm workout={null} {...mockHandlers} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)
    
    expect(mockHandlers.onCancel).toHaveBeenCalled()
  })

  it('should allow selecting different workout categories', async () => {
    const user = userEvent.setup()
    render(<WorkoutForm workout={null} {...mockHandlers} />)
    
    const categorySelect = screen.getByLabelText(/categoria/i)
    await user.selectOptions(categorySelect, 'Força')
    
    expect(screen.getByDisplayValue('Força')).toBeInTheDocument()
  })

  it('should allow selecting different days', async () => {
    const user = userEvent.setup()
    render(<WorkoutForm workout={null} {...mockHandlers} />)
    
    const daySelect = screen.getByLabelText(/dia da semana/i)
    await user.selectOptions(daySelect, 'Qua')
    
    expect(screen.getByDisplayValue('Qua')).toBeInTheDocument()
  })
})

it('should not call onSave when fields are empty', async () => {
  const user = userEvent.setup()
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()
  
  render(<WorkoutForm onSave={mockOnSave} onCancel={mockOnCancel} workout={null} />)
  
  const submitButton = screen.getByRole('button', { name: /salvar/i })
  await user.click(submitButton)
  
  expect(mockOnSave).not.toHaveBeenCalled()
})