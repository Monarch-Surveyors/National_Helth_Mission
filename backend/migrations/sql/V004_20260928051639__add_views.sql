-- Add your migration SQL here
-- NHM: human-readable health-facility view
-- Source: public.health_facility + ref lookup tables
-- Purpose: expose canonical names instead of FK IDs while retaining
--          facility/land/provenance fields.

CREATE OR REPLACE VIEW public.v_health_facility AS
SELECT
    hf.id,
    ft.code AS facility_type_code,
    ft.label AS facility_type,

    d.name AS district,
    t.name AS taluka,

    hf.facility_name,
    hf.hbt_name,
    hf.hbt_address,
    hf.uhwc_name,
    hf.uhwc_address,
    hf.ulb_name,
    hf.ulb_type,
    hf.block_name,
    hf.circle_name,
    hf.lb_name,
    hf.sub_district_name,
    hf.phc_name,

    hf.property_land_address,
    hf.pin_code,
    hf.survey_gat_cts_no,
    hf.total_land_area_sqm,

    ot.label AS ownership_type,
    hf.ownership_doc_available,
    hf.incharge_name_contact,
    hf.remarks,

    hf.source_workbook,
    hf.source_worksheet,
    hf.source_table_id,
    hf.source_row_id

FROM public.health_facility AS hf
LEFT JOIN ref.facility_type AS ft
       ON ft.id = hf.facility_type_id
LEFT JOIN ref.district AS d
       ON d.id = hf.district_id
LEFT JOIN ref.taluka AS t
       ON t.id = hf.taluka_id
LEFT JOIN ref.ownership_type AS ot
       ON ot.id = hf.ownership_type_id;
