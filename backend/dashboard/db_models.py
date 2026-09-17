import os

from dotenv import load_dotenv
from sqlalchemy import MetaData, create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import sessionmaker


load_dotenv()


DATABASE_URL = (
    f"postgresql+psycopg://"
    f"{os.getenv('POSTGRES_USER')}:"
    f"{os.getenv('POSTGRES_PASSWORD')}@"
    f"{os.getenv('POSTGRES_HOST', '127.0.0.1')}:"
    f"{os.getenv('POSTGRES_PORT', '5432')}/"
    f"{os.getenv('POSTGRES_DB')}"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

metadata = MetaData()

# Reflect the canonical application schemas only.
metadata.reflect(bind=engine, schema="ref")
metadata.reflect(bind=engine, schema="public")

Base = automap_base(metadata=metadata)
Base.prepare()


# Reference models
District = Base.classes.district
Taluka = Base.classes.taluka
FacilityType = Base.classes.facility_type
OwnershipType = Base.classes.ownership_type

# Application models
HealthFacility = Base.classes.health_facility
Office = Base.classes.office

# IPHS 2022 reference models.
# These become available after the IPHS Flyway migration creates the tables.
IPHSStandard = getattr(Base.classes, "iphs_standard", None)
IPHSFacility = getattr(Base.classes, "iphs_facility", None)
IPHSRequirement = getattr(Base.classes, "iphs_requirement", None)


SessionLocal = sessionmaker(bind=engine)
