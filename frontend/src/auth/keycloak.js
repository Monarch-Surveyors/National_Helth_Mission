import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

let initPromise = null;

/**
 * Initializes Keycloak with check-sso + silent SSO check.
 *
 * Uses silentCheckSsoRedirectUri so the session check happens via a hidden iframe
 * instead of a full-page redirect. This prevents the token from being missing
 * when page components fire their first API calls.
 *
 * Guaranteed to run only once even in React 19 StrictMode.
 */
export function initKeycloak() {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-sso.html`,
      checkLoginIframe: false,
      pkceMethod: "S256",
    });
  }
  return initPromise;
}

export default keycloak;