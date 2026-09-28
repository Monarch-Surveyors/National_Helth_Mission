-- Add your migration SQL here
-- V7__add_area_parsing_columns.sql

ALTER TABLE public.health_facility
    ADD COLUMN parsed_area_sqm NUMERIC,
    ADD COLUMN area_parse_status TEXT,
    ADD COLUMN area_parse_unit TEXT,
    ADD COLUMN area_parse_note TEXT;

COMMENT ON COLUMN public.health_facility.parsed_area_sqm IS
    'Derived land area normalized to square metres (m²) by the area parsing script.';

COMMENT ON COLUMN public.health_facility.area_parse_status IS
    'Parsing result status, e.g. PARSED, REVIEW_REQUIRED, MISSING, AMBIGUOUS.';

COMMENT ON COLUMN public.health_facility.area_parse_unit IS
    'Detected source unit or notation used before normalization to square metres.';

COMMENT ON COLUMN public.health_facility.area_parse_note IS
    'Parser explanation, transformation details, or reason for review.';

CREATE INDEX idx_health_facility_area_parse_status
    ON public.health_facility (area_parse_status);