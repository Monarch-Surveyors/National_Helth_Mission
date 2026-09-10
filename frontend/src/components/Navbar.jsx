import React from 'react';

/**
 * Navbar Component
 *
 * Top application header containing government identity, status badges,
 * and responsive mobile drawer toggle button.
 */
function Navbar({ onToggleSidebar }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="navbar-title">
          <span>Public Health Department</span>
          <span className="state-badge">Maharashtra</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Prototype indicator */}
        <div className="prototype-tag" title="Static UI Prototype. Backend APIs not connected yet.">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Static UI Prototype</span>
        </div>

        {/* User profile demo badge */}
        <div className="user-profile-badge">
          <div className="avatar-circle">MH</div>
          <span style={{ fontWeight: 500 }}>Health Dept Admin</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

