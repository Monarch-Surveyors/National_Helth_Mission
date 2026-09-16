from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from sqlalchemy.orm import joinedload

from .db_models import (
    SessionLocal,
    FacilityType,
    OwnershipType,
    District,
    Taluka,
    HealthFacility,
    Office,
)


def facility_types(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    session = SessionLocal()

    try:
        rows = session.query(FacilityType).order_by(FacilityType.id).all()

        data = [
            {
                "id": row.id,
                "code": row.code,
                "label": row.label,
            }
            for row in rows
        ]

        return JsonResponse(data, safe=False)

    finally:
        session.close()


def ownership_types(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    session = SessionLocal()

    try:
        rows = session.query(OwnershipType).order_by(OwnershipType.id).all()

        data = [
            {
                "id": row.id,
                "label": row.label,
            }
            for row in rows
        ]

        return JsonResponse(data, safe=False)

    finally:
        session.close()


def districts(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    session = SessionLocal()

    try:
        rows = session.query(District).order_by(District.name).all()

        data = [
            {
                "id": row.id,
                "name": row.name,
            }
            for row in rows
        ]

        return JsonResponse(data, safe=False)

    finally:
        session.close()


def talukas(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    session = SessionLocal()

    try:
        query = session.query(Taluka).order_by(Taluka.name)

        district_id = request.GET.get("district_id")

        if district_id:
            query = query.filter(Taluka.district_id == int(district_id))

        rows = query.all()

        data = [
            {
                "id": row.id,
                "name": row.name,
                "district_id": row.district_id,
            }
            for row in rows
        ]

        return JsonResponse(data, safe=False)

    finally:
        session.close()


def facilities(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    session = SessionLocal()

    try:
        query = (
            session.query(HealthFacility)
            .options(
                joinedload(HealthFacility.facility_type),
                joinedload(HealthFacility.district),
                joinedload(HealthFacility.taluka),
                joinedload(HealthFacility.ownership_type),
            )
        )

        district_id = request.GET.get("district_id")
        taluka_id = request.GET.get("taluka_id")
        facility_type_id = request.GET.get("facility_type_id")
        ownership_type_id = request.GET.get("ownership_type_id")

        if district_id:
            query = query.filter(
                HealthFacility.district_id == int(district_id)
            )

        if taluka_id:
            query = query.filter(
                HealthFacility.taluka_id == int(taluka_id)
            )

        if facility_type_id:
            query = query.filter(
                HealthFacility.facility_type_id == int(facility_type_id)
            )

        if ownership_type_id:
            query = query.filter(
                HealthFacility.ownership_type_id == int(ownership_type_id)
            )

        rows = query.order_by(HealthFacility.id).all()

        data = [
            {
                "id": row.id,
                "source_sn": row.source_sn,
                "facility_name": row.facility_name,

                "facility_type": (
                    {
                        "id": row.facility_type.id,
                        "code": row.facility_type.code,
                        "label": row.facility_type.label,
                    }
                    if row.facility_type
                    else None
                ),

                "district": (
                    {
                        "id": row.district.id,
                        "name": row.district.name,
                    }
                    if row.district
                    else None
                ),

                "taluka": (
                    {
                        "id": row.taluka.id,
                        "name": row.taluka.name,
                    }
                    if row.taluka
                    else None
                ),

                "ownership_type": (
                    {
                        "id": row.ownership_type.id,
                        "label": row.ownership_type.label,
                    }
                    if row.ownership_type
                    else None
                ),

                "property_land_address": row.property_land_address,
                "pin_code": row.pin_code,
                "survey_gat_cts_no": row.survey_gat_cts_no,
                "total_land_area_sqm": row.total_land_area_sqm,
                "ownership_doc_available": row.ownership_doc_available,
                "incharge_name_contact": row.incharge_name_contact,
                "remarks": row.remarks,
            }
            for row in rows
        ]

        return JsonResponse(data, safe=False)

    finally:
        session.close()


def offices(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    session = SessionLocal()

    try:
        query = (
            session.query(Office)
            .options(
                joinedload(Office.district),
                joinedload(Office.taluka),
                joinedload(Office.ownership_type),
            )
        )

        district_id = request.GET.get("district_id")
        taluka_id = request.GET.get("taluka_id")
        ownership_type_id = request.GET.get("ownership_type_id")

        if district_id:
            query = query.filter(
                Office.district_id == int(district_id)
            )

        if taluka_id:
            query = query.filter(
                Office.taluka_id == int(taluka_id)
            )

        if ownership_type_id:
            query = query.filter(
                Office.ownership_type_id == int(ownership_type_id)
            )

        rows = query.order_by(Office.id).all()

        data = [
            {
                "id": row.id,
                "source_sn": row.source_sn,
                "office_name": row.office_name,
                "facility_name": row.facility_name,

                "district": (
                    {
                        "id": row.district.id,
                        "name": row.district.name,
                    }
                    if row.district
                    else None
                ),

                "taluka": (
                    {
                        "id": row.taluka.id,
                        "name": row.taluka.name,
                    }
                    if row.taluka
                    else None
                ),

                "property_land_address": row.property_land_address,
                "pin_code": row.pin_code,
                "survey_gat_cts_no": row.survey_gat_cts_no,
                "total_land_area_sqm": row.total_land_area_sqm,

                "ownership_type": (
                    {
                        "id": row.ownership_type.id,
                        "label": row.ownership_type.label,
                    }
                    if row.ownership_type
                    else None
                ),

                "ownership_doc_available": row.ownership_doc_available,
                "incharge_name_contact": row.incharge_name_contact,
                "incharge_contact": row.incharge_contact,
                "remarks": row.remarks,
            }
            for row in rows
        ]

        return JsonResponse(data, safe=False)

    finally:
        session.close()