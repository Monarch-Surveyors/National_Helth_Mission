import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import FilterBar from '../components/FilterBar';
import { LoadingState, ErrorState, EmptyState, SelectBox } from '../components/common';
import {
  getAnalyticsOverview,
  getFacilitiesByType,
  getFacilitiesByDistrict,
  getOfficesByDistrict,
  getLandByDistrict,
  getOwnershipAnalytics,
  getDocumentsAnalytics,
  getDataQualityAnalytics,
  getIphsSummary,
  getIphsGaps,
  getDistricts,
  getFacilityTypes,
  getOwnershipTypes
} from '../services/api';

const PALETTE = [
  '#0d9488', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#14b8a6',
  '#f97316', '#3b82f6', '#10b981', '#64748b'
];

const SORT_OPTIONS = [
  { value: 'count_desc', label: 'Highest Count First' },
  { value: 'count_asc', label: 'Lowest Count First' },
  { value: 'name_asc', label: 'Alphabetical (A-Z)' }
];

const LIMIT_OPTIONS = [
  { value: 15, label: 'Top 15' },
  { value: 30, label: 'Top 30' },
  { value: 50, label: 'Top 50' },
  { value: 'All', label: 'All Records' }
];

function formatNumber(val) {
  if (val === undefined || val === null || isNaN(Number(val))) return '--';
  return Number(val).toLocaleString();
}

function formatArea(sqm) {
  if (sqm === undefined || sqm === null || isNaN(Number(sqm))) return '--';
  const num = Number(sqm);
  if (num === 0) return '0 Sq.M';
  if (num >= 10000) {
    const ha = (num / 10000).toFixed(2);
    return `${num.toLocaleString()} Sq.M (${ha} Ha)`;
  }
  return `${num.toLocaleString()} Sq.M`;
}

function calculatePercent(part, total) {
  if (!total || total === 0) return 0;
  return Math.round(((part || 0) / total) * 100);
}

/**
 * Analytics Page
 *
 * Dedicated, centralized public health infrastructure intelligence platform.
 * Contains all detailed charts, district distributions, land analytics, document audit,
 * 9-field data quality, and statutory IPHS 2022 standards.
 */
