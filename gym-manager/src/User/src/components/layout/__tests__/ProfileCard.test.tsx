// ============ src/components/layout/__tests__/ProfileCard.test.tsx ============
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import { ProfileCard } from '../index'
import { mockUserData } from '../../../test/mockData'

describe('ProfileCard Component', () => {
  it('should render user profile information', () => {
    render(
      <ProfileCard 
        profile={mockUserData.profile} 
        streak={mockUserData.streak} 
      />
    )
    
    expect(screen.getByText(mockUserData.profile.name)).toBeInTheDocument()
    expect(screen.getByText(mockUserData.profile.email)).toBeInTheDocument()
  })

  it('should display user badges', () => {
    render(
      <ProfileCard 
        profile={mockUserData.profile} 
        streak={mockUserData.streak} 
      />
    )
    
    expect(screen.getByText(mockUserData.profile.plan)).toBeInTheDocument()
    expect(screen.getByText(/nível 5/i)).toBeInTheDocument()
    expect(screen.getByText(/7 dias/i)).toBeInTheDocument()
  })

  it('should display plan expiration date', () => {
    render(
      <ProfileCard 
        profile={mockUserData.profile} 
        streak={mockUserData.streak} 
      />
    )
    
    expect(screen.getByText(mockUserData.profile.expires)).toBeInTheDocument()
  })

  it('should display user initial in profile pic', () => {
    render(
      <ProfileCard 
        profile={mockUserData.profile} 
        streak={mockUserData.streak} 
      />
    )
    
    const initial = mockUserData.profile.name[0]
    expect(screen.getByText(initial)).toBeInTheDocument()
  })
})
