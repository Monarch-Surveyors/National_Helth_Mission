import React from 'react';

/**
 * Reusable Error State Component
 *
 * Consistent alert banner with retry trigger for failed API operations.
 *
 * @param {string} title - Heading description
 * @param {string} message - Error details or status description
 * @param {Function} onRetry - Optional callback to re-execute API request
 * @param {boolean} compact - Compact layout for cards
 */
function ErrorState({
  title = 'Failed to load data',
  message,
  onRetry,
  compact = false
}) {
  return (
    <div
      className="attention-card danger"
      style={{
        padding: compact ? '12px' : '16px',
        marginBottom: compact ? 0 : '16px',
        width: '100%'
      }}
    >
      <div className="attention-card-header">
        <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '13px' }}>
          {title}
        </span>
        {onRetry && (
          <button
            type="button"
            className="pagination-btn"
            onClick={onRetry}
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              color: '#991b1b',
              borderColor: '#fca5a5'
            }}
          >
            Retry
          </button>
        )}
      </div>
      {message && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#7f1d1d' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default ErrorState;