function Analytics() {
  // Global loading and section-level error tracking
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Scope & Presentation Filter States
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedFacilityType, setSelectedFacilityType] = useState('All');
  const [selectedOwnership, setSelectedOwnership] = useState('All');
  const [selectedSort, setSelectedSort] = useState('count_desc');
  const [selectedLimit, setSelectedLimit] = useState(15);

  // Quick search controls
  const [districtSearch, setDistrictSearch] = useState('');
  const [landSearch, setLandSearch] = useState('');

  // Dropdown reference metadata
  const [districts, setDistricts] = useState([]);
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [ownershipTypes, setOwnershipTypes] = useState([]);

  // Analytics datasets
  const [overview, setOverview] = useState(null);
  const [facilitiesByType, setFacilitiesByType] = useState([]);
  const [facilitiesByDistrict, setFacilitiesByDistrict] = useState([]);
  const [officesByDistrict, setOfficesByDistrict] = useState([]);
  const [landByDistrict, setLandByDistrict] = useState([]);
  const [ownershipData, setOwnershipData] = useState([]);
  const [documentsData, setDocumentsData] = useState(null);
  const [dataQualityData, setDataQualityData] = useState(null);
  const [iphsSummary, setIphsSummary] = useState(null);
  const [iphsGaps, setIphsGaps] = useState(null);

  // Parallel fetch routine for all analytics and filter reference datasets
  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const [
      ovRes,
      typeRes,
      distFacRes,
      distOffRes,
      distLandRes,
      ownRes,
      docRes,
      dqRes,
      iphsSumRes,
      iphsGapRes,
      distRefRes,
      ftRefRes,
      otRefRes
    ] = await Promise.allSettled([
      getAnalyticsOverview(),
      getFacilitiesByType(),
      getFacilitiesByDistrict(),
      getOfficesByDistrict(),
      getLandByDistrict(),
      getOwnershipAnalytics(),
      getDocumentsAnalytics(),
      getDataQualityAnalytics(),
      getIphsSummary(),
      getIphsGaps(),
      getDistricts(),
      getFacilityTypes(),
      getOwnershipTypes()
    ]);

    const newErrors = {};

    // 1. Overview
    if (ovRes.status === 'fulfilled' && ovRes.value) {
      setOverview(ovRes.value);
    } else {
      newErrors.overview = ovRes.reason?.message || 'Failed to load executive overview.';
    }

    // 2. Facilities by Type
    if (typeRes.status === 'fulfilled' && Array.isArray(typeRes.value)) {
      setFacilitiesByType(typeRes.value);
    } else {
      newErrors.type = typeRes.reason?.message || 'Failed to load facilities by type.';
    }

    // 3. Facilities by District
    if (distFacRes.status === 'fulfilled' && Array.isArray(distFacRes.value)) {
      setFacilitiesByDistrict(distFacRes.value);
    } else {
      newErrors.distFac = distFacRes.reason?.message || 'Failed to load district facility counts.';
    }

    // 4. Offices by District
    if (distOffRes.status === 'fulfilled' && Array.isArray(distOffRes.value)) {
      setOfficesByDistrict(distOffRes.value);
    } else {
      newErrors.distOff = distOffRes.reason?.message || 'Failed to load district offices count.';
    }

    // 5. Land by District
    if (distLandRes.status === 'fulfilled' && Array.isArray(distLandRes.value)) {
      setLandByDistrict(distLandRes.value);
    } else {
      newErrors.distLand = distLandRes.reason?.message || 'Failed to load district land records.';
    }

    // 6. Ownership Analytics
    if (ownRes.status === 'fulfilled' && Array.isArray(ownRes.value)) {
      setOwnershipData(ownRes.value);
    } else {
      newErrors.ownership = ownRes.reason?.message || 'Failed to load ownership distribution.';
    }

    // 7. Documents Analytics
    if (docRes.status === 'fulfilled' && docRes.value) {
      setDocumentsData(docRes.value);
    } else {
      newErrors.documents = docRes.reason?.message || 'Failed to load documentation audit.';
    }

    // 8. Data Quality Analytics
    if (dqRes.status === 'fulfilled' && dqRes.value) {
      setDataQualityData(dqRes.value);
    } else {
      newErrors.dataQuality = dqRes.reason?.message || 'Failed to load data quality metrics.';
    }

    // 9. IPHS Summary
    if (iphsSumRes.status === 'fulfilled' && iphsSumRes.value) {
      setIphsSummary(iphsSumRes.value);
    } else {
      newErrors.iphsSummary = iphsSumRes.reason?.message || 'Failed to load IPHS summary.';
    }

    // 10. IPHS Gaps
    if (iphsGapRes.status === 'fulfilled' && iphsGapRes.value) {
      setIphsGaps(iphsGapRes.value);
    } else {
      newErrors.iphsGaps = iphsGapRes.reason?.message || 'Failed to load IPHS gap evaluation.';
    }

    // Filter reference dropdowns
    if (distRefRes.status === 'fulfilled' && Array.isArray(distRefRes.value)) {
      setDistricts(distRefRes.value);
    }
    if (ftRefRes.status === 'fulfilled' && Array.isArray(ftRefRes.value)) {
      setFacilityTypes(ftRefRes.value);
    }
    if (otRefRes.status === 'fulfilled' && Array.isArray(otRefRes.value)) {
      setOwnershipTypes(otRefRes.value);
    }

    setErrors(newErrors);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Memoized dropdown options from live API data
  const districtOptions = useMemo(() => {
    const unique = new Map();
    if (Array.isArray(districts) && districts.length > 0) {
      districts.forEach((d) => {
        const name = d?.district_name || d?.name;
        if (name && !unique.has(name)) {
          unique.set(name, { value: name, label: name });
        }
      });
    } else if (Array.isArray(facilitiesByDistrict)) {
      facilitiesByDistrict.forEach((d) => {
        if (d?.district && !unique.has(d.district)) {
          unique.set(d.district, { value: d.district, label: d.district });
        }
      });
    }
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [districts, facilitiesByDistrict]);

  const facilityTypeOptions = useMemo(() => {
    const unique = new Map();
    if (Array.isArray(facilityTypes) && facilityTypes.length > 0) {
      facilityTypes.forEach((ft) => {
        const code = ft?.code || ft?.name;
        const label = ft?.label ? `${ft.label}${ft.code ? ` (${ft.code})` : ''}` : code;
        if (code && !unique.has(code)) {
          unique.set(code, { value: code, label });
        }
      });
    } else if (Array.isArray(facilitiesByType)) {
      facilitiesByType.forEach((ft) => {
        const code = ft?.code;
        const label = ft?.label ? `${ft.label}${ft.code ? ` (${ft.code})` : ''}` : code;
        if (code && !unique.has(code)) {
          unique.set(code, { value: code, label });
        }
      });
    }
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [facilityTypes, facilitiesByType]);

  const ownershipOptions = useMemo(() => {
    const unique = new Map();
    if (Array.isArray(ownershipTypes) && ownershipTypes.length > 0) {
      ownershipTypes.forEach((ot) => {
        const name = ot?.label || ot?.name;
        if (name && !unique.has(name)) {
          unique.set(name, { value: name, label: name });
        }
      });
    } else if (Array.isArray(ownershipData)) {
      ownershipData.forEach((ot) => {
        if (ot?.label && !unique.has(ot.label)) {
          unique.set(ot.label, { value: ot.label, label: ot.label });
        }
      });
    }
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [ownershipTypes, ownershipData]);

  // Computed KPI metrics based on active filter selection
  const computedMetrics = useMemo(() => {
    if (!overview) return null;

    if (selectedDistrict !== 'All') {
      const matchedFac = facilitiesByDistrict.find(
        (d) => (d.district || '').toLowerCase() === selectedDistrict.toLowerCase()
      );
      const matchedOff = officesByDistrict.find(
        (d) => (d.district || '').toLowerCase() === selectedDistrict.toLowerCase()
      );
      const matchedLand = landByDistrict.find(
        (d) => (d.district || '').toLowerCase() === selectedDistrict.toLowerCase()
      );

      return {
        facilities: matchedFac?.facility_count ?? '--',
        offices: matchedOff?.office_count ?? '--',
        districts: 1,
        talukas: overview.talukas,
        facilityTypes: overview.facility_types,
        totalLand: matchedLand?.total_land_area_sqm ?? 0,
        scopeSubtitle: `Filtered for ${selectedDistrict} District`
      };
    }

    return {
      facilities: overview.facilities,
      offices: overview.offices,
      districts: overview.districts,
      talukas: overview.talukas,
      facilityTypes: overview.facility_types,
      totalLand: overview.total_land_area_sqm,
      scopeSubtitle: 'Health Facilities Registered'
    };
  }, [overview, selectedDistrict, facilitiesByDistrict, officesByDistrict, landByDistrict]);

  // Filtered Facilities by Type
  const filteredTypes = useMemo(() => {
    if (!Array.isArray(facilitiesByType)) return [];
    return facilitiesByType
      .filter((t) => {
        if (selectedFacilityType === 'All') return true;
        return t.code === selectedFacilityType || t.label === selectedFacilityType;
      })
      .sort((a, b) => (b.facility_count || 0) - (a.facility_count || 0));
  }, [facilitiesByType, selectedFacilityType]);

  // Filtered Ownership Data
  const filteredOwnership = useMemo(() => {
    if (!Array.isArray(ownershipData)) return [];
    return ownershipData
      .filter((o) => {
        if (selectedOwnership === 'All') return true;
        return o.label === selectedOwnership;
      })
      .sort((a, b) => (b.facility_count || 0) - (a.facility_count || 0));
  }, [ownershipData, selectedOwnership]);

  // Filtered and Sorted Facilities by District
  const processedDistricts = useMemo(() => {
    if (!Array.isArray(facilitiesByDistrict)) return [];
    return facilitiesByDistrict
      .filter((d) => {
        const matchSearch = districtSearch
          ? (d.district || '').toLowerCase().includes(districtSearch.toLowerCase())
          : true;
        const matchSelect = selectedDistrict !== 'All'
          ? (d.district || '').toLowerCase() === selectedDistrict.toLowerCase()
          : true;
        return matchSearch && matchSelect;
      })
      .sort((a, b) => {
        if (selectedSort === 'count_desc') return (b.facility_count || 0) - (a.facility_count || 0);
        if (selectedSort === 'count_asc') return (a.facility_count || 0) - (b.facility_count || 0);
        if (selectedSort === 'name_asc') return (a.district || '').localeCompare(b.district || '');
        return 0;
      });
  }, [facilitiesByDistrict, districtSearch, selectedDistrict, selectedSort]);

  const displayedDistricts = useMemo(() => {
    return selectedLimit === 'All'
      ? processedDistricts
      : processedDistricts.slice(0, Number(selectedLimit));
  }, [processedDistricts, selectedLimit]);

  // Filtered and Sorted Administrative Offices by District
  const processedOffices = useMemo(() => {
    if (!Array.isArray(officesByDistrict)) return [];
    return officesByDistrict
      .filter((d) => {
        if (selectedDistrict !== 'All') {
          return (d.district || '').toLowerCase() === selectedDistrict.toLowerCase();
        }
        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'count_desc') return (b.office_count || 0) - (a.office_count || 0);
        if (selectedSort === 'count_asc') return (a.office_count || 0) - (b.office_count || 0);
        if (selectedSort === 'name_asc') return (a.district || '').localeCompare(b.district || '');
        return 0;
      });
  }, [officesByDistrict, selectedDistrict, selectedSort]);

  const displayedOffices = useMemo(() => {
    return selectedLimit === 'All'
      ? processedOffices
      : processedOffices.slice(0, Number(selectedLimit));
  }, [processedOffices, selectedLimit]);

  // Filtered and Sorted Land by District
  const processedLandDistricts = useMemo(() => {
    if (!Array.isArray(landByDistrict)) return [];
    return landByDistrict
      .filter((d) => {
        const matchSearch = landSearch
          ? (d.district || '').toLowerCase().includes(landSearch.toLowerCase())
          : true;
        const matchSelect = selectedDistrict !== 'All'
          ? (d.district || '').toLowerCase() === selectedDistrict.toLowerCase()
          : true;
        return matchSearch && matchSelect;
      })
      .sort((a, b) => {
        if (selectedSort === 'name_asc') return (a.district || '').localeCompare(b.district || '');
        return (b.total_land_area_sqm || 0) - (a.total_land_area_sqm || 0);
      });
  }, [landByDistrict, landSearch, selectedDistrict, selectedSort]);

  const displayedLandDistricts = useMemo(() => {
    return selectedLimit === 'All'
      ? processedLandDistricts
      : processedLandDistricts.slice(0, Number(selectedLimit));
  }, [processedLandDistricts, selectedLimit]);

  // Memoized Documents Completeness Data for Recharts Bar
  const documentMetrics = useMemo(() => {
    if (!documentsData) return [];
    return [
      {
        field: 'Survey / Gat No.',
        available: documentsData.survey_gat_cts_no?.available || 0,
        missing: documentsData.survey_gat_cts_no?.missing || 0,
        rate: calculatePercent(documentsData.survey_gat_cts_no?.available, documentsData.total_facilities)
      },
      {
        field: 'Property Address',
        available: documentsData.property_land_address?.available || 0,
        missing: documentsData.property_land_address?.missing || 0,
        rate: calculatePercent(documentsData.property_land_address?.available, documentsData.total_facilities)
      },
      {
        field: 'PIN Code',
        available: documentsData.pin_code?.available || 0,
        missing: documentsData.pin_code?.missing || 0,
        rate: calculatePercent(documentsData.pin_code?.available, documentsData.total_facilities)
      },
      {
        field: 'Ownership Document',
        available: documentsData.ownership_doc_available?.available || 0,
        missing: documentsData.ownership_doc_available?.missing || 0,
        rate: calculatePercent(documentsData.ownership_doc_available?.available, documentsData.total_facilities)
      }
    ];
  }, [documentsData]);

  // Memoized Data Quality Fields for Table & Progress View
  const qualityFields = useMemo(() => {
    if (!dataQualityData?.fields) return [];
    return Object.entries(dataQualityData.fields).map(([fieldName, stats]) => ({
      key: fieldName,
      label: fieldName.replace(/_/g, ' ').toUpperCase(),
      available: stats.available || 0,
      missing: stats.missing || 0,
      total: (stats.available || 0) + (stats.missing || 0),
      rate: calculatePercent(stats.available, (stats.available || 0) + (stats.missing || 0))
    })).sort((a, b) => b.rate - a.rate);
  }, [dataQualityData]);

  // Filtered IPHS Gaps rows based on Facility Type selection
  const filteredIphsRows = useMemo(() => {
    const rows = Array.isArray(iphsGaps?.rows) ? iphsGaps.rows : [];
    if (selectedFacilityType === 'All') return rows;
    return rows.filter((r) => r.facility_code === selectedFacilityType);
  }, [iphsGaps, selectedFacilityType]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Infrastructure Analytics & Quality Hub</h1>
            <p className="page-subtitle">
              Public Health Department • Live Register Analytics, Land Register, Quality Index, and IPHS Norms
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="pagination-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
              onClick={loadAnalytics}
              disabled={loading}
              title="Refresh all live analytics metrics"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              {loading ? 'Refreshing...' : 'Refresh All'}
            </button>
          </div>
        </div>
      </div>

      {/* Top Filter Panel with Reusable SelectBox Components */}
      <FilterBar title="Analytics Scope & Presentation Filters">
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

        <SelectBox
          label="Sorting"
          value={selectedSort}
          onChange={setSelectedSort}
          options={SORT_OPTIONS}
          inFilterGroup
        />

        <SelectBox
          label="Display Limit"
          value={selectedLimit}
          onChange={setSelectedLimit}
          options={LIMIT_OPTIONS}
          inFilterGroup
        />

        <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="pagination-btn"
            style={{ height: '38px', fontWeight: 600, background: '#f1f5f9' }}
            onClick={() => {
              setSelectedDistrict('All');
              setSelectedFacilityType('All');
              setSelectedOwnership('All');
              setSelectedSort('count_desc');
              setSelectedLimit(15);
              setDistrictSearch('');
              setLandSearch('');
            }}
          >
            Reset Filters
          </button>
        </div>
      </FilterBar>

      {/* SECTION 1: EXECUTIVE KPI SUMMARY */}
      {errors.overview ? (
        <ErrorState
          title="Executive Overview Error"
          message={errors.overview}
          onRetry={loadAnalytics}
        />
      ) : (
        <div className="kpi-grid">
          <KPICard
            title="Total Facilities"
            value={loading ? '--' : formatNumber(computedMetrics?.facilities)}
            subtitle={computedMetrics?.scopeSubtitle || 'Health Facilities Registered'}
            variant="primary"
          />
          <KPICard
            title="Total Offices"
            value={loading ? '--' : formatNumber(computedMetrics?.offices)}
            subtitle="Administrative & Health Offices"
            variant="neutral"
          />
          <KPICard
            title="Total Districts"
            value={loading ? '--' : formatNumber(computedMetrics?.districts)}
            subtitle={selectedDistrict !== 'All' ? 'Selected District' : 'Districts in Register'}
            variant="accent"
          />
          <KPICard
            title="Total Talukas"
            value={loading ? '--' : formatNumber(computedMetrics?.talukas)}
            subtitle="Tehsils & Health Blocks"
            variant="success"
          />
          <KPICard
            title="Facility Types"
            value={loading ? '--' : formatNumber(computedMetrics?.facilityTypes)}
            subtitle="Standardized Classifications"
            variant="info"
          />
          <KPICard
            title="Total Land Area"
            value={loading ? '--' : formatArea(computedMetrics?.totalLand)}
            subtitle="Recorded Land Area"
            variant="warning"
          />
        </div>
      )}

      {/* SECTION 2 & 3: FACILITIES BY TYPE & OWNERSHIP DISTRIBUTION */}
      <div className="charts-grid-2col">
        {/* Chart 1: Facilities by Type */}
        <ChartCard
          title="1. Facilities by Type"
          subtitle="Count across all registered public health tiers (/api/analytics/facilities/by-type/)"
          badge={`${filteredTypes.length} Types`}
        >
          {errors.type ? (
            <ErrorState
              title="Failed to load type analytics"
              message={errors.type}
              onRetry={loadAnalytics}
              compact
            />
          ) : loading ? (
            <LoadingState message="Loading facility type distribution..." height={320} />
          ) : filteredTypes.length === 0 ? (
            <EmptyState message="No facility types match selected filter." height={320} />
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredTypes}
                  margin={{ top: 15, right: 15, left: 10, bottom: 45 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="code"
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, _name, item) => [
                      `${Number(val).toLocaleString()} Facilities`,
                      item.payload.label || item.payload.code
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6, borderColor: '#cbd5e1' }}
                  />
                  <Bar dataKey="facility_count" radius={[4, 4, 0, 0]}>
                    {filteredTypes.map((entry, index) => (
                      <Cell key={`type-bar-${entry.facility_type_id || index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Chart 4: Ownership Distribution */}
        <ChartCard
          title="2. Ownership Distribution"
          subtitle="Breakdown by property tenure category (/api/analytics/ownership/)"
          badge={`${filteredOwnership.length} Categories`}
        >
          {errors.ownership ? (
            <ErrorState
              title="Failed to load ownership analytics"
              message={errors.ownership}
              onRetry={loadAnalytics}
              compact
            />
          ) : loading ? (
            <LoadingState message="Loading ownership distribution..." height={320} />
          ) : filteredOwnership.length === 0 ? (
            <EmptyState message="No ownership categories match selected filter." height={320} />
          ) : (
            <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredOwnership.slice(0, 10).map((item, idx) => {
                  const percent = calculatePercent(item.facility_count, overview?.facilities);
                  return (
                    <div
                      key={item.ownership_type_id || idx}
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '12px', color: '#1e293b' }}>
                          {item.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '11px', fontWeight: 700 }}>
                            {formatNumber(item.facility_count)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                            {percent}%
                          </span>
                        </div>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: PALETTE[idx % PALETTE.length],
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px' }}>
                * Showing top {Math.min(filteredOwnership.length, 10)} categories of {filteredOwnership.length} total recorded tenure types.
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* SECTION 4: FACILITIES BY DISTRICT (Scrollable & Sortable) */}
      <div style={{ marginBottom: '24px' }}>
        <ChartCard
          title="3. Facilities by District"
          subtitle="Statewide health infrastructure distribution across all districts (/api/analytics/facilities/by-district/)"
          badge={`${processedDistricts.length} Districts Matching`}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search district..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  outline: 'none'
                }}
              />
            </div>
          }
        >
          {errors.distFac ? (
            <ErrorState
              title="Failed to load district facilities"
              message={errors.distFac}
              onRetry={loadAnalytics}
              compact
            />
          ) : loading ? (
            <LoadingState message="Loading district facility distribution..." height={360} />
          ) : displayedDistricts.length === 0 ? (
            <EmptyState message="No matching districts found for selected filters." height={200} />
          ) : (
            <div>
              <div style={{ width: '100%', height: 380, overflowX: 'auto' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={displayedDistricts.length * 30}>
                  <BarChart
                    data={displayedDistricts}
                    margin={{ top: 15, right: 20, left: 10, bottom: 65 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="district"
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      formatter={(val) => [`${Number(val).toLocaleString()} Facilities`, 'Total Health Facilities']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6, borderColor: '#cbd5e1' }}
                    />
                    <Bar dataKey="facility_count" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Showing {displayedDistricts.length} of {processedDistricts.length} matching districts.</span>
                <span>Scroll horizontally to inspect full dataset.</span>
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* SECTION 5: OFFICES BY DISTRICT & LAND BY DISTRICT */}
      <div className="charts-grid-2col">
        {/* Chart 3: Offices by District */}
        <ChartCard
          title="4. Administrative Offices by District"
          subtitle="Administrative and Health Office presence across Maharashtra (/api/analytics/offices/by-district/)"
          badge={`${processedOffices.length} Districts Matching`}
        >
          {errors.distOff ? (
            <ErrorState
              title="Failed to load offices analytics"
              message={errors.distOff}
              onRetry={loadAnalytics}
              compact
            />
          ) : loading ? (
            <LoadingState message="Loading offices distribution..." height={320} />
          ) : displayedOffices.length === 0 ? (
            <EmptyState message="No office data available for selected filter." height={320} />
          ) : (
            <div>
              <div style={{ width: '100%', height: 320, overflowX: 'auto' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={displayedOffices.length * 32}>
                  <BarChart
                    data={displayedOffices}
                    margin={{ top: 15, right: 15, left: 10, bottom: 55 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="district"
                      tick={{ fill: '#334155', fontSize: 11 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      formatter={(val) => [`${Number(val).toLocaleString()} Offices`, 'Administrative Units']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6, borderColor: '#cbd5e1' }}
                    />
                    <Bar dataKey="office_count" fill="#0d9488" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                * Displaying {displayedOffices.length} districts ordered by active sort selection.
              </div>
            </div>
          )}
        </ChartCard>

        {/* Chart 5: Land Area by District */}
        <ChartCard
          title="5. Land Footprint by District"
          subtitle="Total recorded land area and parcels per district (/api/analytics/land/by-district/)"
          badge={`${processedLandDistricts.length} Districts Matching`}
          action={
            <input
              type="text"
              placeholder="Search district..."
              value={landSearch}
              onChange={(e) => setLandSearch(e.target.value)}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                outline: 'none'
              }}
            />
          }
        >
          {errors.distLand ? (
            <ErrorState
              title="Failed to load land analytics"
              message={errors.distLand}
              onRetry={loadAnalytics}
              compact
            />
          ) : loading ? (
            <LoadingState message="Loading land records..." height={320} />
          ) : displayedLandDistricts.length === 0 ? (
            <EmptyState message="No land records match search query." height={320} />
          ) : (
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th style={{ textAlign: 'right' }}>Land Parcels</th>
                    <th style={{ textAlign: 'right' }}>Total Land Area</th>
                    <th style={{ textAlign: 'right' }}>Avg Area</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLandDistricts.map((row) => (
                    <tr key={row.district_id || row.district}>
                      <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{row.district}</td>
                      <td style={{ textAlign: 'right' }}>{formatNumber(row.land_record_count)}</td>
                      <td style={{ textAlign: 'right' }}>{formatArea(row.total_land_area_sqm)}</td>
                      <td style={{ textAlign: 'right' }}>{formatArea(row.average_land_area_sqm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                * Showing {displayedLandDistricts.length} districts matching filter criteria.
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* SECTION 6 & 7: DOCUMENTS COMPLETENESS & DATA QUALITY INDEX */}
      <div className="charts-grid-2col">
        {/* Chart 6: Documents Completeness */}
        <ChartCard
          title="6. Document Completeness Audit"
          subtitle="Legal property records & identification availability (/api/analytics/documents/)"
          badge={`Total ${formatNumber(documentsData?.total_facilities)} Facilities`}
        >
          {errors.documents ? (
            <ErrorState
              title="Failed to load document audit"
              message={errors.documents}
              onRetry={loadAnalytics}
              compact
            />
          ) : loading ? (
            <LoadingState message="Loading document completeness..." height={320} />
          ) : !documentsData ? (
            <EmptyState message="No document completeness data available." height={320} />
          ) : (
            <div>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={documentMetrics}
                    margin={{ top: 15, right: 20, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="field" tick={{ fill: '#334155', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      formatter={(val, name) => [
                        `${Number(val).toLocaleString()} Facilities`,
                        name === 'available' ? 'Available' : 'Missing'
                      ]}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6, borderColor: '#cbd5e1' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="available" name="Available" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="missing" name="Missing" fill="#f87171" stackId="a" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '10px' }}>
                {documentMetrics.map((dm) => (
                  <div key={dm.field} style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '11px' }}>
                    <strong>{dm.field}: </strong>
                    <span style={{ color: dm.rate >= 75 ? '#166534' : '#991b1b', fontWeight: 700 }}>
                      {dm.rate}% Complete
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        {/* Chart 7: Data Quality Field Completeness */}
        <ChartCard
          title="7. Data Quality Completeness Index"
          subtitle="Completeness rate across 9 core schema attributes (/api/analytics/data-quality/)"
          badge="9 Fields Analyzed"
        >
          {errors.dataQuality ? (
            <ErrorState
              title="Failed to load data quality"
              message={errors.dataQuality}
              onRetry={loadAnalytics}
              compact
            />
          ) : loading ? (
            <LoadingState message="Loading data quality analysis..." height={320} />
          ) : qualityFields.length === 0 ? (
            <EmptyState message="No data quality metrics available." height={320} />
          ) : (
            <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {qualityFields.map((field) => (
                  <div
                    key={field.key}
                    style={{
                      padding: '8px 12px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{field.label}</span>
                      <span style={{ fontWeight: 700, color: field.rate >= 80 ? '#15803d' : field.rate >= 50 ? '#b45309' : '#b91c1c' }}>
                        {field.rate}% ({formatNumber(field.available)} / {formatNumber(field.total)})
                      </span>
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${field.rate}%`,
                          background: field.rate >= 80 ? '#10b981' : field.rate >= 50 ? '#f59e0b' : '#ef4444',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* SECTION 8: IPHS 2022 STANDARDS & GAP ASSESSMENT */}
      <div style={{ marginBottom: '24px' }}>
        <ChartCard
          title="8. Indian Public Health Standards (IPHS) 2022 Norms & Gap Assessment"
          subtitle="Evaluation of facility count & land norms against statutory 2022 guidelines (/api/analytics/iphs/gaps/)"
          badge={`${filteredIphsRows.length} Requirements Evaluated`}
        >
          {errors.iphsSummary || errors.iphsGaps ? (
            <ErrorState
              title="Failed to load IPHS standards"
              message={errors.iphsSummary || errors.iphsGaps}
              onRetry={loadAnalytics}
            />
          ) : loading ? (
            <LoadingState message="Loading IPHS standards and gap evaluation..." height={220} />
          ) : (
            <div>
              {/* IPHS Summary Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Tracked Standards</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e3a8a' }}>{formatNumber(iphsSummary?.standards)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>IPHS 2022 Standard Framework</div>
                </div>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Facility Categories</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0d9488' }}>{formatNumber(iphsSummary?.facility_categories)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Standardized Facility Tiers</div>
                </div>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Evaluated Requirements</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>{formatNumber(iphsSummary?.requirements)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Norms Defined in Register</div>
                </div>
              </div>

              {/* Scope Note Banner */}
              {iphsGaps?.scope_note && (
                <div className="benchmark-banner" style={{ marginBottom: '16px' }}>
                  <div className="benchmark-banner-content">
                    <h4>IPHS Evaluation Scope Note</h4>
                    <p>{iphsGaps.scope_note}</p>
                  </div>
                </div>
              )}

              {/* Evaluated Gaps Table */}
              {filteredIphsRows.length === 0 ? (
                <EmptyState message="No IPHS requirement rows match selected facility tier filter." height={150} />
              ) : (
                <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Requirement / Norm</th>
                        <th>Facility Tier</th>
                        <th>Category</th>
                        <th style={{ textAlign: 'right' }}>Required</th>
                        <th style={{ textAlign: 'right' }}>Actual</th>
                        <th style={{ textAlign: 'right' }}>Gap</th>
                        <th style={{ textAlign: 'center' }}>Evaluation Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIphsRows.map((row) => {
                        const status = row.status || 'MISSING_PARAMETER';
                        const badgeClass = status === 'MEETS_NORM'
                          ? 'badge-success'
                          : status === 'BELOW_NORM'
                          ? 'badge-danger'
                          : 'badge-neutral';

                        return (
                          <tr key={row.id || row.requirement_code}>
                            <td style={{ fontWeight: 600, color: '#1e3a8a' }}>
                              {row.requirement_name || row.requirement_code || '--'}
                            </td>
                            <td>
                              <span className="badge badge-info">{row.facility_code || '--'}</span>
                            </td>
                            <td>{row.category || '--'}</td>
                            <td style={{ textAlign: 'right' }}>{formatNumber(row.required_value)}</td>
                            <td style={{ textAlign: 'right' }}>{formatNumber(row.actual_value)}</td>
                            <td style={{ textAlign: 'right' }}>
                              {row.gap !== undefined && row.gap !== null ? (
                                <span style={{ color: row.gap < 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                                  {row.gap > 0 ? `+${formatNumber(row.gap)}` : formatNumber(row.gap)}
                                </span>
                              ) : '--'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge ${badgeClass}`}>
                                {status.replace(/_/g, ' ')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

export default Analytics;
