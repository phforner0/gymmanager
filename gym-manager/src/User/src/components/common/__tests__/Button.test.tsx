// ============ src/components/common/__tests__/Button.test.tsx ============
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import { Button } from '../index'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should apply ghost variant class', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    expect(screen.getByRole('button')).toHaveClass('ghost')
  })

  it('should apply success variant class', () => {
    render(<Button variant="success">Success Button</Button>)
    expect(screen.getByRole('button')).toHaveClass('success')
  })

  it('should apply small size class', () => {
    render(<Button size="sm">Small Button</Button>)
    expect(screen.getByRole('button')).toHaveClass('sm')
  })

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick} disabled>Click me</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).not.toHaveBeenCalled()
  })
})
