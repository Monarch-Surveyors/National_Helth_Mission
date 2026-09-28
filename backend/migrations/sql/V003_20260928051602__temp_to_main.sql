-- ============================================================
-- TRIM/NULLIF SCOPING RULE (Section 0 / Section 5 compliance):
-- Inserted business-data values are copied exactly as they land in TEMP —
-- no trimming, no blank-to-NULL conversion. TRIM/NULLIF appears ONLY inside
-- ref.* lookup WHERE/JOIN conditions (matching against ref.district.name,
-- ref.taluka.name, ref.ownership_type.label) and inside the ref.* population
-- SELECT DISTINCT statements themselves, where it is necessary to build a
-- working, de-duplicated lookup dictionary and to match rows against it
-- despite stray whitespace in some source headers (e.g. Sc Land Info's
-- 'District Name ' has a trailing space in the source header itself).
-- ============================================================
-- Stage 4: insert.sql
-- Populates all public/ref tables from the TEMP tables loaded
-- by load.sql. Assumes schema.sql DDL has been executed and
-- all TEMP tables from load.sql are present in the session.
-- No DDL, no COPY, no new abstractions.
-- ============================================================
begin;
-- ============================================================
-- ref.facility_type
-- One row per source worksheet. Values are fixed/known.
-- ============================================================
INSERT INTO ref.facility_type (code, label) VALUES
    ('DH',      'District Hospital'),
    ('GH',      'General Hospital'),
    ('SSH',     'Super Specialty Hospital'),
    ('SDH-100', 'Sub-District Hospital 100-bed'),
    ('SDH-50',  'Sub-District Hospital 50-bed'),
    ('RH',      'Rural Hospital'),
    ('WH',      'Women Hospital'),
    ('RMH',     'Rural Maternity Home'),
    ('PHC',     'Primary Health Centre'),
    ('SC',      'Sub-Centre'),
    ('UCHC',    'Urban Community Health Centre'),
    ('HBT',     '674 HBT Aapla Dawakhana'),
    ('UHWC',    'Urban Health and Wellness Centre'),
    ('UPHC',    'Urban Primary Health Centre')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- ref.ownership_type
-- Distinct values collected from all Ownership Type columns.
-- ============================================================
INSERT INTO ref.ownership_type (label)
SELECT DISTINCT NULLIF(TRIM(v), '')
FROM (
    SELECT "T1_C7_Ownership Type_Value"  AS v FROM temp.tmp_hospital_land_info_dh
    UNION ALL
    SELECT "T1_C10_Ownership Type_Value" FROM temp.tmp_hospital_land_info_gh
    UNION ALL
    SELECT "T1_C12_Ownership Type_Value" FROM temp.tmp_hospital_land_info_sdh_100
    UNION ALL
    SELECT "T1_C9_Ownership Type_Value"  FROM temp.tmp_hospital_land_info_sdh_50
    UNION ALL
    SELECT "T1_C9_Ownership Type_Value"  FROM temp.tmp_hospital_land_info_ssh
    UNION ALL
    SELECT "T1_C7_Ownership Type_Value"  FROM temp.tmp_hospital_land_info_wh
    UNION ALL
    SELECT "T1_C7_Ownership Type_Value"  FROM temp.tmp_hospital_land_info_rmh
    UNION ALL
    SELECT "T1_C12_Ownership Type_Value" FROM temp.tmp_hospital_land_info_rh
    UNION ALL
    SELECT "T1_C9_Ownership Type_Value"  FROM temp.tmp_phc_land_info_phc
    UNION ALL
    SELECT "T1_C10_Ownership Type_Value" FROM temp.tmp_sc_land_info_sc
    UNION ALL
    SELECT "T1_C11_Ownership Type_Value" FROM temp.tmp_urban_health_land_info_674_hbt
    UNION ALL
    SELECT "T1_C9_Ownership Type_Value"  FROM temp.tmp_urban_health_land_info_uchc
    UNION ALL
    SELECT "T1_C11_Ownership Type_Value" FROM temp.tmp_urban_health_land_info_uhwc
    UNION ALL
    SELECT "T1_C11_Ownership Type_Value" FROM temp.tmp_urban_health_land_info_uphc
    UNION ALL
    SELECT "T1_C9_Ownership Type_Value"  FROM temp.tmp_offices_land_info_dh_raigad
    UNION ALL
    SELECT "T1_C9_Ownership Type_Value"  FROM temp.tmp_offices_land_info_ramtek
    UNION ALL
    SELECT "T1_C8_Ownership Type_Value"  FROM temp.tmp_offices_land_info_offices_by_district
) all_vals
WHERE NULLIF(TRIM(v), '') IS NOT NULL
ON CONFLICT (label) DO NOTHING;

