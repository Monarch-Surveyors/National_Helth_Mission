import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChartCard from '../components/ChartCard';
import FilterBar from '../components/FilterBar';
import StatusBadge from '../components/StatusBadge';
import {
  getDistricts,
  getTalukas,
  getFacilityTypes,
  getOwnershipTypes,
  getFacilities,
  getOffices
} from '../services/api';

/**
 * Facilities & Offices Page
 *
 * Exclusively displays live data from Django backend APIs:
 * - GET /api/facility-types/
 * - GET /api/ownership-types/
 * - GET /api/districts/
 * - GET /api/talukas/?district_id=<id>
 * - GET /api/facilities/
 * - GET /api/offices/
 *
 * No static/demo data, no fake metrics, and no hardcoded fallback records.
 */
function Facilities() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active view: 'Facilities' or 'Offices' (derived from URL path or local state)
  const isOfficesRoute = location.pathname.includes('/offices');
  const [activeTab, setActiveTab] = useState(isOfficesRoute ? 'Offices' : 'Facilities');

  // Keep activeTab in sync with route
  useEffect(() => {
    if (location.pathname.includes('/offices')) {
      setActiveTab('Offices');
    } else {
      setActiveTab('Facilities');
    }
  }, [location.pathname]);

  // Lookup metadata loaded from APIs
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [ownershipTypes, setOwnershipTypes] = useState([]);
  const [talukasLoading, setTalukasLoading] = useState(false);

  // Filter state (Numeric IDs sent to backend)
  const [districtId, setDistrictId] = useState('All');
  const [talukaId, setTalukaId] = useState('All');
  const [facilityTypeId, setFacilityTypeId] = useState('All');
  const [ownershipTypeId, setOwnershipTypeId] = useState('All');
  // Facilities independent state
  const [facilityRecords, setFacilityRecords] = useState([]);
  const [facilityPage, setFacilityPage] = useState(1);
  const [facilityPageSize, setFacilityPageSize] = useState(10);
  const [facilityPagination, setFacilityPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false
  });
  const [facilitySearch, setFacilitySearch] = useState('');
  const [debouncedFacilitySearch, setDebouncedFacilitySearch] = useState('');

  // Offices independent state
  const [officeRecords, setOfficeRecords] = useState([]);
  const [officePage, setOfficePage] = useState(1);
  const [officePageSize, setOfficePageSize] = useState(10);
  const [officePagination, setOfficePagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false
  });
  const [officeSearch, setOfficeSearch] = useState('');
  const [debouncedOfficeSearch, setDebouncedOfficeSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selected item for detail modal
  const [selectedItem, setSelectedItem] = useState(null);

  // Debounce search input for Facilities
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFacilitySearch(facilitySearch);
      setFacilityPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [facilitySearch]);

  // Debounce search input for Offices
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedOfficeSearch(officeSearch);
      setOfficePage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [officeSearch]);

  // 1. Load Filter Metadata (Districts, Facility Types, Ownership Types) on mount
  useEffect(() => {
    let isMounted = true;

    async function loadMetadata() {
      try {
        const [dList, ftList, otList] = await Promise.allSettled([
          getDistricts(),
          getFacilityTypes(),
          getOwnershipTypes()
        ]);

        if (isMounted) {
          if (dList.status === 'fulfilled') setDistricts(dList.value);
          if (ftList.status === 'fulfilled') setFacilityTypes(ftList.value);
          if (otList.status === 'fulfilled') setOwnershipTypes(otList.value);
        }
      } catch {
        if (isMounted) {
          setError('Unable to connect to the backend API.');
        }
      }
    }

    loadMetadata();
    return () => { isMounted = false; };
  }, []);

  // 2. Cascading Filter: Load Talukas whenever districtId changes
  useEffect(() => {
    let isMounted = true;

    if (!districtId || districtId === 'All') {
      setTalukas([]);
      setTalukaId('All');
      return;
    }

    async function loadTalukas() {
      setTalukasLoading(true);
      try {
        const tList = await getTalukas(districtId);
        if (isMounted) {
          setTalukas(tList);
        }
      } catch {
        if (isMounted) setTalukas([]);
      } finally {
        if (isMounted) setTalukasLoading(false);
      }
    }

    setTalukaId('All');
    loadTalukas();
    return () => { isMounted = false; };
  }, [districtId]);

  // 3a. Fetch Facilities from live API with server-side pagination
  useEffect(() => {
    if (activeTab !== 'Facilities') return;
    let isMounted = true;

    async function fetchFacilitiesData() {
      setLoading(true);
      setError(null);

      try {
        const filters = {
          district_id: districtId !== 'All' ? districtId : undefined,
          taluka_id: talukaId !== 'All' ? talukaId : undefined,
          ownership_type_id: ownershipTypeId !== 'All' ? ownershipTypeId : undefined,
          facility_type_id: facilityTypeId !== 'All' ? facilityTypeId : undefined,
          search: debouncedFacilitySearch.trim() || undefined,
          page: facilityPage,
          page_size: facilityPageSize
        };

        const response = await getFacilities(filters);

        if (isMounted) {
          setFacilityRecords(response.results || []);
          setFacilityPagination(response.pagination || {
            page: facilityPage,
            page_size: facilityPageSize,
            total: response.results?.length || 0,
            total_pages: 1,
            has_next: false,
            has_previous: false
          });
          setError(null);
        }
      } catch {
        if (isMounted) {
          setError('Unable to connect to the backend API.');
          setFacilityRecords([]);
          setFacilityPagination({
            page: facilityPage,
            page_size: facilityPageSize,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_previous: false
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchFacilitiesData();
    return () => { isMounted = false; };
  }, [activeTab, districtId, talukaId, facilityTypeId, ownershipTypeId, debouncedFacilitySearch, facilityPage, facilityPageSize]);

  // 3b. Fetch Offices from live API with server-side pagination
  useEffect(() => {
    if (activeTab !== 'Offices') return;
    let isMounted = true;

    async function fetchOfficesData() {
      setLoading(true);
      setError(null);

      try {
        const filters = {
          district_id: districtId !== 'All' ? districtId : undefined,
          taluka_id: talukaId !== 'All' ? talukaId : undefined,
          ownership_type_id: ownershipTypeId !== 'All' ? ownershipTypeId : undefined,
          search: debouncedOfficeSearch.trim() || undefined,
          page: officePage,
          page_size: officePageSize
        };

        const response = await getOffices(filters);

        if (isMounted) {
          setOfficeRecords(response.results || []);
          setOfficePagination(response.pagination || {
            page: officePage,
            page_size: officePageSize,
            total: response.results?.length || 0,
            total_pages: 1,
            has_next: false,
            has_previous: false
          });
          setError(null);
        }
      } catch {
        if (isMounted) {
          setError('Unable to connect to the backend API.');
          setOfficeRecords([]);
          setOfficePagination({
            page: officePage,
            page_size: officePageSize,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_previous: false
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOfficesData();
    return () => { isMounted = false; };
  }, [activeTab, districtId, talukaId, ownershipTypeId, debouncedOfficeSearch, officePage, officePageSize]);

  // Derived values for active tab view
  const records = activeTab === 'Offices' ? officeRecords : facilityRecords;
  const currentPage = activeTab === 'Offices' ? officePage : facilityPage;
  const pageSize = activeTab === 'Offices' ? officePageSize : facilityPageSize;
  const pagination = activeTab === 'Offices' ? officePagination : facilityPagination;
  const searchTerm = activeTab === 'Offices' ? officeSearch : facilitySearch;

  // Tab change handler - preserves each tab's page and page size
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'Offices' ? '/offices' : '/facilities');
  };

  // Reset filters for active tab
  const handleResetFilters = () => {
    setDistrictId('All');
    setTalukaId('All');
    setTalukas([]);
    setOwnershipTypeId('All');

    if (activeTab === 'Offices') {
      setOfficeSearch('');
      setDebouncedOfficeSearch('');
      setOfficePage(1);
    } else {
      setFacilityTypeId('All');
      setFacilitySearch('');
      setDebouncedFacilitySearch('');
      setFacilityPage(1);
    }
  };

  const handlePageSizeChange = (newSize) => {
    if (activeTab === 'Offices') {
      if (officePageSize !== newSize) {
        setOfficePageSize(newSize);
        setOfficePage(1);
      }
    } else {
      if (facilityPageSize !== newSize) {
        setFacilityPageSize(newSize);
        setFacilityPage(1);
      }
    }
  };

  const handlePreviousPage = () => {
    if (activeTab === 'Offices') {
      setOfficePage((p) => Math.max(1, p - 1));
    } else {
      setFacilityPage((p) => Math.max(1, p - 1));
    }
  };

  const handleNextPage = () => {
    if (activeTab === 'Offices') {
      setOfficePage((p) => p + 1);
    } else {
      setFacilityPage((p) => p + 1);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">
              {activeTab === 'Offices' ? 'Administrative Health Offices' : 'Health Facilities Directory'}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'Offices'
                ? 'Public health administrative offices and directorates across Maharashtra'
                : 'Public health infrastructure registry across Maharashtra'}
            </p>
          </div>
        </div>
      </div>

      {/* API Error Banner */}
      {error && (
        <div
          className="attention-card warning"
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div>
            <strong style={{ color: '#92400e', fontSize: '13px' }}>{error}</strong>
            <div style={{ fontSize: '12px', color: '#b45309' }}>
              Please verify that the Django backend server is running on port 8000.
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs (Facilities / Offices) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => handleTabChange('Facilities')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: activeTab === 'Facilities' ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
            background: activeTab === 'Facilities' ? '#1e3a8a' : '#ffffff',
            color: activeTab === 'Facilities' ? '#ffffff' : '#334155',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'Facilities' ? '0 2px 4px rgba(30, 58, 138, 0.2)' : 'none'
          }}
        >
          Health Facilities
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('Offices')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: activeTab === 'Offices' ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
            background: activeTab === 'Offices' ? '#1e3a8a' : '#ffffff',
            color: activeTab === 'Offices' ? '#ffffff' : '#334155',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'Offices' ? '0 2px 4px rgba(30, 58, 138, 0.2)' : 'none'
          }}
        >
          Administrative Offices
        </button>
      </div>

      {/* API-Supported Filter Bar */}
      <FilterBar title="Directory Filters">
        {/* Text Search */}
        <div className="filter-group">
          <label className="filter-label">Search Name / Taluka</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search name, taluka..."
            value={searchTerm}
            onChange={(e) => {
              if (activeTab === 'Offices') {
                setOfficeSearch(e.target.value);
              } else {
                setFacilitySearch(e.target.value);
              }
            }}
          />
        </div>

        {/* Dynamic District Filter */}
        <div className="filter-group">
          <label className="filter-label">District</label>
          <select
            className="filter-select"
            value={districtId}
            onChange={(e) => {
              setDistrictId(e.target.value);
              if (activeTab === 'Offices') {
                setOfficePage(1);
              } else {
                setFacilityPage(1);
              }
            }}
          >
            <option value="All">All Districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cascading Taluka Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Taluka / Block {talukasLoading && '⏳'}
          </label>
          <select
            className="filter-select"
            value={talukaId}
            disabled={districtId === 'All' || talukasLoading}
            onChange={(e) => {
              setTalukaId(e.target.value);
              if (activeTab === 'Offices') {
                setOfficePage(1);
              } else {
                setFacilityPage(1);
              }
            }}
          >
            <option value="All">
              {districtId === 'All' ? 'Select district first' : 'All Talukas'}
            </option>
            {talukas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Facility Type Filter (Facilities only) */}
        {activeTab === 'Facilities' && (
          <div className="filter-group">
            <label className="filter-label">Facility Type</label>
            <select
              className="filter-select"
              value={facilityTypeId}
              onChange={(e) => {
                setFacilityTypeId(e.target.value);
                setFacilityPage(1);
              }}
            >
              <option value="All">All Facility Types</option>
              {facilityTypes.map((ft) => (
                <option key={ft.id} value={ft.id}>
                  {ft.label} {ft.code ? `(${ft.code})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dynamic Ownership Filter */}
        <div className="filter-group">
          <label className="filter-label">Ownership</label>
          <select
            className="filter-select"
            value={ownershipTypeId}
            onChange={(e) => {
              setOwnershipTypeId(e.target.value);
              if (activeTab === 'Offices') {
                setOfficePage(1);
              } else {
                setFacilityPage(1);
              }
            }}
          >
            <option value="All">All Ownership Types</option>
            {ownershipTypes.map((ot) => (
              <option key={ot.id} value={ot.id}>
                {ot.label || ot.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters Action */}
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

      {/* Data Table Card */}
      <ChartCard
        title={activeTab === 'Offices' ? 'Administrative Health Offices' : 'Registered Health Facilities'}
        subtitle={
          loading
            ? 'Loading live data...'
            : `Showing ${records.length} of ${pagination.total.toLocaleString()} records (Click row to inspect)`
        }
      >
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{activeTab === 'Offices' ? 'Office Name' : 'Facility Name'}</th>
                <th>Type</th>
                <th>District</th>
                <th>Taluka / Block</th>
                <th style={{ textAlign: 'right' }}>Land Area</th>
                <th>Ownership</th>
                <th>Document</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <div style={{ display: 'inline-block', fontSize: '14px', fontWeight: 600 }}>
                      Loading live data...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#dc2626', fontWeight: 600 }}>
                    Unable to connect to the backend API.
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((item) => (
                  <tr
                    key={item.id}
                    className="clickable-row"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td style={{ fontWeight: 600, color: '#1e3a8a' }}>
                      {item.name}
                    </td>
                    <td>
                      <span className="badge badge-primary">{item.type}</span>
                    </td>
                    <td>{item.district}</td>
                    <td>{item.taluka}</td>
                    <td style={{ textAlign: 'right' }}>
                      {item.landArea}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.ownership === 'Government'
                            ? 'badge-success'
                            : item.ownership === 'Rented'
                            ? 'badge-warning'
                            : 'badge-neutral'
                        }`}
                      >
                        {item.ownership}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px' }}>{item.legalDocument}</td>
                    <td>
                      <StatusBadge text={item.status} type={item.status} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: '1px solid #cbd5e1',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#2563eb'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No records found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#475569' }}>Page Size:</span>
            {[10, 20, 50, 100].map((size) => (
              <button
                key={size}
                type="button"
                className={`pagination-btn ${pageSize === size ? 'active' : ''}`}
                style={{
                  minWidth: '32px',
                  padding: '3px 8px',
                  fontSize: '12px',
                  fontWeight: pageSize === size ? 700 : 500
                }}
                disabled={loading}
                onClick={() => handlePageSizeChange(size)}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="pagination-btn"
              disabled={!pagination.has_previous || loading}
              onClick={handlePreviousPage}
            >
              Previous
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155', padding: '0 4px' }}>
              Page {pagination.page || currentPage} of {pagination.total_pages || 1}
            </span>
            <button
              type="button"
              className="pagination-btn"
              disabled={!pagination.has_next || loading}
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        </div>
      </ChartCard>

      {/* Standardized 5-Section Detail Modal */}
      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedItem.name}</h3>
                <span className="badge badge-primary" style={{ marginTop: '4px' }}>
                  {selectedItem.type}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedItem(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* SECTION 1: FACILITY / OFFICE INFORMATION */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
                  1. {activeTab === 'Offices' ? 'Office Information' : 'Facility Information'}
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{selectedItem.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Classification / Type</span>
                    <span className="detail-value">{selectedItem.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">District</span>
                    <span className="detail-value">{selectedItem.district}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Taluka / Block</span>
                    <span className="detail-value">{selectedItem.taluka}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: LOCATION */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
                  2. Location
                </div>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{selectedItem.address || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">PIN Code</span>
                    <span className="detail-value">{selectedItem.pincode || '--'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: LAND INFORMATION */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
                  3. Land Information
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Survey / Gat / CTS Number</span>
                    <span className="detail-value">{selectedItem.surveyNo || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Land Area</span>
                    <span className="detail-value">{selectedItem.landArea || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ownership Type</span>
                    <span className="detail-value">{selectedItem.ownership || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Legal Document Available</span>
                    <span className="detail-value">{selectedItem.legalDocument || '--'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: CONTACT */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
                  4. Contact
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">In-charge Name</span>
                    <span className="detail-value">{selectedItem.incharge || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact Number</span>
                    <span className="detail-value">{selectedItem.contact || '--'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 5: REMARKS */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
                  5. Remarks
                </div>
                <div style={{ fontSize: '13px', color: '#475569', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {selectedItem.remarks || '--'}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setSelectedItem(null)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Facilities;
