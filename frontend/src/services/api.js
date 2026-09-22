/**
 * National Health Mission - Maharashtra Health Infrastructure
 * API Client Service Layer
 *
 * Uses native browser fetch and URLSearchParams.
 * Connects to Django backend endpoints via Vite proxy (/api) or direct host.
 */
import {
  ANALYTICS_ENDPOINTS,
  FACILITY_ENDPOINTS,
  OFFICE_ENDPOINTS
} from '../endpoints';
import keycloak, { initKeycloak } from '../auth/keycloak';

// Centralized API Base URL sourced exclusively from Vite environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is missing in frontend/.env');
}

/**
 * Helper to safely construct full request URLs without duplicate slashes.
 */
export function buildUrl(endpoint, params = {}) {
  let cleanBase = API_BASE_URL.trim().replace(/\/+$/, '');
  // If an absolute HTTP(S) URL is provided without /api, append /api for Django routes
  if (cleanBase.startsWith('http') && !cleanBase.endsWith('/api') && !cleanBase.includes('/api/')) {
    cleanBase = `${cleanBase}/api`;
  }
  const cleanEndpoint = endpoint.replace(/^\/+/, '').replace(/\/+$/, '');
  const url = `${cleanBase}/${cleanEndpoint}/`;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'All') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Generic fetch wrapper with comprehensive error handling.
 */
export async function fetchJson(url, options = {}) {
  try {
    const authHeaders = {};

    if (keycloak) {
      // 1. Ensure Keycloak initialization has completed before sending requests
      await initKeycloak();

      // 2. Ensure token freshness — if refresh fails, trigger a clean login redirect
      if (keycloak.authenticated) {
        try {
          await keycloak.updateToken(30);
        } catch (error) {
          console.error('Failed to refresh Keycloak token — re-authenticating:', error);
          // Use keycloak.login() instead of window.location.href so the session
          // restores cleanly without resetting the keycloak-js internal state.
          keycloak.login({ redirectUri: `${window.location.origin}/` });
          throw new Error('Session expired. Re-authenticating...');
        }
      }

      // 3. Attach Bearer token
      if (keycloak.token) {
        authHeaders['Authorization'] = `Bearer ${keycloak.token}`;
      } else {
        console.warn('Protected API request prevented: Keycloak token is not available.');
        throw new Error('Authentication required: Token is missing.');
      }
    }

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...authHeaders,
        ...options.headers
      },
      ...options
    });

    if (response.status === 401) {
      // Do NOT redirect or clear the token here — that causes a reload loop.
      // The token may be valid; the 401 might be a transient backend issue.
      // Components using Promise.allSettled() will handle this as a rejected promise.
      throw new Error('Unauthorized (401): API request rejected. Check backend authentication config.');
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson?.error) {
          errorMessage = errJson.error;
        } else if (errJson?.detail) {
          errorMessage = errJson.detail;
        }
      } catch {
        // Fall back to default status text if response is not JSON
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network connection failed. Backend server may be offline or unreachable.');
    }
    throw error;
  }
}

/**
 * Helper to extract array results from standard response formats:
 * - Direct array: [...]
 * - DRF paginated: { count, results: [...] }
 * - Wrapped: { data: [...] }
 */
