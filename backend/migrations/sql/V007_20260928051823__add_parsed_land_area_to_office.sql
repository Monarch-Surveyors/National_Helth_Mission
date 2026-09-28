-- Add your migration SQL here
ALTER TABLE public.office
    ADD COLUMN parsed_area_sqm NUMERIC,
    ADD COLUMN area_parse_status TEXT,
    ADD COLUMN area_parse_unit TEXT,
    ADD COLUMN area_parse_note TEXT;

COMMENT ON COLUMN public.office.parsed_area_sqm IS
    'Derived land area normalized to square metres (m²) by the area parsing script.';

COMMENT ON COLUMN public.office.area_parse_status IS
    'Parsing result status, e.g. PARSED, REVIEW_REQUIRED, MISSING, AMBIGUOUS, INVALID.';

COMMENT ON COLUMN public.office.area_parse_unit IS
    'Detected source unit or notation used before normalization to square metres.';

COMMENT ON COLUMN public.office.area_parse_note IS
    'Parser explanation, transformation details, or reason for review.';

CREATE INDEX idx_office_area_parse_status
    ON public.office (area_parse_status);