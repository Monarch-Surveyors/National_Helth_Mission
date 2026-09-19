import os
import unittest
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rest_framework.test import APIClient
from rest_framework.request import Request
from django.test.client import RequestFactory

from dashboard.authentication import KeycloakPrincipal, KeycloakAuthentication
from dashboard.rbac import (
    get_client_roles,
    get_realm_roles,
    get_groups,
    HasRole,
    HasAnyRole,
    IsAdmin,
    IsAnalyst,
    IsViewer,
    HasGroup,
    IsNHMAnalyticsGroup,
)


class KeycloakAuthAndRBACTests(unittest.TestCase):
    def setUp(self):
        self.client = APIClient()
        self.factory = RequestFactory()

    def test_unauthenticated_endpoints_return_401(self):
        endpoints = [
            "/api/auth-test/",
            "/api/facility-types/",
            "/api/ownership-types/",
            "/api/districts/",
            "/api/talukas/",
            "/api/filter-options/",
            "/api/facilities/",
            "/api/offices/",
            "/api/analytics/overview/",
            "/api/analytics/facilities/by-district/",
            "/api/analytics/facilities/by-type/",
            "/api/analytics/offices/by-district/",
            "/api/analytics/land/by-district/",
            "/api/analytics/ownership/",
            "/api/analytics/documents/",
            "/api/analytics/data-quality/",
            "/api/analytics/iphs/summary/",
            "/api/analytics/iphs/norms/",
            "/api/analytics/iphs/gaps/",
        ]
        for ep in endpoints:
            resp = self.client.get(ep)
            self.assertEqual(
                resp.status_code,
                401,
                f"Endpoint {ep} should return 401 for unauthenticated request, got {resp.status_code}",
            )
            data = resp.json()
            self.assertIn("detail", data)

    def test_invalid_bearer_token_returns_401(self):
        resp = self.client.get(
            "/api/auth-test/",
            HTTP_AUTHORIZATION="Bearer invalid.token.payload",
        )
        self.assertEqual(resp.status_code, 401)
        data = resp.json()
        detail = data.get("detail", "")
        self.assertTrue(
            "token" in detail.lower() or "header" in detail.lower(),
            f"Expected error detail to mention token or header, got: {detail}",
        )

    def test_auth_test_endpoint_with_authenticated_principal(self):
        principal = KeycloakPrincipal(
            sub="sub-test-12345",
            username="analyst_user",
            email="analyst@example.com",
            roles=["analyst", "viewer"],
            groups=["NHM Analytics"],
            claims={
                "sub": "sub-test-12345",
                "preferred_username": "analyst_user",
                "email": "analyst@example.com",
            },
        )
        self.client.force_authenticate(user=principal, token="mock-token-xyz")
        resp = self.client.get("/api/auth-test/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get("authenticated"))
        self.assertEqual(data.get("user_id"), "sub-test-12345")
        self.assertEqual(data.get("username"), "analyst_user")
        self.assertEqual(data.get("email"), "analyst@example.com")
        self.assertIn("analyst", data.get("roles", []))
        self.assertIn("viewer", data.get("roles", []))
        self.assertIn("NHM Analytics", data.get("groups", []))
        self.assertEqual(data.get("claims", {}).get("sub"), "sub-test-12345")

    def test_claim_extraction(self):
        claims = {
            "resource_access": {
                "NHM": {"roles": ["admin", "editor"]},
                "account": {"roles": ["view-profile"]},
            },
            "realm_access": {
                "roles": ["default-roles-martin", "offline_access"],
            },
            "groups": ["/NHM Analytics", "NHM Admin"],
        }
        client_roles = get_client_roles(claims, "NHM")
        self.assertEqual(sorted(client_roles), ["admin", "editor"])

        realm_roles = get_realm_roles(claims)
        self.assertEqual(sorted(realm_roles), ["default-roles-martin", "offline_access"])

        groups = get_groups(claims)
        self.assertEqual(sorted(groups), ["NHM Admin", "NHM Analytics"])

    def test_rbac_permission_classes(self):
        class MockView:
            pass

        view = MockView()
        django_req = self.factory.get("/")
        req = Request(django_req)

        # Admin user
        admin_user = KeycloakPrincipal(
            sub="1", username="admin", email="", roles=["admin"], groups=[]
        )
        req.user = admin_user
        self.assertTrue(IsAdmin().has_permission(req, view))
        self.assertFalse(IsAnalyst().has_permission(req, view))
        self.assertTrue(HasRole("admin")().has_permission(req, view))
        self.assertTrue(HasAnyRole(["admin", "analyst"])().has_permission(req, view))

        # Analyst user
        analyst_user = KeycloakPrincipal(
            sub="2", username="analyst", email="", roles=["analyst"], groups=["NHM Analytics"]
        )
        req.user = analyst_user
        self.assertFalse(IsAdmin().has_permission(req, view))
        self.assertTrue(IsAnalyst().has_permission(req, view))
        self.assertTrue(HasGroup("NHM Analytics")().has_permission(req, view))
        self.assertTrue(IsNHMAnalyticsGroup().has_permission(req, view))

    def test_authenticated_api_query_execution(self):
        principal = KeycloakPrincipal(
            sub="sub-test-12345",
            username="analyst_user",
            email="analyst@example.com",
            roles=["analyst"],
            groups=["NHM Analytics"],
        )
        self.client.force_authenticate(user=principal, token="mock-token-xyz")
        resp = self.client.get("/api/districts/")
        self.assertEqual(resp.status_code, 200)

        resp_overview = self.client.get("/api/analytics/overview/")
        self.assertEqual(resp_overview.status_code, 200)

        resp_facilities = self.client.get("/api/facilities/?limit=5")
        self.assertEqual(resp_facilities.status_code, 200)
