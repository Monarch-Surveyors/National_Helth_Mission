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

        resp_facilities = self.client.get("/api/facilities/?page=1&page_size=20")
        self.assertEqual(resp_facilities.status_code, 200)


class ServerSidePaginationTests(unittest.TestCase):
    def setUp(self):
        self.client = APIClient()
        self.principal = KeycloakPrincipal(
            sub="sub-test-pagination",
            username="analyst_user",
            email="analyst@example.com",
            roles=["analyst"],
            groups=["NHM Analytics"],
        )
        self.client.force_authenticate(user=self.principal, token="mock-token-pagination")

    def test_01_facilities_default_pagination(self):
        resp = self.client.get("/api/facilities/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("results", data)
        self.assertIn("pagination", data)
        pag = data["pagination"]
        self.assertEqual(pag["page"], 1)
        self.assertEqual(pag["page_size"], 10)
        self.assertGreater(pag["total"], 0)
        self.assertEqual(len(data["results"]), min(10, pag["total"]))
        self.assertFalse(pag["has_previous"])
        self.assertTrue(pag["has_next"])

    def test_02_facilities_page_2(self):
        resp = self.client.get("/api/facilities/?page=2&page_size=20")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        pag = data["pagination"]
        self.assertEqual(pag["page"], 2)
        self.assertTrue(pag["has_previous"])

    def test_03_facilities_page_size_10(self):
        resp = self.client.get("/api/facilities/?page=1&page_size=10")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        pag = data["pagination"]
        self.assertEqual(pag["page_size"], 10)
        self.assertEqual(len(data["results"]), min(10, pag["total"]))

    def test_04_facilities_page_size_50(self):
        resp = self.client.get("/api/facilities/?page=1&page_size=50")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        pag = data["pagination"]
        self.assertEqual(pag["page_size"], 50)
        self.assertEqual(len(data["results"]), min(50, pag["total"]))

    def test_05_facilities_page_size_100(self):
        resp = self.client.get("/api/facilities/?page=1&page_size=100")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        pag = data["pagination"]
        self.assertEqual(pag["page_size"], 100)
        self.assertEqual(len(data["results"]), min(100, pag["total"]))

    def test_06_invalid_page(self):
        for invalid_val in ["abc", "0", "-1"]:
            resp = self.client.get(f"/api/facilities/?page={invalid_val}")
            self.assertEqual(resp.status_code, 400)
            self.assertEqual(
                resp.json(),
                {"error": "page must be an integer greater than or equal to 1"},
            )

    def test_07_invalid_page_size(self):
        for invalid_val in ["abc", "0", "30", "150"]:
            resp = self.client.get(f"/api/facilities/?page_size={invalid_val}")
            self.assertEqual(resp.status_code, 400)
            self.assertEqual(
                resp.json(),
                {
                    "error": "page_size must be an integer in (10, 20, 50, 100) and cannot exceed 100"
                },
            )

    def test_08_facilities_filter_plus_pagination(self):
        resp = self.client.get("/api/facilities/?district_id=1&page=1&page_size=10")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["pagination"]["page"], 1)
        self.assertEqual(data["pagination"]["page_size"], 10)
        for item in data["results"]:
            if item.get("district"):
                self.assertEqual(item["district"]["id"], 1)

    def test_09_facilities_search_plus_pagination(self):
        resp = self.client.get("/api/facilities/?search=Hospital&page=1&page_size=10")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["pagination"]["page"], 1)
        self.assertEqual(data["pagination"]["page_size"], 10)
        for item in data["results"]:
            self.assertIn("hospital", item["facility_name"].lower())

    def test_10_offices_default_pagination(self):
        resp = self.client.get("/api/offices/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("results", data)
        self.assertIn("pagination", data)
        pag = data["pagination"]
        self.assertEqual(pag["page"], 1)
        self.assertEqual(pag["page_size"], 10)
        self.assertGreater(pag["total"], 0)
        self.assertEqual(len(data["results"]), min(10, pag["total"]))
        self.assertFalse(pag["has_previous"])

    def test_11_offices_page_2(self):
        resp = self.client.get("/api/offices/?page=2&page_size=20")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        pag = data["pagination"]
        self.assertEqual(pag["page"], 2)
        self.assertTrue(pag["has_previous"])

    def test_12_offices_filter_plus_pagination(self):
        resp = self.client.get("/api/offices/?district_id=1&page=1&page_size=10")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["pagination"]["page"], 1)
        self.assertEqual(data["pagination"]["page_size"], 10)
        for item in data["results"]:
            if item.get("district"):
                self.assertEqual(item["district"]["id"], 1)

    def test_13_offices_search_plus_pagination(self):
        resp = self.client.get("/api/offices/?search=Office&page=1&page_size=10")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["pagination"]["page"], 1)
        self.assertEqual(data["pagination"]["page_size"], 10)
        for item in data["results"]:
            match = "office" in (item.get("office_name") or "").lower() or "office" in (item.get("facility_name") or "").lower()
            self.assertTrue(match)

    def test_14_last_page(self):
        resp = self.client.get("/api/facilities/?page=1&page_size=100")
        self.assertEqual(resp.status_code, 200)
        total_pages = resp.json()["pagination"]["total_pages"]
        resp_last = self.client.get(
            f"/api/facilities/?page={total_pages}&page_size=100"
        )
        self.assertEqual(resp_last.status_code, 200)
        self.assertFalse(resp_last.json()["pagination"]["has_next"])

    def test_15_empty_result(self):
        resp = self.client.get("/api/facilities/?district_id=999999")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["results"], [])
        self.assertEqual(
            data["pagination"],
            {
                "page": 1,
                "page_size": 10,
                "total": 0,
                "total_pages": 0,
                "has_next": False,
                "has_previous": False,
            },
        )

    def test_16_authentication_remains_protected(self):
        unauth_client = APIClient()
        resp_fac = unauth_client.get("/api/facilities/")
        self.assertEqual(resp_fac.status_code, 401)
        resp_off = unauth_client.get("/api/offices/")
        self.assertEqual(resp_off.status_code, 401)

    def test_17_existing_object_fields_unchanged(self):
        resp = self.client.get("/api/facilities/?page=1&page_size=10")
        self.assertEqual(resp.status_code, 200)
        results = resp.json()["results"]
        self.assertGreater(len(results), 0)
        item = results[0]
        expected_facility_fields = [
            "id",
            "source_sn",
            "facility_name",
            "facility_type",
            "district",
            "taluka",
            "ownership_type",
            "property_land_address",
            "pin_code",
            "survey_gat_cts_no",
            "total_land_area_sqm",
            "ownership_doc_available",
            "incharge_name_contact",
            "remarks",
        ]
        for field in expected_facility_fields:
            self.assertIn(field, item)

        resp_off = self.client.get("/api/offices/?page=1&page_size=10")
        self.assertEqual(resp_off.status_code, 200)
        off_results = resp_off.json()["results"]
        self.assertGreater(len(off_results), 0)
        off_item = off_results[0]
        expected_office_fields = [
            "id",
            "source_sn",
            "office_name",
            "facility_name",
            "district",
            "taluka",
            "property_land_address",
            "pin_code",
            "survey_gat_cts_no",
            "total_land_area_sqm",
            "ownership_type",
            "ownership_doc_available",
            "incharge_name_contact",
            "incharge_contact",
            "remarks",
        ]
        for field in expected_office_fields:
            self.assertIn(field, off_item)

