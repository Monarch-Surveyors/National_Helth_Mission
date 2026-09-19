import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * Navbar Component
 *
 * Top application header containing:
 * - Application title & subtitle
 * - User profile badge showing authenticated Keycloak username
 * - Profile dropdown with user info and Logout link
 */
function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.preferred_username || user?.name || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();

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

      <div className="navbar-right" style={{ position: 'relative' }}>
        {/* User profile dropdown trigger */}
        <div
          className="navbar-profile"
          title="User Profile"
          style={{ cursor: 'pointer' }}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <div className="navbar-avatar">{initials}</div>
          <span className="navbar-user-name">{displayName}</span>
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
            style={{
              transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              minWidth: '180px',
              zIndex: 50,
              padding: '8px 0',
            }}
          >
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                {displayName}
              </div>
              {user?.email && (
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {user.email}
                </div>
              )}
            </div>
            <Link
              to="/logout"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                color: '#ef4444',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
