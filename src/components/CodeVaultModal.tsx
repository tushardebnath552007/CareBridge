import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, Database } from 'lucide-react';

interface CodeVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeVaultModal: React.FC<CodeVaultModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<'database' | 'alert_handler' | 'ambulance' | 'fastapi_main'>('database');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeSnippets: Record<string, { title: string; language: string; content: string }> = {
    database: {
      title: 'backend/database.py (Raw SQLite Schema)',
      language: 'python',
      content: `"""
CareBridge Backend - Database Initializer
Uses native Python sqlite3 executing raw SQL queries.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "carebridge.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        address TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        blood_type TEXT NOT NULL,
        allergies TEXT NOT NULL,
        chronic_conditions TEXT NOT NULL,
        primary_doctor TEXT NOT NULL,
        doctor_phone TEXT NOT NULL,
        caregiver_name TEXT NOT NULL,
        caregiver_relation TEXT NOT NULL,
        caregiver_phone TEXT NOT NULL,
        subscription_plan TEXT NOT NULL DEFAULT 'Care+ Family'
    );

    CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        phone TEXT NOT NULL,
        priority INTEGER NOT NULL,
        notify_sms INTEGER NOT NULL DEFAULT 1,
        notify_call INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS sos_incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        triggered_at TEXT NOT NULL,
        resolved_at TEXT,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        location_name TEXT NOT NULL,
        severity TEXT NOT NULL,
        dispatched_unit TEXT,
        notes TEXT
    );

    CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        distance_km REAL NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        ambulance_eta_mins INTEGER NOT NULL,
        available_icu_beds INTEGER NOT NULL,
        available_er_beds INTEGER NOT NULL,
        trauma_level TEXT NOT NULL,
        accepted_insurance TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS health_vitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        systolic INTEGER NOT NULL,
        diastolic INTEGER NOT NULL,
        heart_rate INTEGER NOT NULL,
        blood_sugar REAL NOT NULL,
        spo2 INTEGER NOT NULL,
        temperature REAL NOT NULL,
        recorded_at TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT
    );

    CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        schedule_time TEXT NOT NULL,
        taken_today INTEGER NOT NULL DEFAULT 0,
        instructions TEXT NOT NULL,
        pills_remaining INTEGER NOT NULL DEFAULT 30
    );

    CREATE TABLE IF NOT EXISTS community_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Requested',
        volunteer_name TEXT,
        volunteer_phone TEXT,
        volunteer_rating REAL
    );

    CREATE TABLE IF NOT EXISTS telehealth_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        doctor_name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        duration_mins INTEGER NOT NULL DEFAULT 30,
        status TEXT NOT NULL DEFAULT 'Scheduled',
        meeting_url TEXT NOT NULL,
        notes TEXT,
        prescription_issued TEXT
    );

    CREATE TABLE IF NOT EXISTS insurance_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        claim_number TEXT NOT NULL,
        hospital_name TEXT NOT NULL,
        service_type TEXT NOT NULL,
        amount_total REAL NOT NULL,
        amount_covered REAL NOT NULL,
        copay_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pre-Approved',
        filed_date TEXT NOT NULL,
        policy_number TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS family_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        relative_name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        location TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        last_active TEXT NOT NULL,
        battery_level INTEGER NOT NULL DEFAULT 88,
        motion_status TEXT NOT NULL DEFAULT 'Active in Living Room',
        allow_remote_vitals INTEGER NOT NULL DEFAULT 1
    );
    """)
    conn.commit()
    conn.close()
`
    },
    alert_handler: {
      title: 'backend/sos_emergency/alert_handler.py',
      language: 'python',
      content: `from fastapi import APIRouter
from datetime import datetime
from backend.database import get_connection

router = APIRouter(prefix="/api/sos", tags=["SOS Emergency"])

@router.post("/trigger")
def trigger_sos(payload: dict):
    """Triggers one-touch SOS, stores GPS coords in SQLite, and alerts family tree."""
    user_id = payload.get("user_id", 1)
    lat = payload.get("lat", 37.7599)
    lng = payload.get("lng", -122.4148)
    location_name = payload.get("location_name", "742 Evergreen Terrace, Apt 3B")
    
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO sos_incidents (user_id, status, triggered_at, lat, lng, location_name, severity, dispatched_unit)
        VALUES (?, 'ACTIVE_EMERGENCY', ?, ?, ?, ?, 'CRITICAL', 'Medic-04 (St. Jude EMS)')
    """, (user_id, now, lat, lng, location_name))
    
    incident_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "success": True,
        "incident_id": incident_id,
        "status": "ACTIVE_EMERGENCY",
        "dispatched_unit": "Medic-04 (St. Jude EMS)",
        "eta_minutes": 5,
        "message": f"EMERGENCY: SOS triggered at {location_name}. GPS: {lat:.4f}, {lng:.4f}"
    }
`
    },
    ambulance: {
      title: 'backend/hospital_coordination/ambulance_dispatcher.py',
      language: 'python',
      content: `from fastapi import APIRouter
from backend.database import get_connection

router = APIRouter(prefix="/api/hospital", tags=["Hospital Coordination"])

@router.post("/dispatch")
def dispatch_ambulance(hospital_id: int = 1):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hospitals WHERE id = ?", (hospital_id,))
    hospital = cursor.fetchone()
    conn.close()

    return {
        "success": True,
        "dispatch_code": "EMS-7821",
        "hospital_name": hospital["name"],
        "unit": "Medic-Unit 04 (Advanced Life Support)",
        "paramedics": "Marcus Bell & EMT Diaz",
        "eta_minutes": hospital["ambulance_eta_mins"],
        "pre_admission_packet": {
            "patient": "Martha Chen, 78",
            "blood_type": "O+",
            "allergies": "Penicillin, Sulfa",
            "insurance": "Medicare Part B Verified"
        }
    }
`
    },
    fastapi_main: {
      title: 'backend/main.py (FastAPI Root Entry Point)',
      language: 'python',
      content: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db

app = FastAPI(title="CareBridge Healthcare Assistance API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/health")
def health():
    return {"status": "ok", "platform": "CareBridge Healthcare"}

# Included Routers:
# - app.include_router(sos_router)
# - app.include_router(hospital_router)
# - app.include_router(vitals_router)
# - app.include_router(community_router)
# - app.include_router(user_router)
`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[selectedFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                CareBridge Codebase & Architecture Vault
              </h2>
              <p className="text-xs text-slate-400">
                Native Python sqlite3 raw queries & FastAPI REST service modules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedFile('database')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedFile === 'database'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>database.py</span>
            </button>

            <button
              onClick={() => setSelectedFile('alert_handler')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedFile === 'alert_handler'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>alert_handler.py</span>
            </button>

            <button
              onClick={() => setSelectedFile('ambulance')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedFile === 'ambulance'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>ambulance_dispatcher.py</span>
            </button>

            <button
              onClick={() => setSelectedFile('fastapi_main')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedFile === 'fastapi_main'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>main.py</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content View */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950 leading-relaxed selection:bg-rose-900/60">
          <div className="text-[11px] text-slate-500 mb-3 font-sans flex items-center justify-between">
            <span>{codeSnippets[selectedFile].title}</span>
            <span>Raw SQLite3 Native Statements</span>
          </div>
          <pre className="whitespace-pre-wrap">{codeSnippets[selectedFile].content}</pre>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Both Python FastAPI and Node SQLite backends are active in this repository.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
