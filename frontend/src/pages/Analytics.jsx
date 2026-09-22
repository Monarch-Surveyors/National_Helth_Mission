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
  Cell,
  LabelList,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
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

function formatPercentage(pct) {
  if (pct === undefined || pct === null || isNaN(Number(pct)) || Number(pct) === 0) return '0%';
  const num = Number(pct);
  if (num < 0.05) return `${num.toFixed(2)}%`;
  return `${num.toFixed(1)}%`;
}



const CircularProgressRing = ({
  percentage,
  size = 46,
  strokeWidth = 4,
  color = '#16a34a',
  textColor = '#0f172a'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Ensure tiny percentages (e.g. 0.01%) have a visible colored segment
  const visualPct = percentage > 0 ? Math.max(percentage, 1.2) : 0;
  const strokeDashoffset = circumference - (visualPct / 100) * circumference;
  const displayPct = formatPercentage(percentage);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontSize: size < 42 ? '8.5px' : '10px',
          fontWeight: 700,
          color: textColor,
          textAlign: 'center',
          lineHeight: 1,
          letterSpacing: '-0.3px'
        }}
      >
        {displayPct}
      </span>
    </div>
  );
};

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data) return null;
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '9px 13px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
          fontSize: '12px',
          color: '#1e293b',
          lineHeight: 1.5,
          minWidth: '200px',
          pointerEvents: 'none'
        }}
      >
        <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '4px', borderBottom: '1px solid #f1f5f9', paddingBottom: '3px' }}>
          {data.label || data.code}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ color: '#64748b' }}>Facility Type:</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{data.code}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ color: '#64748b' }}>Exact Count:</span>
          <span style={{ fontWeight: 800, color: '#1e3a8a' }}>{Number(data.facility_count || 0).toLocaleString()}</span>
        </div>
        {data.total_facilities > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ color: '#64748b' }}>Share of Total:</span>
            <span style={{ fontWeight: 700, color: '#0d9488' }}>
              {formatPercentage(((Number(data.facility_count) || 0) / data.total_facilities) * 100)}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

