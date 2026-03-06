# =============================================================================
# EpiTwin — database.py
# SQLAlchemy engine, session, and Base for all models
# =============================================================================

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite file will be created in the same directory as main.py
DATABASE_URL = "sqlite:///./epitwin.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite + FastAPI
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# -----------------------------------------------------------------------------
# Dependency — use this in every FastAPI route that needs a DB session
# -----------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()