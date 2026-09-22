import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Popup,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ChartCard from './ChartCard';
import { LoadingState, ErrorState } from './common';
import { getHealthInfrastructureMapData } from '../services/api';

// Maharashtra centroid coordinates
const MAHARASHTRA_CENTER = [19.7515, 75.7139];
const DEFAULT_ZOOM = 7;

/**
 * Helper component to fit map bounds automatically to available geographic features.
 */
function FitBounds({ features }) {
  const map = useMap();

  useEffect(() => {
    if (!features || features.length === 0) return;
    try {
      const latLngs = [];
      features.forEach((item) => {
        if (item.geometry?.coordinates) {
          const [lng, lat] = item.geometry.coordinates;
          if (!isNaN(lat) && !isNaN(lng)) latLngs.push([lat, lng]);
        } else if (item.latitude && item.longitude) {
          const lat = Number(item.latitude);
          const lng = Number(item.longitude);
          if (!isNaN(lat) && !isNaN(lng)) latLngs.push([lat, lng]);
        }
      });

      if (latLngs.length > 0) {
        map.fitBounds(latLngs, { padding: [30, 30], maxZoom: 14 });
      }
    } catch {
      // Gracefully ignore bounds calculation errors
    }
  }, [features, map]);

  return null;
}

/**
 * HealthInfrastructureMap Component
 *
 * Responsive Maharashtra Health Infrastructure Map for the Executive Dashboard.
 *
 * Features:
 * - Uses Leaflet & React-Leaflet with OpenStreetMap tiles.
 * - Standard controls: Zoom In / Zoom Out.
 * - Auto-fits bounds when real geographic data is available.
 * - Clicking a facility marker displays details:
 *   Facility Name, Facility Type, District, Taluka, Ownership.
 * - Layer / filter control for facility types when multiple types are present.
 * - Clean empty state when no KML/GeoJSON data is uploaded yet:
 *   "Map data is not available yet"
 *   "KML data will appear here once uploaded."
 * - Strictly NEVER creates fake or random coordinates.
 * - Robust loading and error handling so map errors never break the dashboard.
 */
