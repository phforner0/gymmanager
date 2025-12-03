import React from 'react';
import { Profile } from '../../types';
import { Badge } from '../common';

interface ProfileCardProps {
  profile: Profile;
  streak: number;
}

export function ProfileCard({ profile, streak }: ProfileCardProps) {
  return (
    <div className="card">
      <div className="profile-section">
        <div className="profile-pic">{profile.name[0]}</div>
        
        <div>
          <h2>{profile.name}</h2>
          <div className="muted">{profile.email}</div>
          
          <div style={{ marginTop: 8 }}>
            <Badge variant="primary">{profile.plan}</Badge>
            <Badge variant="info">Nível {profile.level}</Badge>
            <Badge variant="success">🔥 {streak} dias</Badge>
          </div>
        </div>
        
        <div 
          style={{ marginLeft: 'auto', textAlign: 'right' }} 
          className="desktop-only"
        >
          <div className="muted">Validade</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {profile.expires}
          </div>
        </div>
      </div>
    </div>
  );
}