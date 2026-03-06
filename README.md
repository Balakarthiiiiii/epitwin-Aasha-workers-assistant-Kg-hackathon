# EpiTwin 🏥
### Epidemiological Digital Twin & Social Welfare Engine
**Kreative Genesis 2026 — B2G Rural Healthcare**

---

## What is EpiTwin?

EpiTwin digitizes ASHA worker home visits in rural Tamil Nadu for two purposes:
1. **Outbreak Radar** — AI predicts village-level communicable disease risk from ASHA worker symptom logs fused with weather and sanitation data
2. **Welfare Matcher** — Automatically matches chronic illness patients to government schemes like PM-JAY, NPCDCS, and CMCHIS at the point of care

---

## Team
| Name | Role |
|---|---|
| Balakarthi | Backend — FastAPI + SQLite |
| Neeraj | AI/ML — Random Forest Model |
| Indhu | Mobile PWA — ASHA Worker App |
| Sagana | DMO Dashboard — React Leaflet |

---

## Repository Structure
```
epitwin/
├── backend/          FastAPI backend + AI inference
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── train_model.py
│   ├── feature_importance.json
│   └── requirements.txt
├── asha-pwa/         ASHA Worker mobile PWA
│   └── App.jsx
├── dmo-dashboard/    DMO heatmap dashboard
│   └── App.tsx
└── README.md
```

---

## Tech Stack
- **Backend** — Python, FastAPI, SQLAlchemy, SQLite
- **AI Model** — Scikit-learn Random Forest, Pandas, Joblib
- **Mobile PWA** — React, localStorage offline queue
- **Dashboard** — React, React-Leaflet
- **Security** — Passlib bcrypt password hashing
- **Deployment** — Local Wi-Fi LAN hotspot, Uvicorn

---

## How to Run

### Backend
```cmd
cd backend
pip install -r requirements.txt
python train_model.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### ASHA Worker PWA
```cmd
cd asha-pwa
npm install
npm start
```

### DMO Dashboard
```cmd
cd dmo-dashboard
npm install react-leaflet leaflet axios
npm start
```

---

## Demo Credentials
```
Username: sunita
Password: password123
```

---

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /login | ASHA worker authentication |
| POST | /log-symptom | Log symptom + run AI inference |
| POST | /check-scheme | Match patient to welfare schemes |
| GET | /heatmap-data | Village risk data for map |
| GET | /symptoms | Full symptom list |
| GET | /villages | All villages with coordinates |
| POST | /sync-offline-logs | Sync offline queue |

---

## Demo Flow
1. Login as `sunita` on ASHA Worker PWA
2. Turn Wi-Fi OFF — log Dengue, Severity 3 — saved locally
3. Turn Wi-Fi ON — auto syncs to backend
4. DMO Dashboard updates within 5 seconds — Vellore pin turns RED
5. Click RED pin — XAI popup shows top 3 AI risk factors
6. Switch to NCD tab — enter Severe Diabetes + ₹80,000 income
7. NPCDCS Insulin Scheme matched instantly

---

## Problem Statement
- 900M+ rural Indians depend on ASHA workers using paper registers
- No digital disease surveillance exists at village level
- India loses ₹2,400 crore annually to preventable outbreaks
- 68% of eligible rural patients never access government welfare schemes

## Our Solution
EpiTwin gives ASHA workers a digital tool that works offline, predicts outbreaks using AI, and connects patients to welfare schemes they are legally entitled to — at the point of care, in Tamil and English.

---

*"EpiTwin doesn't replace the system. It connects the patient to the system for the first time."*
