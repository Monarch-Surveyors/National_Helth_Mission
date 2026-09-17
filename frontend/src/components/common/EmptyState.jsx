import React from 'react';

/**
 * Reusable Empty State Component
 *
 * Displays neutral placeholder when queries yield zero records.
 *
 * @param {string} message - Message explaining that no data is present
 * @param {number|string} height - Height of container
 */
function EmptyState({
  message = 'No records found for the selected criteria.',
  height = 200
}) {
  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontSize: '13px',
        padding: '24px',
        textAlign: 'center',
        width: '100%'
      }}
    >
      {message}
    </div>
  );
}

export default EmptyState;

