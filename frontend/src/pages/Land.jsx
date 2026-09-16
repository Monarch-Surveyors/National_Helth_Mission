import React from 'react';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import { STATUTORY_BENCHMARKS } from '../data/dashboardData';

/**
 * Land Management Page
 *
 * Dedicated land analytics dashboard:
 * - Metric cards with "--" placeholders
 * - Reference Statutory Benchmark Section (PHC ≥ 1,000, SC ≥ 250, RH ≥ 3,000 Sq.M)
 * - District Land Comparison Table
 * - Nandurbar land constraint highlight
 *
 * NOTE: Currently displays static benchmark & review baseline.
 * Future Django Aggregate APIs Needed:
 * - GET /api/analytics/land-summary/ (Total campus area, compliance vs benchmarks)
 * - GET /api/analytics/land-by-district/ (District land documentation audit)
 */
function Land() {
  // Land management KPI metrics (strictly placeholders per guidelines)
  const landKPIs = [
    { title: 'Total Land Area', value: '--', subtitle: 'Cumulative recorded campus area', variant: 'neutral' },
    { title: 'Facilities with Land Data', value: '--', subtitle: 'Parcels with validated dimensions', variant: 'info' },
    { title: 'Facilities Below Benchmark', value: '--', subtitle: 'Sub-standard campus land size', variant: 'danger' },
    { title: 'Facilities Above Benchmark', value: '--', subtitle: 'Compliant with IPHS space criteria', variant: 'success' },
    { title: 'Missing Land Data', value: '--', subtitle: 'Unsurveyed or unrecorded parcels', variant: 'warning' },
  ];

  // District Land Comparison Dataset
  const districtLandData = [
    { district: 'Akola', documented: '--', underBenchmark: '--', overBenchmark: '--', status: 'In Review' },
    { district: 'Amravati', documented: '--', underBenchmark: '--', overBenchmark: '--', status: 'In Review' },
    { district: 'Chandrapur', documented: '--', underBenchmark: '--', overBenchmark: '--', status: 'In Review' },
    { district: 'Nandurbar', documented: 'Partial', underBenchmark: '80% of PHCs', overBenchmark: '20% of PHCs', status: 'Critical Deficit' },
    { district: 'Nashik', documented: '--', underBenchmark: '--', overBenchmark: '--', status: 'In Review' },
    { district: 'Palghar', documented: 'Partial', underBenchmark: '--', overBenchmark: '--', status: 'Tenure Review' },
    { district: 'Pune', documented: '--', underBenchmark: '--', overBenchmark: '--', status: 'In Review' },
    { district: 'Thane', documented: '--', underBenchmark: '--', overBenchmark: '--', status: 'In Review' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Land Management & Statutory Compliance</h1>
            <p className="page-subtitle">
              Cadastral records, parcel dimensions, and Indian Public Health Standards (IPHS) compliance
            </p>
          </div>
          <span className="badge badge-primary">Land Audit Baseline</span>
        </div>
      </div>

      {/* Reference Benchmarks Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Primary Health Centre (PHC)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#047857', margin: '4px 0' }}>
            ≥ {STATUTORY_BENCHMARKS.phcMinLandSqM.toLocaleString()} Sq.M
          </div>
          <div style={{ fontSize: '12px', color: '#065f46' }}>
            Statutory minimum campus layout for 24x7 clinical operations
          </div>
        </div>

        <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Sub-Centre (SC)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>
            ≥ {STATUTORY_BENCHMARKS.scMinLandSqM} Sq.M
          </div>
          <div style={{ fontSize: '12px', color: '#166534' }}>
            Grassroot clinic & residential staff quarters footprint
          </div>
        </div>

        <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Rural Hospital / CHC (RH)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1d4ed8', margin: '4px 0' }}>
            ≥ {STATUTORY_BENCHMARKS.rhMinLandSqM.toLocaleString()} Sq.M
          </div>
          <div style={{ fontSize: '12px', color: '#1e40af' }}>
            Inpatient secondary referral campus standard
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {landKPIs.map((kpi, idx) => (
          <KPICard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            variant={kpi.variant}
          />
        ))}
      </div>

      {/* District Land Comparison & Highlight Section */}
      <div className="charts-grid-2col">
        {/* District Land Comparison Table */}
        <ChartCard
          title="District Land Comparison"
          subtitle="Evaluation of land availability against statutory standards"
          badge="Audit Baseline"
        >
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>Documented</th>
                  <th>&lt; Benchmark</th>
                  <th>&gt;= Benchmark</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {districtLandData.map((row) => (
                  <tr key={row.district}>
                    <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{row.district}</td>
                    <td>{row.documented}</td>
                    <td>
                      <span className={row.underBenchmark.includes('80%') ? 'badge badge-danger' : ''}>
                        {row.underBenchmark}
                      </span>
                    </td>
                    <td>{row.overBenchmark}</td>
                    <td>
                      <span
                        className={`badge ${
                          row.status === 'Critical Deficit'
                            ? 'badge-danger'
                            : row.status === 'Tenure Review'
                            ? 'badge-warning'
                            : 'badge-neutral'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px' }}>
            * Statewide land square-meter values display &quot;--&quot; pending field cadastral measurements.
          </div>
        </ChartCard>

        {/* Section Highlights */}
        <ChartCard
          title="Benchmark Compliance & Cadastral Insights"
          subtitle="Critical land constraints and legal documentation records"
          badge="Field Audits"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Nandurbar Outlier Box */}
            <div className="attention-card danger">
              <div className="attention-card-header">
                <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '14px' }}>
                  Nandurbar: 80% PHCs Below 1,000 Sq.M
                </span>
                <span className="badge badge-danger">High Severity</span>
              </div>
              <p className="attention-card-desc">
                80% of measured/parseable Primary Health Centre land-area records in Nandurbar fail to meet the 1,000 Sq.M minimum statutory benchmark. This severe deficit restricts maternal wards, lab extensions, and staff quarters.
              </p>
            </div>

            {/* Legal Documentation Analysis */}
            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
                Legal Documentation & 7/12 Title Registry
              </div>
              <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                Rural facilities often operate on un-demarcated Gram Panchayat plots without registered 7/12 land revenue extracts. Formal transfer deeds are required to secure central NHM infrastructure capital funds.
              </p>
            </div>

            {/* Ownership Summary Placeholder */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f1f5f9', borderRadius: '6px', fontSize: '13px' }}>
              <span>Statewide Government-Titled Campus Area:</span>
              <strong>--</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f1f5f9', borderRadius: '6px', fontSize: '13px' }}>
              <span>Parcels on Forest / Rented Land:</span>
              <strong>--</strong>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

export default Land;
