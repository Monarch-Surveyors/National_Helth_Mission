# Current Database Model Reference

> Generated from the live PostgreSQL database using SQLAlchemy reflection.
> This file is a compact agent reference; it is not a migration history.

## Schemas

### `ref`

- `district`
- `facility_type`
- `iphs_facility`
- `iphs_requirement`
- `iphs_standard`
- `ownership_type`
- `taluka`

### `public`

- `flyway_schema_history`
- `health_facility`
- `office`

## Tables

### `public.flyway_schema_history`

| Column | Type | Nullable | PK | Default | Foreign Key |
|---|---|---|---|---|---|
| `installed_rank` | INTEGER | NO | YES |  |  |
| `version` | VARCHAR(50) | YES |  |  |  |
| `description` | VARCHAR(200) | NO |  |  |  |
| `type` | VARCHAR(20) | NO |  |  |  |
| `script` | VARCHAR(1000) | NO |  |  |  |
| `checksum` | INTEGER | YES |  |  |  |
| `installed_by` | VARCHAR(100) | NO |  |  |  |
| `installed_on` | TIMESTAMP | NO |  | now() |  |
| `execution_time` | INTEGER | NO |  |  |  |
| `success` | BOOLEAN | NO |  |  |  |

Constraints:

- `flyway_schema_history_pk`

Indexes:

| Index | Columns | Unique |
|---|---|---|
| `flyway_schema_history_s_idx` | `success` | NO |

#### SQLAlchemy-reflected CREATE TABLE

```sql

CREATE TABLE public.flyway_schema_history (
	installed_rank INTEGER NOT NULL, 
	version VARCHAR(50), 
	description VARCHAR(200) NOT NULL, 
	type VARCHAR(20) NOT NULL, 
	script VARCHAR(1000) NOT NULL, 
	checksum INTEGER, 
	installed_by VARCHAR(100) NOT NULL, 
	installed_on TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
	execution_time INTEGER NOT NULL, 
	success BOOLEAN NOT NULL, 
	CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank)
)
```

#### SQLAlchemy-reflected indexes

```sql
CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history (success);
```

### `public.health_facility`

| Column | Type | Nullable | PK | Default | Foreign Key |
|---|---|---|---|---|---|
| `id` | BIGINT | NO | YES | Identity(always=True, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1) |  |
| `facility_type_id` | BIGINT | YES |  |  | ref.facility_type.id |
| `source_sn` | TEXT | YES |  |  |  |
| `district_id` | BIGINT | YES |  |  | ref.district.id |
| `taluka_id` | BIGINT | YES |  |  | ref.taluka.id |
| `facility_name` | TEXT | YES |  |  |  |
| `hbt_name` | TEXT | YES |  |  |  |
| `hbt_address` | TEXT | YES |  |  |  |
| `uhwc_name` | TEXT | YES |  |  |  |
| `uhwc_address` | TEXT | YES |  |  |  |
| `ulb_name` | TEXT | YES |  |  |  |
| `ulb_type` | TEXT | YES |  |  |  |
| `block_name` | TEXT | YES |  |  |  |
| `circle_name` | TEXT | YES |  |  |  |
| `lb_name` | TEXT | YES |  |  |  |
| `sub_district_name` | TEXT | YES |  |  |  |
| `phc_name` | TEXT | YES |  |  |  |
| `property_land_address` | TEXT | YES |  |  |  |
| `pin_code` | TEXT | YES |  |  |  |
| `survey_gat_cts_no` | TEXT | YES |  |  |  |
| `total_land_area_sqm` | TEXT | YES |  |  |  |
| `ownership_type_id` | BIGINT | YES |  |  | ref.ownership_type.id |
| `ownership_doc_available` | TEXT | YES |  |  |  |
| `incharge_name_contact` | TEXT | YES |  |  |  |
| `remarks` | TEXT | YES |  |  |  |
| `vc_setup` | TEXT | YES |  |  |  |
| `remarks_1` | TEXT | YES |  |  |  |
| `no_label_c` | TEXT | YES |  |  |  |
| `no_label_d` | TEXT | YES |  |  |  |
| `no_label_e` | TEXT | YES |  |  |  |
| `no_label_f` | TEXT | YES |  |  |  |
| `no_label_g` | TEXT | YES |  |  |  |
| `no_label_m` | TEXT | YES |  |  |  |
| `no_label_o` | TEXT | YES |  |  |  |
| `source_workbook` | TEXT | YES |  |  |  |
| `source_worksheet` | TEXT | YES |  |  |  |
| `source_table_id` | TEXT | YES |  |  |  |
| `source_row_id` | TEXT | YES |  |  |  |
| `parsed_area_sqm` | NUMERIC | YES |  |  |  |
| `area_parse_status` | TEXT | YES |  |  |  |
| `area_parse_unit` | TEXT | YES |  |  |  |
| `area_parse_note` | TEXT | YES |  |  |  |

