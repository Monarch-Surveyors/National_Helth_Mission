import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import FilterBar from '../components/FilterBar';
import {
  STATEWIDE_KPIS,
  FACILITY_DISTRIBUTION_DATA,
  OWNERSHIP_CATEGORIES,
  KEY_INSIGHTS
} from '../data/dashboardData';
import { AUDITED_DISTRICTS } from '../data/districtData';
import { getDistricts, getFacilityTypes, getOwnershipTypes } from '../services/api';

/**
 * Dashboard Page
 *
 * Executive summary for Maharashtra Health Infrastructure.
 * Connects directly to centralized static datasets.
 */
function Dashboard() {
  // Filter state
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFacilityType, setSelectedFacilityType] = useState('All');
  const [selectedOwnership, setSelectedOwnership] = useState('All');

  // Dynamic dropdown data loaded from live Django APIs
  const [districts, setDistricts] = useState([]);
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [ownershipTypes, setOwnershipTypes] = useState([]);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      getDistricts(),
      getFacilityTypes(),
      getOwnershipTypes()
    ]).then(([dRes, fRes, oRes]) => {
      if (!mounted) return;
      if (dRes.status === 'fulfilled' && Array.isArray(dRes.value) && dRes.value.length > 0) {
        setDistricts(dRes.value);
      }
      if (fRes.status === 'fulfilled' && Array.isArray(fRes.value) && fRes.value.length > 0) {
        setFacilityTypes(fRes.value);
      }
      if (oRes.status === 'fulfilled' && Array.isArray(oRes.value) && oRes.value.length > 0) {
        setOwnershipTypes(oRes.value);
      }
    });
    return () => { mounted = false; };
  }, []);

  // KPI cards configuration from verified statewide data
  const kpiData = [
    { title: 'Total Facilities', value: STATEWIDE_KPIS.totalFacilities, subtitle: 'Statewide Health Network', variant: 'primary' },
    { title: 'Sub-Centres', value: STATEWIDE_KPIS.subCentres, subtitle: 'Grassroot Care Units (SC)', variant: 'accent' },
    { title: 'Primary Health Centres', value: STATEWIDE_KPIS.phcs, subtitle: 'Primary Hubs (PHC)', variant: 'success' },
    { title: 'Hospitals', value: STATEWIDE_KPIS.hospitals, subtitle: 'Secondary & Tertiary Care', variant: 'info' },
    { title: 'Urban Facilities', value: STATEWIDE_KPIS.urbanFacilities, subtitle: 'Municipal & Urban Health', variant: 'warning' },
    { title: 'Health Offices', value: STATEWIDE_KPIS.healthOffices, subtitle: 'Administrative Offices', variant: 'neutral' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Maharashtra Health Infrastructure Dashboard</h1>
            <p className="page-subtitle">
              Public Health Department • Executive Infrastructure & Facilities Baseline
            </p>
          </div>
          <span className="badge badge-primary">Statewide Baseline — Aggregate API Pending</span>
        </div>
      </div>

      {/* Top Filter Bar */}
      <FilterBar title="Infrastructure Scope Filters">
        <div className="filter-group">
          <label className="filter-label">District</label>
          <select
            className="filter-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="All">All Districts (Statewide)</option>
            {districts.length > 0 ? (
              districts.map((d) => (
                <option key={d.id || d.district_name || d.name} value={d.district_name || d.name}>
                  {d.district_name || d.name}
                </option>
              ))
            ) : (
              <>
                <option value="Akola">Akola</option>
                <option value="Amravati">Amravati</option>
                <option value="Chandrapur">Chandrapur</option>
                <option value="Nashik">Nashik</option>
                <option value="Pune">Pune</option>
                <option value="Thane">Thane</option>
              </>
            )}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Facility Category</label>
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Rural">Rural</option>
            <option value="Hospitals">Hospitals</option>
            <option value="Urban">Urban</option>
            <option value="Offices">Offices</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Facility Type</label>
          <select
            className="filter-select"
            value={selectedFacilityType}
            onChange={(e) => setSelectedFacilityType(e.target.value)}
          >
            <option value="All">All Facility Types</option>
            {facilityTypes.length > 0 ? (
              facilityTypes.map((ft) => (
                <option key={ft.id || ft.code || ft.name} value={ft.code || ft.name}>
                  {ft.name ? `${ft.name}${ft.code ? ` (${ft.code})` : ''}` : ft.code}
                </option>
              ))
            ) : (
              <>
                <option value="SC">Sub-Centres (SC)</option>
                <option value="PHC">Primary Health Centres (PHC)</option>
                <option value="RH">Rural Hospitals (RH)</option>
                <option value="DH">District Hospitals (DH)</option>
                <option value="GH">General Hospitals (GH)</option>
                <option value="SSH">Super Specialty Hospitals (SSH)</option>
                <option value="SDH">Sub-District Hospitals (SDH)</option>
                <option value="UPHC">Urban PHCs (UPHC)</option>
                <option value="UCHC">Urban CHCs (UCHC)</option>
                <option value="UHWC">Urban Health & Wellness (UHWC)</option>
                <option value="HBT">HBT / Aapla Dawakhana</option>
                <option value="Offices">Administrative Offices</option>
              </>
            )}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Ownership</label>
          <select
            className="filter-select"
            value={selectedOwnership}
            onChange={(e) => setSelectedOwnership(e.target.value)}
          >
            <option value="All">All Ownership Types</option>
            {ownershipTypes.length > 0 ? (
              ownershipTypes.map((ot) => (
                <option key={ot.id || ot.name} value={ot.name}>
                  {ot.name}
                </option>
              ))
            ) : (
              <>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Rented">Rented</option>
                <option value="Forest">Forest</option>
                <option value="Leased">Leased</option>
                <option value="Unknown">Unknown</option>
              </>
            )}
          </select>
        </div>
      </FilterBar>

      {/* High-Level KPI Metrics */}
      <div className="kpi-grid">
        {kpiData.map((kpi, idx) => (
          <KPICard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            variant={kpi.variant}
          />
        ))}
      </div>

      {/* Facility Distribution Chart and Ownership Visualizer */}
      <div className="charts-grid-2col">
        {/* Recharts Bar Chart */}
        <ChartCard
          title="Facility Distribution by Tier"
          subtitle="Breakdown across all 18,017 registered public health entities"
          badge="18,017 Total"
        >
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={FACILITY_DISTRIBUTION_DATA}
                margin={{ top: 15, right: 20, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  interval={0}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name, item) => [
                    `${val.toLocaleString()} Units`,
                    item.payload.fullName
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6, borderColor: '#cbd5e1' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {FACILITY_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Ownership Structure Section */}
        <ChartCard
          title="Ownership Category Structure"
          subtitle="Land & premises tenure breakdown (Statewide validation in progress)"
          badge="Audit Baseline"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '4px' }}>
            {OWNERSHIP_CATEGORIES.map((item) => (
              <div
                key={item.name}
                style={{
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '2px',
                      backgroundColor: item.color
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', maxWidth: '140px' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '12px', fontWeight: 700 }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginTop: '12px' }}>
            * Note: Statewide ownership proportions show &quot;--&quot; because verified property tenure records are not yet finalized in the primary dataset.
          </div>
        </ChartCard>
      </div>

      {/* District Comparison Section */}
      <div style={{ marginBottom: '24px' }}>
        <ChartCard
          title="District Infrastructure Comparison"
          subtitle="Comparative facility tallies across 6 audited districts"
          badge="6 Audited Districts"
        >
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th style={{ textAlign: 'right' }}>SC</th>
                  <th style={{ textAlign: 'right' }}>PHC</th>
                  <th style={{ textAlign: 'right' }}>RH</th>
                  <th style={{ textAlign: 'right' }}>DH</th>
                  <th style={{ textAlign: 'right' }}>Urban</th>
                  <th style={{ textAlign: 'right' }}>SC : PHC Ratio</th>
                </tr>
              </thead>
              <tbody>
                {AUDITED_DISTRICTS.map((row) => (
                  <tr key={row.district}>
                    <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{row.district}</td>
                    <td style={{ textAlign: 'right' }}>{row.scs}</td>
                    <td style={{ textAlign: 'right' }}>{row.phcs}</td>
                    <td style={{ textAlign: 'right' }}>{row.rhs}</td>
                    <td style={{ textAlign: 'right' }}>{row.dhs}</td>
                    <td style={{ textAlign: 'right' }}>{row.urban}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span
                        className={`badge ${row.ratio < 3.0 ? 'badge-warning' : 'badge-primary'}`}
                      >
                        {row.ratio} : 1
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Important Insights Section */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
          Important Regional Insights & Outliers
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {KEY_INSIGHTS.map((item) => (
            <div
              key={item.district}
              className={`attention-card ${item.variant}`}
            >
              <div className="attention-card-header">
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e3a8a' }}>
                  {item.district}
                </span>
                <span className="badge badge-neutral">{item.badge}</span>
              </div>
              <div className="attention-card-title">{item.title}</div>
              <p className="attention-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
