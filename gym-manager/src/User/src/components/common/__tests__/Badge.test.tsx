// ============ src/components/common/__tests__/Badge.test.tsx ============
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import { Badge } from '../index'

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText(/test badge/i)).toBeInTheDocument()
  })

  it('should apply primary variant by default', () => {
    render(<Badge>Badge</Badge>)
    expect(screen.getByText(/badge/i)).toHaveClass('primary')
  })

  it('should apply success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    expect(screen.getByText(/success/i)).toHaveClass('success')
  })

  it('should apply warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>)
    expect(screen.getByText(/warning/i)).toHaveClass('warning')
  })

  it('should apply info variant', () => {
    render(<Badge variant="info">Info</Badge>)
    expect(screen.getByText(/info/i)).toHaveClass('info')
  })
})
