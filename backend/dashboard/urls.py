from django.urls import path

from . import views


urlpatterns = [
    # Reference / filter APIs
    path("facility-types/", views.facility_types),
    path("ownership-types/", views.ownership_types),
    path("districts/", views.districts),
    path("talukas/", views.talukas),
    path("filter-options/", views.filter_options),

    # Record APIs
    path("facilities/", views.facilities),
    path("offices/", views.offices),

    # Basic analytics
    path("analytics/overview/", views.analytics_overview),
    path(
        "analytics/facilities/by-district/",
        views.analytics_facilities_by_district,
    ),
    path(
        "analytics/facilities/by-type/",
        views.analytics_facilities_by_type,
    ),
    path(
        "analytics/offices/by-district/",
        views.analytics_offices_by_district,
    ),
    path(
        "analytics/land/by-district/",
        views.analytics_land_by_district,
    ),
    path("analytics/ownership/", views.analytics_ownership),
    path("analytics/documents/", views.analytics_documents),
    path("analytics/data-quality/", views.analytics_data_quality),

    # Limited-data IPHS 2022 analytics
    path("analytics/iphs/summary/", views.iphs_summary),
    path("analytics/iphs/norms/", views.iphs_norms),
    path("analytics/iphs/gaps/", views.iphs_gaps),
]
