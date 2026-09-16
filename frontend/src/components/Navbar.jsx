import React from 'react';

/**
 * Navbar Component
 *
 * Top application header containing government identity, status indicators,
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
        {/* User profile badge */}
        <div className="user-profile-badge">
          <div className="avatar-circle">MH</div>
          <span style={{ fontWeight: 500 }}>Health Dept Admin</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
