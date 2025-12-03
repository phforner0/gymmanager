// ============ src/components/workouts/__tests__/WorkoutItem.test.tsx ============
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import { WorkoutItem } from '../index'
import { mockWorkout } from '../../../test/mockData'

describe('WorkoutItem Component', () => {
  const mockHandlers = {
    onToggle: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render workout details', () => {
    render(<WorkoutItem workout={mockWorkout} {...mockHandlers} />)
    
    expect(screen.getByText(mockWorkout.name)).toBeInTheDocument()
    expect(screen.getByText(/2 exercícios/i)).toBeInTheDocument()
    expect(screen.getByText(/seg/i)).toBeInTheDocument()
  })

  it('should display workout tags', () => {
    render(<WorkoutItem workout={mockWorkout} {...mockHandlers} />)
    
    mockWorkout.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument()
    })
  })

  it('should call onToggle when mark button is clicked', async () => {
    const user = userEvent.setup()
    render(<WorkoutItem workout={mockWorkout} {...mockHandlers} />)
    
    const markButton = screen.getByText(/marcar/i)
    await user.click(markButton)
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockWorkout.id)
  })

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<WorkoutItem workout={mockWorkout} {...mockHandlers} />)
    
    const editButton = screen.getByRole('button', { name: /editar/i })
    await user.click(editButton)
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockWorkout)
  })

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<WorkoutItem workout={mockWorkout} {...mockHandlers} />)
    
    const deleteButton = screen.getAllByRole('button')[2]
    await user.click(deleteButton)
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockWorkout.id)
  })

  it('should show completed status when workout is completed', () => {
    const completedWorkout = { ...mockWorkout, completed: true }
    render(<WorkoutItem workout={completedWorkout} {...mockHandlers} />)
    
    expect(screen.getByText(/concluído/i)).toBeInTheDocument()
  })

  it('should display category badge', () => {
    render(<WorkoutItem workout={mockWorkout} {...mockHandlers} />)
    
    expect(screen.getByText(mockWorkout.category)).toBeInTheDocument()
  })

  it('should display completion count', () => {
    const workoutWithDates = {
      ...mockWorkout,
      completedDates: [Date.now(), Date.now() - 86400000]
    }
    render(<WorkoutItem workout={workoutWithDates} {...mockHandlers} />)
    
    expect(screen.getByText(/2x realizado/i)).toBeInTheDocument()
  })
})