-- ============================================================
-- ref.district
-- Distinct district names from all sources that carry one.
-- ============================================================
INSERT INTO ref.district (name)
SELECT DISTINCT NULLIF(TRIM(v), '')
FROM (
    SELECT "T1_C2_District Name_Value"   AS v FROM temp.tmp_phc_land_info_phc
    UNION ALL
    SELECT "T1_C2_District Name _Value"       FROM temp.tmp_sc_land_info_sc
    UNION ALL
    SELECT "T1_C2_Name of Districts_Value"    FROM temp.tmp_urban_health_land_info_674_hbt
    UNION ALL
    SELECT "T1_C2_District Name_Value"        FROM temp.tmp_urban_health_land_info_uchc
    UNION ALL
    SELECT "T1_C2_Districts Name_Value"       FROM temp.tmp_urban_health_land_info_uhwc
    UNION ALL
    SELECT "T1_C3_District Name _Value"       FROM temp.tmp_urban_health_land_info_uphc
    UNION ALL
    SELECT "T1_C2_District_Value"             FROM temp.tmp_offices_land_info_dh_raigad
    UNION ALL
    SELECT "T1_C2_District_Value"             FROM temp.tmp_offices_land_info_ramtek
    UNION ALL
    SELECT "T1_C2_District_Value"             FROM temp.tmp_offices_land_info_offices_by_district
) all_vals
WHERE NULLIF(TRIM(v), '') IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- ref.taluka
-- Distinct (district, taluka) pairs. District FK resolved by
-- name lookup; NULLs where district is absent for that source.
-- ============================================================
INSERT INTO ref.taluka (district_id, name)
SELECT DISTINCT
    d.id,
    t.taluka
FROM (
    SELECT "T1_C2_District Name_Value"  AS district, "T1_C3_Taluka Name_Value"  AS taluka FROM temp.tmp_phc_land_info_phc
    UNION ALL
    SELECT "T1_C2_District Name _Value",              "T1_C3_Taluka Name_Value"            FROM temp.tmp_sc_land_info_sc
    UNION ALL
    SELECT "T1_C2_District_Value",                    "T1_C3_Taluka_Value"                 FROM temp.tmp_offices_land_info_dh_raigad
    UNION ALL
    SELECT "T1_C2_District_Value",                    "T1_C3_Taluka_Value"                 FROM temp.tmp_offices_land_info_ramtek
) t
JOIN ref.district d ON d.name = NULLIF(TRIM(t.district), '')
WHERE NULLIF(TRIM(t.taluka), '') IS NOT NULL;


-- ============================================================
-- public.health_facility — DH
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn, facility_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'DH'),
    "T1_C1_SN_Value",
    "T1_C2_List of Functional  District Hospitals_Value",
    "T1_C3_Property / Land Name and Address_Value",
    "T1_C4_Pin Code_Value",
    "T1_C5_Survey No. / Gat No. / CTS No._Value",
    "T1_C6_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C7_Ownership Type_Value"), '')),
    "T1_C8_Ownership Document Available (Yes/No)_Value",
    "T1_C9_Facility/Office Incharge Name and Contact_Value",
    "T1_C10_Remarks_Value",
    'Hospital LAND Info', 'DH', 'T1', "row_id"
FROM temp.tmp_hospital_land_info_dh;

-- ============================================================
-- public.health_facility — GH (main row)
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn, facility_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    no_label_c,
    no_label_d,
    no_label_e,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'GH'),
    "T1_C1_SN_Value",
    "T1_C2_List of Functional General Hospitals_Value",
    "T1_C6_Property / Land Name and Address_Value",
    "T1_C7_Pin Code_Value",
    "T1_C8_Survey No. / Gat No. / CTS No._Value",
    "T1_C9_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C10_Ownership Type_Value"), '')),
    "T1_C11_Ownership Document Available (Yes/No)_Value",
    "T1_C12_Facility/Office Incharge Name and Contact_Value",
    "T1_C13_Remarks_Value",
    "T1_C3_no_label_c_Value",
    "T1_C4_no_label_d_Value",
    "T1_C5_no_label_e_Value",
    'Hospital LAND Info', 'GH', 'T1', "row_id"