Constraints:

- `health_facility_district_id_fkey`
- `health_facility_facility_type_id_fkey`
- `health_facility_ownership_type_id_fkey`
- `health_facility_pkey`
- `health_facility_taluka_id_fkey`

Indexes:

| Index | Columns | Unique |
|---|---|---|
| `idx_health_facility_area_parse_status` | `area_parse_status` | NO |

#### SQLAlchemy-reflected CREATE TABLE

```sql

CREATE TABLE public.health_facility (
	id BIGINT GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 START WITH 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 NO CYCLE), 
	facility_type_id BIGINT, 
	source_sn TEXT, 
	district_id BIGINT, 
	taluka_id BIGINT, 
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
	ownership_type_id BIGINT, 
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
	source_row_id TEXT, 
	parsed_area_sqm NUMERIC, 
	area_parse_status TEXT, 
	area_parse_unit TEXT, 
	area_parse_note TEXT, 
	CONSTRAINT health_facility_pkey PRIMARY KEY (id), 
	CONSTRAINT health_facility_district_id_fkey FOREIGN KEY(district_id) REFERENCES ref.district (id), 
	CONSTRAINT health_facility_facility_type_id_fkey FOREIGN KEY(facility_type_id) REFERENCES ref.facility_type (id), 
	CONSTRAINT health_facility_ownership_type_id_fkey FOREIGN KEY(ownership_type_id) REFERENCES ref.ownership_type (id), 
	CONSTRAINT health_facility_taluka_id_fkey FOREIGN KEY(taluka_id) REFERENCES ref.taluka (id)
)
```

#### SQLAlchemy-reflected indexes

```sql
CREATE INDEX idx_health_facility_area_parse_status ON public.health_facility (area_parse_status);
```

### `public.office`

| Column | Type | Nullable | PK | Default | Foreign Key |
|---|---|---|---|---|---|
| `id` | BIGINT | NO | YES | Identity(always=True, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1) |  |
| `source_sn` | TEXT | YES |  |  |  |
| `district_id` | BIGINT | YES |  |  | ref.district.id |
| `taluka_id` | BIGINT | YES |  |  | ref.taluka.id |
| `office_name` | TEXT | YES |  |  |  |
| `facility_name` | TEXT | YES |  |  |  |
| `property_land_address` | TEXT | YES |  |  |  |
| `pin_code` | TEXT | YES |  |  |  |
| `survey_gat_cts_no` | TEXT | YES |  |  |  |
| `total_land_area_sqm` | TEXT | YES |  |  |  |
| `ownership_type_id` | BIGINT | YES |  |  | ref.ownership_type.id |
| `ownership_doc_available` | TEXT | YES |  |  |  |
| `incharge_name_contact` | TEXT | YES |  |  |  |
| `incharge_contact` | TEXT | YES |  |  |  |
| `remarks` | TEXT | YES |  |  |  |
| `no_label_l` | TEXT | YES |  |  |  |
| `source_workbook` | TEXT | YES |  |  |  |
| `source_worksheet` | TEXT | YES |  |  |  |
| `source_table_id` | TEXT | YES |  |  |  |
| `source_row_id` | TEXT | YES |  |  |  |
| `parsed_area_sqm` | NUMERIC | YES |  |  |  |
| `area_parse_status` | TEXT | YES |  |  |  |
| `area_parse_unit` | TEXT | YES |  |  |  |
| `area_parse_note` | TEXT | YES |  |  |  |

