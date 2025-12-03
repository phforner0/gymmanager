import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './LandingPage/context/AuthContext';
import LandingPage from './LandingPage/App';

const AdminApp = lazy(() => import('./Admin/App'));
const UserApp = lazy(() => import('./User/src/App'));

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Carregando...</div>}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/user/*" element={<UserApp />} />
          <Route path="/*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
