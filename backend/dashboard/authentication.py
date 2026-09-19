"""
Keycloak JWT Authentication for Django REST Framework.

Provides:
- KeycloakPrincipal: A lightweight, non-ORM user principal holding claims, roles, and groups.
- KeycloakAuthentication: Validates RS256 JWT tokens using live Keycloak JWKS certificates.
"""
import logging
from django.conf import settings
import jwt
from jwt import PyJWKClient
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .rbac import get_client_roles, get_groups

logger = logging.getLogger(__name__)

# Global JWKS client singleton with in-memory caching
_jwks_client = None


def get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        jwks_url = getattr(settings, "KEYCLOAK_JWKS_URL", None)
        if not jwks_url:
            raise RuntimeError("KEYCLOAK_JWKS_URL is not configured in Django settings.")
        _jwks_client = PyJWKClient(
            jwks_url,
            cache_keys=True,
            max_cached_keys=16,
            cache_jwk_set=True,
            lifespan=300,
        )
    return _jwks_client


class KeycloakPrincipal:
    """
    Lightweight, non-persistent authenticated principal for Keycloak users.
    Exposes standard identity attributes, roles, and groups for DRF.
    """
    def __init__(
        self,
        sub: str,
        username: str | None = None,
        email: str | None = None,
        given_name: str | None = None,
        family_name: str | None = None,
        roles: set[str] | None = None,
        groups: set[str] | None = None,
        claims: dict | None = None,
    ):
        self.sub = sub
        self.username = username or sub
        self.preferred_username = self.username
        self.email = email
        self.given_name = given_name
        self.family_name = family_name
        self.roles = roles or set()
        self.groups = groups or set()
        self.claims = claims or {}

    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def is_active(self) -> bool:
        return True

    def __str__(self) -> str:
        return self.username

    def __repr__(self) -> str:
        return f"<KeycloakPrincipal sub={self.sub} username={self.username} roles={self.roles} groups={self.groups}>"


class KeycloakAuthentication(BaseAuthentication):
    """
    Stateless Keycloak JWT authentication class for Django REST Framework.

    Workflow:
    1. Reads Authorization: Bearer <token> header.
    2. Validates JWT signature using Keycloak JWKS public keys.
    3. Validates expiration (exp), issuer (iss), and audience (aud).
    4. Extracts verified claims, roles, and groups into KeycloakPrincipal.
    5. Sets request.user = KeycloakPrincipal and request.auth = claims.
    """
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
        if not auth_header:
            # Return None to allow DRF permission classes (IsAuthenticated) to enforce 401
            return None

        parts = auth_header.split()
        if len(parts) == 0:
            return None

        if parts[0].lower() != "bearer":
            raise AuthenticationFailed("Invalid Authorization header format. Expected 'Bearer <token>'.")

        if len(parts) == 1:
            raise AuthenticationFailed("Invalid Authorization header. Token is missing.")

        if len(parts) > 2:
            raise AuthenticationFailed("Invalid Authorization header. Token contains spaces.")

        token = parts[1]
        return self.authenticate_token(token)

    def authenticate_token(self, token: str):
        try:
            jwks_client = get_jwks_client()
            signing_key = jwks_client.get_signing_key_from_jwt(token)
        except jwt.PyJWKClientError as e:
            logger.warning("JWKS lookup error: %s", e)
            raise AuthenticationFailed(f"Could not retrieve signing key from Keycloak: {str(e)}")
        except Exception as e:
            logger.warning("Token header parsing error: %s", e)
            raise AuthenticationFailed(f"Malformed JWT token: {str(e)}")

        expected_issuer = getattr(settings, "KEYCLOAK_ISSUER", None)
        raw_audience = getattr(settings, "KEYCLOAK_AUDIENCE", None) or getattr(settings, "KEYCLOAK_CLIENT_ID", None)
        
        # Support comma-separated expected audiences or single string
        if isinstance(raw_audience, str) and "," in raw_audience:
            expected_audience = [aud.strip() for aud in raw_audience.split(",") if aud.strip()]
        else:
            expected_audience = raw_audience

        decode_options = {
            "verify_signature": True,
            "verify_exp": True,
            "verify_iss": bool(expected_issuer),
            "verify_aud": bool(expected_audience),
        }

        try:
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                issuer=expected_issuer,
                audience=expected_audience,
                options=decode_options,
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidIssuerError:
            raise AuthenticationFailed("Token issuer is invalid.")
        except jwt.InvalidAudienceError:
            raise AuthenticationFailed("Token audience is invalid.")
        except jwt.PyJWTError as e:
            raise AuthenticationFailed(f"Invalid token signature or claims: {str(e)}")
        except Exception as e:
            logger.exception("Unexpected error during token verification")
            raise AuthenticationFailed(f"Token verification failed: {str(e)}")

        client_id = getattr(settings, "KEYCLOAK_CLIENT_ID", "NHM")
        roles = get_client_roles(claims, client_id)
        groups = get_groups(claims)

        sub = claims.get("sub")
        if not sub:
            raise AuthenticationFailed("Token missing 'sub' claim.")

        principal = KeycloakPrincipal(
            sub=sub,
            username=claims.get("preferred_username") or sub,
            email=claims.get("email"),
            given_name=claims.get("given_name"),
            family_name=claims.get("family_name"),
            roles=roles,
            groups=groups,
            claims=claims,
        )

        return (principal, claims)

    def authenticate_header(self, request):
        return "Bearer realm=\"Keycloak\""

