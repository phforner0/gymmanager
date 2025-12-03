// ============ src/components/layout/__tests__/StatsGrid.test.tsx ============
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import { StatsGrid } from '../index'
import { mockUserData } from '../../../test/mockData'

describe('StatsGrid Component', () => {
  it('should display total workouts', () => {
    render(
      <StatsGrid 
        workouts={mockUserData.workouts}
        streak={mockUserData.streak}
        volume={mockUserData.volume}
      />
    )
    
    expect(screen.getByText(/total de treinos/i)).toBeInTheDocument()
    expect(screen.getByText(mockUserData.workouts.length.toString())).toBeInTheDocument()
  })

  it('should display streak', () => {
    render(
      <StatsGrid 
        workouts={mockUserData.workouts}
        streak={mockUserData.streak}
        volume={mockUserData.volume}
      />
    )
    
    expect(screen.getByText(/sequência/i)).toBeInTheDocument()
    expect(screen.getByText(mockUserData.streak.toString())).toBeInTheDocument()
  })

  it('should display volume', () => {
    render(
      <StatsGrid 
        workouts={mockUserData.workouts}
        streak={mockUserData.streak}
        volume={1000}
      />
    )
    
    expect(screen.getByText(/volume total/i)).toBeInTheDocument()
    expect(screen.getByText('1.000')).toBeInTheDocument()
  })

  it('should calculate completed workouts percentage', () => {
    const workouts = [
      { ...mockUserData.workouts[0], completed: true },
      { ...mockUserData.workouts[0], id: 'w2', completed: false }
    ]
    
    render(
      <StatsGrid 
        workouts={workouts}
        streak={mockUserData.streak}
        volume={mockUserData.volume}
      />
    )
    
    expect(screen.getByText(/concluídos/i)).toBeInTheDocument()
  })
})
