import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import ChartCard from '../components/ChartCard';
import { KEY_INSIGHTS, STATUTORY_BENCHMARKS } from '../data/dashboardData';
import { AUDITED_DISTRICTS } from '../data/districtData';

/**
 * Analytics Page
 *
 * Comprehensive infrastructure analytics:
 * - Section A: Visual Facility Hierarchy Flow
 * - Section B: SC:PHC Ratio Analysis with Plain (6:1) and Tribal (4:1) Benchmarks
 * - Section C: Multi-Tier District Facility Comparison Chart
 * - Section D: Urban vs Rural Infrastructure Overview
 * - Section E: Key Outliers & Regional Insights
 *
 * NOTE: Currently displaying verified static baseline dataset.
 * Future Django Aggregate APIs Needed:
 * - GET /api/analytics/ratios/ (SC:PHC distribution by district & terrain)
 * - GET /api/analytics/tier-comparison/ (District-wise breakdown by tier)
 */
function Analytics() {
  // SC:PHC Ratio data for the 6 audited districts
  const ratioChartData = AUDITED_DISTRICTS.map((d) => ({
    district: d.district,
    ratio: d.ratio,
    isPune: d.district === 'Pune'
  })).sort((a, b) => b.ratio - a.ratio);

  // District comparison data for stacked/grouped bar chart
  const districtComparisonData = AUDITED_DISTRICTS.map((d) => ({
    district: d.district,
    SC: d.scs,
    PHC: d.phcs,
    RH: d.rhs,
    DH: d.dhs,
    Urban: d.urban
  }));

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Infrastructure Analytics</h1>
            <p className="page-subtitle">
              Hierarchy flow, normative benchmarks, tier ratios, and verified regional outliers
            </p>
          </div>
          <span className="badge badge-primary">Audited Baseline</span>
        </div>
      </div>

      {/* SECTION A: VISUAL FACILITY HIERARCHY */}
      <div style={{ marginBottom: '24px' }}>
        <ChartCard
          title="Section A: Public Health Facility Hierarchy"
          subtitle="Four-tier statutory referral cascade across Maharashtra"
          badge="IPHS Tier Model"
        >
          <div className="hierarchy-container">
            {/* Level 1 */}
            <div className="hierarchy-step">
              <div className="hierarchy-node tier-sc">
                <div className="hierarchy-level">Tier 1 • Grassroot Level</div>
                <div className="hierarchy-name">Sub-Centres (SC)</div>
                <div className="hierarchy-desc">Village-level preventive & maternal care</div>
                <div className="hierarchy-stat">10,870 Statewide</div>
              </div>
              <div className="hierarchy-arrow">↓</div>
            </div>

            {/* Level 2 */}
            <div className="hierarchy-step">
              <div className="hierarchy-node tier-phc">
                <div className="hierarchy-level">Tier 2 • Primary Clinical Hub</div>
                <div className="hierarchy-name">Primary Health Centres (PHC)</div>
                <div className="hierarchy-desc">First-contact 24x7 institutional medical care</div>
                <div className="hierarchy-stat">2,954 Statewide</div>
              </div>
              <div className="hierarchy-arrow">↓</div>
            </div>

            {/* Level 3 */}
            <div className="hierarchy-step">
              <div className="hierarchy-node tier-rh">
                <div className="hierarchy-level">Tier 3 • Secondary Community Hub</div>
                <div className="hierarchy-name">Rural Hospitals / CHC (RH / SDH)</div>
                <div className="hierarchy-desc">30–100 bed secondary inpatient specialty care</div>
                <div className="hierarchy-stat">360+ Rural Hospitals</div>
              </div>
              <div className="hierarchy-arrow">↓</div>
            </div>

            {/* Level 4 */}
            <div className="hierarchy-step">
              <div className="hierarchy-node tier-dh">
                <div className="hierarchy-level">Tier 4 • Apex District Care</div>
                <div className="hierarchy-name">District Hospitals (DH / GH / SSH)</div>
                <div className="hierarchy-desc">Full tertiary specialties & regional referral</div>
                <div className="hierarchy-stat">Apex Tertiary Units</div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* SECTION B: SC : PHC RATIO & SECTION C: DISTRICT COMPARISON */}
      <div className="charts-grid-2col">
        {/* SC : PHC Ratio Chart */}
        <ChartCard
          title="Section B: SC : PHC Ratio Analysis"
          subtitle="Sub-Centres linked to each Primary Health Centre"
          badge="Norm: 6:1 (Plain) / 4:1 (Tribal)"
        >
          {/* Statutory Benchmark Banner */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1, padding: '8px 12px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#065f46', textTransform: 'uppercase' }}>Plain Area Benchmark</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#047857' }}>{STATUTORY_BENCHMARKS.plainAreaRatio}</div>
            </div>
            <div style={{ flex: 1, padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Tribal Area Benchmark</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#15803d' }}>{STATUTORY_BENCHMARKS.tribalAreaRatio}</div>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ratioChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 7]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  dataKey="district"
                  type="category"
                  tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 500 }}
                  width={85}
                />
                <Tooltip
                  formatter={(val) => [`${val} : 1`, 'SC to PHC Ratio']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6, borderColor: '#cbd5e1' }}
                />
                <Bar
                  dataKey="ratio"
                  fill="#2563eb"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pune Outlier Alert Box */}
          <div className="attention-card danger" style={{ marginTop: '14px', padding: '12px' }}>
            <div className="attention-card-header">
              <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '13px' }}>Pune Ratio Outlier: 2.6 : 1</span>
              <span className="badge badge-danger">Below 6:1 Benchmark</span>
            </div>
            <p style={{ fontSize: '12px', color: '#7f1d1d', margin: '4px 0 0' }}>
              Pune exhibits an SC:PHC ratio of 2.6, well below the 6:1 plain-area standard, indicating a dense network of PHCs relative to field Sub-Centres.
            </p>
          </div>
        </ChartCard>

        {/* District Multi-Tier Comparison Chart */}
        <ChartCard
          title="Section C: District Facility Tier Comparison"
          subtitle="Distribution of SC, PHC, RH, DH, and Urban units across audited districts"
          badge="6 Audited Districts"
        >
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={districtComparisonData}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="district" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6, borderColor: '#cbd5e1' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="SC" fill="#0d9488" radius={[2, 2, 0, 0]} />
                <Bar dataKey="PHC" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="RH" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="DH" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Urban" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* SECTION D: URBAN VS RURAL & SECTION E: OUTLIERS */}
      <div className="charts-grid-2col">
        {/* Urban vs Rural Infrastructure */}
        <ChartCard
          title="Section D: Urban vs Rural Infrastructure"
          subtitle="Structural comparison between rural and municipal health delivery"
          badge="Structural Balance"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Total Rural Health Facilities</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>SCs (10,870) + PHCs (2,954) + Rural Hospitals</div>
              </div>
              <strong style={{ fontSize: '15px', color: '#1e3a8a' }}>13,824+</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Total Urban Health Units</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>UPHC, UCHC, UHWC, and HBT Aapla Dawakhana</div>
              </div>
              <strong style={{ fontSize: '15px', color: '#f59e0b' }}>3,595</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f1f5f9', borderRadius: '6px', fontSize: '13px' }}>
              <span>Rural to Urban Ratio:</span>
              <strong>--</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f1f5f9', borderRadius: '6px', fontSize: '13px' }}>
              <span>Statewide Urban Bed Share:</span>
              <strong>--</strong>
            </div>

            <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
              * Note: Exact population catchment percentages and beds are unrepresented in the current baseline and marked &quot;--&quot;.
            </p>
          </div>
        </ChartCard>

        {/* Section E: Important Outliers */}
        <ChartCard
          title="Section E: Important Outliers"
          subtitle="Field insights and verified operational irregularities"
          badge="Verified Observations"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {KEY_INSIGHTS.map((outlier) => (
              <div
                key={outlier.district}
                style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  borderLeft: outlier.variant === 'danger' ? '4px solid #dc2626' : outlier.variant === 'warning' ? '4px solid #d97706' : '4px solid #0284c7'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{outlier.district}</span>
                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{outlier.badge}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e3a8a', marginBottom: '2px' }}>
                  {outlier.title}
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  {outlier.desc}
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

export default Analytics;