FROM temp.tmp_hospital_land_info_gh;


-- ============================================================
-- public.health_facility — SDH-100
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn, facility_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    no_label_c,
    no_label_d,
    no_label_e,
    no_label_f,
    no_label_g,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'SDH-100'),
    "T1_C1_SN_Value",
    "T1_C2_List of Functional  SDH - 100s_Value",
    "T1_C8_Property / Land Name and Address_Value",
    "T1_C9_Pin Code_Value",
    "T1_C10_Survey No. / Gat No. / CTS No._Value",
    "T1_C11_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C12_Ownership Type_Value"), '')),
    "T1_C13_Ownership Document Available (Yes/No)_Value",
    "T1_C14_Facility/Office Incharge Name and Contact_Value",
    "T1_C15_Remarks_Value",
    "T1_C3_no_label_c_Value",
    "T1_C4_no_label_d_Value",
    "T1_C5_no_label_e_Value",
    "T1_C6_no_label_f_Value",
    "T1_C7_no_label_g_Value",
    'Hospital LAND Info', 'SDH-100', 'T1', "row_id"
FROM temp.tmp_hospital_land_info_sdh_100;


-- ============================================================
-- public.health_facility — SDH-50
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn, facility_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    no_label_c,
    no_label_d,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'SDH-50'),
    "T1_C1_SN_Value",
    "T1_C2_List of Functional  SDH-50_Value",
    "T1_C5_Property / Land Name and Address_Value",
    "T1_C6_Pin Code_Value",
    "T1_C7_Survey No. / Gat No. / CTS No._Value",
    "T1_C8_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C9_Ownership Type_Value"), '')),
    "T1_C10_Ownership Document Available (Yes/No)_Value",
    "T1_C11_Facility/Office Incharge Name and Contact_Value",
    "T1_C12_Remarks_Value",
    "T1_C3_no_label_c_Value",
    "T1_C4_no_label_d_Value",
    'Hospital LAND Info', 'SDH-50', 'T1', "row_id"
FROM temp.tmp_hospital_land_info_sdh_50;


-- ============================================================
-- public.health_facility — SSH
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn, facility_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    no_label_c,
    no_label_d,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'SSH'),
    "T1_C1_SN_Value",
    "T1_C2_List of Functional  Super Specialty Hospitals_Value",
    "T1_C5_Property / Land Name and Address_Value",
    "T1_C6_Pin Code_Value",
    "T1_C7_Survey No. / Gat No. / CTS No._Value",
    "T1_C8_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C9_Ownership Type_Value"), '')),
    "T1_C10_Ownership Document Available (Yes/No)_Value",
    "T1_C11_Facility/Office Incharge Name and Contact_Value",
    "T1_C12_Remarks_Value",
    "T1_C3_no_label_c_Value",
    "T1_C4_no_label_d_Value",
    'Hospital LAND Info', 'SSH', 'T1', "row_id"
FROM temp.tmp_hospital_land_info_ssh;


-- ============================================================
-- public.health_facility — WH
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn, facility_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'WH'),
    "T1_C1_SN_Value",
    "T1_C2_List of Functional  Women Hospitals_Value",
    "T1_C3_Property / Land Name and Address_Value",
    "T1_C4_Pin Code_Value",
    "T1_C5_Survey No. / Gat No. / CTS No._Value",
    "T1_C6_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C7_Ownership Type_Value"), '')),
    "T1_C8_Ownership Document Available (Yes/No)_Value",
    "T1_C9_Facility/Office Incharge Name and Contact_Value",
    "T1_C10_Remarks_Value",
    'Hospital LAND Info', 'WH', 'T1', "row_id"
FROM temp.tmp_hospital_land_info_wh;

