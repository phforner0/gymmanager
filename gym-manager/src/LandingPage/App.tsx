import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LandingPage />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;