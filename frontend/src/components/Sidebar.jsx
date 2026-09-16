import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Sidebar Navigation Component
 *
 * Provides main menu routing links for API-supported views:
 * - Facilities (/facilities)
 * - Administrative Offices (/offices)
 */
function Sidebar({ isOpen, onClose }) {
  const navItems = [
    {
      name: 'Health Facilities',
      path: '/facilities',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18"></path>
          <path d="M5 21V7l8-4v18"></path>
          <path d="M19 21V11l-6-3"></path>
          <path d="M9 9h1"></path>
          <path d="M9 13h1"></path>
          <path d="M9 17h1"></path>
        </svg>
      )
    },
    {
      name: 'Administrative Offices',
      path: '/offices',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-emblem">NHM</div>
        <div className="sidebar-brand-text">
          <h2>NHM Maharashtra</h2>
          <span>Health Infrastructure</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-link-icon">{item.icon}</span>
            <span style={{ flex: 1 }}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer Info */}
      <div className="sidebar-footer">
        <div>Govt. of Maharashtra</div>
        <div className="sidebar-footer-badge">NHM Portal</div>
      </div>
    </aside>
  );
}

export default Sidebar;
