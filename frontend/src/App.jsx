import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Facilities from './pages/Facilities';
import GisMap from './pages/GisMap';
import Analytics from './pages/Analytics';
import Land from './pages/Land';
import RiskCompliance from './pages/RiskCompliance';
import DataQuality from './pages/DataQuality';
import './App.css';

/**
 * App Component
 *
 * Configures client-side routing for the 7 dashboard views using `react-router-dom`.
 * Demonstrates clean, beginner-friendly declarative routing:
 * - Master layout wrapping all views (`<DashboardLayout />`)
 * - Default root redirecting to `/dashboard`
 * - 7 dedicated view routes
 * - Catch-all wildcard redirecting to `/dashboard`
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Master layout wrapping all dashboard pages */}
        <Route path="/" element={<DashboardLayout />}>
          {/* Default root redirects to /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* 7 Core Application Routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="facilities" element={<Facilities />} />
          <Route path="gis" element={<GisMap />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="land" element={<Land />} />
          <Route path="risk-compliance" element={<RiskCompliance />} />
          <Route path="data-quality" element={<DataQuality />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
