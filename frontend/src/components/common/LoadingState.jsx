import React from 'react';

/**
 * Reusable Loading State Component
 *
 * Displays a lightweight centered spinner and descriptive message.
 *
 * @param {string} message - Text prompt explaining the background request
 * @param {number|string} height - Visual container height
 */
function LoadingState({ message = 'Loading data...', height = 240 }) {
  return (
    <div
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        gap: '12px',
        width: '100%'
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'nhmSpin 0.8s linear infinite'
        }}
      />
      <span style={{ fontSize: '13px', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes nhmSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingState;

