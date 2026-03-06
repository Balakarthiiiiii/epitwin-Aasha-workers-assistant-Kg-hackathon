# =============================================================================
# EpiTwin — models.py
# All SQLAlchemy models — updated with new symptom fields
# =============================================================================

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


# =============================================================================
# VALID SYMPTOMS LIST — single source of truth used by models + API validation
# =============================================================================

VALID_SYMPTOMS = [
    # Original communicable symptoms
    "Fever",
    "Cough",
    "Diarrhea",
    "Rash",
    "Vomiting",
    "Jaundice",
    # New additions — Tamil Nadu specific
    "Dengue",
    "Malaria",
    "Typhoid",
    "Cholera",
    "Chikungunya",
    "Leptospirosis",
    "Measles",
    "Chickenpox",
    "Conjunctivitis",
    "Acute Respiratory Infection",
    "Pneumonia",
    "Scrub Typhus",
    "Hand Foot Mouth Disease",
]

# High risk symptoms — used by AI label function
HIGH_RISK_SYMPTOMS = [
    "Fever", "Diarrhea", "Jaundice", "Cholera",
    "Typhoid", "Dengue", "Malaria", "Leptospirosis",
    "Pneumonia", "Scrub Typhus",
]

# NCD conditions — used by /check-scheme endpoint
VALID_NCD_CONDITIONS = [
    "Severe Diabetes",
    "Type 2 Diabetes",
    "Gestational Diabetes",
    "Hypertension",
    "Heart Disease",
    "Cancer",
    "Kidney Disease",
    "Stroke",
    "Chronic Obstructive Pulmonary Disease (COPD)",
    "Asthma",
    "Sickle Cell Anemia",
    "Thalassemia",
    "Epilepsy",
    "Depression / Mental Illness",
    "Malnutrition",
    "Tuberculosis",
    "Leprosy",
    "Blindness / Low Vision",
    "Deafness",
]


# =============================================================================
# TABLE 1 — Village
# =============================================================================

class Village(Base):
    __tablename__ = "villages"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    district     = Column(String, nullable=False)
    latitude     = Column(Float, nullable=False)    # For Leaflet map pins
    longitude    = Column(Float, nullable=False)    # For Leaflet map pins
    population   = Column(Integer)

    symptom_logs = relationship("SymptomLog", back_populates="village")
    ncd_patients = relationship("NCDPatient",  back_populates="village")


# =============================================================================
# TABLE 2 — AshaWorker
# =============================================================================

class AshaWorker(Base):
    __tablename__ = "asha_workers"

    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)          # bcrypt hashed
    full_name     = Column(String)
    village_id    = Column(Integer, ForeignKey("villages.id"))
    language_pref = Column(String, default="en")            # "en" or "ta"

    village      = relationship("Village")
    symptom_logs = relationship("SymptomLog", back_populates="asha_worker")
    ncd_patients = relationship("NCDPatient",  back_populates="asha_worker")


# =============================================================================
# TABLE 3 — SymptomLog (updated with new fields)
# =============================================================================

class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id                   = Column(Integer, primary_key=True, index=True)
    village_id           = Column(Integer, ForeignKey("villages.id"),    nullable=False)
    asha_worker_id       = Column(Integer, ForeignKey("asha_workers.id"), nullable=False)

    # --- Patient demographics ---
    patient_age          = Column(Integer)
    patient_gender       = Column(String)

    # --- Symptom details ---
    symptom              = Column(String, nullable=False)   # From VALID_SYMPTOMS list
    severity             = Column(Integer, default=1)       # 1=Mild 2=Moderate 3=Severe
    duration_days        = Column(Integer, default=1)       # How many days symptomatic

    # --- High risk group flags ---
    is_child_under_5     = Column(Boolean, default=False)   # High risk group
    is_pregnant_woman    = Column(Boolean, default=False)   # High risk group
    is_elderly_above_60  = Column(Boolean, default=False)   # High risk group

    # --- Epidemiological context ---
    cases_last_7_days    = Column(Integer, default=1)
    household_size       = Column(Integer, default=4)       # Spread risk
    has_travel_history   = Column(Boolean, default=False)   # Imported case flag
    vaccination_status   = Column(String, default="unknown") # vaccinated/unvaccinated/unknown
    referred_to_hospital = Column(Boolean, default=False)   # Did ASHA refer to hospital?

    # --- Environmental factors ---
    avg_temperature_c    = Column(Float, default=32.0)
    humidity_percent     = Column(Float, default=70.0)
    season               = Column(Integer, default=0)       # 0=Summer 1=SW Monsoon 2=NE Monsoon 3=Winter
    water_source_risk    = Column(Integer, default=0)       # 0=Safe 1=Unsafe

    # --- Metadata ---
    logged_at            = Column(DateTime, default=datetime.utcnow)
    synced_from_offline  = Column(Boolean, default=False)   # From Indhu's offline queue

    # --- AI outputs (written by Neeraj's model via Bala's inference) ---
    risk_score           = Column(Float,  nullable=True)    # 0.2=Low 0.6=Medium 1.0=High
    risk_label           = Column(String, nullable=True)    # "Low" / "Medium" / "High"
    ai_explanation       = Column(Text,   nullable=True)    # JSON for Sagana's XAI popup

    village      = relationship("Village",    back_populates="symptom_logs")
    asha_worker  = relationship("AshaWorker", back_populates="symptom_logs")


# =============================================================================
# TABLE 4 — GovernmentScheme
# =============================================================================

class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id                = Column(Integer, primary_key=True, index=True)
    name              = Column(String, nullable=False)
    description       = Column(Text)
    eligible_diseases = Column(String)      # comma-separated: "diabetes,hypertension"
    income_threshold  = Column(Float)       # Annual income ceiling in INR
    state_specific    = Column(String, nullable=True)   # "Tamil Nadu" or NULL=national


# =============================================================================
# TABLE 5 — NCDPatient
# =============================================================================

class NCDPatient(Base):
    __tablename__ = "ncd_patients"

    id              = Column(Integer, primary_key=True, index=True)
    village_id      = Column(Integer, ForeignKey("villages.id"))
    asha_worker_id  = Column(Integer, ForeignKey("asha_workers.id"))
    full_name       = Column(String)
    age             = Column(Integer)
    condition       = Column(String)        # From VALID_NCD_CONDITIONS
    annual_income   = Column(Float)
    enrolled_scheme = Column(String, nullable=True)     # Populated after /check-scheme
    logged_at       = Column(DateTime, default=datetime.utcnow)

    village     = relationship("Village",    back_populates="ncd_patients")
    asha_worker = relationship("AshaWorker", back_populates="ncd_patients")