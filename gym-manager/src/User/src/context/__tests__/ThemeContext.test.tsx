// ============ src/context/__tests__/ThemeContext.test.tsx ============
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils'
import { useTheme } from '../ThemeContext'
import userEvent from '@testing-library/user-event'

function TestComponent() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}

describe('ThemeContext', () => {
  it('should provide theme value', () => {
    render(<TestComponent />)
    
    const themeElement = screen.getByTestId('theme')
    expect(themeElement).toHaveTextContent(/light|dark/)
  })

  it('should toggle theme when toggleTheme is called', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)
    
    const initialTheme = screen.getByTestId('theme').textContent
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    
    await user.click(toggleButton)
    
    const newTheme = screen.getByTestId('theme').textContent
    expect(newTheme).not.toBe(initialTheme)
  })
})
