import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './LandingPage/context/AuthContext';
import LandingPage from './LandingPage/App';

const AdminApp = lazy(() => import('./Admin/App'));
const AthleteApp = lazy(() => import('./athlete-dashboard'));

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Carregando...</div>}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/athlete-dashboard" element={<AthleteApp />} />
          <Route path="/*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
