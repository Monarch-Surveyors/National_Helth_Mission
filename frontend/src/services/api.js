/**
 * National Health Mission - Maharashtra Health Infrastructure
 * API Service Layer (Placeholder)
 *
 * Future Django REST API integration will be added here.
 *
 * This file is currently a placeholder only.
 * No real API requests are made.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const nhmApi = {
  // Placeholder methods for future DRF integration
  getDashboardKPIs: async () => {
    // Future Django REST API integration will be added here.
    return null;
  },
  getFacilities: async () => {
    // Future Django REST API integration will be added here.
    return [];
  },
  getDistrictSummary: async () => {
    // Future Django REST API integration will be added here.
    return [];
  },
  getLandAnalytics: async () => {
    // Future Django REST API integration will be added here.
    return null;
  },
  getRiskReports: async () => {
    // Future Django REST API integration will be added here.
    return [];
  },
  getDataQualityReport: async () => {
    // Future Django REST API integration will be added here.
    return null;
  }
};

export default nhmApi;
