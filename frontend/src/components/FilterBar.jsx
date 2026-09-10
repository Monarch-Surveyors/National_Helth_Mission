import React from 'react';

/**
 * FilterBar Component
 *
 * Wrapper container for page filters with consistent card borders and responsive grid.
 *
 * @param {React.ReactNode} children - Select/input controls
 * @param {string} title - Optional filter section title
 */
function FilterBar({ children, title = 'Filter & Search' }) {
  return (
    <div className="filter-card">
      {title && (
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#475569' }}>
            {title}
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Frontend Static Filters</span>
        </div>
      )}
      <div className="filter-grid">
        {children}
      </div>
    </div>
  );
}

export default FilterBar;

