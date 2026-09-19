"""
Role-Based Access Control (RBAC) and Group helpers for Keycloak.

Centralizes:
- Claim extraction (client roles, realm roles, groups)
- Reusable DRF permission classes (HasRole, HasAnyRole, HasGroup, etc.)
"""
from rest_framework.permissions import BasePermission


def get_client_roles(claims: dict, client_id: str) -> set[str]:
    """Extract client roles for the specified Keycloak client ID."""
    resource_access = claims.get("resource_access", {})
    client_access = resource_access.get(client_id, {})
    roles = client_access.get("roles", [])
    return set(roles)


def get_realm_roles(claims: dict) -> set[str]:
    """Extract realm-level roles from Keycloak token claims."""
    realm_access = claims.get("realm_access", {})
    roles = realm_access.get("roles", [])
    return set(roles)


def get_groups(claims: dict) -> set[str]:
    """Extract group memberships from Keycloak token claims.

    Normalizes group names by stripping any leading slashes (e.g. '/NHM Analytics' -> 'NHM Analytics').
    """
    raw_groups = claims.get("groups", [])
    groups = set()
    for g in raw_groups:
        if isinstance(g, str):
            cleaned = g.lstrip("/")
            if cleaned:
                groups.add(cleaned)
    return groups


class HasRole(BasePermission):
    """
    Permission class checking if the user has a specific client role.
    Can be used as a base class:
        class IsAdmin(HasRole):
            required_role = "ADMIN"
    Or dynamically instantiated:
        permission_classes = [HasRole("ADMIN")]
    """
    required_role: str | None = None

    def __init__(self, role: str | None = None):
        if role is not None:
            self.required_role = role

    def __call__(self):
        return self

    def has_permission(self, request, view) -> bool:
        if not (request.user and getattr(request.user, "is_authenticated", False)):
            return False
        user_roles = {r.upper() for r in getattr(request.user, "roles", set())}
        if not self.required_role:
            return False
        return self.required_role.upper() in user_roles


class HasAnyRole(BasePermission):
    """
    Permission class checking if the user has at least one of the specified roles.
    """
    required_roles: set[str] = set()

    def __init__(self, roles: list[str] | set[str] | None = None):
        if roles is not None:
            self.required_roles = set(roles)

    def __call__(self):
        return self

    def has_permission(self, request, view) -> bool:
        if not (request.user and getattr(request.user, "is_authenticated", False)):
            return False
        user_roles = {r.upper() for r in getattr(request.user, "roles", set())}
        target_roles = {r.upper() for r in self.required_roles}
        return bool(user_roles.intersection(target_roles))


class IsAdmin(HasRole):
    required_role = "ADMIN"


class IsAnalyst(HasRole):
    required_role = "ANALYST"


class IsViewer(HasRole):
    required_role = "VIEWER"


class IsAdminOrAnalyst(HasAnyRole):
    required_roles = {"ADMIN", "ANALYST"}


class HasGroup(BasePermission):
    """
    Permission class checking if the user belongs to a specific Keycloak group.
    """
    required_group: str | None = None

    def __init__(self, group: str | None = None):
        if group is not None:
            self.required_group = group

    def __call__(self):
        return self

    def has_permission(self, request, view) -> bool:
        if not (request.user and getattr(request.user, "is_authenticated", False)):
            return False
        user_groups = getattr(request.user, "groups", set())
        if not self.required_group:
            return False
        normalized_target = self.required_group.lstrip("/").lower()
        normalized_user_groups = {g.lstrip("/").lower() for g in user_groups}
        return normalized_target in normalized_user_groups


class IsNHMAnalyticsGroup(HasGroup):
    required_group = "NHM Analytics"
