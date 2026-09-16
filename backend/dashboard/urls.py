from django.urls import path
from . import views

urlpatterns = [
    path("facility-types/", views.facility_types),
    path("ownership-types/", views.ownership_types),
    path("districts/", views.districts),
    path("talukas/", views.talukas),
    path("facilities/", views.facilities),
    path("offices/", views.offices),
]