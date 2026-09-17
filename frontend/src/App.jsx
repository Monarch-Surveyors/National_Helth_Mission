import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Facilities from './pages/Facilities';
import './App.css';

/**
 * App Component
 *
 * Configures client-side routing for the live API-supported views:
 * - Master layout wrapping all views (`<DashboardLayout />`)
 * - Default root `/` redirects to `/dashboard`
 * - Dedicated routes for live API data:
 *   - `/dashboard` (Executive Summary Dashboard)
 *   - `/analytics` (Comprehensive Infrastructure Analytics & Quality Hub)
 *   - `/facilities` (Health Facilities Register)
 *   - `/offices` (Administrative Offices Register)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          {/* Default root redirects to /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Live API Supported Routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="facilities" element={<Facilities />} />
          <Route path="offices" element={<Facilities />} />

          {/* Sub-analytics redirects to /analytics */}
          <Route path="land" element={<Navigate to="/analytics" replace />} />
          <Route path="data-quality" element={<Navigate to="/analytics" replace />} />
          <Route path="risk-compliance" element={<Navigate to="/analytics" replace />} />

          {/* Catch-all fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