-- ============================================================
-- public.health_facility — RMH
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn, facility_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'RMH'),
    "T1_C1_SN_Value",
    "T1_C2_List of Functional  Women Hospitals_Value",
    "T1_C3_Property / Land Name and Address_Value",
    "T1_C4_Pin Code_Value",
    "T1_C5_Survey No. / Gat No. / CTS No._Value",
    "T1_C6_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C7_Ownership Type_Value"), '')),
    "T1_C8_Ownership Document Available (Yes/No)_Value",
    "T1_C9_Facility/Office Incharge Name and Contact_Value",
    "T1_C10_Remarks_Value",
    'Hospital LAND Info', 'RMH', 'T1', "row_id"
FROM temp.tmp_hospital_land_info_rmh;

-- ============================================================
-- public.health_facility — RH
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn,
    district_id, taluka_id, circle_name, facility_name,
    vc_setup, remarks_1,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'RH'),
    "T1_C1_Sr. No_Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T1_C3_List of Functional RH (Funcing RH) | Dist_Name_Value"), '')),
    (SELECT tk.id FROM ref.taluka tk
        JOIN ref.district d ON d.id = tk.district_id
        WHERE d.name = NULLIF(TRIM("T1_C3_List of Functional RH (Funcing RH) | Dist_Name_Value"), '')
          AND tk.name = NULLIF(TRIM("T1_C4_List of Functional RH (Funcing RH) | Taluka Name_Value"), '')
        LIMIT 1),
    "T1_C2_List of Functional RH (Funcing RH) | Circle Name_Value",
    "T1_C5_List of Functional RH (Funcing RH) | Funcing RH_Value",
    "T1_C6_VC Setup (Yes/No)(Computer,Web Camera,Mice,Speaker etc)_Value",
    "T1_C7_Remarks | Remarks_Value",
    "T1_C8_Property / Land Name and Address_Value",
    "T1_C9_Pin Code_Value",
    "T1_C10_Survey No. / Gat No. / CTS No._Value",
    "T1_C11_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C12_Ownership Type_Value"), '')),
    "T1_C13_Ownership Document Available (Yes/No)_Value",
    "T1_C14_Facility/Office Incharge Name and Contact_Value",
    "T1_C15_Remarks_Value",
    'Hospital LAND Info', 'RH', 'T1', "row_id"
FROM temp.tmp_hospital_land_info_rh;

-- ============================================================
-- public.health_facility — PHC
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn,
    district_id, taluka_id, facility_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    no_label_m,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'PHC'),
    "T1_C1_Sr. No_Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T1_C2_District Name_Value"), '')),
    (SELECT tk.id FROM ref.taluka tk
        JOIN ref.district d ON d.id = tk.district_id
        WHERE d.name  = NULLIF(TRIM("T1_C2_District Name_Value"), '')
          AND tk.name = NULLIF(TRIM("T1_C3_Taluka Name_Value"), '')
        LIMIT 1),
    "T1_C4_PHC_Value",
    "T1_C5_Property / Land Name and Address_Value",
    "T1_C6_Pin Code_Value",
    "T1_C7_Survey No. / Gat No. / CTS No._Value",
    "T1_C8_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C9_Ownership Type_Value"), '')),
    "T1_C10_Ownership Document Available (Yes/No)_Value",
    "T1_C11_Facility/Office Incharge Name and Contact_Value",
    "T1_C12_Remarks_Value",
    "T1_C13_no_label_m_Value",
    'PHC LAND Info', 'PHC', 'T1', "row_id"
FROM temp.tmp_phc_land_info_phc;


-- ============================================================
-- public.health_facility — SC
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn,
    district_id, taluka_id, phc_name, facility_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'SC'),
    "T1_C1_Sr. No_Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T1_C2_District Name _Value"), '')),
    (SELECT tk.id FROM ref.taluka tk
        JOIN ref.district d ON d.id = tk.district_id
        WHERE d.name  = NULLIF(TRIM("T1_C2_District Name _Value"), '')
          AND tk.name = NULLIF(TRIM("T1_C3_Taluka Name_Value"), '')
        LIMIT 1),
    "T1_C4_PHC_Value",
    "T1_C5_SC_Value",
    "T1_C6_Property / Land Name and Address_Value",
    "T1_C7_Pin Code_Value",
    "T1_C8_Survey No. / Gat No. / CTS No._Value",
    "T1_C9_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C10_Ownership Type_Value"), '')),
    "T1_C11_Ownership Document Available (Yes/No)_Value",
    "T1_C12_Facility/Office Incharge Name and Contact_Value",
    "T1_C13_Remarks_Value",
    'Sc Land Info', 'SC', 'T1', "row_id"