Constraints:

- `office_district_id_fkey`
- `office_ownership_type_id_fkey`
- `office_pkey`
- `office_taluka_id_fkey`

Indexes:

| Index | Columns | Unique |
|---|---|---|
| `idx_office_area_parse_status` | `area_parse_status` | NO |

#### SQLAlchemy-reflected CREATE TABLE

```sql

CREATE TABLE public.office (
	id BIGINT GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 START WITH 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 NO CYCLE), 
	source_sn TEXT, 
	district_id BIGINT, 
	taluka_id BIGINT, 
	office_name TEXT, 
	facility_name TEXT, 
	property_land_address TEXT, 
	pin_code TEXT, 
	survey_gat_cts_no TEXT, 
	total_land_area_sqm TEXT, 
	ownership_type_id BIGINT, 
	ownership_doc_available TEXT, 
	incharge_name_contact TEXT, 
	incharge_contact TEXT, 
	remarks TEXT, 
	no_label_l TEXT, 
	source_workbook TEXT, 
	source_worksheet TEXT, 
	source_table_id TEXT, 
	source_row_id TEXT, 
	parsed_area_sqm NUMERIC, 
	area_parse_status TEXT, 
	area_parse_unit TEXT, 
	area_parse_note TEXT, 
	CONSTRAINT office_pkey PRIMARY KEY (id), 
	CONSTRAINT office_district_id_fkey FOREIGN KEY(district_id) REFERENCES ref.district (id), 
	CONSTRAINT office_ownership_type_id_fkey FOREIGN KEY(ownership_type_id) REFERENCES ref.ownership_type (id), 
	CONSTRAINT office_taluka_id_fkey FOREIGN KEY(taluka_id) REFERENCES ref.taluka (id)
)
```

#### SQLAlchemy-reflected indexes

```sql
CREATE INDEX idx_office_area_parse_status ON public.office (area_parse_status);
```

### `ref.district`

| Column | Type | Nullable | PK | Default | Foreign Key |
|---|---|---|---|---|---|
| `id` | BIGINT | NO | YES | Identity(always=True, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1) |  |
| `name` | TEXT | NO |  |  |  |

Constraints:

- `district_name_key`
- `district_pkey`

#### SQLAlchemy-reflected CREATE TABLE

```sql

CREATE TABLE ref.district (
	id BIGINT GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 START WITH 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 NO CYCLE), 
	name TEXT NOT NULL, 
	CONSTRAINT district_pkey PRIMARY KEY (id), 
	CONSTRAINT district_name_key UNIQUE NULLS DISTINCT (name)
)
```

### `ref.facility_type`

| Column | Type | Nullable | PK | Default | Foreign Key |
|---|---|---|---|---|---|
| `id` | BIGINT | NO | YES | Identity(always=True, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1) |  |
| `code` | TEXT | NO |  |  |  |
| `label` | TEXT | NO |  |  |  |

Constraints:

- `facility_type_code_key`
- `facility_type_pkey`

#### SQLAlchemy-reflected CREATE TABLE

```sql

CREATE TABLE ref.facility_type (
	id BIGINT GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 START WITH 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 NO CYCLE), 
	code TEXT NOT NULL, 
	label TEXT NOT NULL, 
	CONSTRAINT facility_type_pkey PRIMARY KEY (id), 
	CONSTRAINT facility_type_code_key UNIQUE NULLS DISTINCT (code)
)
```

### `ref.iphs_facility`

| Column | Type | Nullable | PK | Default | Foreign Key |
|---|---|---|---|---|---|
| `id` | BIGINT | NO | YES | nextval('ref.iphs_facility_id_seq'::regclass) |  |
| `standard_id` | BIGINT | NO |  |  | ref.iphs_standard.id |
| `code` | TEXT | NO |  |  |  |
| `name` | TEXT | NO |  |  |  |
| `level` | TEXT | YES |  |  |  |
| `rural_urban` | TEXT | YES |  |  |  |
| `description` | TEXT | YES |  |  |  |

Constraints:

- `iphs_facility_pkey`
- `iphs_facility_standard_id_fkey`
- `uq_iphs_facility_standard_code`

