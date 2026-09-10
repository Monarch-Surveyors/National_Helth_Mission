import React from 'react';

/**
 * KPICard Component
 * 
 * Reusable card to display a single metric (KPI).
 * Designed for readability and beginner-friendly React usage.
 *
 * @param {string} title - Label for the metric (e.g., "Total Facilities")
 * @param {string|number} value - The numeric value or placeholder (e.g., "18,017" or "--")
 * @param {string} subtitle - Optional explanatory context
 * @param {React.ReactNode} icon - Optional icon element
 * @param {string} variant - Accent color scheme: 'primary' | 'success' | 'warning' | 'accent' | 'neutral'
 */
function KPICard({ title, value, subtitle, icon, variant = 'primary' }) {
  // Format numbers nicely with commas if a raw number is passed
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div className={`kpi-card ${variant}`}>
      <div className="kpi-top">
        <span className="kpi-title">{title}</span>
        {icon && <div className="kpi-icon-wrapper">{icon}</div>}
      </div>
      <div className="kpi-value">{formattedValue}</div>
      {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
    </div>
  );
}

export default KPICard;

