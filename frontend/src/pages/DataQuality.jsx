import React from 'react';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import { ZERO_SUBMISSION_DISTRICTS } from '../data/districtData';

/**
 * Data Quality Page
 *
 * Data Quality & Submission Monitoring:
 * - High-level completeness KPI cards
 * - Detailed Zero-Submission / Missing Land Documentation audit
 * - Data completeness section displaying '--' placeholders
 *
 * NOTE: Currently displays verified baseline reporting audit.
 * Future Django Aggregate APIs Needed:
 * - GET /api/analytics/data-quality-summary/ (Completeness percentages by attribute)
 * - GET /api/analytics/zero-submission-districts/ (Districts with zero reporting)
 */
function DataQuality() {
  // Quality completeness metrics
  const qualityKPIs = [
    { title: 'Land Data', value: '--', subtitle: 'Validated parcel square-meter dimensions', variant: 'warning' },
    { title: 'Ownership Data', value: '--', subtitle: 'Reconciled property tenure records', variant: 'warning' },
    { title: 'Documentation', value: '--', subtitle: 'Uploaded 7/12 extracts & CTS title deeds', variant: 'warning' },
    { title: 'Coordinates', value: 'Not Available', subtitle: 'Validated field GIS GPS coordinates', variant: 'danger' },
  ];

  // Data completeness field categories
  const completenessFields = [
    { field: 'Plot Boundary Geo-Coordinates (Lat / Long)', stateStatus: '0% Recorded', detail: 'Phase 2 field survey drive pending across all districts', badgeType: 'badge-danger' },
    { field: 'Cadastral Survey / Gat / CTS Numbers', stateStatus: '--', detail: 'Partial coverage in audited districts; 8 districts missing completely', badgeType: 'badge-warning' },
    { field: 'Sanctioned Total Campus Area (Sq.M)', stateStatus: '--', detail: 'High parsing gap; Nandurbar shows 80% below 1,000 Sq.M standard', badgeType: 'badge-warning' },
    { field: 'Ownership Title Deeds / Revenue Extracts', stateStatus: '--', detail: 'Gram Panchayat land transfers un-regularized for multiple Sub-Centres', badgeType: 'badge-warning' },
    { field: 'Facility In-charge Contact & Cadre Info', stateStatus: '--', detail: 'Maintained independently in HRMIS; reconciliation ongoing', badgeType: 'badge-neutral' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Data Quality & Submission Monitoring</h1>
            <p className="page-subtitle">
              Audit trail of missing data fields, non-reporting administrative units, and verification gaps
            </p>
          </div>
          <span className="badge badge-danger">Quality Audit</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {qualityKPIs.map((kpi, idx) => (
          <KPICard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            variant={kpi.variant}
          />
        ))}
      </div>

      {/* SECTION 1: ZERO SUBMISSION / MISSING LAND DOCUMENTATION */}
      <div style={{ marginBottom: '24px' }}>
        <ChartCard
          title="Zero Submission / Missing Land Documentation"
          subtitle="The 8 administrative districts with zero submitted facility infrastructure land records"
          badge="8 Districts Requiring Immediate Submission"
        >
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>District Name</th>
                  <th>Administrative Division</th>
                  <th>Land Data</th>
                  <th>Documentation</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ZERO_SUBMISSION_DISTRICTS.map((district) => (
                  <tr key={district.name}>
                    <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{district.name}</td>
                    <td>{district.division}</td>
                    <td>
                      <span className="badge badge-danger">
                        {district.landData}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-danger">
                        {district.documentation}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-warning" style={{ fontWeight: 600 }}>
                        {district.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '12px', padding: '10px 14px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
            ⚠ Action Item: DHO coordination and emergency data submission drives are required for these 8 districts before central capital grants can be disbursed.
          </div>
        </ChartCard>
      </div>

      {/* SECTION 2: DATA COMPLETENESS OVERVIEW */}
      <ChartCard
        title="Statewide Data Completeness Audit"
        subtitle="Verification status of core statutory attributes (Percentages marked '--' where statewide totals are unfinalized)"
        badge="Field Completeness"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {completenessFields.map((item) => (
            <div
              key={item.field}
              style={{
                padding: '12px 16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                  {item.field}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {item.detail}
                </div>
              </div>
              <span className={`badge ${item.badgeType}`} style={{ fontSize: '12px', fontWeight: 700 }}>
                {item.stateStatus}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

export default DataQuality;