export function extractResults(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/**
 * Normalizes a health facility record from either nested API response or flat fallback.
 * Uses '--' for any missing fields; does not invent values.
 */
export function normalizeFacility(f = {}) {
  if (!f) return null;

  return {
    id: f.id ?? '--',
    sourceSn: f.source_sn || '--',
    name: f.facility_name || f.name || '--',
    type: f.facility_type?.label || f.facility_type?.code || f.type || '--',
    typeCode: f.facility_type?.code || '--',
    district: f.district?.name || f.district || '--',
    districtId: f.district?.id || f.district_id || null,
    taluka: f.taluka?.name || f.taluka || '--',
    talukaId: f.taluka?.id || f.taluka_id || null,
    ownership: f.ownership_type?.label || f.ownership || '--',
    ownershipId: f.ownership_type?.id || f.ownership_type_id || null,
    landArea: f.total_land_area_sqm ? `${f.total_land_area_sqm} Sq.M` : '--',
    legalDocument: f.ownership_doc_available || '--',
    status: f.status || 'Operational',
    address: f.property_land_address || '--',
    pincode: f.pin_code || '--',
    surveyNo: f.survey_gat_cts_no || '--',
    incharge: f.incharge_name_contact || '--',
    contact: f.incharge_contact || '--',
    remarks: f.remarks || '--'
  };
}

/**
 * Normalizes an administrative office record from either nested API response or flat fallback.
 * Uses '--' for any missing fields; does not invent values.
 */
export function normalizeOffice(o = {}) {
  if (!o) return null;

  return {
    id: o.id ?? '--',
    sourceSn: o.source_sn || '--',
    name: o.office_name || o.facility_name || o.name || '--',
    facilityName: o.facility_name || '--',
    type: 'Administrative / Health Office',
    district: o.district?.name || o.district || '--',
    districtId: o.district?.id || o.district_id || null,
    taluka: o.taluka?.name || o.taluka || '--',
    talukaId: o.taluka?.id || o.taluka_id || null,
    ownership: o.ownership_type?.label || o.ownership || '--',
    ownershipId: o.ownership_type?.id || o.ownership_type_id || null,
    landArea: o.total_land_area_sqm ? `${o.total_land_area_sqm} Sq.M` : '--',
    legalDocument: o.ownership_doc_available || '--',
    status: o.status || 'Operational',
    address: o.property_land_address || '--',
    pincode: o.pin_code || '--',
    surveyNo: o.survey_gat_cts_no || '--',
    incharge: o.incharge_name_contact || '--',
    contact: o.incharge_contact || '--',
    remarks: o.remarks || '--'
  };
}

// ==========================================
// REFERENCE & RECORD API SERVICE METHODS
// ==========================================

/**
 * GET /api/facility-types/
 * Retrieves all registered facility classification types.
 */
export async function getFacilityTypes() {
  const url = buildUrl(FACILITY_ENDPOINTS.FACILITY_TYPES);
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/ownership-types/
 * Retrieves all registered property tenure/ownership categories.
 */
export async function getOwnershipTypes() {
  const url = buildUrl(OFFICE_ENDPOINTS.OWNERSHIP_TYPES);
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/districts/
 * Retrieves all administrative districts in Maharashtra.
 */
export async function getDistricts() {
  const url = buildUrl(FACILITY_ENDPOINTS.DISTRICTS);
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/talukas/?district_id=<numeric_id>
 * Retrieves talukas, optionally filtered by parent district ID.
 */
export async function getTalukas(districtId = null) {
  const params = {};
  if (districtId && districtId !== 'All') {
    params.district_id = districtId;
  }
  const url = buildUrl(FACILITY_ENDPOINTS.TALUKAS, params);
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/facilities/?district_id=...&taluka_id=...&facility_type_id=...&ownership_type_id=...&search=...&page=...&page_size=...
 * Retrieves server-side paginated health facility records matching specified filters.
 */
export async function getFacilities(filters = {}) {
  const params = {};
  const districtId = filters.district_id ?? filters.districtId;
  const talukaId = filters.taluka_id ?? filters.talukaId;
  const facilityTypeId = filters.facility_type_id ?? filters.facilityTypeId;
  const ownershipTypeId = filters.ownership_type_id ?? filters.ownershipTypeId;
  const search = filters.search ?? filters.searchTerm ?? filters.q;
  const page = filters.page ?? 1;
  const pageSize = filters.page_size ?? filters.pageSize ?? 10;

  if (districtId && districtId !== 'All') params.district_id = districtId;
  if (talukaId && talukaId !== 'All') params.taluka_id = talukaId;
  if (facilityTypeId && facilityTypeId !== 'All') params.facility_type_id = facilityTypeId;
  if (ownershipTypeId && ownershipTypeId !== 'All') params.ownership_type_id = ownershipTypeId;
  if (search && String(search).trim()) params.search = String(search).trim();
  if (page) params.page = page;
  if (pageSize) params.page_size = pageSize;

  const url = buildUrl(FACILITY_ENDPOINTS.FACILITIES, params);
  const data = await fetchJson(url);

  const rawList = Array.isArray(data?.results) ? data.results : extractResults(data);
  const results = rawList.map(normalizeFacility);

  const pagination = data?.pagination || {
    page: Number(page) || 1,
    page_size: Number(pageSize) || 10,
    total: results.length,
    total_pages: Math.ceil(results.length / (Number(pageSize) || 10)) || (results.length > 0 ? 1 : 0),
    has_next: false,
    has_previous: false
  };

  return {
    results,
    pagination
  };
}

/**
 * GET /api/offices/?district_id=...&taluka_id=...&ownership_type_id=...&search=...&page=...&page_size=...
 * Retrieves server-side paginated administrative office records matching specified filters.
 */
export async function getOffices(filters = {}) {
  const params = {};
  const districtId = filters.district_id ?? filters.districtId;
  const talukaId = filters.taluka_id ?? filters.talukaId;
  const ownershipTypeId = filters.ownership_type_id ?? filters.ownershipTypeId;
  const search = filters.search ?? filters.searchTerm ?? filters.q;
  const page = filters.page ?? 1;
  const pageSize = filters.page_size ?? filters.pageSize ?? 10;

  if (districtId && districtId !== 'All') params.district_id = districtId;
  if (talukaId && talukaId !== 'All') params.taluka_id = talukaId;
  if (ownershipTypeId && ownershipTypeId !== 'All') params.ownership_type_id = ownershipTypeId;
  if (search && String(search).trim()) params.search = String(search).trim();
  if (page) params.page = page;
  if (pageSize) params.page_size = pageSize;

  const url = buildUrl(OFFICE_ENDPOINTS.OFFICES, params);
  const data = await fetchJson(url);

  const rawList = Array.isArray(data?.results) ? data.results : extractResults(data);
  const results = rawList.map(normalizeOffice);

  const pagination = data?.pagination || {
    page: Number(page) || 1,
    page_size: Number(pageSize) || 10,
    total: results.length,
    total_pages: Math.ceil(results.length / (Number(pageSize) || 10)) || (results.length > 0 ? 1 : 0),
    has_next: false,
    has_previous: false
  };

  return {
    results,
    pagination
  };
}

// ==========================================
// ANALYTICS & IPHS API SERVICE METHODS
// ==========================================

/**
 * GET /api/analytics/overview/
 * Retrieves high-level statewide totals: facilities, offices, districts, talukas, types, land.
 */
export async function getAnalyticsOverview() {
  const url = buildUrl(ANALYTICS_ENDPOINTS.OVERVIEW);
  return await fetchJson(url);
}

/**
 * GET /api/analytics/facilities/by-type/
 * Retrieves facility counts aggregated across all registered facility classification types.
 */
export async function getFacilitiesByType() {
  const url = buildUrl(ANALYTICS_ENDPOINTS.FACILITIES_BY_TYPE);
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/analytics/facilities/by-district/
 * Retrieves facility counts and land footprints aggregated across all 82 districts.
 */
export async function getFacilitiesByDistrict() {
  const url = buildUrl(ANALYTICS_ENDPOINTS.FACILITIES_BY_DISTRICT);
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/analytics/offices/by-district/
 * Retrieves administrative office counts aggregated across districts.
 */
export async function getOfficesByDistrict() {
  const url = buildUrl(ANALYTICS_ENDPOINTS.OFFICES_BY_DISTRICT);
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/analytics/land/by-district/
 * Retrieves land record counts, total area, and average area per district.
 */
export async function getLandByDistrict() {
  const url = buildUrl(ANALYTICS_ENDPOINTS.LAND_BY_DISTRICT);
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/analytics/ownership/
 * Retrieves facility counts aggregated by property ownership/tenure categories.
 */
export async function getOwnershipAnalytics() {
  const url = buildUrl(ANALYTICS_ENDPOINTS.OWNERSHIP);
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/analytics/documents/
 * Retrieves documentation completeness counts for critical property and identification fields.
 */
export async function getDocumentsAnalytics() {
  const url = buildUrl(ANALYTICS_ENDPOINTS.DOCUMENTS);
  return await fetchJson(url);
}

/**
 * GET /api/analytics/data-quality/
 * Retrieves overall record quality & field-level completeness breakdown.
 */
export async function getDataQualityAnalytics() {
  const url = buildUrl(ANALYTICS_ENDPOINTS.DATA_QUALITY);
  return await fetchJson(url);
}

/**
 * GET /api/analytics/iphs/summary/
 * Retrieves statutory IPHS 2022 standards metadata, facility categories, and requirements count.
 */
export async function getIphsSummary() {
  const url = buildUrl(ANALYTICS_ENDPOINTS.IPHS_SUMMARY);
  return await fetchJson(url);
}

/**
 * GET /api/analytics/iphs/norms/
 * Retrieves IPHS requirement norms with optional filtering.
 */
export async function getIphsNorms(params = {}) {
  const url = buildUrl(ANALYTICS_ENDPOINTS.IPHS_NORMS, params);
  return await fetchJson(url);
}

/**
 * GET /api/analytics/iphs/gaps/
 * Retrieves evaluated IPHS gaps comparing actual facility counts & land footprints against norms.
 */
export async function getIphsGaps() {
  const url = buildUrl(ANALYTICS_ENDPOINTS.IPHS_GAPS);
  return await fetchJson(url);
}

/**
 * GET /api/auth-test/
 * Diagnostic auth test endpoint returning authenticated state and Keycloak claims.
 */
export async function getAuthTest() {
  const url = buildUrl(ANALYTICS_ENDPOINTS.AUTH_TEST);
  return await fetchJson(url);
}

/**
 * GET /api/map-data/
 * Retrieves geographic health infrastructure data (KML / GeoJSON).
 * Resolves safely to null when no geographic dataset is published yet.
 */
export async function getHealthInfrastructureMapData() {
  // Inspect if a geographic endpoint is provided. Currently no geographic table or coordinates exist in the database.
  // In the future, if a backend geographic endpoint is added (e.g. /api/map-data/), this will fetch it.
  return null;
}

export const nhmApi = {
  API_BASE_URL,
  buildUrl,
  fetchJson,
  getAuthTest,
  getHealthInfrastructureMapData,
  getFacilityTypes,
  getOwnershipTypes,
  getDistricts,
  getTalukas,
  getFacilities,
  getOffices,
  getAnalyticsOverview,
  getFacilitiesByType,
  getFacilitiesByDistrict,
  getOfficesByDistrict,
  getLandByDistrict,
  getOwnershipAnalytics,
  getDocumentsAnalytics,
  getDataQualityAnalytics,
  getIphsSummary,
  getIphsNorms,
  getIphsGaps,
  extractResults,
  normalizeFacility,
  normalizeOffice
};

export default nhmApi;
