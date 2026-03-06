# =============================================================================
# EpiTwin — main.py
# FastAPI Backend — All endpoints for the EpiTwin platform
# Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# =============================================================================
# =============================================================================
# EpiTwin — main.py
# FastAPI Backend — updated with new symptoms, new fields, new schemes
# Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# =============================================================================

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from datetime import datetime, timedelta
from typing import Optional, List
import joblib
import json
import numpy as np

from database import Base, engine, get_db
from model import (
    Village, AshaWorker, SymptomLog, GovernmentScheme, NCDPatient,
    VALID_SYMPTOMS, HIGH_RISK_SYMPTOMS, VALID_NCD_CONDITIONS
)

# =============================================================================
# SECTION 1 — CREATE ALL TABLES
# =============================================================================

Base.metadata.create_all(bind=engine)

# =============================================================================
# SECTION 2 — PASSWORD HASHING
# =============================================================================

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    USE_BCRYPT = True
except ImportError:
    import hashlib, os
    USE_BCRYPT = False
    print("⚠️  passlib not found — using hashlib fallback. Run: pip install passlib[bcrypt]")


def hash_password(password: str) -> str:
    if USE_BCRYPT:
        return pwd_context.hash(password)
    import hashlib, os
    salt = os.urandom(16).hex()
    hashed = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{hashed}"


def verify_password(plain: str, hashed: str) -> bool:
    if USE_BCRYPT:
        return pwd_context.verify(plain, hashed)
    import hashlib
    try:
        salt, stored_hash = hashed.split(":")
        return hashlib.sha256((salt + plain).encode()).hexdigest() == stored_hash
    except Exception:
        return False

# =============================================================================
# SECTION 3 — LOAD AI MODEL ARTIFACTS
# =============================================================================

try:
    model      = joblib.load("epitwin_model.pkl")
    le_symptom = joblib.load("le_symptom.pkl")
    le_season  = joblib.load("le_season.pkl")
    le_label   = joblib.load("le_label.pkl")
    with open("feature_importance.json") as f:
        feature_importance = json.load(f)
    print("✅ AI model loaded successfully.")
    MODEL_LOADED = True
except Exception as e:
    print(f"⚠️  AI model not found: {e}. Run train_model.py first.")
    MODEL_LOADED = False

# =============================================================================
# SECTION 4 — PYDANTIC SCHEMAS
# =============================================================================

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success:       bool
    worker_id:     int
    full_name:     str
    village_id:    int
    village_name:  str
    language_pref: str
    message:       str


class SymptomLogRequest(BaseModel):
    asha_worker_id:      int
    village_id:          int
    patient_age:         Optional[int]   = None
    patient_gender:      Optional[str]   = None
    symptom:             str
    severity:            int             = 1       # 1=Mild 2=Moderate 3=Severe
    duration_days:       int             = 1
    is_child_under_5:    bool            = False
    is_pregnant_woman:   bool            = False
    is_elderly_above_60: bool            = False
    cases_last_7_days:   int             = 1
    household_size:      int             = 4
    has_travel_history:  bool            = False
    vaccination_status:  str             = "unknown"
    referred_to_hospital: bool           = False
    avg_temperature_c:   float           = 32.0
    humidity_percent:    float           = 70.0
    season:              int             = 0
    water_source_risk:   int             = 0
    synced_from_offline: bool            = False

    @validator("symptom")
    def symptom_must_be_valid(cls, v):
        if v not in VALID_SYMPTOMS:
            raise ValueError(
                f"Invalid symptom '{v}'. Must be one of: {VALID_SYMPTOMS}"
            )
        return v

    @validator("severity")
    def severity_must_be_valid(cls, v):
        if v not in [1, 2, 3]:
            raise ValueError("Severity must be 1 (Mild), 2 (Moderate), or 3 (Severe)")
        return v

    @validator("season")
    def season_must_be_valid(cls, v):
        if v not in [0, 1, 2, 3]:
            raise ValueError("Season must be 0=Summer 1=SW Monsoon 2=NE Monsoon 3=Winter")
        return v


class SymptomLogResponse(BaseModel):
    success:        bool
    log_id:         int
    risk_label:     str
    risk_score:     float
    confidence_pct: float
    ai_explanation: dict
    message:        str


class NCDCheckRequest(BaseModel):
    asha_worker_id: int
    village_id:     int
    full_name:      str
    age:            int
    condition:      str
    annual_income:  float

    @validator("condition")
    def condition_must_be_valid(cls, v):
        condition_lower = v.lower()
        # Flexible match — checks if any valid condition keyword is in the input
        valid_lower = [c.lower() for c in VALID_NCD_CONDITIONS]
        if not any(valid in condition_lower for valid in valid_lower):
            # Don't hard reject — just warn. Scheme matcher will handle it.
            pass
        return v