FROM temp.tmp_sc_land_info_sc;

-- ============================================================
-- public.health_facility — UCHC
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn,
    district_id, ulb_name, facility_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    no_label_m,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'UCHC'),
    "T1_C1_Sr. No._Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T1_C2_District Name_Value"), '')),
    "T1_C3_ULB Name_Value",
    "T1_C4_Facility Name_Value",
    "T1_C5_Property / Land Name and Address_Value",
    "T1_C6_Pin Code_Value",
    "T1_C7_Survey No. / Gat No. / CTS No._Value",
    "T1_C8_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C9_Ownership Type_Value"), '')),
    "T1_C10_Ownership Document Available (Yes/No)_Value",
    "T1_C11_Facility/Office Incharge Name and Contact_Value",
    "T1_C12_Remarks_Value",
    "T1_C13_no_label_m_Value",
    'Urban Health land info', 'UCHC', 'T1', "row_id"
FROM temp.tmp_urban_health_land_info_uchc;


-- ============================================================
-- public.health_facility — 674 HBT
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn,
    district_id, block_name, ulb_type,
    hbt_name, hbt_address,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    no_label_o,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'HBT'),
    "T1_C1_Sr.No_Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T1_C2_Name of Districts_Value"), '')),
    "T1_C3_Name of Block_Value",
    "T1_C4_Type of UHWC_Council/Nagarpanchayat/Cant_Board/Corp_Value",
    "T1_C5_Name of HBT Aapla Dawakhana_Value",
    "T1_C6_Address Of HBT Aapla Dawakhana _Value",
    "T1_C7_Property / Land Name and Address_Value",
    "T1_C8_Pin Code_Value",
    "T1_C9_Survey No. / Gat No. / CTS No._Value",
    "T1_C10_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C11_Ownership Type_Value"), '')),
    "T1_C12_Ownership Document Available (Yes/No)_Value",
    "T1_C13_Facility/Office Incharge Name and Contact_Value",
    "T1_C14_Remarks_Value",
    "T1_C15_no_label_o_Value",
    'Urban Health land info', '674 HBT', 'T1', "row_id"
FROM temp.tmp_urban_health_land_info_674_hbt;


-- ============================================================
-- public.health_facility — UHWC
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn,
    district_id, block_name, ulb_type,
    uhwc_name, uhwc_address,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'UHWC'),
    "T1_C1_Sr.No._Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T1_C2_Districts Name_Value"), '')),
    "T1_C3_Name of Block_Value",
    "T1_C4_Type of UHWC_Council/Nagarpanchayat/Cant_Board/Corp_Value",
    "T1_C5_  Name of UHWC_Value",
    "T1_C6_Address of UHWC _Value",
    "T1_C7_Property / Land Name and Address_Value",
    "T1_C8_Pin Code_Value",
    "T1_C9_Survey No. / Gat No. / CTS No._Value",
    "T1_C10_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C11_Ownership Type_Value"), '')),
    "T1_C12_Ownership Document Available (Yes/No)_Value",
    "T1_C13_Facility/Office Incharge Name and Contact_Value",
    "T1_C14_Remarks_Value",
    'Urban Health land info', 'UHWC', 'T1', "row_id"
FROM temp.tmp_urban_health_land_info_uhwc;

-- ============================================================
-- public.health_facility — UPHC
-- ============================================================
INSERT INTO public.health_facility (
    facility_type_id, source_sn,
    circle_name, district_id, sub_district_name, lb_name, facility_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    (SELECT id FROM ref.facility_type WHERE code = 'UPHC'),
    "T1_C1_Sr.No._Value",
    "T1_C2_Circle Name _Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T1_C3_District Name _Value"), '')),
    "T1_C4_Sub District Name_Value",
    "T1_C5_Lb Name_Value",
    "T1_C6_Facility Name_Value",
    "T1_C7_Property / Land Name and Address_Value",
    "T1_C8_Pin Code_Value",
    "T1_C9_Survey No. / Gat No. / CTS No._Value",
    "T1_C10_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C11_Ownership Type_Value"), '')),
    "T1_C12_Ownership Document Available (Yes/No)_Value",
    "T1_C13_Facility/Office Incharge Name and Contact_Value",
    "T1_C14_Remarks_Value",
    'Urban Health land info', 'UPHC', 'T1', "row_id"
