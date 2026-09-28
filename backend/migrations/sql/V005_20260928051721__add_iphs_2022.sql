-- V5__add_iphs_2022.sql
--
-- IPHS 2022 reference catalogue for limited-data analytics.
--
-- Source:
--   National Health Mission, Ministry of Health & Family Welfare,
--   Indian Public Health Standards (IPHS) 2022.
--
-- Official IPHS index:
--   https://www.nhm.gov.in/index1.php?lang=1&level=1&lid=154&sublinkid=284
--
-- The four official 2022 guideline volumes are:
--   Volume I   : SDH / DH
--   Volume II  : CHC / UCHC
--   Volume III : HWC-PHC / UPHC / Polyclinic
--   Volume IV  : HWC-SHC / UHWC
--
-- This migration stores the IPHS catalogue/reference rules.
-- It does NOT claim full IPHS compliance from the current NHM Land Register.
-- The analytics API evaluates only requirements for which the current
-- dataset contains the necessary parameter(s); otherwise it returns
-- MISSING_PARAMETER.

CREATE TABLE IF NOT EXISTS ref.iphs_standard (
    id                  BIGSERIAL PRIMARY KEY,
    code                TEXT NOT NULL,
    name                TEXT NOT NULL,
    version             TEXT NOT NULL,
    description         TEXT,
    source_url          TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_iphs_standard_code_version
        UNIQUE (code, version)
);

CREATE TABLE IF NOT EXISTS ref.iphs_facility (
    id                  BIGSERIAL PRIMARY KEY,
    standard_id         BIGINT NOT NULL
        REFERENCES ref.iphs_standard(id)
        ON DELETE RESTRICT,
    code                TEXT NOT NULL,
    name                TEXT NOT NULL,
    level               TEXT,
    rural_urban         TEXT,
    description         TEXT,

    CONSTRAINT uq_iphs_facility_standard_code
        UNIQUE (standard_id, code)
);

CREATE TABLE IF NOT EXISTS ref.iphs_requirement (
    id                  BIGSERIAL PRIMARY KEY,
    standard_id         BIGINT NOT NULL
        REFERENCES ref.iphs_standard(id)
        ON DELETE RESTRICT,
    facility_id         BIGINT NOT NULL
        REFERENCES ref.iphs_facility(id)
        ON DELETE RESTRICT,

    category             TEXT NOT NULL,
    subcategory          TEXT,

    requirement_code     TEXT NOT NULL,
    requirement_name     TEXT NOT NULL,
    requirement_type    TEXT,
    measurement_type     TEXT,

    required_value       NUMERIC,
    required_min         NUMERIC,
    required_max         NUMERIC,
    unit                 TEXT,

    applicability         TEXT,
    condition             TEXT,

    evaluability         TEXT NOT NULL DEFAULT 'MISSING_PARAMETER',

    source_document      TEXT NOT NULL,
    source_section       TEXT,
    source_page          TEXT,
    source_text          TEXT,

    CONSTRAINT uq_iphs_requirement
        UNIQUE (standard_id, facility_id, requirement_code),

    CONSTRAINT ck_iphs_requirement_evaluability
        CHECK (
            evaluability IN (
                'SUPPORTED',
                'PARTIAL',
                'MISSING_PARAMETER'
            )
        ),

    CONSTRAINT ck_iphs_requirement_type
        CHECK (
            requirement_type IS NULL
            OR requirement_type IN ('ESSENTIAL', 'DESIRABLE', 'REFERENCE')
        )
);

CREATE INDEX IF NOT EXISTS ix_iphs_facility_standard
    ON ref.iphs_facility (standard_id);

CREATE INDEX IF NOT EXISTS ix_iphs_requirement_facility
    ON ref.iphs_requirement (facility_id);

CREATE INDEX IF NOT EXISTS ix_iphs_requirement_category
    ON ref.iphs_requirement (category);

CREATE INDEX IF NOT EXISTS ix_iphs_requirement_metric
    ON ref.iphs_requirement (requirement_code);

-- -------------------------------------------------------------------------
-- IPHS 2022 standard
-- -------------------------------------------------------------------------

INSERT INTO ref.iphs_standard (
    code,
    name,
    version,
    description,
    source_url
)
VALUES (
    'IPHS',
    'Indian Public Health Standards',
    '2022',
    'Revised Indian Public Health Standards released in 2022 for public health facilities.',
    'https://www.nhm.gov.in/index1.php?lang=1&level=1&lid=154&sublinkid=284'
)
ON CONFLICT (code, version) DO NOTHING;

-- -------------------------------------------------------------------------
-- Facility catalogue used by IPHS 2022
-- -------------------------------------------------------------------------

INSERT INTO ref.iphs_facility (
    standard_id,
    code,
    name,
    level,
    rural_urban,
    description
)
SELECT
    s.id,
    v.code,
    v.name,
    v.level,
    v.rural_urban,
    v.description
