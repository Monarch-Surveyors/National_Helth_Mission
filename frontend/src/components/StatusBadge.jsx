import React from 'react';

/**
 * StatusBadge Component
 *
 * Renders consistent, accessible status and risk badges across the portal.
 *
 * @param {string} text - Label to display
 * @param {string} type - Variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'critical'
 */
function StatusBadge({ text, type = 'neutral' }) {
  const getBadgeClass = () => {
    switch (type) {
      case 'success':
      case 'positive':
      case 'Operational':
        return 'badge-success';
      case 'warning':
      case 'caution':
      case 'Tenure Review':
        return 'badge-warning';
      case 'danger':
      case 'critical':
      case 'Below Benchmark':
        return 'badge-danger';
      case 'info':
        return 'badge-info';
      case 'primary':
        return 'badge-primary';
      default:
        return 'badge-neutral';
    }
  };

  const renderIcon = () => {
    if (type === 'critical' || type === 'danger') {
      return <span style={{ marginRight: '4px', fontSize: '10px' }}>🔴</span>;
    }
    if (type === 'warning' || type === 'caution') {
      return <span style={{ marginRight: '4px', fontSize: '10px' }}>🟠</span>;
    }
    return null;
  };

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {renderIcon()}
      {text}
    </span>
  );
}

export default StatusBadge;