function HealthInfrastructureMap({
  selectedDistrict = 'All',
  selectedFacilityType = 'All',
  selectedOwnership = 'All',
  mapHeight = 460
}) {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState('All');

  const loadMapData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getHealthInfrastructureMapData();
      setGeoData(data);
    } catch (err) {
      setError(err?.message || 'Unable to load map data.');
      setGeoData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Extract valid geographic features (GeoJSON features or items with coordinates)
  const rawFeatures = useMemo(() => {
    if (!geoData) return [];
    if (Array.isArray(geoData)) {
      return geoData.filter(
        (item) =>
          item &&
          ((item.latitude && item.longitude) || item.geometry?.coordinates)
      );
    }
    if (geoData.type === 'FeatureCollection' && Array.isArray(geoData.features)) {
      return geoData.features.filter((f) => f.geometry?.coordinates);
    }
    return [];
  }, [geoData]);

  // Extract distinct facility types for the layer/filter control
  const availableTypes = useMemo(() => {
    const types = new Set();
    rawFeatures.forEach((f) => {
      const t = f.properties?.type || f.properties?.facility_type || f.type || f.facility_type;
      if (t) types.add(t);
    });
    return Array.from(types).sort();
  }, [rawFeatures]);

  // Filter features based on dashboard scope and local map layer filter
  const filteredFeatures = useMemo(() => {
    return rawFeatures.filter((f) => {
      const props = f.properties || f;
      const district = props.district || props.district_name;
      const type = props.type || props.facility_type || props.facility_type_name;
      const ownership = props.ownership || props.ownership_type;

      if (selectedDistrict !== 'All' && district && district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }
      if (selectedFacilityType !== 'All' && type && type.toLowerCase() !== selectedFacilityType.toLowerCase()) {
        return false;
      }
      if (selectedOwnership !== 'All' && ownership && ownership.toLowerCase() !== selectedOwnership.toLowerCase()) {
        return false;
      }
      if (activeTypeFilter !== 'All' && type && type !== activeTypeFilter) {
        return false;
      }
      return true;
    });
  }, [rawFeatures, selectedDistrict, selectedFacilityType, selectedOwnership, activeTypeFilter]);

  const hasGeographicData = rawFeatures.length > 0;

  // Badge content for ChartCard header
  const badgeContent = hasGeographicData
    ? `${filteredFeatures.length} Facilities Mapped`
    : 'Awaiting Geographic Data';

  // Action content for ChartCard header
  const actionContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {availableTypes.length > 1 && (
        <select
          className="filter-select"
          style={{ height: '32px', fontSize: '12px', padding: '0 8px' }}
          value={activeTypeFilter}
          onChange={(e) => setActiveTypeFilter(e.target.value)}
          title="Filter map by facility type"
        >
          <option value="All">All Facility Types</option>
          {availableTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        className="pagination-btn"
        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 10px' }}
        onClick={loadMapData}
        disabled={loading}
        title="Refresh map data"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 4v6h-6" />
          <path d="M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        {loading ? 'Loading...' : 'Refresh'}
      </button>
    </div>
  );

  return (
    <ChartCard
      title="Health Infrastructure Map"
      subtitle="Geographic distribution of health infrastructure across Maharashtra"
      badge={badgeContent}
      action={actionContent}
    >
      {loading ? (
        <LoadingState message="Loading map data..." height={mapHeight} />
      ) : error ? (
        <div style={{ padding: '16px' }}>
          <ErrorState
            title="Unable to load map data."
            message={error}
            onRetry={loadMapData}
            compact
          />
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: `${mapHeight}px`,
            borderRadius: '8px',
            overflow: 'hidden',
            isolation: 'isolate',
            border: '1px solid #e2e8f0'
          }}
        >
          <MapContainer
            center={MAHARASHTRA_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Auto-fit map to data if features are present */}
            {hasGeographicData && <FitBounds features={filteredFeatures} />}

            {/* GeoJSON rendering if standard GeoJSON is provided */}
            {geoData?.type === 'FeatureCollection' && (
              <GeoJSON
                data={{ type: 'FeatureCollection', features: filteredFeatures }}
                pointToLayer={(feature, latlng) => {
                  return new window.L.CircleMarker(latlng, {
                    radius: 6,
                    fillColor: '#1e3a8a',
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.85
                  });
                }}
                onEachFeature={(feature, layer) => {
                  const p = feature.properties || {};
                  const name = p.name || p.facility_name || 'Unnamed Facility';
                  const type = p.type || p.facility_type || '--';
                  const district = p.district || p.district_name || '--';
                  const taluka = p.taluka || p.taluka_name || '--';
                  const ownership = p.ownership || p.ownership_type || '--';

                  layer.bindPopup(`
                    <div style="font-family: inherit; min-width: 180px;">
                      <div style="font-weight: 700; color: #1e3a8a; font-size: 13px; margin-bottom: 4px;">${name}</div>
                      <div style="display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; margin-bottom: 8px;">${type}</div>
                      <div style="font-size: 12px; color: #475569; line-height: 1.4;">
                        <div><strong>District:</strong> ${district}</div>
                        <div><strong>Taluka:</strong> ${taluka}</div>
                        <div><strong>Ownership:</strong> ${ownership}</div>
                      </div>
                    </div>
                  `);
                }}
              />
            )}

            {/* Coordinate-based point rendering if record array is provided */}
            {Array.isArray(geoData) &&
              filteredFeatures.map((item, idx) => {
                const lat = Number(item.latitude || item.geometry?.coordinates?.[1]);
                const lng = Number(item.longitude || item.geometry?.coordinates?.[0]);
                if (isNaN(lat) || isNaN(lng)) return null;

                const name = item.name || item.facility_name || 'Health Facility';
                const type = item.type || item.facility_type?.label || item.facility_type || '--';
                const district = item.district || item.district?.name || '--';
                const taluka = item.taluka || item.taluka?.name || '--';
                const ownership = item.ownership || item.ownership_type?.label || item.ownership || '--';

                return (
                  <CircleMarker
                    key={item.id || idx}
                    center={[lat, lng]}
                    radius={6}
                    pathOptions={{
                      fillColor: '#1e3a8a',
                      color: '#ffffff',
                      weight: 2,
                      opacity: 1,
                      fillOpacity: 0.85
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: '180px' }}>
                        <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '13px', marginBottom: '4px' }}>
                          {name}
                        </div>
                        <div
                          style={{
                            display: 'inline-block',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            marginBottom: '8px'
                          }}
                        >
                          {type}
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                          <div><strong>District:</strong> {district}</div>
                          <div><strong>Taluka:</strong> {taluka}</div>
                          <div><strong>Ownership:</strong> {ownership}</div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
          </MapContainer>

          {/* Clean Empty State Overlay when no geographic / KML data is available */}
          {!hasGeographicData && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 500,
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(6px)',
                borderRadius: '10px',
                padding: '24px 32px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                border: '1px solid #cbd5e1',
                textAlign: 'center',
                maxWidth: '380px',
                width: 'calc(100% - 40px)',
                pointerEvents: 'auto'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: '#1e3a8a'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e3a8a', marginBottom: '4px' }}>
                Map data is not available yet
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                KML data will appear here once uploaded.
              </div>
            </div>
          )}
        </div>
      )}
    </ChartCard>
  );
}

export default HealthInfrastructureMap;