FROM ref.iphs_standard s
CROSS JOIN (
    VALUES
        (
            'DH',
            'District Hospital',
            'District',
            'BOTH',
            'IPHS Volume I'
        ),
        (
            'SDH',
            'Sub-District Hospital',
            'Secondary',
            'BOTH',
            'IPHS Volume I'
        ),
        (
            'CHC',
            'Community Health Centre',
            'Secondary',
            'RURAL',
            'IPHS Volume II'
        ),
        (
            'UCHC',
            'Urban Community Health Centre',
            'Secondary',
            'URBAN',
            'IPHS Volume II'
        ),
        (
            'HWC-PHC',
            'Health and Wellness Centre - Primary Health Centre',
            'Primary',
            'RURAL',
            'IPHS Volume III'
        ),
        (
            'UPHC',
            'Urban Primary Health Centre',
            'Primary',
            'URBAN',
            'IPHS Volume III'
        ),
        (
            'POLYCLINIC',
            'Multispecialty UPHC / Polyclinic',
            'Primary',
            'URBAN',
            'IPHS Volume III'
        ),
        (
            'HWC-SHC',
            'Health and Wellness Centre - Sub Health Centre',
            'Primary',
            'RURAL',
            'IPHS Volume IV'
        ),
        (
            'UHWC',
            'Urban Health and Wellness Centre',
            'Primary',
            'URBAN',
            'IPHS Volume IV'
        )
) AS v(code, name, level, rural_urban, description)
WHERE s.code = 'IPHS'
  AND s.version = '2022'
ON CONFLICT (standard_id, code) DO NOTHING;

-- -------------------------------------------------------------------------
-- IPHS 2022 population norms that are explicitly defined in the official
-- guideline text. These are stored as reference rules.
--
-- The current NHM Land Register does not contain population/catchment
-- population, so these remain MISSING_PARAMETER for the current analytics.
-- -------------------------------------------------------------------------

INSERT INTO ref.iphs_requirement (
    standard_id,
    facility_id,
    category,
    subcategory,
    requirement_code,
    requirement_name,
    requirement_type,
    measurement_type,
    required_value,
    unit,
    applicability,
    evaluability,
    source_document,
    source_section,
    source_page,
    source_text
)
SELECT
    s.id,
    f.id,
    v.category,
    v.subcategory,
    v.requirement_code,
    v.requirement_name,
    v.requirement_type,
    v.measurement_type,
    v.required_value,
    v.unit,
    v.applicability,
    'MISSING_PARAMETER',
    v.source_document,
    v.source_section,
    v.source_page,
    v.source_text
FROM ref.iphs_standard s
JOIN ref.iphs_facility f
  ON f.standard_id = s.id
CROSS JOIN (
    VALUES
        (
            'HWC-PHC',
            'POPULATION',
            'CATCHMENT',
            'PHC_RURAL_PLAIN_POPULATION',
            'Rural PHC population norm - plains',
            'REFERENCE',
            'THRESHOLD',
            30000::NUMERIC,
            'population',
            'Rural plains',
            '03_PHC_IPHS_Guidelines-2022.pdf',
            'Population Norms for HWC-PHC',
            '7',
            'Normally, a PHC in rural areas is to be established for a population of 20,000 in hilly and tribal areas and 30,000 in plains.'
        ),
        (
            'HWC-PHC',
            'POPULATION',
            'CATCHMENT',
            'PHC_RURAL_HILLY_TRIBAL_POPULATION',
            'Rural PHC population norm - hilly and tribal',
            'REFERENCE',
            'THRESHOLD',
            20000::NUMERIC,
            'population',
            'Rural hilly and tribal areas',
            '03_PHC_IPHS_Guidelines-2022.pdf',
            'Population Norms for HWC-PHC',
            '7',
            'Normally, a PHC in rural areas is to be established for a population of 20,000 in hilly and tribal areas.'
        ),
        (
            'UPHC',
            'POPULATION',
            'CATCHMENT',
            'PHC_URBAN_POPULATION',
            'Urban PHC population norm',
            'REFERENCE',
            'THRESHOLD',
            50000::NUMERIC,
            'population',
            'Urban',
            '03_PHC_IPHS_Guidelines-2022.pdf',
            'Population Norms for HWC-PHC',
            '7',
            'UPHCs are established for every 50,000 population.'
        ),
        (
            'POLYCLINIC',
            'POPULATION',
            'CATCHMENT',
            'POLYCLINIC_POPULATION_MIN',
            'Polyclinic population norm - minimum',
            'REFERENCE',
            'RANGE',
            250000::NUMERIC,
            'population',
            'Urban',
            '03_PHC_IPHS_Guidelines-2022.pdf',
            'Population Norms for HWC-PHC',
            '7',
            'Multispecialty Polyclinics provide specialist healthcare services to a population of 2.5 to 3 lakhs.'
        ),
        (
            'POLYCLINIC',
            'POPULATION',
            'CATCHMENT',
            'POLYCLINIC_POPULATION_MAX',
            'Polyclinic population norm - maximum',
            'REFERENCE',
            'RANGE',
            300000::NUMERIC,
            'population',
            'Urban',
            '03_PHC_IPHS_Guidelines-2022.pdf',
            'Population Norms for HWC-PHC',
            '7',
            'Multispecialty Polyclinics provide specialist healthcare services to a population of 2.5 to 3 lakhs.'
        ),
        (
            'CHC',
            'POPULATION',
            'CATCHMENT',
            'CHC_RURAL_PLAIN_POPULATION',
            'Rural CHC population norm - plains',
            'REFERENCE',
            'THRESHOLD',
            120000::NUMERIC,
            'population',
            'Rural plains',
            '02-CHC_IPHS_Guidelines-2022.pdf',
            'Population Norms for CHCs',
            '8',
            'One rural CHC in the plains will cater to a population of 120,000 people.'
        ),
        (
            'CHC',
            'POPULATION',
            'CATCHMENT',
            'CHC_RURAL_HILLY_TRIBAL_POPULATION',
            'Rural CHC population norm - hilly and tribal',
            'REFERENCE',
            'THRESHOLD',
            80000::NUMERIC,
            'population',
            'Rural hilly and tribal areas',
            '02-CHC_IPHS_Guidelines-2022.pdf',
            'Population Norms for CHCs',
            '8',
            'One rural CHC in hilly and tribal areas will provide services to 80,000 people.'
        ),
        (
            'UCHC',
            'POPULATION',
            'CATCHMENT',
            'UCHC_METRO_POPULATION',
            'UCHC population norm - metro',
            'REFERENCE',
            'THRESHOLD',
            500000::NUMERIC,
            'population',
            'Urban metro',
            '02-CHC_IPHS_Guidelines-2022.pdf',
            'Population Norms for CHCs',
            '8',
            'Urban community health centres are established in metro cities with a population of 5 lakh and above.'
        ),
        (
            'UCHC',
            'POPULATION',
            'CATCHMENT',
            'UCHC_NON_METRO_POPULATION',
            'UCHC population norm - non-metro',
            'REFERENCE',
            'THRESHOLD',
            250000::NUMERIC,
            'population',
            'Urban non-metro',
            '02-CHC_IPHS_Guidelines-2022.pdf',
            'Population Norms for CHCs',
            '8',
            'Urban community health centres are established in non-metro cities with a population of 2.5 lakh.'
        )
) AS v(
    facility_code,
    category,
    subcategory,
    requirement_code,
    requirement_name,
    requirement_type,
    measurement_type,
    required_value,
    unit,
    applicability,
    source_document,
    source_section,
    source_page,
    source_text
)
WHERE s.code = 'IPHS'
  AND s.version = '2022'
  AND f.code = v.facility_code