class NCDCheckResponse(BaseModel):
    success:         bool
    matched_schemes: List[dict]
    message:         str


class HeatmapVillage(BaseModel):
    village_id:     int
    village_name:   str
    district:       str
    latitude:       float
    longitude:      float
    risk_label:     str
    risk_score:     float
    recent_symptom: str
    case_count:     int
    ai_explanation: dict

# =============================================================================
# SECTION 5 — AI INFERENCE
# =============================================================================

FEATURE_HUMAN_LABELS = {
    "symptom_encoded":          "Symptom type",
    "severity":                 "Severity level",
    "cases_last_7_days":        "Active cases (last 7 days)",
    "avg_temperature_c":        "Average temperature (°C)",
    "humidity_percent":         "Humidity (%)",
    "population_density":       "Population density",
    "distance_to_clinic_km":    "Distance to clinic (km)",
    "open_defecation_index":    "Sanitation risk index",
    "season_encoded":           "Current season",
    "water_source_risk":        "Water source safety",
}


def run_inference(
    symptom: str,
    severity: int,
    cases_last_7_days: int,
    avg_temperature_c: float,
    humidity_percent: float,
    season: int,
    water_source_risk: int,
    village: Village,
    is_child_under_5: bool = False,
    is_pregnant_woman: bool = False,
    is_elderly_above_60: bool = False,
    has_travel_history: bool = False,
) -> dict:

    if not MODEL_LOADED:
        return {
            "risk_label":     "Medium",
            "risk_score":     0.5,
            "confidence_pct": 75.0,
            "probabilities":  {"Low": 20.0, "Medium": 55.0, "High": 25.0},
            "ai_explanation": {"note": "Model not loaded — using fallback values"}
        }

    # Safe symptom encoding — fallback to Fever if unseen
    known_symptoms = list(le_symptom.classes_)
    safe_symptom   = symptom if symptom in known_symptoms else "Fever"
    symptom_enc    = le_symptom.transform([safe_symptom])[0]
    season_enc     = le_season.transform([season])[0]

    # Boost cases if high risk groups are involved
    effective_cases = cases_last_7_days
    if is_child_under_5 or is_pregnant_woman or is_elderly_above_60:
        effective_cases = int(cases_last_7_days * 1.3)
    if has_travel_history:
        effective_cases = int(effective_cases * 1.2)

    features = np.array([[
        symptom_enc,
        severity,
        effective_cases,
        avg_temperature_c,
        humidity_percent,
        village.population or 500,
        10.0,   # default distance_to_clinic_km
        0.3,    # default open_defecation_index
        season_enc,
        water_source_risk
    ]])

    prediction    = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    risk_label    = le_label.inverse_transform([prediction])[0]
    confidence    = round(float(max(probabilities)) * 100, 1)

    score_map  = {"High": 1.0, "Medium": 0.6, "Low": 0.2}
    risk_score = score_map.get(risk_label, 0.5)

    # XAI explanation for Sagana's popup
    top_factors = sorted(
        feature_importance.items(), key=lambda x: x[1], reverse=True
    )[:3]

    explanation = {
        "risk_label":     risk_label,
        "confidence_pct": confidence,
        "top_factors": [
            {
                "feature":     FEATURE_HUMAN_LABELS.get(feat, feat),
                "importance":  round(imp * 100, 1),
                "description": f"Contributed {round(imp*100,1)}% to this prediction"
            }
            for feat, imp in top_factors
        ],
        "probabilities": {
            label: round(float(prob) * 100, 1)
            for label, prob in zip(le_label.classes_, probabilities)
        },
        "high_risk_groups": {
            "child_under_5":    is_child_under_5,
            "pregnant_woman":   is_pregnant_woman,
            "elderly_above_60": is_elderly_above_60,
            "travel_history":   has_travel_history,
        }
    }

    return {
        "risk_label":     risk_label,
        "risk_score":     risk_score,
        "confidence_pct": confidence,
        "ai_explanation": explanation
    }

# =============================================================================
# SECTION 6 — NCD SCHEME MATCHING
# =============================================================================

