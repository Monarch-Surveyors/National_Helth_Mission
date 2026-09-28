-- ============================================================
-- schema_final.sql
-- Final normalized schema.
-- Unlabelled source columns are kept directly on the main entity.
-- ============================================================
begin;  
CREATE SCHEMA IF NOT EXISTS ref;
CREATE SCHEMA IF NOT EXISTS public;

-- Fresh rebuild of the final model. Existing final tables are removed so
-- the schema cannot retain the older extra-column/raw-table design.
DROP TABLE IF EXISTS public.health_facility_extra_cols CASCADE;
DROP TABLE IF EXISTS public.office CASCADE;
DROP TABLE IF EXISTS public.health_facility CASCADE;
DROP TABLE IF EXISTS ref.taluka CASCADE;
DROP TABLE IF EXISTS ref.district CASCADE;
DROP TABLE IF EXISTS ref.ownership_type CASCADE;
DROP TABLE IF EXISTS ref.facility_type CASCADE;

CREATE TABLE IF NOT EXISTS ref.facility_type (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ref.ownership_type (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    label TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS ref.district (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS ref.taluka (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    district_id BIGINT REFERENCES ref.district(id),
    name TEXT NOT NULL,
    UNIQUE (district_id, name)
);

CREATE TABLE IF NOT EXISTS public.health_facility (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    facility_type_id BIGINT REFERENCES ref.facility_type(id),
    source_sn TEXT,
    district_id BIGINT REFERENCES ref.district(id),
    taluka_id BIGINT REFERENCES ref.taluka(id),
    facility_name TEXT,
    hbt_name TEXT,
    hbt_address TEXT,
    uhwc_name TEXT,
    uhwc_address TEXT,
    ulb_name TEXT,
    ulb_type TEXT,
    block_name TEXT,
    circle_name TEXT,
    lb_name TEXT,
    sub_district_name TEXT,
    phc_name TEXT,
    property_land_address TEXT,
    pin_code TEXT,
    survey_gat_cts_no TEXT,
    total_land_area_sqm TEXT,
    ownership_type_id BIGINT REFERENCES ref.ownership_type(id),
    ownership_doc_available TEXT,
    incharge_name_contact TEXT,
    remarks TEXT,
    vc_setup TEXT,
    remarks_1 TEXT,
    no_label_c TEXT,
    no_label_d TEXT,
    no_label_e TEXT,
    no_label_f TEXT,
    no_label_g TEXT,
    no_label_m TEXT,
    no_label_o TEXT,
    source_workbook TEXT,
    source_worksheet TEXT,
    source_table_id TEXT,
    source_row_id TEXT
);

CREATE TABLE IF NOT EXISTS public.office (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_sn TEXT,
    district_id BIGINT REFERENCES ref.district(id),
    taluka_id BIGINT REFERENCES ref.taluka(id),
    office_name TEXT,
    facility_name TEXT,
    property_land_address TEXT,
    pin_code TEXT,
    survey_gat_cts_no TEXT,
    total_land_area_sqm TEXT,
    ownership_type_id BIGINT REFERENCES ref.ownership_type(id),
    ownership_doc_available TEXT,
    incharge_name_contact TEXT,
    incharge_contact TEXT,
    remarks TEXT,
    no_label_l TEXT,
    source_workbook TEXT,
    source_worksheet TEXT,
    source_table_id TEXT,
    source_row_id TEXT
);

COMMENT ON COLUMN public.health_facility.no_label_c IS 'Unlabelled Excel column C; preserved without assigning an unsupported business meaning.';
COMMENT ON COLUMN public.health_facility.no_label_d IS 'Unlabelled Excel column D; preserved without assigning an unsupported business meaning.';
COMMENT ON COLUMN public.health_facility.no_label_e IS 'Unlabelled Excel column E; preserved without assigning an unsupported business meaning.';
COMMENT ON COLUMN public.health_facility.no_label_f IS 'Unlabelled Excel column F; preserved without assigning an unsupported business meaning.';
COMMENT ON COLUMN public.health_facility.no_label_g IS 'Unlabelled Excel column G; preserved without assigning an unsupported business meaning.';
COMMENT ON COLUMN public.health_facility.no_label_m IS 'Unlabelled Excel column M; preserved without assigning an unsupported business meaning.';
COMMENT ON COLUMN public.health_facility.no_label_o IS 'Unlabelled Excel column O; preserved without assigning an unsupported business meaning.';
COMMENT ON COLUMN public.office.no_label_l IS 'Unlabelled Excel column L; preserved without assigning an unsupported business meaning.';
COMMENT ON COLUMN public.health_facility.pin_code IS 'TEXT because source profiles contain mixed numeric/string values.';
COMMENT ON COLUMN public.health_facility.survey_gat_cts_no IS 'TEXT because source profiles contain mixed numeric/string/date-like values.';
COMMENT ON COLUMN public.health_facility.total_land_area_sqm IS 'TEXT because source profiles contain mixed numeric/string values.';
COMMENT ON COLUMN public.office.pin_code IS 'TEXT because office source profiles contain mixed values.';
COMMENT ON COLUMN public.office.survey_gat_cts_no IS 'TEXT because office source profiles contain mixed values.';
COMMENT ON COLUMN public.office.total_land_area_sqm IS 'TEXT because office source profiles contain mixed values.';

commit;

