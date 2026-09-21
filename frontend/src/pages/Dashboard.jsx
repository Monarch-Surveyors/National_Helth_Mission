import React, { useState, useEffect, useCallback, useMemo } from 'react';
import KPICard from '../components/KPICard';
import FilterBar from '../components/FilterBar';
import { ErrorState, SelectBox } from '../components/common';
import {
  getAnalyticsOverview,
  getFacilitiesByDistrict,
  getOfficesByDistrict,
  getLandByDistrict,
  getDistricts,
  getFacilityTypes,
  getOwnershipTypes
} from '../services/api';

function formatNumber(val) {
  if (val === undefined || val === null || isNaN(Number(val))) return '--';
  return Number(val).toLocaleString();
}

function formatArea(sqm) {
  if (sqm === undefined || sqm === null || isNaN(Number(sqm))) return '--';
  const num = Number(sqm);
  if (num === 0) return '0 Sq.M (Pending entry)';
  if (num >= 10000) {
    const ha = (num / 10000).toFixed(2);
    return `${num.toLocaleString()} Sq.M (${ha} Ha)`;
  }
  return `${num.toLocaleString()} Sq.M`;
}

/**
 * Executive Dashboard Page
 *
 * Executive summary for Maharashtra Health Infrastructure.
 * Focuses strictly on high-level executive metrics and status.
 * Detailed analytics reside exclusively on the Infrastructure Analytics page (/analytics).
 */