ON CONFLICT (standard_id, facility_id, requirement_code) DO NOTHING;

-- HWC-SHC / UHWC population norms are included as reference rows as well.
-- The official Volume IV defines 5,000 population for HWC-SHC in plains
-- and 3,000 in hilly/tribal areas. The current land register has no
-- population/catchment field, so these remain MISSING_PARAMETER.

INSERT INTO ref.iphs_requirement (
    standard_id,
    facility_id,
    category,
    subcategory,
    requirement_code,
    requirement_name,
    requirement_type,
    measurement_type,
    required_value,
    unit,
    applicability,
    evaluability,
    source_document,
    source_section,
    source_page,
    source_text
)
SELECT
    s.id,
    f.id,
    v.category,
    v.subcategory,
    v.requirement_code,
    v.requirement_name,
    v.requirement_type,
    v.measurement_type,
    v.required_value,
    v.unit,
    v.applicability,
    'MISSING_PARAMETER',
    v.source_document,
    v.source_section,
    v.source_page,
    v.source_text
FROM ref.iphs_standard s
JOIN ref.iphs_facility f
  ON f.standard_id = s.id
CROSS JOIN (
    VALUES
        (
            'HWC-SHC',
            'POPULATION',
            'CATCHMENT',
            'HWC_SHC_PLAIN_POPULATION',
            'HWC-SHC population norm - plains',
            'REFERENCE',
            'THRESHOLD',
            5000::NUMERIC,
            'population',
            'Rural plains',
            '04-SHC_HWC_UHWC_IPHS_Guidelines-2022.pdf',
            'Population Norms',
            'volume IV',
            'HWC-SHC population norm stated in the IPHS 2022 framework.'
        ),
        (
            'HWC-SHC',
            'POPULATION',
            'CATCHMENT',
            'HWC_SHC_HILLY_TRIBAL_POPULATION',
            'HWC-SHC population norm - hilly and tribal',
            'REFERENCE',
            'THRESHOLD',
            3000::NUMERIC,
            'population',
            'Rural hilly and tribal areas',
            '04-SHC_HWC_UHWC_IPHS_Guidelines-2022.pdf',
            'Population Norms',
            'volume IV',
            'HWC-SHC population norm stated in the IPHS 2022 framework.'
        )
) AS v(
    facility_code,
    category,
    subcategory,
    requirement_code,
    requirement_name,
    requirement_type,
    measurement_type,
    required_value,
    unit,
    applicability,
    source_document,
    source_section,
    source_page,
    source_text
)
WHERE s.code = 'IPHS'
  AND s.version = '2022'
  AND f.code = v.facility_code
ON CONFLICT (standard_id, facility_id, requirement_code) DO NOTHING;
