import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Facilities from './pages/Facilities';
import './App.css';

/**
 * App Component
 *
 * Configures client-side routing for the API-supported views:
 * - Master layout wrapping all views (`<DashboardLayout />`)
 * - Default root `/` redirects to `/facilities`
 * - Dedicated routes for live API data: `/facilities` and `/offices`
 * - Unsupported routes (`/dashboard`, `/analytics`, `/land`, `/risk-compliance`, `/data-quality`, etc.) redirect to `/facilities`
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          {/* Default root redirects to /facilities */}
          <Route index element={<Navigate to="/facilities" replace />} />

          {/* Live API Supported Routes */}
          <Route path="facilities" element={<Facilities />} />
          <Route path="offices" element={<Facilities />} />

          {/* Unsupported routes redirected to /facilities */}
          <Route path="dashboard" element={<Navigate to="/facilities" replace />} />
          <Route path="analytics" element={<Navigate to="/facilities" replace />} />
          <Route path="land" element={<Navigate to="/facilities" replace />} />
          <Route path="risk-compliance" element={<Navigate to="/facilities" replace />} />
          <Route path="data-quality" element={<Navigate to="/facilities" replace />} />

          {/* Catch-all fallback route */}
          <Route path="*" element={<Navigate to="/facilities" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
