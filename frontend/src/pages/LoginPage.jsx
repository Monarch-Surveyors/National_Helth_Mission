import React from 'react';
import { useAuth } from '../auth/AuthContext';

/**
 * LoginPage Component
 *
 * Rendered at root `/` when the user is unauthenticated.
 * Initiates the Keycloak OIDC login redirect with redirectUri pointing back to `/`.
 */
function LoginPage() {
  const { login } = useAuth();

  const handleLogin = () => {
    login();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            backgroundColor: '#1e3a8a',
            backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            padding: '36px 28px',
            textAlign: 'center',
            color: '#ffffff',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '20px',
              fontWeight: '700',
              letterSpacing: '1px',
              border: '2px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            NHM
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            NHM Maharashtra
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#93c5fd',
              margin: 0,
              fontWeight: '400',
            }}
          >
            Health Infrastructure & Asset Monitoring Portal
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '32px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 8px 0',
              }}
            >
              Sign In to Continue
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#64748b',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Access the secure dashboard, facilities register, and infrastructure analytics.
            </p>
          </div>

          <button
            id="login-btn"
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '13px 20px',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background-color 0.15s ease, transform 0.1s ease',
              boxShadow: '0 2px 4px rgba(30, 58, 138, 0.2)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1e3a8a';
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign in with Keycloak
          </button>

          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              fontSize: '12px',
              color: '#94a3b8',
            }}
          >
            Government of Maharashtra &bull; Public Health Department
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

