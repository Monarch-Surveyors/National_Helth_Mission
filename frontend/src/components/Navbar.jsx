import React from 'react';

/**
 * Navbar Component
 *
 * Top application header containing:
 * - Application title & subtitle:
 *     "Welcome to NHM Maharashtra"
 *     "Explore and monitor health infrastructure across the state"
 * - User profile badge (MH Admin dropdown trigger)
 */
function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-heading">
          <h1 className="navbar-title">Welcome to NHM Maharashtra</h1>
          <p className="navbar-subtitle">
            Explore and monitor health infrastructure across the state
          </p>
        </div>
      </div>

      <div className="navbar-right">
        {/* User profile dropdown trigger */}
        <div className="navbar-profile" title="Admin Profile">
          <div className="navbar-avatar">MH</div>
          <span className="navbar-user-name">Admin</span>
          <svg
            className="navbar-chevron"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </header>
  );
}

export default Navbar;