def match_schemes(condition: str, annual_income: float, db: Session) -> List[dict]:
    condition_lower = condition.lower()
    all_schemes     = db.query(GovernmentScheme).all()
    matched         = []

    for scheme in all_schemes:
        eligible_diseases = [
            d.strip().lower() for d in scheme.eligible_diseases.split(",")
        ]
        disease_match = any(d in condition_lower for d in eligible_diseases)
        income_match  = annual_income <= scheme.income_threshold

        if disease_match and income_match:
            matched.append({
                "scheme_id":        scheme.id,
                "name":             scheme.name,
                "description":      scheme.description,
                "income_threshold": scheme.income_threshold,
                "state_specific":   scheme.state_specific,
                "why_matched":      (
                    f"Condition '{condition}' matches and "
                    f"income ₹{annual_income:,.0f} is within ₹{scheme.income_threshold:,.0f} threshold"
                )
            })

    return matched

# =============================================================================
# SECTION 7 — FASTAPI APP
# =============================================================================

app = FastAPI(
    title="EpiTwin API",
    description="Epidemiological Digital Twin & Social Welfare Engine",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# SECTION 8 — DATABASE SEEDING
# =============================================================================

def seed_database(db: Session):

    # ── Villages ──────────────────────────────────────────────────────────────
    if db.query(Village).count() == 0:
        villages = [
            Village(name="Vellore",       district="Vellore",        latitude=12.9165, longitude=79.1325, population=523117),
            Village(name="Thanjavur",      district="Thanjavur",      latitude=10.7870, longitude=79.1378, population=222943),
            Village(name="Madurai",        district="Madurai",        latitude=9.9252,  longitude=78.1198, population=1017865),
            Village(name="Tirunelveli",    district="Tirunelveli",    latitude=8.7139,  longitude=77.7567, population=474838),
            Village(name="Salem",          district="Salem",          latitude=11.6643, longitude=78.1460, population=831038),
            Village(name="Nagapattinam",   district="Nagapattinam",   latitude=10.7672, longitude=79.8449, population=188130),
            Village(name="Ramanathapuram", district="Ramanathapuram", latitude=9.3762,  longitude=78.8301, population=130042),
            Village(name="Cuddalore",      district="Cuddalore",      latitude=11.7480, longitude=79.7714, population=173676),
            Village(name="Dindigul",       district="Dindigul",       latitude=10.3673, longitude=77.9803, population=207327),
            Village(name="Ariyalur",       district="Ariyalur",       latitude=11.1412, longitude=79.0762, population=80116),
        ]
        db.add_all(villages)
        db.commit()
        print("✅ Villages seeded.")

    # ── ASHA Workers ──────────────────────────────────────────────────────────
    if db.query(AshaWorker).count() == 0:
        workers = [
            AshaWorker(username="sunita",  password_hash=hash_password("password123"), full_name="Sunita Devi",      village_id=1, language_pref="ta"),
            AshaWorker(username="meena",   password_hash=hash_password("password123"), full_name="Meena Krishnan",   village_id=2, language_pref="ta"),
            AshaWorker(username="kavitha", password_hash=hash_password("password123"), full_name="Kavitha Rajan",    village_id=3, language_pref="en"),
            AshaWorker(username="priya",   password_hash=hash_password("password123"), full_name="Priya Sundaram",   village_id=4, language_pref="ta"),
            AshaWorker(username="admin",   password_hash=hash_password("admin123"),    full_name="District Officer", village_id=1, language_pref="en"),
        ]
        db.add_all(workers)
        db.commit()
        print("✅ ASHA Workers seeded. Demo login → sunita / password123")

    # ── Government Schemes ────────────────────────────────────────────────────
    if db.query(GovernmentScheme).count() == 0:
        schemes = [
            GovernmentScheme(
                name="PM-JAY (Ayushman Bharat)",
                description="Health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
                eligible_diseases="diabetes,hypertension,heart disease,cancer,kidney disease,stroke,copd,asthma",
                income_threshold=300000.0,
                state_specific=None
            ),
            GovernmentScheme(
                name="NPCDCS Insulin Scheme",
                description="Free insulin and blood glucose monitoring strips for BPL diabetic patients.",
                eligible_diseases="diabetes,severe diabetes,type 2 diabetes,gestational diabetes",
                income_threshold=120000.0,
                state_specific=None
            ),
            GovernmentScheme(
                name="CMCHIS (Tamil Nadu)",
                description="Chief Minister's Comprehensive Health Insurance — covers 1,027 procedures up to ₹5 lakh.",
                eligible_diseases="diabetes,hypertension,cancer,heart disease,renal failure,tuberculosis,stroke",
                income_threshold=72000.0,
                state_specific="Tamil Nadu"
            ),
            GovernmentScheme(
                name="RBSK — Child Health Screening",
                description="Free treatment for children with deficiencies and diseases under Rashtriya Bal Swasthya Karyakram.",
                eligible_diseases="malnutrition,anemia,fever,diarrhea,respiratory infection,hand foot mouth disease",
                income_threshold=500000.0,
                state_specific=None
            ),
            GovernmentScheme(
                name="National TB Elimination Programme (NTEP)",
                description="Free diagnosis, treatment, and ₹500/month nutritional support for TB patients.",
                eligible_diseases="tuberculosis,tb,respiratory infection,chronic cough,pneumonia",
                income_threshold=500000.0,
                state_specific=None
            ),
            GovernmentScheme(
                name="Pradhan Mantri Suraksha Bima Yojana",
                description="Accidental insurance coverage of ₹2 lakh at ₹12/year for BPL families.",
                eligible_diseases="accident,disability,injury",
                income_threshold=150000.0,
                state_specific=None
            ),
            GovernmentScheme(
                name="JSSK — Janani Shishu Suraksha",
                description="Free delivery, C-section, and newborn care for pregnant women in government hospitals.",
                eligible_diseases="gestational diabetes,pregnancy complications,malnutrition",
                income_threshold=500000.0,
                state_specific=None
            ),
            GovernmentScheme(
                name="POSHAN Abhiyaan",
                description="Nutritional support and supplementary food for malnourished children under 6 and pregnant women.",
                eligible_diseases="malnutrition,anemia,gestational diabetes",
                income_threshold=200000.0,
                state_specific=None
            ),
            GovernmentScheme(
                name="NMHP — National Mental Health Programme",
                description="Free psychiatric consultation, medication, and rehabilitation for mental illness patients.",
                eligible_diseases="depression,mental illness,epilepsy,schizophrenia",
                income_threshold=300000.0,
                state_specific=None
            ),
            GovernmentScheme(
                name="NPCB — National Programme for Control of Blindness",
                description="Free cataract surgery, spectacles, and low vision aids for eligible patients.",
                eligible_diseases="blindness,low vision,cataract,glaucoma",
                income_threshold=200000.0,
                state_specific=None
            ),
        ]
        db.add_all(schemes)
        db.commit()
        print("✅ Government Schemes seeded (10 schemes).")


@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_database(db)
    print("🚀 EpiTwin API v2.0 is running.")

# =============================================================================
# SECTION 9 — ENDPOINTS
# =============================================================================

@app.get("/")
def root():
    return {
        "project":        "EpiTwin",
        "tagline":        "Epidemiological Digital Twin & Social Welfare Engine",
        "status":         "running",
        "version":        "2.0.0",
        "valid_symptoms": VALID_SYMPTOMS,
        "total_symptoms": len(VALID_SYMPTOMS),
    }


# ── /login ────────────────────────────────────────────────────────────────────
@app.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    worker = db.query(AshaWorker).filter(
        AshaWorker.username == payload.username
    ).first()

    if not worker or not verify_password(payload.password, worker.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    village = db.query(Village).filter(Village.id == worker.village_id).first()

    return LoginResponse(
        success=True,
        worker_id=worker.id,
        full_name=worker.full_name,
        village_id=worker.village_id,
        village_name=village.name if village else "Unknown",
        language_pref=worker.language_pref,
        message=f"Welcome, {worker.full_name}!"
    )


# ── /log-symptom ──────────────────────────────────────────────────────────────
@app.post("/log-symptom", response_model=SymptomLogResponse)
def log_symptom(payload: SymptomLogRequest, db: Session = Depends(get_db)):
    village = db.query(Village).filter(Village.id == payload.village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")

    result = run_inference(
        symptom=payload.symptom,
        severity=payload.severity,
        cases_last_7_days=payload.cases_last_7_days,
        avg_temperature_c=payload.avg_temperature_c,
        humidity_percent=payload.humidity_percent,
        season=payload.season,
        water_source_risk=payload.water_source_risk,
        village=village,
        is_child_under_5=payload.is_child_under_5,
        is_pregnant_woman=payload.is_pregnant_woman,
        is_elderly_above_60=payload.is_elderly_above_60,
        has_travel_history=payload.has_travel_history,
    )

    log = SymptomLog(
        village_id=payload.village_id,
        asha_worker_id=payload.asha_worker_id,
        patient_age=payload.patient_age,
        patient_gender=payload.patient_gender,
        symptom=payload.symptom,
        severity=payload.severity,
        duration_days=payload.duration_days,
        is_child_under_5=payload.is_child_under_5,
        is_pregnant_woman=payload.is_pregnant_woman,
        is_elderly_above_60=payload.is_elderly_above_60,
        cases_last_7_days=payload.cases_last_7_days,
        household_size=payload.household_size,
        has_travel_history=payload.has_travel_history,
        vaccination_status=payload.vaccination_status,
        referred_to_hospital=payload.referred_to_hospital,
        avg_temperature_c=payload.avg_temperature_c,
        humidity_percent=payload.humidity_percent,
        season=payload.season,
        water_source_risk=payload.water_source_risk,
        synced_from_offline=payload.synced_from_offline,
        risk_score=result["risk_score"],
        risk_label=result["risk_label"],
        ai_explanation=json.dumps(result["ai_explanation"])
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return SymptomLogResponse(
        success=True,
        log_id=log.id,
        risk_label=result["risk_label"],
        risk_score=result["risk_score"],
        confidence_pct=result["confidence_pct"],
        ai_explanation=result["ai_explanation"],
        message=f"Symptom logged. Village risk: {result['risk_label']}"
    )


# ── /check-scheme ─────────────────────────────────────────────────────────────
@app.post("/check-scheme", response_model=NCDCheckResponse)
def check_scheme(payload: NCDCheckRequest, db: Session = Depends(get_db)):
    matched = match_schemes(payload.condition, payload.annual_income, db)

    patient = NCDPatient(
        village_id=payload.village_id,
        asha_worker_id=payload.asha_worker_id,
        full_name=payload.full_name,
        age=payload.age,
        condition=payload.condition,
        annual_income=payload.annual_income,
        enrolled_scheme=matched[0]["name"] if matched else None
    )
    db.add(patient)
    db.commit()

    if not matched:
        return NCDCheckResponse(
            success=True,
            matched_schemes=[],
            message="No matching schemes found for this condition and income level."
        )

    return NCDCheckResponse(
        success=True,
        matched_schemes=matched,
        message=f"{len(matched)} scheme(s) found for {payload.full_name}!"
    )


# ── /heatmap-data ─────────────────────────────────────────────────────────────
@app.get("/heatmap-data", response_model=List[HeatmapVillage])
def heatmap_data(db: Session = Depends(get_db)):
    villages = db.query(Village).all()
    heatmap  = []
    cutoff   = datetime.utcnow() - timedelta(days=7)

    for village in villages:
        latest_log = (
            db.query(SymptomLog)
            .filter(SymptomLog.village_id == village.id)
            .order_by(SymptomLog.logged_at.desc())
            .first()
        )

        case_count = (
            db.query(SymptomLog)
            .filter(
                SymptomLog.village_id == village.id,
                SymptomLog.logged_at  >= cutoff
            )
            .count()
        )

        if latest_log:
            risk_label = latest_log.risk_label  or "Low"
            risk_score = latest_log.risk_score   or 0.2
            recent_sym = latest_log.symptom
            ai_exp     = json.loads(latest_log.ai_explanation) if latest_log.ai_explanation else {}
        else:
            risk_label = "Low"
            risk_score = 0.2
            recent_sym = "None"
            ai_exp     = {"note": "No symptoms logged yet"}

        heatmap.append(HeatmapVillage(
            village_id=village.id,
            village_name=village.name,
            district=village.district,
            latitude=village.latitude,
            longitude=village.longitude,
            risk_label=risk_label,
            risk_score=risk_score,
            recent_symptom=recent_sym,
            case_count=case_count,
            ai_explanation=ai_exp
        ))

    return heatmap


# ── /villages ─────────────────────────────────────────────────────────────────
@app.get("/villages")
def get_villages(db: Session = Depends(get_db)):
    return db.query(Village).all()


# ── /symptoms (helper for Indhu's dropdown) ───────────────────────────────────
@app.get("/symptoms")
def get_symptoms():
    return {
        "symptoms":         VALID_SYMPTOMS,
        "high_risk":        HIGH_RISK_SYMPTOMS,
        "total":            len(VALID_SYMPTOMS),
    }


# ── /schemes (helper for Indhu's NCD tab) ────────────────────────────────────
@app.get("/schemes")
def get_schemes(db: Session = Depends(get_db)):
    return db.query(GovernmentScheme).all()


# ── /sync-offline-logs ────────────────────────────────────────────────────────
@app.post("/sync-offline-logs")
def sync_offline_logs(logs: List[SymptomLogRequest], db: Session = Depends(get_db)):
    results = []
    for log_payload in logs:
        log_payload.synced_from_offline = True
        result = log_symptom(log_payload, db)
        results.append(result)

    return {
        "success":      True,
        "synced_count": len(results),
        "message":      f"Successfully synced {len(results)} offline log(s).",
        "results":      results
    }


# =============================================================================
# SECTION 10 — RUN
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
    #uvicorn main:app --host 0.0.0.0 --port 8000 --reload