/**
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
  const [facilityViewMode, setFacilityViewMode] = useState('hierarchy');

  const handleResetFilters = () => {
    setSelectedDistrict('All');
    setSelectedFacilityType('All');
    setSelectedOwnership('All');
    setSelectedSort('count_desc');
    setSelectedLimit(15);
    setDistrictSearch('');
    setLandSearch('');
  };

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
    const total = facilitiesByType.reduce((sum, item) => sum + (Number(item.facility_count) || 0), 0);
    return facilitiesByType
      .filter((t) => {
        if (selectedFacilityType === 'All') return true;
        return t.code === selectedFacilityType || t.label === selectedFacilityType;
      })
      .map((item) => ({
        ...item,
        total_facilities: total
      }))
      .sort((a, b) => (b.facility_count || 0) - (a.facility_count || 0));
  }, [facilitiesByType, selectedFacilityType]);

  // Lookup map for fast retrieval of live facility counts by type code
  const facilityTypeMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(facilitiesByType)) {
      facilitiesByType.forEach((item) => {
        if (item && item.code) {
          map.set(item.code.trim().toUpperCase(), item);
        }
      });
    }
    return map;
  }, [facilitiesByType]);

  const getTypeInfo = useCallback(
    (code, defaultLabel = '') => {
      const item = facilityTypeMap.get(code.trim().toUpperCase());
      return {
        code,
        label: item?.label || defaultLabel || code,
        count: item?.facility_count ?? 0,
        id: item?.facility_type_id || null
      };
    },
    [facilityTypeMap]
  );

  const totalFacilityCount = useMemo(() => {
    if (!Array.isArray(facilitiesByType)) return 0;
    return facilitiesByType.reduce((sum, item) => sum + (Number(item.facility_count) || 0), 0);
  }, [facilitiesByType]);

  const dhItem = facilityTypeMap.get('DH');
  const hasDH = Boolean(dhItem && (dhItem.facility_count !== undefined && dhItem.facility_count !== null));
  const dhInfo = getTypeInfo('DH', 'District Hospital');
  const dhPct = totalFacilityCount > 0 ? (dhInfo.count / totalFacilityCount) * 100 : 0;

  const handleFacilityTypeClick = (code) => {
    if (selectedFacilityType === code) {
      setSelectedFacilityType('All');
    } else {
      setSelectedFacilityType(code);
    }
  };

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

    const getMetric = (label, dataObj) => {
      const available = Number(dataObj?.available) || 0;
      const missing = Number(dataObj?.missing) || 0;
      const total = available + missing;
      const rate = total > 0 ? Math.round((available / total) * 100) : 0;
      return {
        field: label,
        available,
        missing,
        total,
        rate
      };
    };

    const knownKeys = new Set([
      'survey_gat_cts_no',
      'property_land_address',
      'pin_code',
      'ownership_doc_available',
      'ownership_document',
      'total_facilities'
    ]);

    const metrics = [
      getMetric('Survey / Gat No.', documentsData.survey_gat_cts_no),
      getMetric('Property Land Address', documentsData.property_land_address),
      getMetric('PIN Code', documentsData.pin_code),
      getMetric(
        'Ownership Document',
        documentsData.ownership_document || documentsData.ownership_doc_available
      )
    ];

    // Check for any other existing data-quality fields in documentsData
    Object.entries(documentsData).forEach(([key, val]) => {
      if (!knownKeys.has(key) && val && typeof val === 'object' && ('available' in val || 'missing' in val)) {
        const formattedLabel = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        metrics.push(getMetric(formattedLabel, val));
      }
    });

    return metrics;
  }, [documentsData]);

  // Memoized Data Quality Fields for Radar Chart
  const qualityFields = useMemo(() => {
    if (!dataQualityData?.fields) return [];

    const fieldConfig = [
      { key: 'facility_name', label: 'Facility Name' },
      { key: 'property_land_address', label: 'Property Land Address' },
      { key: 'pin_code', label: 'PIN Code' },
      { key: 'survey_gat_cts_no', label: 'Survey Gat CTS No' },
      { key: 'total_land_area_sqm', label: 'Total Land Area SQM' },
      {
        key: 'ownership_doc_available',
        fallbackKey: 'ownership_document',
        label: 'Ownership Document'
      },
      { key: 'district', label: 'District' },
      { key: 'taluka', label: 'Taluka' },
      { key: 'facility_type', label: 'Facility Type' }
    ];

    const processedKeys = new Set();
    const result = [];

    fieldConfig.forEach(({ key, fallbackKey, label }) => {
      const stats = dataQualityData.fields[key] || (fallbackKey ? dataQualityData.fields[fallbackKey] : null);
      if (stats) {
        processedKeys.add(key);
        if (fallbackKey) processedKeys.add(fallbackKey);
        const available = Number(stats.available) || 0;
        const missing = Number(stats.missing) || 0;
        const total = available + missing;
        const rate = total > 0 ? Math.round((available / total) * 100) : 0;
        result.push({
          key,
          label,
          available,
          missing,
          total,
          rate
        });
      }
    });

    // Support any additional schema/data-quality fields from the API
    Object.entries(dataQualityData.fields).forEach(([fieldName, stats]) => {
      if (!processedKeys.has(fieldName) && stats && typeof stats === 'object') {
        const available = Number(stats.available) || 0;
        const missing = Number(stats.missing) || 0;
        const total = available + missing;
        const rate = total > 0 ? Math.round((available / total) * 100) : 0;
        const formattedLabel = fieldName
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        result.push({
          key: fieldName,
          label: formattedLabel,
          available,
          missing,
          total,
          rate
        });
      }
    });

    return result;
  }, [dataQualityData]);

  // Filtered IPHS Gaps rows based on Facility Type selection
  const filteredIphsRows = useMemo(() => {
    const rows = Array.isArray(iphsGaps?.rows) ? iphsGaps.rows : [];
    if (selectedFacilityType === 'All') return rows;
    return rows.filter((r) => r.facility_code === selectedFacilityType);
  }, [iphsGaps, selectedFacilityType]);

  const renderRuralCard = (code, defaultLabel, ringColor) => {
    const info = getTypeInfo(code, defaultLabel);
    const pct = totalFacilityCount > 0 ? (info.count / totalFacilityCount) * 100 : 0;
    const isSelected = selectedFacilityType === code;
    const isDimmed = selectedFacilityType !== 'All' && !isSelected;

    return (
      <div
        key={code}
        className={`nhm-info-card ${isSelected ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
        onClick={() => handleFacilityTypeClick(code)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleFacilityTypeClick(code);
        }}
        title={`${info.code} - ${info.label}: ${formatNumber(info.count)} Facilities (${formatPercentage(pct)}). Click to filter.`}
      >
        <div className="nhm-info-card-left">
          <span className="nhm-info-card-code">{info.code}</span>
          <span className="nhm-info-card-label">{info.label}</span>
        </div>
        <div className="nhm-info-card-center">
          <span className="nhm-info-card-count">{formatNumber(info.count)}</span>
          <span className="nhm-info-card-pct" style={{ color: ringColor }}>{formatPercentage(pct)}</span>
        </div>
        <CircularProgressRing percentage={pct} color={ringColor} size={48} textColor="#0f172a" />
      </div>
    );
  };

  const renderUrbanCard = (code, defaultLabel, countColor, ringColor) => {
    const info = getTypeInfo(code, defaultLabel);
    const pct = totalFacilityCount > 0 ? (info.count / totalFacilityCount) * 100 : 0;
    const isSelected = selectedFacilityType === code;
    const isDimmed = selectedFacilityType !== 'All' && !isSelected;

    return (
      <div
        key={code}
        className={`nhm-info-card ${isSelected ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
        onClick={() => handleFacilityTypeClick(code)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleFacilityTypeClick(code);
        }}
        title={`${info.code} - ${info.label}: ${formatNumber(info.count)} Facilities (${formatPercentage(pct)}). Click to filter.`}
      >
        <div className="nhm-info-card-left">
          <span className="nhm-info-card-code">{info.code}</span>
          <span className="nhm-info-card-label">{info.label}</span>
        </div>
        <div className="nhm-info-card-center">
          <span className="nhm-info-card-count" style={{ color: countColor }}>{formatNumber(info.count)}</span>
          <span className="nhm-info-card-pct" style={{ color: ringColor }}>{formatPercentage(pct)}</span>
        </div>
        <CircularProgressRing percentage={pct} color={ringColor} size={48} textColor="#0f172a" />
      </div>
    );
  };

  const renderUrbanDualPod = () => {
    const uhwc = getTypeInfo('UHWC', 'Urban Health & Wellness Centre');
    const hbt = getTypeInfo('HBT', 'HBT Aapla Dawakhana');
    const uhwcPct = totalFacilityCount > 0 ? (uhwc.count / totalFacilityCount) * 100 : 0;
    const hbtPct = totalFacilityCount > 0 ? (hbt.count / totalFacilityCount) * 100 : 0;
    const isUhwcSelected = selectedFacilityType === 'UHWC';
    const isHbtSelected = selectedFacilityType === 'HBT';
    const isAnyOther = selectedFacilityType !== 'All';

    return (
      <div className="nhm-urban-dual-wrapper">
        <div
          className={`nhm-urban-dual-card ${isUhwcSelected ? 'active' : ''} ${isAnyOther && !isUhwcSelected ? 'dimmed' : ''}`}
          onClick={() => handleFacilityTypeClick('UHWC')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleFacilityTypeClick('UHWC');
          }}
          title={`${uhwc.code} - ${uhwc.label}: ${formatNumber(uhwc.count)} Facilities (${formatPercentage(uhwcPct)}). Click to filter.`}
        >
          <div className="nhm-urban-dual-left">
            <span className="nhm-urban-dual-code">{uhwc.code}</span>
            <span className="nhm-urban-dual-desc">{uhwc.label}</span>
            <span className="nhm-urban-dual-count">{formatNumber(uhwc.count)}</span>
            <span className="nhm-urban-dual-pct" style={{ color: '#06b6d4' }}>{formatPercentage(uhwcPct)}</span>
          </div>
          <CircularProgressRing percentage={uhwcPct} color="#06b6d4" size={40} textColor="#0f172a" />
        </div>

        <div
          className={`nhm-urban-dual-card ${isHbtSelected ? 'active' : ''} ${isAnyOther && !isHbtSelected ? 'dimmed' : ''}`}
          onClick={() => handleFacilityTypeClick('HBT')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleFacilityTypeClick('HBT');
          }}
          title={`${hbt.code} - ${hbt.label}: ${formatNumber(hbt.count)} Facilities (${formatPercentage(hbtPct)}). Click to filter.`}
        >
          <div className="nhm-urban-dual-left">
            <span className="nhm-urban-dual-code">{hbt.code}</span>
            <span className="nhm-urban-dual-desc">{hbt.label}</span>
            <span className="nhm-urban-dual-count">{formatNumber(hbt.count)}</span>
            <span className="nhm-urban-dual-pct" style={{ color: '#8b5cf6' }}>{formatPercentage(hbtPct)}</span>
          </div>
          <CircularProgressRing percentage={hbtPct} color="#8b5cf6" size={40} textColor="#0f172a" />
        </div>
      </div>
    );
  };



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
            onClick={handleResetFilters}
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
            subtitle={selectedDistrict !== 'All' ? 'Selected District' : 'Districts in Register'}
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
            subtitle="Tehsils & Health Blocks"
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
            subtitle="Standardized Classifications"
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
            subtitle="Recorded Land Area"
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

      {/* SECTION 1: FACILITIES BY TYPE (Healthcare Delivery Hierarchy) */}
      <div style={{ marginBottom: '24px' }}>
        <ChartCard
          title="1. Facilities by Type"
          subtitle="Distribution of registered health facilities by facility type"
          badge={`${facilitiesByType.length || 14} Types`}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="nhm-ref-total-badge">
                <div className="nhm-ref-total-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <div className="nhm-ref-total-text">
                  <span className="nhm-ref-total-label">Total Facilities</span>
                  <span className="nhm-ref-total-num">{formatNumber(totalFacilityCount)}</span>
                </div>
              </div>

              {selectedFacilityType !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedFacilityType('All')}
                  className="btn btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe'
                  }}
                  title="Reset Facility Type Filter"
                >
                  Clear Filter ({selectedFacilityType}) ×
                </button>
              )}
              <div style={{ display: 'inline-flex', borderRadius: '6px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setFacilityViewMode('hierarchy')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    background: facilityViewMode === 'hierarchy' ? '#1e3a8a' : '#ffffff',
                    color: facilityViewMode === 'hierarchy' ? '#ffffff' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Hierarchy View
                </button>
                <button
                  type="button"
                  onClick={() => setFacilityViewMode('chart')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    background: facilityViewMode === 'chart' ? '#1e3a8a' : '#ffffff',
                    color: facilityViewMode === 'chart' ? '#ffffff' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Bar Chart
                </button>
              </div>
            </div>
          }
        >
          {errors.type ? (
            <ErrorState
              title="Failed to load type analytics"
              message={errors.type}
              onRetry={loadAnalytics}
              compact
            />
          ) : loading ? (
            <LoadingState message="Loading facility type distribution..." height={360} />
          ) : facilitiesByType.length === 0 ? (
            <EmptyState message="No facility types available." height={300} />
          ) : facilityViewMode === 'chart' ? (
            <div style={{ width: '100%', height: 350 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px', paddingRight: '12px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748b',
                    background: '#f8fafc',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  Scale: Logarithmic (Y-axis) • Exact Counts on Bars
                </span>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={filteredTypes}
                  margin={{ top: 28, right: 15, left: 0, bottom: 45 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="code"
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis
                    scale="log"
                    domain={[1, 15000]}
                    allowDataOverflow
                    ticks={[1, 10, 100, 1000, 10000]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(val) => Number(val).toLocaleString()}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="facility_count"
                    radius={[4, 4, 0, 0]}
                  >
                    {filteredTypes.map((entry, index) => {
                      const isSelected = selectedFacilityType === entry.code;
                      const isDimmed = selectedFacilityType !== 'All' && !isSelected;
                      return (
                        <Cell
                          key={`type-bar-${entry.facility_type_id || entry.code || index}`}
                          fill={PALETTE[index % PALETTE.length]}
                          style={{
                            cursor: 'pointer',
                            opacity: isDimmed ? 0.35 : 1,
                            stroke: isSelected ? '#0f172a' : 'none',
                            strokeWidth: isSelected ? 2 : 0,
                            transition: 'opacity 0.2s ease'
                          }}
                          onClick={() => handleFacilityTypeClick(entry.code)}
                        />
                      );
                    })}
                    <LabelList
                      dataKey="facility_count"
                      position="top"
                      offset={6}
                      formatter={(val) => Number(val || 0).toLocaleString()}
                      style={{
                        fill: '#0f172a',
                        fontSize: '10px',
                        fontWeight: 700
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="nhm-infographic-container">
              {/* 1. TOP DH FOCAL POINT & BRANCHING ARMS */}
              <div className="nhm-dh-focal-wrapper">
                {/* Left Branch Arm to Rural */}
                <div className="nhm-dh-branch-arm left">
                  <div className="nhm-dh-arm-line green" />
                  <div className="nhm-dh-arm-elbow green" />
                  <div className="nhm-dh-arm-arrow green">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                  </div>
                </div>

                {/* Central DH Circle Node */}
                {hasDH ? (
                  <div
                    className={`nhm-dh-circle-node ${selectedFacilityType === 'DH' ? 'active' : ''} ${selectedFacilityType !== 'All' && selectedFacilityType !== 'DH' ? 'dimmed' : ''}`}
                    onClick={() => handleFacilityTypeClick('DH')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleFacilityTypeClick('DH');
                    }}
                    title={`District Hospital (DH): ${formatNumber(dhInfo.count)} Facilities (${formatPercentage(dhPct)}). Click to filter.`}
                  >
                    <div className="nhm-dh-badge-top">L4</div>
                    <div className="nhm-dh-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18" />
                        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                        <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                        <path d="M10 9h4" />
                        <path d="M12 7v4" />
                      </svg>
                    </div>
                    <span className="nhm-dh-code">DH</span>
                    <span className="nhm-dh-label">{dhInfo.label || 'District Hospital'}</span>
                    <span className="nhm-dh-count">{formatNumber(dhInfo.count)}</span>
                    <span className="nhm-dh-share-badge">{formatPercentage(dhPct)} of total</span>
                  </div>
                ) : (
                  <div style={{ width: 136, height: 136 }} />
                )}

                {/* Right Branch Arm to Urban */}
                <div className="nhm-dh-branch-arm right">
                  <div className="nhm-dh-arm-arrow blue">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                  </div>
                  <div className="nhm-dh-arm-elbow blue" />
                  <div className="nhm-dh-arm-line blue" />
                </div>
              </div>

              {/* 2. TWO-COLUMN SECTION: RURAL | URBAN */}
              <div className="nhm-infographic-grid">
                {/* LEFT COLUMN: RURAL HEALTH FACILITIES */}
                <div className="nhm-track-column">
                  <div className="nhm-track-header rural">
                    <div className="nhm-track-header-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                    </div>
                    <div className="nhm-track-header-text">
                      <span className="nhm-track-title">RURAL HEALTH FACILITIES</span>
                      <span className="nhm-track-subtitle">(Community to District-level Care)</span>
                    </div>
                  </div>

                  <div className="nhm-track-arrow green">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                  </div>

                  {/* L1: SC */}
                  <div className="nhm-level-circle l1">L1</div>
                  {renderRuralCard('SC', 'Sub-Centre', '#16a34a')}

                  <div className="nhm-track-arrow green">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                  </div>

                  {/* L2: PHC */}
                  <div className="nhm-level-circle l2">L2</div>
                  {renderRuralCard('PHC', 'Primary Health Centre', '#2563eb')}

                  <div className="nhm-track-arrow green">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                  </div>

                  {/* L3: RH */}
                  <div className="nhm-level-circle l3">L3</div>
                  {renderRuralCard('RH', 'Rural Hospital', '#ea580c')}
                </div>

                {/* RIGHT COLUMN: URBAN HEALTH FACILITIES */}
                <div className="nhm-track-column">
                  <div className="nhm-track-header urban">
                    <div className="nhm-track-header-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                    </div>
                    <div className="nhm-track-header-text">
                      <span className="nhm-track-title">URBAN HEALTH FACILITIES</span>
                      <span className="nhm-track-subtitle">(Urban Primary to District-level Care)</span>
                    </div>
                  </div>

                  <div className="nhm-track-arrow blue">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                  </div>

                  {/* L1: UHWC & HBT */}
                  <div className="nhm-level-circle l1">L1</div>
                  <div className="nhm-urban-branch-fork" />
                  {renderUrbanDualPod()}
                  <div className="nhm-urban-convergence-fork" />

                  {/* L2: UPHC */}
                  <div className="nhm-level-circle l2">L2</div>
                  {renderUrbanCard('UPHC', 'Urban Primary Health Centre', '#2563eb', '#ec4899')}

                  <div className="nhm-track-arrow blue">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                  </div>

                  {/* L3: UCHC */}
                  <div className="nhm-level-circle l3">L3</div>
                  {renderUrbanCard('UCHC', 'Urban Community Health Centre', '#dc2626', '#dc2626')}
                </div>
              </div>

              {/* 4. FOOTER INFO NOTICE */}
              <div className="nhm-footer-info-bar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>Percentages are calculated based on total registered facilities ({formatNumber(totalFacilityCount)}) and include all {facilitiesByType.length || 14} facility types.</span>
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* SECTION 2: OWNERSHIP DISTRIBUTION */}
      <div style={{ marginBottom: '24px' }}>
        <ChartCard
          title="2. Ownership Distribution"
          subtitle="Breakdown of facilities by ownership category"
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
            <div style={{ maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {filteredOwnership.map((item, idx) => {
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
            </div>
          )}
        </ChartCard>
      </div>

      {/* SECTION 4: FACILITIES BY DISTRICT (Scrollable & Sortable) */}
      <div style={{ marginBottom: '24px' }}>
        <ChartCard
          title="3. Facilities by District"
          subtitle="Statewide health infrastructure distribution across all districts"
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
              <div className="chart-scroll-wrapper">
                <div style={{ minWidth: `${Math.max(1200, displayedDistricts.length * 34)}px`, width: '100%', height: 380 }}>
                  <ResponsiveContainer width="100%" height="100%">
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
          subtitle="Administrative and health office presence across Maharashtra districts"
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
              <div className="chart-scroll-wrapper">
                <div style={{ minWidth: `${Math.max(1200, displayedOffices.length * 34)}px`, width: '100%', height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={displayedOffices}
                      margin={{ top: 15, right: 15, left: 10, bottom: 55 }}
                    >
                      <defs>
                        <linearGradient id="officeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
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
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#cbd5e1' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="office_count"
                        stroke="#0d9488"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#officeAreaGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Showing {displayedOffices.length} of {processedOffices.length} matching districts.</span>
                <span>Scroll horizontally to inspect full dataset.</span>
              </div>
            </div>
          )}
        </ChartCard>

        {/* Chart 5: Land Area by District */}
        <ChartCard
          title="5. Land Footprint by District"
          subtitle="Total recorded land area and parcels per district"
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
          subtitle="Availability of important legal and property records"
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
                      formatter={(val, name) => {
                        const isAvailable = String(name).toLowerCase() === 'available';
                        return [
                          `${Number(val).toLocaleString()} Facilities`,
                          isAvailable ? 'Available' : 'Missing'
                        ];
                      }}
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
          subtitle="Completeness of important facility information"
          badge={`${qualityFields.length || 9} Fields Analyzed`}
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
          ) : (!dataQualityData || !dataQualityData.fields || qualityFields.length === 0) ? (
            <EmptyState message="No data quality metrics available." height={320} />
          ) : (
            <div style={{ width: '100%', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={95} data={qualityFields}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="label"
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <Radar
                    name="Completeness Rate"
                    dataKey="rate"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            style={{
                              backgroundColor: '#ffffff',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                              fontSize: '12px'
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{data.label}</span>
                            <span style={{ color: '#64748b' }}>: </span>
                            <span style={{ fontWeight: 700, color: '#2563eb' }}>{data.rate}%</span>
                            <span style={{ color: '#64748b' }}>
                              {' '}
                              ({formatNumber(data.available)} / {formatNumber(data.total)})
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* SECTION 8: IPHS 2022 STANDARDS & GAP ASSESSMENT */}
      <div style={{ marginBottom: '24px' }}>
        <ChartCard
          title="8. Indian Public Health Standards (IPHS) 2022 Norms & Gap Assessment"
          subtitle="Assessment of health infrastructure standards and gaps"
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
