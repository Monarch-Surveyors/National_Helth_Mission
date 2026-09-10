/**
 * National Health Mission - Maharashtra Health Infrastructure
 * Static Dashboard Dataset
 *
 * NOTE:
 * All metrics here are static prototype values.
 * In future phases, these will be replaced with dynamic calls to Django REST APIs.
 */

// Statewide Verified Baseline Counts (Exact Known Values)
export const STATEWIDE_KPIS = {
  totalFacilities: 18017,
  subCentres: 10870,
  phcs: 2954,
  hospitals: 561,
  urbanFacilities: 3595,
  healthOffices: 919
};

// Facility Tier Distribution Chart Data (for Recharts)
export const FACILITY_DISTRIBUTION_DATA = [
  { name: 'SC', fullName: 'Sub-Centres', count: 10870, color: '#0d9488' },
  { name: 'PHC', fullName: 'Primary Health Centres', count: 2954, color: '#10b981' },
  { name: 'Hospitals', fullName: 'Hospitals (DH/RH/SDH/GH)', count: 561, color: '#3b82f6' },
  { name: 'Urban', fullName: 'Urban Facilities', count: 3595, color: '#f59e0b' },
  { name: 'Offices', fullName: 'Health / Admin Offices', count: 919, color: '#64748b' }
];

// Ownership Categories (exact percentages not finalized; display '--')
export const OWNERSHIP_CATEGORIES = [
  { name: 'Government', value: '--', color: '#2563eb', desc: 'State Government / Dept of Health owned premises' },
  { name: 'Private', value: '--', color: '#f59e0b', desc: 'Privately owned / Trust health facilities' },
  { name: 'Rented', value: '--', color: '#8b5cf6', desc: 'Rented accommodation awaiting permanent land' },
  { name: 'Forest', value: '--', color: '#10b981', desc: 'Premises situated on Forest Department land' },
  { name: 'Leased', value: '--', color: '#0284c7', desc: 'Long-term government or institutional lease' },
  { name: 'Unknown', value: '--', color: '#64748b', desc: 'Pending revenue title documentation' }
];

// Key Analytical Outliers (Known Observations Only)
export const KEY_INSIGHTS = [
  {
    district: 'Pune',
    badge: 'Ratio Outlier',
    variant: 'warning',
    title: 'SC:PHC Ratio = 2.6',
    desc: 'Significantly lower than the 6:1 plain-area benchmark, reflecting a heavy concentration of PHCs relative to grassroot Sub-Centres.'
  },
  {
    district: 'Nandurbar',
    badge: 'Land Constraint',
    variant: 'danger',
    title: '80% PHCs Below 1,000 Sq.M',
    desc: '80% of measured/parseable PHC land-area records fail to meet the 1,000 Sq.M minimum statutory benchmark under IPHS standards.'
  },
  {
    district: 'Palghar',
    badge: 'Tenure Risk',
    variant: 'warning',
    title: 'Non-Government Ownership Concentration',
    desc: 'Notable concentration of non-government ownership (private, rented, or customary trust holdings) in the rural infrastructure dataset.'
  },
  {
    district: 'Thane',
    badge: 'Urban Density',
    variant: 'info',
    title: '584 Urban Health Units',
    desc: 'Highest urban health facility volume among audited districts, indicating massive peri-urban primary care demand.'
  }
];

// Statutory Infrastructure Benchmarks
export const STATUTORY_BENCHMARKS = {
  plainAreaRatio: '6 : 1',
  tribalAreaRatio: '4 : 1',
  phcMinLandSqM: 1000,
  scMinLandSqM: 250,
  rhMinLandSqM: 3000
};

