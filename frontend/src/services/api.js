/**
 * National Health Mission - Maharashtra Health Infrastructure
 * API Client Service Layer
 *
 * Uses native browser fetch and URLSearchParams.
 * Connects to Django backend endpoints via Vite proxy (/api) or direct host.
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!RAW_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is missing in frontend/.env');
}

/**
 * Helper to safely construct full request URLs without duplicate slashes.
 */
function buildUrl(endpoint, params = {}) {
  let cleanBase = RAW_BASE_URL.trim().replace(/\/+$/, '');
  // If an absolute HTTP(S) URL is provided without /api, append /api for Django routes
  if (cleanBase.startsWith('http') && !cleanBase.endsWith('/api') && !cleanBase.includes('/api/')) {
    cleanBase = `${cleanBase}/api`;
  }
  const cleanEndpoint = endpoint.replace(/^\/+/, '').replace(/\/+$/, '');
  let url = `${cleanBase}/${cleanEndpoint}/`;

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
async function fetchJson(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...options.headers
      },
      ...options
    });

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
// BACKEND API SERVICE METHODS
// ==========================================

/**
 * GET /api/facility-types/
 * Retrieves all registered facility classification types.
 */
export async function getFacilityTypes() {
  const url = buildUrl('facility-types');
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/ownership-types/
 * Retrieves all registered property tenure/ownership categories.
 */
export async function getOwnershipTypes() {
  const url = buildUrl('ownership-types');
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/districts/
 * Retrieves all administrative districts in Maharashtra.
 */
export async function getDistricts() {
  const url = buildUrl('districts');
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
  const url = buildUrl('talukas', params);
  const data = await fetchJson(url);
  return extractResults(data);
}

/**
 * GET /api/facilities/?district_id=...&taluka_id=...&facility_type_id=...&ownership_type_id=...
 * Retrieves health facility records matching the specified numeric ID filters.
 */
export async function getFacilities(filters = {}) {
  const params = {};
  if (filters.district_id && filters.district_id !== 'All') params.district_id = filters.district_id;
  if (filters.taluka_id && filters.taluka_id !== 'All') params.taluka_id = filters.taluka_id;
  if (filters.facility_type_id && filters.facility_type_id !== 'All') params.facility_type_id = filters.facility_type_id;
  if (filters.ownership_type_id && filters.ownership_type_id !== 'All') params.ownership_type_id = filters.ownership_type_id;

  const url = buildUrl('facilities', params);
  const data = await fetchJson(url);
  const rawList = extractResults(data);
  return rawList.map(normalizeFacility);
}

/**
 * GET /api/offices/?district_id=...&taluka_id=...&ownership_type_id=...
 * Retrieves administrative office records matching the specified numeric ID filters.
 */
export async function getOffices(filters = {}) {
  const params = {};
  if (filters.district_id && filters.district_id !== 'All') params.district_id = filters.district_id;
  if (filters.taluka_id && filters.taluka_id !== 'All') params.taluka_id = filters.taluka_id;
  if (filters.ownership_type_id && filters.ownership_type_id !== 'All') params.ownership_type_id = filters.ownership_type_id;

  const url = buildUrl('offices', params);
  const data = await fetchJson(url);
  const rawList = extractResults(data);
  return rawList.map(normalizeOffice);
}

export const nhmApi = {
  getFacilityTypes,
  getOwnershipTypes,
  getDistricts,
  getTalukas,
  getFacilities,
  getOffices,
  extractResults,
  normalizeFacility,
  normalizeOffice
};

export default nhmApi;
