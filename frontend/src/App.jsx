import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import RootAuthEntry from './auth/RootAuthEntry';
import ProtectedRoute from './auth/ProtectedRoute';
import Logout from './pages/Logout';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Facilities from './pages/Facilities';
import './App.css';

/**
 * App Component
 *
 * Configures client-side routing with Keycloak authentication:
 * - Single authentication entry point at `/` (`<RootAuthEntry />`)
 * - Dedicated explicit logout handler at `/logout` (`<Logout />`)
 * - Protected application routes wrapped in `<ProtectedRoute>`:
 *   - `/dashboard`
 *   - `/analytics`
 *   - `/facilities`
 *   - `/offices`
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root authentication entry point */}
          <Route path="/" element={<RootAuthEntry />} />

          {/* Dedicated logout route */}
          <Route path="/logout" element={<Logout />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/offices" element={<Facilities />} />

            {/* Sub-analytics redirects to /analytics */}
            <Route path="/land" element={<Navigate to="/analytics" replace />} />
            <Route path="/data-quality" element={<Navigate to="/analytics" replace />} />
            <Route path="/risk-compliance" element={<Navigate to="/analytics" replace />} />
          </Route>

          {/* Catch-all fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
