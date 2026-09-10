import React from 'react';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';
import { DEMO_RISK_RECORDS } from '../data/facilityDemoData';

/**
 * Risk & Compliance Page
 *
 * Tracks health infrastructure legal tenure, land deficiencies,
 * documentation bottlenecks, and priority attention zones.
 */
function RiskCompliance() {
  // Risk categories specification
  const riskCategories = [
    { name: 'Below Land Benchmark', icon: '🔴', type: 'critical', desc: 'Facilities operating on plots smaller than statutory norms (e.g. PHC < 1,000 Sq.M)' },
    { name: 'Private / Rented / Leased', icon: '🟠', type: 'warning', desc: 'Non-government ownership posing long-term tenure stability and rent risks' },
    { name: 'Forest Land', icon: '🟠', type: 'warning', desc: 'Premises inside Forest Dept demarcations requiring central MoEFCC diversion clearance' },
    { name: 'Legal Document Unavailable', icon: '🔴', type: 'critical', desc: 'Parcels lacking registered 7/12 extract, CTS card, or formal government sanction deed' },
    { name: 'Missing Land Information', icon: '⚠', type: 'caution', desc: 'Unsurveyed premises with missing square-meter footprint dimensions' },
    { name: 'Missing Ownership Information', icon: '⚠', type: 'caution', desc: 'Unclassified tenure between ZP, Panchayat, and Health Department' }
  ];

  // Priority districts with known critical observations
  const priorityDistricts = [
    {
      name: 'Nandurbar',
      badge: 'Critical Land Deficit',
      color: '#dc2626',
      desc: '80% of measured PHCs below the 1,000 Sq.M statutory benchmark. High priority for land acquisition and campus expansion.'
    },
    {
      name: 'Palghar',
      badge: 'High Tenure Vulnerability',
      color: '#d97706',
      desc: 'Notable concentration of non-government ownership in rural health units requiring land regularization and title transfers.'
    },
    {
      name: 'Pune',
      badge: 'Norm Disparity',
      color: '#0284c7',
      desc: 'SC:PHC ratio of 2.6 : 1 (significantly below 6:1 plain norm), requiring rationalization of field referral linkage.'
    },
    {
      name: 'Thane',
      badge: 'Rapid Urban Load',
      color: '#7c3aed',
      desc: '584 urban health units with significant rented/leased municipal premises needing permanent infrastructure assets.'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Risk & Compliance Monitoring</h1>
            <p className="page-subtitle">
              Auditing infrastructure vulnerability, statutory deficits, and tenure exposure
            </p>
          </div>
          <span className="badge badge-warning" style={{ padding: '6px 14px', fontSize: '12px' }}>
            Demo / Static Data
          </span>
        </div>
      </div>

      {/* SECTION 1: RISK CATEGORIES OVERVIEW */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
          Infrastructure Risk Classifications
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {riskCategories.map((rc) => (
            <div
              key={rc.name}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px' }}>{rc.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
                  {rc.name}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {rc.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: DEMO RISK AUDIT TABLE */}
      <div style={{ marginBottom: '24px' }}>
        <ChartCard
          title="Facility Risk Audit Register"
          subtitle="Sample high-priority non-compliance cases (Demo / Static Data)"
          badge="Audit Sample"
        >
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>Facility</th>
                  <th>Risk Type</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_RISK_RECORDS.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{item.district}</td>
                    <td style={{ fontWeight: 600 }}>{item.facility}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.riskLevel === 'critical'
                            ? 'badge-danger'
                            : item.riskLevel === 'warning'
                            ? 'badge-warning'
                            : 'badge-neutral'
                        }`}
                      >
                        {item.riskLevel === 'critical' ? '🔴 ' : item.riskLevel === 'warning' ? '🟠 ' : '⚠ '}
                        {item.riskCategory}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569', maxWidth: '380px' }}>
                      {item.details}
                    </td>
                    <td>
                      <StatusBadge text={item.status} type="neutral" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px' }}>
            * Demonstrative risk audit log. Complete statewide risk records will be dynamically populated by Django audit services.
          </div>
        </ChartCard>
      </div>

      {/* SECTION 3: PRIORITY DISTRICTS */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
          Priority Districts Requiring Immediate Intervention
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {priorityDistricts.map((pd) => (
            <div
              key={pd.name}
              className="attention-card"
              style={{ borderLeftColor: pd.color }}
            >
              <div className="attention-card-header">
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#1e3a8a' }}>{pd.name}</span>
                <span className="badge badge-neutral">{pd.badge}</span>
              </div>
              <p className="attention-card-desc" style={{ marginTop: '6px' }}>
                {pd.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RiskCompliance;

