//gymmanager\src\User\src\test\utils.tsx
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '../context/ThemeContext'

interface AllTheProvidersProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Export tudo de testing-library exceto render
export { screen, waitFor, within, fireEvent } from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { customRender as render }