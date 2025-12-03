// ============ src/components/common/__tests__/Modal.test.tsx ============
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import { Modal } from '../index'

describe('Modal Component', () => {
  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        Content
      </Modal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        Content
      </Modal>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should display title', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        Content
      </Modal>
    )
    expect(screen.getByText(/test modal/i)).toBeInTheDocument()
  })

  it('should display children content', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <div>Test Content</div>
      </Modal>
    )
    expect(screen.getByText(/test content/i)).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    )
    
    const closeButton = screen.getByRole('button', { name: /fechar modal/i })
    await user.click(closeButton)
    
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when backdrop is clicked', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    )
    
    const backdrop = screen.getByRole('dialog')
    await user.click(backdrop)
    
    expect(handleClose).toHaveBeenCalled()
  })

  it('should not call onClose when modal content is clicked', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <div data-testid="modal-content">Content</div>
      </Modal>
    )
    
    const content = screen.getByTestId('modal-content')
    await user.click(content)
    
    expect(handleClose).not.toHaveBeenCalled()
  })
})
