import React, { createContext, useContext, useState, useEffect } from 'react';
import keycloak, { initKeycloak } from './keycloak';

const AuthContext = createContext({
  initializing: true,
  authenticated: false,
  keycloak: null,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [initializing, setInitializing] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Setup Keycloak session callbacks
    keycloak.onAuthSuccess = () => {
      setAuthenticated(true);
      setUser(keycloak.tokenParsed || null);
    };

    keycloak.onAuthLogout = () => {
      setAuthenticated(false);
      setUser(null);
      // Navigate to login page without a hard browser reload
      keycloak.login({ redirectUri: `${window.location.origin}/` });
    };

    keycloak.onAuthRefreshSuccess = () => {
      setUser(keycloak.tokenParsed || null);
    };

    keycloak.onAuthRefreshError = () => {
      setAuthenticated(false);
      setUser(null);
      keycloak.login({ redirectUri: `${window.location.origin}/` });
    };

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => {
        setAuthenticated(false);
        setUser(null);
        keycloak.login({ redirectUri: `${window.location.origin}/` });
      });
    };

    // Initialize Keycloak with check-sso
    initKeycloak()
      .then((isAuth) => {
        setAuthenticated(Boolean(isAuth));
        setUser(keycloak.tokenParsed || null);
      })
      .catch((err) => {
        console.error('Keycloak initialization failed:', err);
        setAuthenticated(false);
        setUser(null);
      })
      .finally(() => {
        setInitializing(false);
      });
  }, []);

  const login = () => {
    return keycloak.login({
      redirectUri: `${window.location.origin}/`,
    });
  };

  const logout = () => {
    return keycloak.logout({
      redirectUri: `${window.location.origin}/`,
    });
  };

  const value = {
    initializing,
    authenticated,
    keycloak,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;

