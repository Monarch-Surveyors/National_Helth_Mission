import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

/**
 * Logout Component
 *
 * Dedicated route handler for `/logout`.
 * Initiates Keycloak logout with redirectUri pointing back to `/`.
 */
function Logout() {
  const { keycloak, authenticated, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initializing) return;

    if (keycloak && authenticated) {
      keycloak.logout({
        redirectUri: `${window.location.origin}/`,
      });
    } else {
      navigate('/', { replace: true });
    }
  }, [keycloak, authenticated, initializing, navigate]);

  return <LoadingScreen message="Logging out..." />;
}

export default Logout;

