-- Add your migration SQL here
begin;

CREATE SCHEMA IF NOT EXISTS temp;

-- Hospital LAND Info / DH
DROP TABLE IF EXISTS temp.tmp_hospital_land_info_dh;
CREATE TABLE temp.tmp_hospital_land_info_dh (
    "row_id" TEXT,
    "T1_C1_SN_Value" TEXT,
    "T1_C1_SN_Formula" TEXT,
    "T1_C2_List of Functional  District Hospitals_Value" TEXT,
    "T1_C2_List of Functional  District Hospitals_Formula" TEXT,
    "T1_C3_Property / Land Name and Address_Value" TEXT,
    "T1_C3_Property / Land Name and Address_Formula" TEXT,
    "T1_C4_Pin Code_Value" TEXT,
    "T1_C4_Pin Code_Formula" TEXT,
    "T1_C5_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C5_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C6_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C6_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C7_Ownership Type_Value" TEXT,
    "T1_C7_Ownership Type_Formula" TEXT,
    "T1_C8_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C8_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C9_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C9_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C10_Remarks_Value" TEXT,
    "T1_C10_Remarks_Formula" TEXT
);
COPY temp.tmp_hospital_land_info_dh FROM '${csvDir_4_initail_data_load}/Hospital LAND Info/DH.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Hospital LAND Info / GH
DROP TABLE IF EXISTS temp.tmp_hospital_land_info_gh;
CREATE TABLE temp.tmp_hospital_land_info_gh (
    "row_id" TEXT,
    "T1_C1_SN_Value" TEXT,
    "T1_C1_SN_Formula" TEXT,
    "T1_C2_List of Functional General Hospitals_Value" TEXT,
    "T1_C2_List of Functional General Hospitals_Formula" TEXT,
    "T1_C3_no_label_c_Value" TEXT,
    "T1_C3_no_label_c_Formula" TEXT,
    "T1_C4_no_label_d_Value" TEXT,
    "T1_C4_no_label_d_Formula" TEXT,
    "T1_C5_no_label_e_Value" TEXT,
    "T1_C5_no_label_e_Formula" TEXT,
    "T1_C6_Property / Land Name and Address_Value" TEXT,
    "T1_C6_Property / Land Name and Address_Formula" TEXT,
    "T1_C7_Pin Code_Value" TEXT,
    "T1_C7_Pin Code_Formula" TEXT,
    "T1_C8_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C8_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C9_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C9_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C10_Ownership Type_Value" TEXT,
    "T1_C10_Ownership Type_Formula" TEXT,
    "T1_C11_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C11_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C12_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C12_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C13_Remarks_Value" TEXT,
    "T1_C13_Remarks_Formula" TEXT
);
COPY temp.tmp_hospital_land_info_gh FROM '${csvDir_4_initail_data_load}/Hospital LAND Info/GH.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Hospital LAND Info / SSH
DROP TABLE IF EXISTS temp.tmp_hospital_land_info_ssh;
CREATE TABLE temp.tmp_hospital_land_info_ssh (
    "row_id" TEXT,
    "T1_C1_SN_Value" TEXT,
    "T1_C1_SN_Formula" TEXT,
    "T1_C2_List of Functional  Super Specialty Hospitals_Value" TEXT,
    "T1_C2_List of Functional  Super Specialty Hospitals_Formula" TEXT,
    "T1_C3_no_label_c_Value" TEXT,
    "T1_C3_no_label_c_Formula" TEXT,
    "T1_C4_no_label_d_Value" TEXT,
    "T1_C4_no_label_d_Formula" TEXT,
    "T1_C5_Property / Land Name and Address_Value" TEXT,
    "T1_C5_Property / Land Name and Address_Formula" TEXT,
    "T1_C6_Pin Code_Value" TEXT,
    "T1_C6_Pin Code_Formula" TEXT,
    "T1_C7_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C7_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C9_Ownership Type_Value" TEXT,
    "T1_C9_Ownership Type_Formula" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C12_Remarks_Value" TEXT,
    "T1_C12_Remarks_Formula" TEXT
);
COPY temp.tmp_hospital_land_info_ssh FROM '${csvDir_4_initail_data_load}/Hospital LAND Info/SSH.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Hospital LAND Info / SDH-100
DROP TABLE IF EXISTS temp.tmp_hospital_land_info_sdh_100;
CREATE TABLE temp.tmp_hospital_land_info_sdh_100 (
    "row_id" TEXT,
    "T1_C1_SN_Value" TEXT,
    "T1_C1_SN_Formula" TEXT,
    "T1_C2_List of Functional  SDH - 100s_Value" TEXT,
    "T1_C2_List of Functional  SDH - 100s_Formula" TEXT,
    "T1_C3_no_label_c_Value" TEXT,
    "T1_C3_no_label_c_Formula" TEXT,
    "T1_C4_no_label_d_Value" TEXT,
    "T1_C4_no_label_d_Formula" TEXT,
    "T1_C5_no_label_e_Value" TEXT,
    "T1_C5_no_label_e_Formula" TEXT,
    "T1_C6_no_label_f_Value" TEXT,
    "T1_C6_no_label_f_Formula" TEXT,
    "T1_C7_no_label_g_Value" TEXT,
    "T1_C7_no_label_g_Formula" TEXT,
    "T1_C8_Property / Land Name and Address_Value" TEXT,
    "T1_C8_Property / Land Name and Address_Formula" TEXT,
    "T1_C9_Pin Code_Value" TEXT,
    "T1_C9_Pin Code_Formula" TEXT,
    "T1_C10_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C10_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C11_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C11_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C12_Ownership Type_Value" TEXT,
    "T1_C12_Ownership Type_Formula" TEXT,
    "T1_C13_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C13_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C14_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C14_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C15_Remarks_Value" TEXT,
    "T1_C15_Remarks_Formula" TEXT
);
COPY temp.tmp_hospital_land_info_sdh_100 FROM '${csvDir_4_initail_data_load}/Hospital LAND Info/SDH-100.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Hospital LAND Info / SDH-50
DROP TABLE IF EXISTS temp.tmp_hospital_land_info_sdh_50;
CREATE TABLE temp.tmp_hospital_land_info_sdh_50 (
    "row_id" TEXT,
    "T1_C1_SN_Value" TEXT,
    "T1_C1_SN_Formula" TEXT,
    "T1_C2_List of Functional  SDH-50_Value" TEXT,
    "T1_C2_List of Functional  SDH-50_Formula" TEXT,
    "T1_C3_no_label_c_Value" TEXT,
    "T1_C3_no_label_c_Formula" TEXT,
    "T1_C4_no_label_d_Value" TEXT,
    "T1_C4_no_label_d_Formula" TEXT,
    "T1_C5_Property / Land Name and Address_Value" TEXT,
    "T1_C5_Property / Land Name and Address_Formula" TEXT,
    "T1_C6_Pin Code_Value" TEXT,
    "T1_C6_Pin Code_Formula" TEXT,
    "T1_C7_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C7_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C9_Ownership Type_Value" TEXT,
    "T1_C9_Ownership Type_Formula" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C12_Remarks_Value" TEXT,
    "T1_C12_Remarks_Formula" TEXT
);
COPY temp.tmp_hospital_land_info_sdh_50 FROM '${csvDir_4_initail_data_load}/Hospital LAND Info/SDH-50.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Hospital LAND Info / RH
DROP TABLE IF EXISTS temp.tmp_hospital_land_info_rh;
CREATE TABLE temp.tmp_hospital_land_info_rh (
    "row_id" TEXT,
    "T1_C1_Sr. No_Value" TEXT,
    "T1_C1_Sr. No_Formula" TEXT,
    "T1_C2_List of Functional RH (Funcing RH) | Circle Name_Value" TEXT,
    "T1_C2_List of Functional RH (Funcing RH) | Circle Name_Formula" TEXT,
    "T1_C3_List of Functional RH (Funcing RH) | Dist_Name_Value" TEXT,
    "T1_C3_List of Functional RH (Funcing RH) | Dist_Name_Formula" TEXT,
    "T1_C4_List of Functional RH (Funcing RH) | Taluka Name_Value" TEXT,
    "T1_C4_List of Functional RH (Funcing RH) | Taluka Name_Formula" TEXT,
    "T1_C5_List of Functional RH (Funcing RH) | Funcing RH_Value" TEXT,
    "T1_C5_List of Functional RH (Funcing RH) | Funcing RH_Formula" TEXT,
    "T1_C6_VC Setup (Yes/No)(Computer,Web Camera,Mice,Speaker etc)_Value" TEXT,
    "T1_C6_VC Setup (Yes/No)(Computer,Web Camera,Mice,Speaker etc)_Formula" TEXT,
    "T1_C7_Remarks | Remarks_Value" TEXT,
    "T1_C7_Remarks | Remarks_Formula" TEXT,
    "T1_C8_Property / Land Name and Address_Value" TEXT,
    "T1_C8_Property / Land Name and Address_Formula" TEXT,
    "T1_C9_Pin Code_Value" TEXT,
    "T1_C9_Pin Code_Formula" TEXT,
    "T1_C10_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C10_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C11_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C11_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C12_Ownership Type_Value" TEXT,
    "T1_C12_Ownership Type_Formula" TEXT,
    "T1_C13_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C13_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C14_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C14_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C15_Remarks_Value" TEXT,
    "T1_C15_Remarks_Formula" TEXT
);
COPY temp.tmp_hospital_land_info_rh FROM '${csvDir_4_initail_data_load}/Hospital LAND Info/RH.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Hospital LAND Info / WH
DROP TABLE IF EXISTS temp.tmp_hospital_land_info_wh;
CREATE TABLE temp.tmp_hospital_land_info_wh (
    "row_id" TEXT,
    "T1_C1_SN_Value" TEXT,
    "T1_C1_SN_Formula" TEXT,
    "T1_C2_List of Functional  Women Hospitals_Value" TEXT,
    "T1_C2_List of Functional  Women Hospitals_Formula" TEXT,
    "T1_C3_Property / Land Name and Address_Value" TEXT,
    "T1_C3_Property / Land Name and Address_Formula" TEXT,
    "T1_C4_Pin Code_Value" TEXT,
    "T1_C4_Pin Code_Formula" TEXT,
    "T1_C5_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C5_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C6_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C6_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C7_Ownership Type_Value" TEXT,
    "T1_C7_Ownership Type_Formula" TEXT,
    "T1_C8_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C8_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C9_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C9_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C10_Remarks_Value" TEXT,
    "T1_C10_Remarks_Formula" TEXT
);
COPY temp.tmp_hospital_land_info_wh FROM '${csvDir_4_initail_data_load}/Hospital LAND Info/WH.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Hospital LAND Info / RMH
DROP TABLE IF EXISTS temp.tmp_hospital_land_info_rmh;
CREATE TABLE temp.tmp_hospital_land_info_rmh (
    "row_id" TEXT,
    "T1_C1_SN_Value" TEXT,
    "T1_C1_SN_Formula" TEXT,
    "T1_C2_List of Functional  Women Hospitals_Value" TEXT,
    "T1_C2_List of Functional  Women Hospitals_Formula" TEXT,
    "T1_C3_Property / Land Name and Address_Value" TEXT,
    "T1_C3_Property / Land Name and Address_Formula" TEXT,
    "T1_C4_Pin Code_Value" TEXT,
    "T1_C4_Pin Code_Formula" TEXT,
    "T1_C5_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C5_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C6_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C6_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C7_Ownership Type_Value" TEXT,
    "T1_C7_Ownership Type_Formula" TEXT,
    "T1_C8_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C8_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C9_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C9_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C10_Remarks_Value" TEXT,
    "T1_C10_Remarks_Formula" TEXT
);
COPY temp.tmp_hospital_land_info_rmh FROM '${csvDir_4_initail_data_load}/Hospital LAND Info/RMH.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Offices LAND Info / DH RAIGAD
DROP TABLE IF EXISTS temp.tmp_offices_land_info_dh_raigad;
CREATE TABLE temp.tmp_offices_land_info_dh_raigad (
    "row_id" TEXT,
    "T1_C1_Sr. No_Value" TEXT,
    "T1_C1_Sr. No_Formula" TEXT,
    "T1_C2_District_Value" TEXT,
    "T1_C2_District_Formula" TEXT,
    "T1_C3_Taluka_Value" TEXT,
    "T1_C3_Taluka_Formula" TEXT,
    "T1_C4_Offices Name_Value" TEXT,
    "T1_C4_Offices Name_Formula" TEXT,
    "T1_C5_Property / Land Name and Address_Value" TEXT,
    "T1_C5_Property / Land Name and Address_Formula" TEXT,
    "T1_C6_Pin Code_Value" TEXT,
    "T1_C6_Pin Code_Formula" TEXT,
    "T1_C7_Survey No. /  Gat No. / CTS No._Value" TEXT,
    "T1_C7_Survey No. /  Gat No. / CTS No._Formula" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C9_Ownership Type_Value" TEXT,
    "T1_C9_Ownership Type_Formula" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C12_Remarks_Value" TEXT,
    "T1_C12_Remarks_Formula" TEXT
);
COPY temp.tmp_offices_land_info_dh_raigad FROM '${csvDir_4_initail_data_load}/Offices LAND Info/DH RAIGAD.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Offices LAND Info / Ramtek
DROP TABLE IF EXISTS temp.tmp_offices_land_info_ramtek;
CREATE TABLE temp.tmp_offices_land_info_ramtek (
    "row_id" TEXT,
    "T1_C1_Sr. No_Value" TEXT,
    "T1_C1_Sr. No_Formula" TEXT,
    "T1_C2_District_Value" TEXT,
    "T1_C2_District_Formula" TEXT,
    "T1_C3_Taluka_Value" TEXT,
    "T1_C3_Taluka_Formula" TEXT,
    "T1_C4_Offices Name_Value" TEXT,
    "T1_C4_Offices Name_Formula" TEXT,
    "T1_C5_Property / Land Name and Address_Value" TEXT,
    "T1_C5_Property / Land Name and Address_Formula" TEXT,
    "T1_C6_Pin Code_Value" TEXT,
    "T1_C6_Pin Code_Formula" TEXT,
    "T1_C7_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C7_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C9_Ownership Type_Value" TEXT,
    "T1_C9_Ownership Type_Formula" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C12_Remarks_Value" TEXT,
    "T1_C12_Remarks_Formula" TEXT,
    "T2_C1_Sr. No_Value" TEXT,
    "T2_C1_Sr. No_Formula" TEXT,
    "T2_C2_District_Value" TEXT,
    "T2_C2_District_Formula" TEXT,
    "T2_C3_Taluka_Value" TEXT,
    "T2_C3_Taluka_Formula" TEXT,
    "T2_C4_Offices Name_Value" TEXT,
    "T2_C4_Offices Name_Formula" TEXT,
    "T2_C5_Property / Land Name and Address_Value" TEXT,
    "T2_C5_Property / Land Name and Address_Formula" TEXT,
    "T2_C6_Pin Code_Value" TEXT,
    "T2_C6_Pin Code_Formula" TEXT,
    "T2_C7_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T2_C7_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T2_C8_Total Land Area (Sq.M)_Value" TEXT,
    "T2_C8_Total Land Area (Sq.M)_Formula" TEXT,
    "T2_C9_Ownership Type_Value" TEXT,
    "T2_C9_Ownership Type_Formula" TEXT,
    "T2_C10_Ownership Document Available (Yes/No)_Value" TEXT,
    "T2_C10_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T2_C11_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T2_C11_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T2_C12_Remarks_Value" TEXT,
    "T2_C12_Remarks_Formula" TEXT,
    "T3_C1_Sr. No_Value" TEXT,
    "T3_C1_Sr. No_Formula" TEXT,
    "T3_C2_District_Value" TEXT,
    "T3_C2_District_Formula" TEXT,
    "T3_C3_Taluka_Value" TEXT,
    "T3_C3_Taluka_Formula" TEXT,
    "T3_C4_Offices Name_Value" TEXT,
    "T3_C4_Offices Name_Formula" TEXT,
    "T3_C5_Property / Land Name and Address_Value" TEXT,
    "T3_C5_Property / Land Name and Address_Formula" TEXT,
    "T3_C6_Pin Code_Value" TEXT,
    "T3_C6_Pin Code_Formula" TEXT,
    "T3_C7_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T3_C7_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T3_C8_Total Land Area (Sq.M)_Value" TEXT,
    "T3_C8_Total Land Area (Sq.M)_Formula" TEXT,
    "T3_C9_Ownership Type_Value" TEXT,
    "T3_C9_Ownership Type_Formula" TEXT,
    "T3_C10_Ownership Document Available (Yes/No)_Value" TEXT,
    "T3_C10_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T3_C11_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T3_C11_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T3_C12_no_label_l_Value" TEXT,
    "T3_C12_no_label_l_Formula" TEXT
);
COPY temp.tmp_offices_land_info_ramtek FROM '${csvDir_4_initail_data_load}/Offices LAND Info/Ramtek.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Offices LAND Info / Offices by District
DROP TABLE IF EXISTS temp.tmp_offices_land_info_offices_by_district;
CREATE TABLE temp.tmp_offices_land_info_offices_by_district (
    "row_id" TEXT,
    "T1_C1_Sr. No_Value" TEXT,
    "T1_C1_Sr. No_Formula" TEXT,
    "T1_C2_District_Value" TEXT,
    "T1_C2_District_Formula" TEXT,
    "T1_C3_Offices Name_Value" TEXT,
    "T1_C3_Offices Name_Formula" TEXT,
    "T1_C4_Property / Land Name and Address_Value" TEXT,
    "T1_C4_Property / Land Name and Address_Formula" TEXT,
    "T1_C5_Pin Code_Value" TEXT,
    "T1_C5_Pin Code_Formula" TEXT,
    "T1_C6_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C6_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C7_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C7_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C8_Ownership Type_Value" TEXT,
    "T1_C8_Ownership Type_Formula" TEXT,
    "T1_C9_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C9_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C10_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C10_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C11_Remarks_Value" TEXT,
    "T1_C11_Remarks_Formula" TEXT,
    "T1_C12_no_label_l_Value" TEXT,
    "T1_C12_no_label_l_Formula" TEXT,
    "T2_C1_1_Value" TEXT,
    "T2_C1_1_Formula" TEXT,
    "T2_C2_Thane_Value" TEXT,
    "T2_C2_Thane_Formula" TEXT,
    "T2_C3_Ambarnath_Value" TEXT,
    "T2_C3_Ambarnath_Formula" TEXT,
    "T2_C4_Medical Officer, PHC Badlapur_Value" TEXT,
    "T2_C4_Medical Officer, PHC Badlapur_Formula" TEXT,
    "T2_C5_Primary Health Center Badlapur_Value" TEXT,
    "T2_C5_Primary Health Center Badlapur_Formula" TEXT,
    "T2_C6_421503_Value" TEXT,
    "T2_C6_421503_Formula" TEXT,
    "T2_C7_169_Value" TEXT,
    "T2_C7_169_Formula" TEXT,
    "T2_C8_237 Sq.M._Value" TEXT,
    "T2_C8_237 Sq.M._Formula" TEXT,
    "T2_C9_Government_Value" TEXT,
    "T2_C9_Government_Formula" TEXT,
    "T2_C10_YES_Value" TEXT,
    "T2_C10_YES_Formula" TEXT,
    "T2_C11_Dr. Ashwini Vane_Value" TEXT,
    "T2_C11_Dr. Ashwini Vane_Formula" TEXT,
    "T2_C12_9004424091_Value" TEXT,
    "T2_C12_9004424091_Formula" TEXT
);
COPY temp.tmp_offices_land_info_offices_by_district FROM '${csvDir_4_initail_data_load}/Offices LAND Info/Offices by District.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- PHC LAND Info / PHC
DROP TABLE IF EXISTS temp.tmp_phc_land_info_phc;
CREATE TABLE temp.tmp_phc_land_info_phc (
    "row_id" TEXT,
    "T1_C1_Sr. No_Value" TEXT,
    "T1_C1_Sr. No_Formula" TEXT,
    "T1_C2_District Name_Value" TEXT,
    "T1_C2_District Name_Formula" TEXT,
    "T1_C3_Taluka Name_Value" TEXT,
    "T1_C3_Taluka Name_Formula" TEXT,
    "T1_C4_PHC_Value" TEXT,
    "T1_C4_PHC_Formula" TEXT,
    "T1_C5_Property / Land Name and Address_Value" TEXT,
    "T1_C5_Property / Land Name and Address_Formula" TEXT,
    "T1_C6_Pin Code_Value" TEXT,
    "T1_C6_Pin Code_Formula" TEXT,
    "T1_C7_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C7_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C9_Ownership Type_Value" TEXT,
    "T1_C9_Ownership Type_Formula" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C12_Remarks_Value" TEXT,
    "T1_C12_Remarks_Formula" TEXT,
    "T1_C13_no_label_m_Value" TEXT,
    "T1_C13_no_label_m_Formula" TEXT
);
COPY temp.tmp_phc_land_info_phc FROM '${csvDir_4_initail_data_load}/PHC LAND Info/PHC.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Sc Land Info / SC
DROP TABLE IF EXISTS temp.tmp_sc_land_info_sc;
CREATE TABLE temp.tmp_sc_land_info_sc (
    "row_id" TEXT,
    "T1_C1_Sr. No_Value" TEXT,
    "T1_C1_Sr. No_Formula" TEXT,
    "T1_C2_District Name _Value" TEXT,
    "T1_C2_District Name _Formula" TEXT,
    "T1_C3_Taluka Name_Value" TEXT,
    "T1_C3_Taluka Name_Formula" TEXT,
    "T1_C4_PHC_Value" TEXT,
    "T1_C4_PHC_Formula" TEXT,
    "T1_C5_SC_Value" TEXT,
    "T1_C5_SC_Formula" TEXT,
    "T1_C6_Property / Land Name and Address_Value" TEXT,
    "T1_C6_Property / Land Name and Address_Formula" TEXT,
    "T1_C7_Pin Code_Value" TEXT,
    "T1_C7_Pin Code_Formula" TEXT,
    "T1_C8_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C8_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C9_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C9_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C10_Ownership Type_Value" TEXT,
    "T1_C10_Ownership Type_Formula" TEXT,
    "T1_C11_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C11_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C12_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C12_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C13_Remarks_Value" TEXT,
    "T1_C13_Remarks_Formula" TEXT
);
COPY temp.tmp_sc_land_info_sc FROM '${csvDir_4_initail_data_load}/Sc Land Info/SC.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Urban Health land info / UCHC
DROP TABLE IF EXISTS temp.tmp_urban_health_land_info_uchc;
CREATE TABLE temp.tmp_urban_health_land_info_uchc (
    "row_id" TEXT,
    "T1_C1_Sr. No._Value" TEXT,
    "T1_C1_Sr. No._Formula" TEXT,
    "T1_C2_District Name_Value" TEXT,
    "T1_C2_District Name_Formula" TEXT,
    "T1_C3_ULB Name_Value" TEXT,
    "T1_C3_ULB Name_Formula" TEXT,
    "T1_C4_Facility Name_Value" TEXT,
    "T1_C4_Facility Name_Formula" TEXT,
    "T1_C5_Property / Land Name and Address_Value" TEXT,
    "T1_C5_Property / Land Name and Address_Formula" TEXT,
    "T1_C6_Pin Code_Value" TEXT,
    "T1_C6_Pin Code_Formula" TEXT,
    "T1_C7_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C7_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C8_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C9_Ownership Type_Value" TEXT,
    "T1_C9_Ownership Type_Formula" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C10_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C11_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C12_Remarks_Value" TEXT,
    "T1_C12_Remarks_Formula" TEXT,
    "T1_C13_no_label_m_Value" TEXT,
    "T1_C13_no_label_m_Formula" TEXT
);
COPY temp.tmp_urban_health_land_info_uchc FROM '${csvDir_4_initail_data_load}/Urban Health land info/UCHC.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Urban Health land info / 674 HBT
DROP TABLE IF EXISTS temp.tmp_urban_health_land_info_674_hbt;
CREATE TABLE temp.tmp_urban_health_land_info_674_hbt (
    "row_id" TEXT,
    "T1_C1_Sr.No_Value" TEXT,
    "T1_C1_Sr.No_Formula" TEXT,
    "T1_C2_Name of Districts_Value" TEXT,
    "T1_C2_Name of Districts_Formula" TEXT,
    "T1_C3_Name of Block_Value" TEXT,
    "T1_C3_Name of Block_Formula" TEXT,
    "T1_C4_Type of UHWC_Council/Nagarpanchayat/Cant_Board/Corp_Value" TEXT,
    "T1_C4_Type of UHWC_Council/Nagarpanchayat/Cant_Board/Corp_Formula" TEXT,
    "T1_C5_Name of HBT Aapla Dawakhana_Value" TEXT,
    "T1_C5_Name of HBT Aapla Dawakhana_Formula" TEXT,
    "T1_C6_Address Of HBT Aapla Dawakhana _Value" TEXT,
    "T1_C6_Address Of HBT Aapla Dawakhana _Formula" TEXT,
    "T1_C7_Property / Land Name and Address_Value" TEXT,
    "T1_C7_Property / Land Name and Address_Formula" TEXT,
    "T1_C8_Pin Code_Value" TEXT,
    "T1_C8_Pin Code_Formula" TEXT,
    "T1_C9_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C9_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C10_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C10_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C11_Ownership Type_Value" TEXT,
    "T1_C11_Ownership Type_Formula" TEXT,
    "T1_C12_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C12_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C13_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C13_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C14_Remarks_Value" TEXT,
    "T1_C14_Remarks_Formula" TEXT,
    "T1_C15_no_label_o_Value" TEXT,
    "T1_C15_no_label_o_Formula" TEXT
);
COPY temp.tmp_urban_health_land_info_674_hbt FROM '${csvDir_4_initail_data_load}/Urban Health land info/674 HBT.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Urban Health land info / UHWC
DROP TABLE IF EXISTS temp.tmp_urban_health_land_info_uhwc;
CREATE TABLE temp.tmp_urban_health_land_info_uhwc (
    "row_id" TEXT,
    "T1_C1_Sr.No._Value" TEXT,
    "T1_C1_Sr.No._Formula" TEXT,
    "T1_C2_Districts Name_Value" TEXT,
    "T1_C2_Districts Name_Formula" TEXT,
    "T1_C3_Name of Block_Value" TEXT,
    "T1_C3_Name of Block_Formula" TEXT,
    "T1_C4_Type of UHWC_Council/Nagarpanchayat/Cant_Board/Corp_Value" TEXT,
    "T1_C4_Type of UHWC_Council/Nagarpanchayat/Cant_Board/Corp_Formula" TEXT,
    "T1_C5_  Name of UHWC_Value" TEXT,
    "T1_C5_  Name of UHWC_Formula" TEXT,
    "T1_C6_Address of UHWC _Value" TEXT,
    "T1_C6_Address of UHWC _Formula" TEXT,
    "T1_C7_Property / Land Name and Address_Value" TEXT,
    "T1_C7_Property / Land Name and Address_Formula" TEXT,
    "T1_C8_Pin Code_Value" TEXT,
    "T1_C8_Pin Code_Formula" TEXT,
    "T1_C9_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C9_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C10_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C10_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C11_Ownership Type_Value" TEXT,
    "T1_C11_Ownership Type_Formula" TEXT,
    "T1_C12_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C12_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C13_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C13_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C14_Remarks_Value" TEXT,
    "T1_C14_Remarks_Formula" TEXT
);
COPY temp.tmp_urban_health_land_info_uhwc FROM '${csvDir_4_initail_data_load}/Urban Health land info/UHWC.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Urban Health land info / UPHC
DROP TABLE IF EXISTS temp.tmp_urban_health_land_info_uphc;
CREATE TABLE temp.tmp_urban_health_land_info_uphc (
    "row_id" TEXT,
    "T1_C1_Sr.No._Value" TEXT,
    "T1_C1_Sr.No._Formula" TEXT,
    "T1_C2_Circle Name _Value" TEXT,
    "T1_C2_Circle Name _Formula" TEXT,
    "T1_C3_District Name _Value" TEXT,
    "T1_C3_District Name _Formula" TEXT,
    "T1_C4_Sub District Name_Value" TEXT,
    "T1_C4_Sub District Name_Formula" TEXT,
    "T1_C5_Lb Name_Value" TEXT,
    "T1_C5_Lb Name_Formula" TEXT,
    "T1_C6_Facility Name_Value" TEXT,
    "T1_C6_Facility Name_Formula" TEXT,
    "T1_C7_Property / Land Name and Address_Value" TEXT,
    "T1_C7_Property / Land Name and Address_Formula" TEXT,
    "T1_C8_Pin Code_Value" TEXT,
    "T1_C8_Pin Code_Formula" TEXT,
    "T1_C9_Survey No. / Gat No. / CTS No._Value" TEXT,
    "T1_C9_Survey No. / Gat No. / CTS No._Formula" TEXT,
    "T1_C10_Total Land Area (Sq.M)_Value" TEXT,
    "T1_C10_Total Land Area (Sq.M)_Formula" TEXT,
    "T1_C11_Ownership Type_Value" TEXT,
    "T1_C11_Ownership Type_Formula" TEXT,
    "T1_C12_Ownership Document Available (Yes/No)_Value" TEXT,
    "T1_C12_Ownership Document Available (Yes/No)_Formula" TEXT,
    "T1_C13_Facility/Office Incharge Name and Contact_Value" TEXT,
    "T1_C13_Facility/Office Incharge Name and Contact_Formula" TEXT,
    "T1_C14_Remarks_Value" TEXT,
    "T1_C14_Remarks_Formula" TEXT
);
COPY temp.tmp_urban_health_land_info_uphc FROM '${csvDir_4_initail_data_load}/Urban Health land info/UPHC.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Staging is persistent in schema temp so insert_final.sql may be run separately.
commit;