FROM temp.tmp_urban_health_land_info_uphc;

-- ============================================================
-- public.office — DH RAIGAD (T1)
-- ============================================================
INSERT INTO public.office (
    source_sn, district_id, taluka_id, office_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    "T1_C1_Sr. No_Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T1_C2_District_Value"), '')),
    (SELECT tk.id FROM ref.taluka tk
        JOIN ref.district d ON d.id = tk.district_id
        WHERE d.name  = NULLIF(TRIM("T1_C2_District_Value"), '')
          AND tk.name = NULLIF(TRIM("T1_C3_Taluka_Value"), '')
        LIMIT 1),
    "T1_C4_Offices Name_Value",
    "T1_C5_Property / Land Name and Address_Value",
    "T1_C6_Pin Code_Value",
    "T1_C7_Survey No. /  Gat No. / CTS No._Value",
    "T1_C8_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C9_Ownership Type_Value"), '')),
    "T1_C10_Ownership Document Available (Yes/No)_Value",
    "T1_C11_Facility/Office Incharge Name and Contact_Value",
    "T1_C12_Remarks_Value",
    'Offices LAND Info', 'DH RAIGAD', 'T1', "row_id"
FROM temp.tmp_offices_land_info_dh_raigad;

-- ============================================================
-- public.office — Ramtek T1
-- ============================================================
INSERT INTO public.office (
    source_sn, district_id, taluka_id, office_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    "T1_C1_Sr. No_Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T1_C2_District_Value"), '')),
    (SELECT tk.id FROM ref.taluka tk
        JOIN ref.district d ON d.id = tk.district_id
        WHERE d.name  = NULLIF(TRIM("T1_C2_District_Value"), '')
          AND tk.name = NULLIF(TRIM("T1_C3_Taluka_Value"), '')
        LIMIT 1),
    "T1_C4_Offices Name_Value",
    "T1_C5_Property / Land Name and Address_Value",
    "T1_C6_Pin Code_Value",
    "T1_C7_Survey No. / Gat No. / CTS No._Value",
    "T1_C8_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C9_Ownership Type_Value"), '')),
    "T1_C10_Ownership Document Available (Yes/No)_Value",
    "T1_C11_Facility/Office Incharge Name and Contact_Value",
    "T1_C12_Remarks_Value",
    'Offices LAND Info', 'Ramtek', 'T1', "row_id"
FROM temp.tmp_offices_land_info_ramtek
-- Include any row where at least one T1 column carries data.
-- Excludes 2 truly-blank rows (row_ids 56, 67) that fall inside the T1
-- declared range but have no data in any column — manifest counts them
-- because it counts all rows in the declared range.
-- Also captures 4 rows (57,61,62,63) that have only Ownership Type
-- populated and would be dropped by a Sr.No/OfficeName-only guard.
WHERE EXISTS (
    SELECT 1 FROM (VALUES
        ("T1_C1_Sr. No_Value"),("T1_C2_District_Value"),("T1_C3_Taluka_Value"),
        ("T1_C4_Offices Name_Value"),("T1_C5_Property / Land Name and Address_Value"),
        ("T1_C6_Pin Code_Value"),("T1_C7_Survey No. / Gat No. / CTS No._Value"),
        ("T1_C8_Total Land Area (Sq.M)_Value"),("T1_C9_Ownership Type_Value"),
        ("T1_C10_Ownership Document Available (Yes/No)_Value"),
        ("T1_C11_Facility/Office Incharge Name and Contact_Value"),("T1_C12_Remarks_Value")
    ) AS v(val) WHERE val <> ''
);

