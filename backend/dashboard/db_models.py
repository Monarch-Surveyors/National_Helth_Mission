import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData
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

engine = create_engine(DATABASE_URL)

metadata = MetaData()

# Read the actual PostgreSQL schemas
metadata.reflect(
    bind=engine,
    schema="ref",
)

metadata.reflect(
    bind=engine,
    schema="public",
)

# Generate ORM classes automatically
Base = automap_base(metadata=metadata)
Base.prepare()

# Expose the generated classes
District = Base.classes.district
Taluka = Base.classes.taluka
FacilityType = Base.classes.facility_type
OwnershipType = Base.classes.ownership_type

HealthFacility = Base.classes.health_facility
Office = Base.classes.office



SessionLocal = sessionmaker(bind=engine)