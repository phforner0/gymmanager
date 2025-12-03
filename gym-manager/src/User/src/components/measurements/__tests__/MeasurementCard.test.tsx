// ============ src/components/measurements/__tests__/MeasurementCard.test.tsx ============
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import { MeasurementCard } from '../index'
import { mockMeasurement } from '../../../test/mockData'

describe('MeasurementCard Component', () => {
  it('should render all measurement values', () => {
    render(<MeasurementCard measurement={mockMeasurement} />)
    
    expect(screen.getByText(/75 kg/i)).toBeInTheDocument()
    expect(screen.getByText(/100 cm/i)).toBeInTheDocument()
    expect(screen.getByText(/80 cm/i)).toBeInTheDocument()
    expect(screen.getByText(/38 cm/i)).toBeInTheDocument()
    expect(screen.getByText(/55 cm/i)).toBeInTheDocument()
  })

  it('should calculate and display BMI', () => {
    render(<MeasurementCard measurement={mockMeasurement} />)
    
    const expectedBMI = (75 / Math.pow(175 / 100, 2)).toFixed(1)
    expect(screen.getByText(expectedBMI)).toBeInTheDocument()
  })

  it('should display measurement date', () => {
    render(<MeasurementCard measurement={mockMeasurement} />)
    
    const dateStr = new Date(mockMeasurement.date).toLocaleDateString()
    expect(screen.getByText(dateStr)).toBeInTheDocument()
  })

  it('should display notes when present', () => {
    render(<MeasurementCard measurement={mockMeasurement} />)
    
    expect(screen.getByText(mockMeasurement.notes)).toBeInTheDocument()
  })

  it('should show comparison with previous measurement', () => {
    const previousMeasurement = {
      ...mockMeasurement,
      weight: 77,
      date: Date.now() - 86400000
    }
    
    render(
      <MeasurementCard 
        measurement={mockMeasurement} 
        previous={previousMeasurement} 
      />
    )
    
    expect(screen.getByText(/-2\.0/i)).toBeInTheDocument()
  })

  it('should handle missing values gracefully', () => {
    const incompleteMeasurement = {
      ...mockMeasurement,
      weight: null,
      chest: null
    }
    
    render(<MeasurementCard measurement={incompleteMeasurement} />)
    
    expect(screen.getAllByText(/-/)).toHaveLength(3) // weight, chest, BMI
  })
})