-- ============================================================
-- public.office — Ramtek T2
-- ============================================================
INSERT INTO public.office (
    source_sn, district_id, taluka_id, office_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    "T2_C1_Sr. No_Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T2_C2_District_Value"), '')),
    (SELECT tk.id FROM ref.taluka tk
        JOIN ref.district d ON d.id = tk.district_id
        WHERE d.name  = NULLIF(TRIM("T2_C2_District_Value"), '')
          AND tk.name = NULLIF(TRIM("T2_C3_Taluka_Value"), '')
        LIMIT 1),
    "T2_C4_Offices Name_Value",
    "T2_C5_Property / Land Name and Address_Value",
    "T2_C6_Pin Code_Value",
    "T2_C7_Survey No. / Gat No. / CTS No._Value",
    "T2_C8_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T2_C9_Ownership Type_Value"), '')),
    "T2_C10_Ownership Document Available (Yes/No)_Value",
    "T2_C11_Facility/Office Incharge Name and Contact_Value",
    "T2_C12_Remarks_Value",
    'Offices LAND Info', 'Ramtek', 'T2', "row_id"
FROM temp.tmp_offices_land_info_ramtek
-- Excludes 1 truly-blank row (row_id 142) inside the T2 declared range.
WHERE EXISTS (
    SELECT 1 FROM (VALUES
        ("T2_C1_Sr. No_Value"),("T2_C2_District_Value"),("T2_C3_Taluka_Value"),
        ("T2_C4_Offices Name_Value"),("T2_C5_Property / Land Name and Address_Value"),
        ("T2_C6_Pin Code_Value"),("T2_C7_Survey No. / Gat No. / CTS No._Value"),
        ("T2_C8_Total Land Area (Sq.M)_Value"),("T2_C9_Ownership Type_Value"),
        ("T2_C10_Ownership Document Available (Yes/No)_Value"),
        ("T2_C11_Facility/Office Incharge Name and Contact_Value"),("T2_C12_Remarks_Value")
    ) AS v(val) WHERE val <> ''
);

-- ============================================================
-- public.office — Ramtek T3 (no_label_l carries col L)
-- ============================================================
INSERT INTO public.office (
    source_sn, district_id, taluka_id, office_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, no_label_l,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    "T3_C1_Sr. No_Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T3_C2_District_Value"), '')),
    (SELECT tk.id FROM ref.taluka tk
        JOIN ref.district d ON d.id = tk.district_id
        WHERE d.name  = NULLIF(TRIM("T3_C2_District_Value"), '')
          AND tk.name = NULLIF(TRIM("T3_C3_Taluka_Value"), '')
        LIMIT 1),
    "T3_C4_Offices Name_Value",
    "T3_C5_Property / Land Name and Address_Value",
    "T3_C6_Pin Code_Value",
    "T3_C7_Survey No. / Gat No. / CTS No._Value",
    "T3_C8_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T3_C9_Ownership Type_Value"), '')),
    "T3_C10_Ownership Document Available (Yes/No)_Value",
    "T3_C11_Facility/Office Incharge Name and Contact_Value",
    "T3_C12_no_label_l_Value",
    'Offices LAND Info', 'Ramtek', 'T3', "row_id"
FROM temp.tmp_offices_land_info_ramtek
-- Excludes 7 truly-blank rows (175-178, 186-187, 201) inside the T3 declared range.
WHERE EXISTS (
    SELECT 1 FROM (VALUES
        ("T3_C1_Sr. No_Value"),("T3_C2_District_Value"),("T3_C3_Taluka_Value"),
        ("T3_C4_Offices Name_Value"),("T3_C5_Property / Land Name and Address_Value"),
        ("T3_C6_Pin Code_Value"),("T3_C7_Survey No. / Gat No. / CTS No._Value"),
        ("T3_C8_Total Land Area (Sq.M)_Value"),("T3_C9_Ownership Type_Value"),
        ("T3_C10_Ownership Document Available (Yes/No)_Value"),
        ("T3_C11_Facility/Office Incharge Name and Contact_Value"),("T3_C12_no_label_l_Value")
    ) AS v(val) WHERE val <> ''
);

-- ============================================================
-- public.office — Offices by District T1
-- col L (no_label_l) has 1 string value; no taluka in this sheet
-- ============================================================
INSERT INTO public.office (
    source_sn, district_id, office_name,
    property_land_address, pin_code, survey_gat_cts_no,
    total_land_area_sqm, ownership_type_id, ownership_doc_available,
    incharge_name_contact, remarks, no_label_l,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    "T1_C1_Sr. No_Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T1_C2_District_Value"), '')),
    "T1_C3_Offices Name_Value",
    "T1_C4_Property / Land Name and Address_Value",
    "T1_C5_Pin Code_Value",
    "T1_C6_Survey No. / Gat No. / CTS No._Value",
    "T1_C7_Total Land Area (Sq.M)_Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T1_C8_Ownership Type_Value"), '')),
    "T1_C9_Ownership Document Available (Yes/No)_Value",
    "T1_C10_Facility/Office Incharge Name and Contact_Value",
    "T1_C11_Remarks_Value",
    "T1_C12_no_label_l_Value",
    'Offices LAND Info', 'Offices by District', 'T1', "row_id"