Indexes:

| Index | Columns | Unique |
|---|---|---|
| `ix_iphs_facility_standard` | `standard_id` | NO |

#### SQLAlchemy-reflected CREATE TABLE

```sql

CREATE TABLE ref.iphs_facility (
	id BIGSERIAL NOT NULL, 
	standard_id BIGINT NOT NULL, 
	code TEXT NOT NULL, 
	name TEXT NOT NULL, 
	level TEXT, 
	rural_urban TEXT, 
	description TEXT, 
	CONSTRAINT iphs_facility_pkey PRIMARY KEY (id), 
	CONSTRAINT iphs_facility_standard_id_fkey FOREIGN KEY(standard_id) REFERENCES ref.iphs_standard (id) ON DELETE RESTRICT, 
	CONSTRAINT uq_iphs_facility_standard_code UNIQUE NULLS DISTINCT (standard_id, code)
)
```

#### SQLAlchemy-reflected indexes

```sql
CREATE INDEX ix_iphs_facility_standard ON ref.iphs_facility (standard_id);
```

### `ref.iphs_requirement`

| Column | Type | Nullable | PK | Default | Foreign Key |
|---|---|---|---|---|---|
| `id` | BIGINT | NO | YES | nextval('ref.iphs_requirement_id_seq'::regclass) |  |
| `standard_id` | BIGINT | NO |  |  | ref.iphs_standard.id |
| `facility_id` | BIGINT | NO |  |  | ref.iphs_facility.id |
| `category` | TEXT | NO |  |  |  |
| `subcategory` | TEXT | YES |  |  |  |
| `requirement_code` | TEXT | NO |  |  |  |
| `requirement_name` | TEXT | NO |  |  |  |
| `requirement_type` | TEXT | YES |  |  |  |
| `measurement_type` | TEXT | YES |  |  |  |
| `required_value` | NUMERIC | YES |  |  |  |
| `required_min` | NUMERIC | YES |  |  |  |
| `required_max` | NUMERIC | YES |  |  |  |
| `unit` | TEXT | YES |  |  |  |
| `applicability` | TEXT | YES |  |  |  |
| `condition` | TEXT | YES |  |  |  |
| `evaluability` | TEXT | NO |  | 'MISSING_PARAMETER'::text |  |
| `source_document` | TEXT | NO |  |  |  |
| `source_section` | TEXT | YES |  |  |  |
| `source_page` | TEXT | YES |  |  |  |
| `source_text` | TEXT | YES |  |  |  |

Constraints:

- `ck_iphs_requirement_evaluability`
- `ck_iphs_requirement_type`
- `iphs_requirement_facility_id_fkey`
- `iphs_requirement_pkey`
- `iphs_requirement_standard_id_fkey`
- `uq_iphs_requirement`

Indexes:

| Index | Columns | Unique |
|---|---|---|
| `ix_iphs_requirement_category` | `category` | NO |
| `ix_iphs_requirement_facility` | `facility_id` | NO |
| `ix_iphs_requirement_metric` | `requirement_code` | NO |

#### SQLAlchemy-reflected CREATE TABLE

```sql

CREATE TABLE ref.iphs_requirement (
	id BIGSERIAL NOT NULL, 
	standard_id BIGINT NOT NULL, 
	facility_id BIGINT NOT NULL, 
	category TEXT NOT NULL, 
	subcategory TEXT, 
	requirement_code TEXT NOT NULL, 
	requirement_name TEXT NOT NULL, 
	requirement_type TEXT, 
	measurement_type TEXT, 
	required_value NUMERIC, 
	required_min NUMERIC, 
	required_max NUMERIC, 
	unit TEXT, 
	applicability TEXT, 
	condition TEXT, 
	evaluability TEXT DEFAULT 'MISSING_PARAMETER'::text NOT NULL, 
	source_document TEXT NOT NULL, 
	source_section TEXT, 
	source_page TEXT, 
	source_text TEXT, 
	CONSTRAINT iphs_requirement_pkey PRIMARY KEY (id), 
	CONSTRAINT iphs_requirement_facility_id_fkey FOREIGN KEY(facility_id) REFERENCES ref.iphs_facility (id) ON DELETE RESTRICT, 
	CONSTRAINT iphs_requirement_standard_id_fkey FOREIGN KEY(standard_id) REFERENCES ref.iphs_standard (id) ON DELETE RESTRICT, 
	CONSTRAINT uq_iphs_requirement UNIQUE NULLS DISTINCT (standard_id, facility_id, requirement_code), 
	CONSTRAINT ck_iphs_requirement_evaluability CHECK (evaluability = ANY (ARRAY['SUPPORTED'::text, 'PARTIAL'::text, 'MISSING_PARAMETER'::text])), 
	CONSTRAINT ck_iphs_requirement_type CHECK (requirement_type IS NULL OR (requirement_type = ANY (ARRAY['ESSENTIAL'::text, 'DESIRABLE'::text, 'REFERENCE'::text])))
)
```

