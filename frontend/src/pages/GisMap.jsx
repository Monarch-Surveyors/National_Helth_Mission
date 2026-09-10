import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ChartCard from '../components/ChartCard';

/**
 * GisMap Page
 *
 * Geographic Information System (GIS) visualization page.
 * NOTE: As per project guidelines, no fake coordinates or imaginary markers
 * are plotted. The map renders Maharashtra bounds with an informational notice
 * detailing the future layer architecture.
 */
function GisMap() {
  // Approximate geographic center coordinates of Maharashtra State
  const maharashtraCenter = [19.7515, 75.7139];

  // Future GIS layers specification
  const futureLayers = [
    { name: 'District Boundaries', desc: 'Revenue administrative district polygons', count: '36 Districts', status: 'Ready for GeoJSON' },
    { name: 'Taluka / Block Boundaries', desc: 'Sub-district administrative sub-divisions', count: '350+ Blocks', status: 'Ready for GeoJSON' },
    { name: 'Sub-Centres (SC)', desc: 'Rural grassroot primary care geo-locations', count: '10,870 Units', status: 'Coordinates Required' },
    { name: 'Primary Health Centres (PHC)', desc: 'First-contact clinical institutional points', count: '2,954 Units', status: 'Coordinates Required' },
    { name: 'Rural Hospitals (RH)', desc: 'Secondary rural community referral nodes', count: '360+ Units', status: 'Coordinates Required' },
    { name: 'District Hospitals (DH)', desc: 'Tertiary district health administrative campuses', count: 'Audited Units', status: 'Coordinates Required' },
    { name: 'Urban Facilities', desc: 'UPHCs, UCHCs, UHWCs and HBT Clinics', count: '3,595 Units', status: 'Coordinates Required' },
    { name: 'Administrative Offices', desc: 'DHO, DDHS, and State Mission Directorates', count: '919 Units', status: 'Coordinates Required' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Health Facility GIS Map</h1>
            <p className="page-subtitle">
              Spatial infrastructure visualization & geographic health accessibility mapping
            </p>
          </div>
          <span className="badge badge-warning" style={{ padding: '6px 14px', fontSize: '12px' }}>
            Coming Soon / Coordinates Required
          </span>
        </div>
      </div>

      {/* Prominent Informational Banner */}
      <div className="attention-card info" style={{ marginBottom: '20px' }}>
        <div className="attention-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#075985' }}>
              Spatial Mapping Notice
            </span>
          </div>
          <span className="badge badge-info">Phase 2 Activation</span>
        </div>
        <p style={{ fontSize: '13px', color: '#0c4a6e', margin: '6px 0 0' }}>
          Interactive facility mapping will be enabled when reliable latitude/longitude data is available.
          No unverified or simulated coordinates are plotted to prevent spatial misinformation.
        </p>
      </div>

      {/* GIS Grid: Map Viewport + Future Layers Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
        {/* Leaflet Map Card */}
        <ChartCard
          title="Maharashtra Spatial Overview"
          subtitle="Reference cartographic viewport (Latitude 19.75°N, Longitude 75.71°E)"
          badge="Leaflet Map"
        >
          <div style={{ height: '520px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <MapContainer
              center={maharashtraCenter}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </MapContainer>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Map tiles provided by OpenStreetMap</span>
            <span>Zero mock coordinates plotted</span>
          </div>
        </ChartCard>

        {/* Future Layers Architecture Panel */}
        <ChartCard
          title="Future Spatial Layers"
          subtitle="Target GIS layer pipeline upon GPS data capture"
          badge="8 Layers"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {futureLayers.map((layer) => (
              <div
                key={layer.name}
                style={{
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                    {layer.name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                    {layer.count}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {layer.desc}
                </div>
                <div style={{ marginTop: '2px' }}>
                  <span
                    className={`badge ${
                      layer.status === 'Ready for GeoJSON'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                    style={{ fontSize: '10px' }}
                  >
                    {layer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

export default GisMap;

