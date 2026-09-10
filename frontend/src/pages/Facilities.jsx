import React, { useState } from 'react';
import ChartCard from '../components/ChartCard';
import FilterBar from '../components/FilterBar';
import StatusBadge from '../components/StatusBadge';
import { DEMO_FACILITIES } from '../data/facilityDemoData';

/**
 * Facilities Page
 *
 * Professional Facility Directory with:
 * - Category Tabs: [All] [Rural] [Hospitals] [Urban] [Offices]
 * - Multi-criteria filters
 * - Client-side search and pagination
 * - Standardized 5-section detail modal
 */
function Facilities() {
  // Category tabs state
  const [activeTab, setActiveTab] = useState('All');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [talukaFilter, setTalukaFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [ownershipFilter, setOwnershipFilter] = useState('All');
  const [docFilter, setDocFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Detail Modal inspection
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Subtype mapping based on active category
  const categorySubtypes = {
    Rural: ['SC', 'PHC', 'RH'],
    Hospitals: ['DH', 'GH', 'SSH', 'SDH-100', 'SDH-50', 'RH', 'WH', 'RMH'],
    Urban: ['UCHC', 'UPHC', 'UHWC', 'HBT / Aapla Dawakhana'],
    Offices: ['Administrative / Health Office']
  };

  // Switch tabs handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTypeFilter('All'); // Reset type filter when category tab changes
    setCurrentPage(1);
  };

  // Multi-criteria client-side filter
  const filteredFacilities = DEMO_FACILITIES.filter((facility) => {
    // Category Tab match
    if (activeTab !== 'All' && facility.category !== activeTab) {
      return false;
    }

    // Search query match (facility name or taluka)
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchName = facility.name.toLowerCase().includes(q);
      const matchTaluka = facility.taluka.toLowerCase().includes(q);
      if (!matchName && !matchTaluka) return false;
    }

    // Dropdown filters
    if (districtFilter !== 'All' && facility.district !== districtFilter) return false;
    if (talukaFilter !== 'All' && facility.taluka !== talukaFilter) return false;
    if (typeFilter !== 'All' && facility.type !== typeFilter) return false;
    if (ownershipFilter !== 'All' && facility.ownership !== ownershipFilter) return false;
    if (docFilter !== 'All' && !facility.legalDocument.toLowerCase().includes(docFilter.toLowerCase())) return false;
    if (statusFilter !== 'All' && facility.status !== statusFilter) return false;

    return true;
  });

  // Calculate pagination slice
  const totalPages = Math.ceil(filteredFacilities.length / pageSize) || 1;
  const displayedFacilities = filteredFacilities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Health Facilities Directory</h1>
            <p className="page-subtitle">
              Interactive registry of public health infrastructure across Maharashtra
            </p>
          </div>
          <span className="badge badge-warning" style={{ padding: '6px 14px', fontSize: '12px' }}>
            Demo / Static Data
          </span>
        </div>
      </div>

      {/* Top-Level Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['All', 'Rural', 'Hospitals', 'Urban', 'Offices'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: activeTab === tab ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
              background: activeTab === tab ? '#1e3a8a' : '#ffffff',
              color: activeTab === tab ? '#ffffff' : '#334155',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === tab ? '0 2px 4px rgba(30, 58, 138, 0.2)' : 'none'
            }}
          >
            {tab === 'All' ? 'All Facilities' : tab}
          </button>
        ))}
      </div>

      {/* Comprehensive Filter Bar */}
      <FilterBar title="Directory Filters">
        <div className="filter-group">
          <label className="filter-label">Search Facility Name / Taluka</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search facility name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">District</label>
          <select
            className="filter-select"
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Districts</option>
            <option value="Akola">Akola</option>
            <option value="Amravati">Amravati</option>
            <option value="Chandrapur">Chandrapur</option>
            <option value="Nandurbar">Nandurbar</option>
            <option value="Nashik">Nashik</option>
            <option value="Palghar">Palghar</option>
            <option value="Pune">Pune</option>
            <option value="Thane">Thane</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Taluka / Block</label>
          <input
            type="text"
            className="filter-input"
            placeholder="e.g. Mulshi, Dindori..."
            value={talukaFilter === 'All' ? '' : talukaFilter}
            onChange={(e) => {
              setTalukaFilter(e.target.value.trim() === '' ? 'All' : e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Facility Sub-Type</label>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Types</option>
            {activeTab !== 'All' ? (
              (categorySubtypes[activeTab] || []).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))
            ) : (
              <>
                <optgroup label="Rural">
                  <option value="SC">Sub-Centres (SC)</option>
                  <option value="PHC">Primary Health Centres (PHC)</option>
                  <option value="RH">Rural Hospitals (RH)</option>
                </optgroup>
                <optgroup label="Hospitals">
                  <option value="DH">District Hospital (DH)</option>
                  <option value="GH">General Hospital (GH)</option>
                  <option value="SDH-100">SDH-100</option>
                  <option value="SDH-50">SDH-50</option>
                  <option value="WH">Women Hospital (WH)</option>
                  <option value="RMH">Regional Mental Hospital (RMH)</option>
                </optgroup>
                <optgroup label="Urban">
                  <option value="UPHC">Urban PHC (UPHC)</option>
                  <option value="UCHC">Urban CHC (UCHC)</option>
                  <option value="UHWC">Urban Health & Wellness (UHWC)</option>
                  <option value="HBT / Aapla Dawakhana">HBT / Aapla Dawakhana</option>
                </optgroup>
                <optgroup label="Offices">
                  <option value="Administrative / Health Office">Administrative / Health Office</option>
                </optgroup>
              </>
            )}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Ownership</label>
          <select
            className="filter-select"
            value={ownershipFilter}
            onChange={(e) => {
              setOwnershipFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Ownerships</option>
            <option value="Government">Government</option>
            <option value="Private">Private</option>
            <option value="Rented">Rented</option>
            <option value="Forest">Forest</option>
            <option value="Leased">Leased</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Legal Document</label>
          <select
            className="filter-select"
            value={docFilter}
            onChange={(e) => {
              setDocFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Documents</option>
            <option value="7/12">7/12 Extract</option>
            <option value="Sanction">Sanction Order</option>
            <option value="Handover">Handover / Resolution</option>
            <option value="Pending">Clearance Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Operational">Operational</option>
            <option value="Below Benchmark">Below Benchmark</option>
            <option value="Tenure Review">Tenure Review</option>
          </select>
        </div>
      </FilterBar>

      {/* Facilities Table Card */}
      <ChartCard
        title="Registered Facilities Directory"
        subtitle={`Showing ${displayedFacilities.length} of ${filteredFacilities.length} matching entries (Click any row to open full details)`}
        badge="Demo / Static Data"
      >
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Facility Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>District</th>
                <th>Taluka / Block / ULB</th>
                <th style={{ textAlign: 'right' }}>Land Area</th>
                <th>Ownership</th>
                <th>Document</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedFacilities.length > 0 ? (
                displayedFacilities.map((facility) => (
                  <tr
                    key={facility.id}
                    className="clickable-row"
                    onClick={() => setSelectedFacility(facility)}
                  >
                    <td style={{ fontWeight: 600, color: '#1e3a8a' }}>
                      {facility.name}
                    </td>
                    <td>
                      <span className="badge badge-neutral">{facility.category}</span>
                    </td>
                    <td>
                      <span className="badge badge-primary">{facility.type}</span>
                    </td>
                    <td>{facility.district}</td>
                    <td>{facility.taluka}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={facility.landArea === '--' ? 'badge badge-danger' : ''}>
                        {facility.landArea}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          facility.ownership === 'Government'
                            ? 'badge-success'
                            : facility.ownership === 'Rented'
                            ? 'badge-warning'
                            : 'badge-neutral'
                        }`}
                      >
                        {facility.ownership}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px' }}>{facility.legalDocument}</td>
                    <td>
                      <StatusBadge text={facility.status} type={facility.status} />
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
                          setSelectedFacility(facility);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No facility records match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <div>
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </ChartCard>

      {/* Structured 5-Section Facility Detail Modal */}
      {selectedFacility && (
        <div className="modal-backdrop" onClick={() => setSelectedFacility(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedFacility.name}</h3>
                <span className="badge badge-warning" style={{ marginTop: '4px' }}>
                  Demo / Static Data
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedFacility(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* SECTION 1: FACILITY INFORMATION */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
                  1. Facility Information
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Facility Name</span>
                    <span className="detail-value">{selectedFacility.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Facility Category</span>
                    <span className="detail-value">{selectedFacility.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Facility Type</span>
                    <span className="detail-value">{selectedFacility.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">District</span>
                    <span className="detail-value">{selectedFacility.district}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Taluka / Block / ULB</span>
                    <span className="detail-value">{selectedFacility.taluka}</span>
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
                    <span className="detail-value">{selectedFacility.address || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">PIN Code</span>
                    <span className="detail-value">{selectedFacility.pincode || '--'}</span>
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
                    <span className="detail-value">{selectedFacility.surveyNo || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Land Area</span>
                    <span className="detail-value">{selectedFacility.landArea || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ownership Type</span>
                    <span className="detail-value">{selectedFacility.ownership || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Legal Document Available</span>
                    <span className="detail-value">{selectedFacility.legalDocument || '--'}</span>
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
                    <span className="detail-value">{selectedFacility.incharge || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact Number</span>
                    <span className="detail-value">{selectedFacility.contact || '--'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 5: REMARKS */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
                  5. Remarks
                </div>
                <div style={{ fontSize: '13px', color: '#475569', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {selectedFacility.remarks || '--'}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setSelectedFacility(null)}
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