#### SQLAlchemy-reflected indexes

```sql
CREATE INDEX ix_iphs_requirement_category ON ref.iphs_requirement (category);
CREATE INDEX ix_iphs_requirement_facility ON ref.iphs_requirement (facility_id);
CREATE INDEX ix_iphs_requirement_metric ON ref.iphs_requirement (requirement_code);
```

### `ref.iphs_standard`

| Column | Type | Nullable | PK | Default | Foreign Key |
|---|---|---|---|---|---|
| `id` | BIGINT | NO | YES | nextval('ref.iphs_standard_id_seq'::regclass) |  |
| `code` | TEXT | NO |  |  |  |
| `name` | TEXT | NO |  |  |  |
| `version` | TEXT | NO |  |  |  |
| `description` | TEXT | YES |  |  |  |
| `source_url` | TEXT | NO |  |  |  |
| `created_at` | TIMESTAMP | NO |  | CURRENT_TIMESTAMP |  |

Constraints:

- `iphs_standard_pkey`
- `uq_iphs_standard_code_version`

#### SQLAlchemy-reflected CREATE TABLE

```sql

CREATE TABLE ref.iphs_standard (
	id BIGSERIAL NOT NULL, 
	code TEXT NOT NULL, 
	name TEXT NOT NULL, 
	version TEXT NOT NULL, 
	description TEXT, 
	source_url TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, 
	CONSTRAINT iphs_standard_pkey PRIMARY KEY (id), 
	CONSTRAINT uq_iphs_standard_code_version UNIQUE NULLS DISTINCT (code, version)
)
```

### `ref.ownership_type`

| Column | Type | Nullable | PK | Default | Foreign Key |
|---|---|---|---|---|---|
| `id` | BIGINT | NO | YES | Identity(always=True, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1) |  |
| `label` | TEXT | NO |  |  |  |

Constraints:

- `ownership_type_label_key`
- `ownership_type_pkey`

#### SQLAlchemy-reflected CREATE TABLE

```sql

CREATE TABLE ref.ownership_type (
	id BIGINT GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 START WITH 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 NO CYCLE), 
	label TEXT NOT NULL, 
	CONSTRAINT ownership_type_pkey PRIMARY KEY (id), 
	CONSTRAINT ownership_type_label_key UNIQUE NULLS DISTINCT (label)
)
```

### `ref.taluka`

| Column | Type | Nullable | PK | Default | Foreign Key |
|---|---|---|---|---|---|
| `id` | BIGINT | NO | YES | Identity(always=True, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1) |  |
| `district_id` | BIGINT | YES |  |  | ref.district.id |
| `name` | TEXT | NO |  |  |  |

Constraints:

- `taluka_district_id_fkey`
- `taluka_district_id_name_key`
- `taluka_pkey`

#### SQLAlchemy-reflected CREATE TABLE

```sql

CREATE TABLE ref.taluka (
	id BIGINT GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 START WITH 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 NO CYCLE), 
	district_id BIGINT, 
	name TEXT NOT NULL, 
	CONSTRAINT taluka_pkey PRIMARY KEY (id), 
	CONSTRAINT taluka_district_id_fkey FOREIGN KEY(district_id) REFERENCES ref.district (id), 
	CONSTRAINT taluka_district_id_name_key UNIQUE NULLS DISTINCT (district_id, name)
)
```