function Dashboard() {
  // Filter state
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedFacilityType, setSelectedFacilityType] = useState('All');
  const [selectedOwnership, setSelectedOwnership] = useState('All');

  const handleResetFilters = () => {
    setSelectedDistrict('All');
    setSelectedFacilityType('All');
    setSelectedOwnership('All');
  };

  // Reference filter metadata loaded from live APIs
  const [districts, setDistricts] = useState([]);
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [ownershipTypes, setOwnershipTypes] = useState([]);

  // Executive overview & supporting district counts for responsive KPI filtering
  const [overview, setOverview] = useState(null);
  const [districtFacilities, setDistrictFacilities] = useState([]);
  const [districtOffices, setDistrictOffices] = useState([]);
  const [districtLand, setDistrictLand] = useState([]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parallel fetch loader for executive overview and filter reference data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [
      ovRes,
      distFacRes,
      distOffRes,
      distLandRes,
      distRefRes,
      ftRefRes,
      otRefRes
    ] = await Promise.allSettled([
      getAnalyticsOverview(),
      getFacilitiesByDistrict(),
      getOfficesByDistrict(),
      getLandByDistrict(),
      getDistricts(),
      getFacilityTypes(),
      getOwnershipTypes()
    ]);

    if (ovRes.status === 'fulfilled' && ovRes.value) {
      setOverview(ovRes.value);
    } else {
      setError(ovRes.reason?.message || 'Failed to load executive overview.');
    }

    if (distFacRes.status === 'fulfilled' && Array.isArray(distFacRes.value)) {
      setDistrictFacilities(distFacRes.value);
    }
    if (distOffRes.status === 'fulfilled' && Array.isArray(distOffRes.value)) {
      setDistrictOffices(distOffRes.value);
    }
    if (distLandRes.status === 'fulfilled' && Array.isArray(distLandRes.value)) {
      setDistrictLand(distLandRes.value);
    }

    if (distRefRes.status === 'fulfilled' && Array.isArray(distRefRes.value)) {
      setDistricts(distRefRes.value);
    }
    if (ftRefRes.status === 'fulfilled' && Array.isArray(ftRefRes.value)) {
      setFacilityTypes(ftRefRes.value);
    }
    if (otRefRes.status === 'fulfilled' && Array.isArray(otRefRes.value)) {
      setOwnershipTypes(otRefRes.value);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Memoized dropdown options from API data
  const districtOptions = useMemo(() => {
    const unique = new Map();
    if (Array.isArray(districts) && districts.length > 0) {
      districts.forEach((d) => {
        const name = d?.district_name || d?.name;
        if (name && !unique.has(name)) {
          unique.set(name, { value: name, label: name });
        }
      });
    } else if (Array.isArray(districtFacilities)) {
      districtFacilities.forEach((d) => {
        if (d?.district && !unique.has(d.district)) {
          unique.set(d.district, { value: d.district, label: d.district });
        }
      });
    }
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [districts, districtFacilities]);

  const facilityTypeOptions = useMemo(() => {
    if (!Array.isArray(facilityTypes)) return [];
    const unique = new Map();
    facilityTypes.forEach((ft) => {
      const code = ft?.code || ft?.name;
      const label = ft?.label ? `${ft.label}${ft.code ? ` (${ft.code})` : ''}` : code;
      if (code && !unique.has(code)) {
        unique.set(code, { value: code, label });
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [facilityTypes]);

  const ownershipOptions = useMemo(() => {
    if (!Array.isArray(ownershipTypes)) return [];
    const unique = new Map();
    ownershipTypes.forEach((ot) => {
      const name = ot?.label || ot?.name;
      if (name && !unique.has(name)) {
        unique.set(name, { value: name, label: name });
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [ownershipTypes]);

  // Computed KPI metrics based on active filter selection
  const computedMetrics = useMemo(() => {
    if (!overview) return null;

    const filterTag = [
      selectedDistrict !== 'All' ? selectedDistrict : null,
      selectedFacilityType !== 'All' ? selectedFacilityType : null,
      selectedOwnership !== 'All' ? selectedOwnership : null
    ].filter(Boolean).join(' • ');

    const scopeSubtitle = filterTag ? `Filtered: ${filterTag}` : 'Statewide Health Network';

    if (selectedDistrict !== 'All') {
      const matchedFac = districtFacilities.find(
        (d) => (d.district || '').toLowerCase() === selectedDistrict.toLowerCase()
      );
      const matchedOff = districtOffices.find(
        (d) => (d.district || '').toLowerCase() === selectedDistrict.toLowerCase()
      );
      const matchedLand = districtLand.find(
        (d) => (d.district || '').toLowerCase() === selectedDistrict.toLowerCase()
      );

      return {
        facilities: matchedFac?.facility_count ?? '--',
        offices: matchedOff?.office_count ?? '--',
        districts: 1,
        talukas: overview.talukas,
        facilityTypes: overview.facility_types,
        totalLand: matchedLand?.total_land_area_sqm ?? 0,
        scopeSubtitle
      };
    }

    return {
      facilities: overview.facilities,
      offices: overview.offices,
      districts: overview.districts,
      talukas: overview.talukas,
      facilityTypes: overview.facility_types,
      totalLand: overview.total_land_area_sqm,
      scopeSubtitle
    };
  }, [overview, selectedDistrict, selectedFacilityType, selectedOwnership, districtFacilities, districtOffices, districtLand]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-subtitle">
              Public Health Department • Statewide Health Infrastructure, Facilities, Offices, and Land Overview
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="pagination-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
              onClick={loadDashboardData}
              disabled={loading}
              title="Refresh live metrics from backend"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Top Filter Bar with Reusable SelectBox Components */}
      <FilterBar title="Dashboard Scope Filters">
        <SelectBox
          label="District"
          value={selectedDistrict}
          onChange={setSelectedDistrict}
          options={districtOptions}
          defaultOption="All Districts (Statewide)"
          inFilterGroup
        />

        <SelectBox
          label="Facility Type"
          value={selectedFacilityType}
          onChange={setSelectedFacilityType}
          options={facilityTypeOptions}
          defaultOption="All Facility Types"
          inFilterGroup
        />

        <SelectBox
          label="Ownership"
          value={selectedOwnership}
          onChange={setSelectedOwnership}
          options={ownershipOptions}
          defaultOption="All Ownership Types"
          inFilterGroup
        />

        <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="pagination-btn"
            style={{ height: '38px', fontWeight: 600, background: '#f1f5f9' }}
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </div>
      </FilterBar>

      {/* High-Level Executive KPI Metrics */}
      {error ? (
        <ErrorState
          title="Executive Overview Error"
          message={error}
          onRetry={loadDashboardData}
        />
      ) : (
        <div className="kpi-grid">
          <KPICard
            title="Total Facilities"
            value={loading ? '--' : formatNumber(computedMetrics?.facilities)}
            subtitle={computedMetrics?.scopeSubtitle || 'Statewide Health Network'}
            variant="primary"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 21h18" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                <path d="M10 9h4" />
                <path d="M12 7v4" />
              </svg>
            }
          />
          <KPICard
            title="Total Offices"
            value={loading ? '--' : formatNumber(computedMetrics?.offices)}
            subtitle="Administrative & Health Offices"
            variant="neutral"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M9 22v-4h6v4" />
                <path d="M8 6h.01" />
                <path d="M16 6h.01" />
                <path d="M12 6h.01" />
                <path d="M12 10h.01" />
                <path d="M12 14h.01" />
                <path d="M16 10h.01" />
                <path d="M16 14h.01" />
                <path d="M8 10h.01" />
                <path d="M8 14h.01" />
              </svg>
            }
          />
          <KPICard
            title="Total Districts"
            value={loading ? '--' : formatNumber(computedMetrics?.districts)}
            subtitle={selectedDistrict !== 'All' ? 'Selected District' : 'Administrative Districts'}
            variant="accent"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
          />
          <KPICard
            title="Total Talukas"
            value={loading ? '--' : formatNumber(computedMetrics?.talukas)}
            subtitle="Blocks & Sub-Districts"
            variant="success"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            }
          />
          <KPICard
            title="Facility Types"
            value={loading ? '--' : formatNumber(computedMetrics?.facilityTypes)}
            subtitle="Registered Classifications"
            variant="info"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            }
          />
          <KPICard
            title="Total Land Area"
            value={loading ? '--' : formatArea(computedMetrics?.totalLand)}
            subtitle="Logged Land Footprint"
            variant="warning"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
            }
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
