from decimal import Decimal

from django.http import JsonResponse
from sqlalchemy import String, and_, cast, func
from sqlalchemy.orm import joinedload

from .db_models import (
    SessionLocal,
    FacilityType,
    OwnershipType,
    District,
    Taluka,
    HealthFacility,
    Office,
    IPHSStandard,
    IPHSFacility,
    IPHSRequirement,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _method_not_allowed(request):
    return JsonResponse({"error": "Method not allowed"}, status=405)


def _parse_int(request, name):
    value = request.GET.get(name)

    if value in (None, ""):
        return None

    try:
        return int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{name} must be an integer")


def _safe_number(value):
    if value is None:
        return 0

    if isinstance(value, Decimal):
        return float(value)

    return value


def _present(column):
    return and_(
        column.isnot(None),
        func.trim(cast(column, String)) != "",
    )


def _facility_query(session, request):
    query = session.query(HealthFacility)

    district_id = _parse_int(request, "district_id")
    taluka_id = _parse_int(request, "taluka_id")
    facility_type_id = _parse_int(request, "facility_type_id")
    ownership_type_id = _parse_int(request, "ownership_type_id")

    if district_id is not None:
        query = query.filter(HealthFacility.district_id == district_id)

    if taluka_id is not None:
        query = query.filter(HealthFacility.taluka_id == taluka_id)

    if facility_type_id is not None:
        query = query.filter(
            HealthFacility.facility_type_id == facility_type_id
        )

    if ownership_type_id is not None:
        query = query.filter(
            HealthFacility.ownership_type_id == ownership_type_id
        )

    return query


def _office_query(session, request):
    query = session.query(Office)

    district_id = _parse_int(request, "district_id")
    taluka_id = _parse_int(request, "taluka_id")
    ownership_type_id = _parse_int(request, "ownership_type_id")

    if district_id is not None:
        query = query.filter(Office.district_id == district_id)

    if taluka_id is not None:
        query = query.filter(Office.taluka_id == taluka_id)

    if ownership_type_id is not None:
        query = query.filter(Office.ownership_type_id == ownership_type_id)

    return query


def _iphs_available():
    return all(
        model is not None
        for model in (IPHSStandard, IPHSFacility, IPHSRequirement)
    )


# ---------------------------------------------------------------------------
# Reference APIs
# ---------------------------------------------------------------------------

def facility_types(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()
    try:
        rows = (
            session.query(FacilityType)
            .order_by(FacilityType.id)
            .all()
        )

        return JsonResponse(
            [
                {
                    "id": row.id,
                    "code": row.code,
                    "label": row.label,
                }
                for row in rows
            ],
            safe=False,
        )
    finally:
        session.close()


def ownership_types(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()
    try:
        rows = (
            session.query(OwnershipType)
            .order_by(OwnershipType.id)
            .all()
        )

        return JsonResponse(
            [
                {
                    "id": row.id,
                    "label": row.label,
                }
                for row in rows
            ],
            safe=False,
        )
    finally:
        session.close()


def districts(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()
    try:
        rows = session.query(District).order_by(District.name).all()

        return JsonResponse(
            [
                {
                    "id": row.id,
                    "name": row.name,
                }
                for row in rows
            ],
            safe=False,
        )
    finally:
        session.close()


def talukas(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        district_id = _parse_int(request, "district_id")

        query = session.query(Taluka).order_by(Taluka.name)

        if district_id is not None:
            query = query.filter(Taluka.district_id == district_id)

        rows = query.all()

        return JsonResponse(
            [
                {
                    "id": row.id,
                    "name": row.name,
                    "district_id": row.district_id,
                }
                for row in rows
            ],
            safe=False,
        )

    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    finally:
        session.close()


def filter_options(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        return JsonResponse(
            {
                "districts": [
                    {"id": row.id, "name": row.name}
                    for row in session.query(District)
                    .order_by(District.name)
                    .all()
                ],
                "talukas": [
                    {
                        "id": row.id,
                        "name": row.name,
                        "district_id": row.district_id,
                    }
                    for row in session.query(Taluka)
                    .order_by(Taluka.name)
                    .all()
                ],
                "facility_types": [
                    {
                        "id": row.id,
                        "code": row.code,
                        "label": row.label,
                    }
                    for row in session.query(FacilityType)
                    .order_by(FacilityType.id)
                    .all()
                ],
                "ownership_types": [
                    {
                        "id": row.id,
                        "label": row.label,
                    }
                    for row in session.query(OwnershipType)
                    .order_by(OwnershipType.id)
                    .all()
                ],
            }
        )
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Record APIs
# ---------------------------------------------------------------------------

def facilities(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        query = (
            _facility_query(session, request)
            .options(
                joinedload(HealthFacility.facility_type),
                joinedload(HealthFacility.district),
                joinedload(HealthFacility.taluka),
                joinedload(HealthFacility.ownership_type),
            )
            .order_by(HealthFacility.id)
        )

        rows = query.all()

        return JsonResponse(
            [
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
            ],
            safe=False,
        )

    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    finally:
        session.close()


def offices(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        query = (
            _office_query(session, request)
            .options(
                joinedload(Office.district),
                joinedload(Office.taluka),
                joinedload(Office.ownership_type),
            )
            .order_by(Office.id)
        )

        rows = query.all()

        return JsonResponse(
            [
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
            ],
            safe=False,
        )

    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    finally:
        session.close()


# ---------------------------------------------------------------------------
# Basic analytics
# ---------------------------------------------------------------------------

def analytics_overview(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        facility_query = _facility_query(session, request)
        office_query = _office_query(session, request)

        facility_count = facility_query.count()
        office_count = office_query.count()

        total_land = (
            facility_query.with_entities(
                func.coalesce(
                    func.sum(HealthFacility.parsed_area_sqm),
                    0,
                )
            )
            .scalar()
        )

        return JsonResponse(
            {
                "facilities": facility_count,
                "offices": office_count,
                "districts": session.query(District).count(),
                "talukas": session.query(Taluka).count(),
                "facility_types": session.query(FacilityType).count(),
                "total_land_area_sqm": _safe_number(total_land),
            }
        )

    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    finally:
        session.close()


def analytics_facilities_by_district(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        # The endpoint intentionally preserves every health_facility row
        # through COUNT(id); no business-row deduplication is performed.
        query = (
            session.query(
                District.id.label("district_id"),
                District.name.label("district"),
                func.count(HealthFacility.id).label("facility_count"),
                func.coalesce(
                    func.sum(HealthFacility.parsed_area_sqm),
                    0,
                ).label("land_area_sqm"),
            )
            .outerjoin(
                HealthFacility,
                HealthFacility.district_id == District.id,
            )
            .group_by(District.id, District.name)
            .order_by(District.name)
        )

        rows = query.all()

        return JsonResponse(
            [
                {
                    "district_id": row.district_id,
                    "district": row.district,
                    "facility_count": row.facility_count,
                    "land_area_sqm": _safe_number(row.land_area_sqm),
                }
                for row in rows
            ],
            safe=False,
        )

    finally:
        session.close()


def analytics_facilities_by_type(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        query = (
            session.query(
                FacilityType.id.label("facility_type_id"),
                FacilityType.code,
                FacilityType.label,
                func.count(HealthFacility.id).label("facility_count"),
            )
            .outerjoin(
                HealthFacility,
                HealthFacility.facility_type_id == FacilityType.id,
            )
            .group_by(
                FacilityType.id,
                FacilityType.code,
                FacilityType.label,
            )
            .order_by(FacilityType.id)
        )

        rows = query.all()

        return JsonResponse(
            [
                {
                    "facility_type_id": row.facility_type_id,
                    "code": row.code,
                    "label": row.label,
                    "facility_count": row.facility_count,
                }
                for row in rows
            ],
            safe=False,
        )

    finally:
        session.close()


def analytics_offices_by_district(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        query = (
            session.query(
                District.id.label("district_id"),
                District.name.label("district"),
                func.count(Office.id).label("office_count"),
                func.coalesce(
                    func.sum(Office.parsed_area_sqm),
                    0,
                ).label("land_area_sqm"),
            )
            .outerjoin(
                Office,
                Office.district_id == District.id,
            )
            .group_by(District.id, District.name)
            .order_by(District.name)
        )

        rows = query.all()

        return JsonResponse(
            [
                {
                    "district_id": row.district_id,
                    "district": row.district,
                    "office_count": row.office_count,
                    "land_area_sqm": _safe_number(row.land_area_sqm),
                }
                for row in rows
            ],
            safe=False,
        )

    finally:
        session.close()


def analytics_land_by_district(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        query = (
            session.query(
                District.id.label("district_id"),
                District.name.label("district"),
                func.count(HealthFacility.id).label("land_record_count"),
                func.coalesce(
                    func.sum(HealthFacility.parsed_area_sqm),
                    0,
                ).label("total_land_area_sqm"),
                func.coalesce(
                    func.avg(HealthFacility.parsed_area_sqm),
                    0,
                ).label("average_land_area_sqm"),
            )
            .outerjoin(
                HealthFacility,
                HealthFacility.district_id == District.id,
            )
            .group_by(District.id, District.name)
            .order_by(District.name)
        )

        rows = query.all()

        return JsonResponse(
            [
                {
                    "district_id": row.district_id,
                    "district": row.district,
                    "land_record_count": row.land_record_count,
                    "total_land_area_sqm": _safe_number(
                        row.total_land_area_sqm
                    ),
                    "average_land_area_sqm": _safe_number(
                        row.average_land_area_sqm
                    ),
                }
                for row in rows
            ],
            safe=False,
        )

    finally:
        session.close()


def analytics_ownership(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        query = (
            session.query(
                OwnershipType.id.label("ownership_type_id"),
                OwnershipType.label,
                func.count(HealthFacility.id).label("facility_count"),
                func.coalesce(
                    func.sum(HealthFacility.parsed_area_sqm),
                    0,
                ).label("land_area_sqm"),
            )
            .outerjoin(
                HealthFacility,
                HealthFacility.ownership_type_id == OwnershipType.id,
            )
            .group_by(
                OwnershipType.id,
                OwnershipType.label,
            )
            .order_by(OwnershipType.label)
        )

        rows = query.all()

        return JsonResponse(
            [
                {
                    "ownership_type_id": row.ownership_type_id,
                    "label": row.label,
                    "facility_count": row.facility_count,
                    "land_area_sqm": _safe_number(row.land_area_sqm),
                }
                for row in rows
            ],
            safe=False,
        )

    finally:
        session.close()


def analytics_documents(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        base = session.query(HealthFacility)
        total = base.count()

        field_specs = {
            "survey_gat_cts_no": HealthFacility.survey_gat_cts_no,
            "property_land_address": HealthFacility.property_land_address,
            "pin_code": HealthFacility.pin_code,
            "ownership_doc_available": HealthFacility.ownership_doc_available,
        }

        result = {
            "total_facilities": total,
        }

        for name, column in field_specs.items():
            available = base.filter(_present(column)).count()
            result[name] = {
                "available": available,
                "missing": total - available,
            }

        return JsonResponse(result)

    finally:
        session.close()


def analytics_data_quality(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    session = SessionLocal()

    try:
        total = session.query(HealthFacility).count()

        text_fields = {
            "facility_name": HealthFacility.facility_name,
            "property_land_address": HealthFacility.property_land_address,
            "pin_code": HealthFacility.pin_code,
            "survey_gat_cts_no": HealthFacility.survey_gat_cts_no,
            "total_land_area_sqm": HealthFacility.total_land_area_sqm,
            "ownership_doc_available": HealthFacility.ownership_doc_available,
        }

        fields = {}

        for name, column in text_fields.items():
            available = session.query(HealthFacility).filter(
                _present(column)
            ).count()

            fields[name] = {
                "available": available,
                "missing": total - available,
            }

        fields["district"] = {
            "available": session.query(HealthFacility).filter(
                HealthFacility.district_id.isnot(None)
            ).count(),
            "missing": session.query(HealthFacility).filter(
                HealthFacility.district_id.is_(None)
            ).count(),
        }

        fields["taluka"] = {
            "available": session.query(HealthFacility).filter(
                HealthFacility.taluka_id.isnot(None)
            ).count(),
            "missing": session.query(HealthFacility).filter(
                HealthFacility.taluka_id.is_(None)
            ).count(),
        }

        fields["facility_type"] = {
            "available": session.query(HealthFacility).filter(
                HealthFacility.facility_type_id.isnot(None)
            ).count(),
            "missing": session.query(HealthFacility).filter(
                HealthFacility.facility_type_id.is_(None)
            ).count(),
        }

        return JsonResponse(
            {
                "total_facilities": total,
                "fields": fields,
            }
        )

    finally:
        session.close()


# ---------------------------------------------------------------------------
# IPHS 2022 — limited-data analysis
# ---------------------------------------------------------------------------

def iphs_summary(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    if not _iphs_available():
        return JsonResponse(
            {
                "analysis_mode": "limited_data_subset",
                "status": "IPHS_REFERENCE_TABLES_NOT_MIGRATED",
                "message": (
                    "IPHS 2022 reference tables are not available yet."
                ),
            },
            status=503,
        )

    session = SessionLocal()

    try:
        return JsonResponse(
            {
                "analysis_mode": "limited_data_subset",
                "standards": session.query(IPHSStandard).count(),
                "facility_categories": session.query(IPHSFacility).count(),
                "requirements": session.query(IPHSRequirement).count(),
                "note": (
                    "Gap analysis is limited to IPHS parameters supported "
                    "by the currently available NHM dataset. Missing "
                    "parameters are not treated as failures."
                ),
            }
        )

    finally:
        session.close()


def iphs_norms(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    if not _iphs_available():
        return JsonResponse(
            {
                "analysis_mode": "limited_data_subset",
                "status": "IPHS_REFERENCE_TABLES_NOT_MIGRATED",
            },
            status=503,
        )

    session = SessionLocal()

    try:
        query = session.query(IPHSRequirement).order_by(IPHSRequirement.id)

        facility_code = request.GET.get("facility_code")
        category = request.GET.get("category")
        requirement_type = request.GET.get("requirement_type")

        if facility_code and hasattr(
            IPHSRequirement, "facility_code"
        ):
            query = query.filter(
                IPHSRequirement.facility_code == facility_code
            )

        if category and hasattr(IPHSRequirement, "category"):
            query = query.filter(IPHSRequirement.category == category)

        if requirement_type and hasattr(
            IPHSRequirement, "requirement_type"
        ):
            query = query.filter(
                IPHSRequirement.requirement_type == requirement_type
            )

        rows = query.all()

        data = []

        for row in rows:
            data.append(
                {
                    column.name: getattr(row, column.name)
                    for column in row.__table__.columns
                }
            )

        return JsonResponse(
            {
                "analysis_mode": "limited_data_subset",
                "rows": data,
            }
        )

    finally:
        session.close()


def iphs_gaps(request):
    if request.method != "GET":
        return _method_not_allowed(request)

    if not _iphs_available():
        return JsonResponse(
            {
                "analysis_mode": "limited_data_subset",
                "status": "IPHS_REFERENCE_TABLES_NOT_MIGRATED",
            },
            status=503,
        )

    session = SessionLocal()

    try:
        rows = (
            session.query(IPHSRequirement)
            .order_by(IPHSRequirement.id)
            .all()
        )

        result = []

        for row in rows:
            item = {
                column.name: getattr(row, column.name)
                for column in row.__table__.columns
            }

            # The current land-register dataset does not contain every
            # IPHS evidence dimension. Therefore the API only evaluates
            # explicit land/facility-count metrics when their requirement
            # representation is available. Everything else is marked
            # MISSING_PARAMETER rather than guessed.
            metric = str(
                item.get("metric_code")
                or item.get("requirement_code")
                or ""
            ).lower()

            facility_code = item.get("facility_code")
            actual = None
            status = "MISSING_PARAMETER"
            evaluated = False
            missing_parameters = []

            if metric in {
                "facility_count",
                "facility_count_minimum",
            } and facility_code:
                actual = (
                    session.query(HealthFacility.id)
                    .join(FacilityType)
                    .filter(FacilityType.code == facility_code)
                    .count()
                )

                required = item.get("required_value")

                if isinstance(required, (int, float, Decimal)):
                    evaluated = True
                    status = (
                        "MEETS_NORM"
                        if actual >= required
                        else "BELOW_NORM"
                    )
                    item["gap"] = actual - required
                else:
                    missing_parameters.append("required_value")

            elif metric in {
                "land_area_minimum",
                "minimum_land_area",
            } and facility_code:
                actual = (
                    session.query(
                        func.coalesce(
                            func.avg(HealthFacility.parsed_area_sqm),
                            0,
                        )
                    )
                    .join(FacilityType)
                    .filter(FacilityType.code == facility_code)
                    .scalar()
                )

                required = item.get("required_value")

                if isinstance(required, (int, float, Decimal)):
                    evaluated = True
                    status = (
                        "MEETS_NORM"
                        if actual >= required
                        else "BELOW_NORM"
                    )
                    item["gap"] = float(actual or 0) - float(required)

            else:
                missing_parameters.append(
                    item.get("required_parameter")
                    or metric
                    or "supporting_dataset"
                )

            item.update(
                {
                    "analysis_mode": "limited_data_subset",
                    "actual_value": _safe_number(actual),
                    "evaluated": evaluated,
                    "status": status,
                    "missing_parameters": missing_parameters,
                }
            )

            result.append(item)

        return JsonResponse(
            {
                "analysis_mode": "limited_data_subset",
                "scope_note": (
                    "This is not a full IPHS compliance assessment. "
                    "Only requirements supported by currently available "
                    "NHM Land Register data are evaluated."
                ),
                "rows": result,
            }
        )

    finally:
        session.close()
