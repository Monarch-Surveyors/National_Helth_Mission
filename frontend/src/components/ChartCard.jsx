import React from 'react';

/**
 * ChartCard Component
 *
 * Wrapper card for charts, tables, or analytical blocks.
 * Provides a standardized header, title, badge, action area, and body.
 *
 * @param {string} title - Section title
 * @param {string} subtitle - Sub-caption or description
 * @param {string|React.ReactNode} badge - Optional status tag or indicator
 * @param {React.ReactNode} action - Optional button or control placed on the right
 * @param {React.ReactNode} children - Chart or content elements rendered inside
 */
function ChartCard({ title, subtitle, badge, action, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 className="chart-card-title">{title}</h3>
            {badge && (
              <span className="badge badge-info">{badge}</span>
            )}
          </div>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="chart-card-body">
        {children}
      </div>
    </div>
  );
}

export default ChartCard;