FROM temp.tmp_offices_land_info_offices_by_district
-- Excludes 2 truly-blank rows (652, 654) inside the T1 declared range
-- that have no data in any column. 653 rows inserted, not 655.
WHERE EXISTS (
    SELECT 1 FROM (VALUES
        ("T1_C1_Sr. No_Value"),("T1_C2_District_Value"),("T1_C3_Offices Name_Value"),
        ("T1_C4_Property / Land Name and Address_Value"),("T1_C5_Pin Code_Value"),
        ("T1_C6_Survey No. / Gat No. / CTS No._Value"),("T1_C7_Total Land Area (Sq.M)_Value"),
        ("T1_C8_Ownership Type_Value"),("T1_C9_Ownership Document Available (Yes/No)_Value"),
        ("T1_C10_Facility/Office Incharge Name and Contact_Value"),("T1_C11_Remarks_Value"),
        ("T1_C12_no_label_l_Value")
    ) AS v(val) WHERE val <> ''
);

-- ============================================================
-- public.office — Offices by District T2
-- T2 header cells are actual first-record values, so mapping is
-- positional according to the audited T2 structure.
-- ============================================================
INSERT INTO public.office (
    source_sn, district_id, taluka_id, office_name, facility_name,
    pin_code, survey_gat_cts_no, total_land_area_sqm,
    ownership_type_id, ownership_doc_available,
    incharge_name_contact,
    source_workbook, source_worksheet, source_table_id, source_row_id
)
SELECT
    "T2_C1_1_Value",
    (SELECT id FROM ref.district WHERE name = NULLIF(TRIM("T2_C2_Thane_Value"), '')),
    (SELECT tk.id FROM ref.taluka tk
        JOIN ref.district d ON d.id = tk.district_id
        WHERE d.name = NULLIF(TRIM("T2_C2_Thane_Value"), '')
          AND tk.name = NULLIF(TRIM("T2_C3_Ambarnath_Value"), '')
        LIMIT 1),
    "T2_C4_Medical Officer, PHC Badlapur_Value",
    "T2_C5_Primary Health Center Badlapur_Value",
    "T2_C6_421503_Value",
    "T2_C7_169_Value",
    "T2_C8_237 Sq.M._Value",
    (SELECT id FROM ref.ownership_type WHERE label = NULLIF(TRIM("T2_C9_Government_Value"), '')),
    "T2_C10_YES_Value",
    "T2_C11_Dr. Ashwini Vane_Value",
    'Offices LAND Info', 'Offices by District', 'T2', "row_id"
FROM temp.tmp_offices_land_info_offices_by_district
WHERE NULLIF(TRIM("T2_C1_1_Value"), '') IS NOT NULL
   OR NULLIF(TRIM("T2_C2_Thane_Value"), '') IS NOT NULL
   OR NULLIF(TRIM("T2_C3_Ambarnath_Value"), '') IS NOT NULL
   OR NULLIF(TRIM("T2_C4_Medical Officer, PHC Badlapur_Value"), '') IS NOT NULL
   OR NULLIF(TRIM("T2_C5_Primary Health Center Badlapur_Value"), '') IS NOT NULL
   OR NULLIF(TRIM("T2_C6_421503_Value"), '') IS NOT NULL
   OR NULLIF(TRIM("T2_C7_169_Value"), '') IS NOT NULL
   OR NULLIF(TRIM("T2_C8_237 Sq.M._Value"), '') IS NOT NULL
   OR NULLIF(TRIM("T2_C9_Government_Value"), '') IS NOT NULL
   OR NULLIF(TRIM("T2_C10_YES_Value"), '') IS NOT NULL
   OR NULLIF(TRIM("T2_C11_Dr. Ashwini Vane_Value"), '') IS NOT NULL
   OR NULLIF(TRIM("T2_C12_9004424091_Value"), '') IS NOT NULL;

commit;