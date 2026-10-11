"""CareBridge FastAPI backend — async routing for all 8 modules (raw sqlite3, no ORM)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.database import init_db
from backend.sos_emergency.alert_handler import trigger_sos_alert, get_active_incident, resolve_incident
from backend.sos_emergency.family_notifier import broadcast_emergency_notification
from backend.sos_emergency.location_tracker import update_user_live_coordinates
from backend.hospital_coordination.ambulance_dispatcher import find_nearest_ambulance_and_dispatch
from backend.hospital_coordination.admission_manager import generate_pre_admission_packet, get_hospital_bed_capacity
from backend.health_monitoring.vitals_logger import log_vitals_reading, get_vitals_history
from backend.health_monitoring.reminder_service import get_medication_schedule as get_todays_medications, mark_medication_taken as toggle_medication_taken
from backend.community_care.volunteer_matcher import match_volunteer_for_task
from backend.community_care.errand_tracker import create_errand_request, get_user_errands
from backend.user_management.profile_service import get_full_user_profile
from backend.user_management.subscription_service import get_subscription_plans, update_user_subscription
from backend.telehealth_consultations.session_manager import schedule_telehealth_visit, get_user_telehealth_sessions
from backend.telehealth_consultations.prescription_sync import get_synced_prescriptions
from backend.insurance_claims.claim_processor import file_cashless_claim, get_user_claims
from backend.insurance_claims.policy_vault import get_active_insurance_policies
from backend.family_dashboard.relative_tracker import get_remote_family_telemetry
from backend.family_dashboard.alert_relay import relay_caregiver_ping_to_home
from backend.database import get_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="CareBridge API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Schemas ----------
class SosTrigger(BaseModel):
    user_id: int = 1
    lat: float = 37.7599
    lng: float = -122.4148
    location_name: str = "Home: 742 Evergreen Terrace, Apt 3B"
    severity: str = "CRITICAL"


class SosResolve(BaseModel):
    incident_id: int


class DispatchRequest(BaseModel):
    hospital_id: int = 1


class VitalsIn(BaseModel):
    user_id: int = 1
    systolic: int
    diastolic: int
    heart_rate: int
    blood_sugar: float
    spo2: int
    temperature: float
    notes: str = ""


class MedToggle(BaseModel):
    id: int
    taken: bool


class ErrandIn(BaseModel):
    user_id: int = 1
    category: str
    title: str
    description: str
    scheduled_time: str


class TelehealthIn(BaseModel):
    user_id: int = 1
    doctor_name: str
    specialty: str
    scheduled_time: str
    duration_mins: int = 30
    notes: str = ""


class ClaimIn(BaseModel):
    user_id: int = 1
    hospital_name: str
    service_type: str
    amount_total: float
    policy_number: str = "MED-9082-SF4110"


class SubscriptionIn(BaseModel):
    user_id: int = 1
    plan: str


class PingIn(BaseModel):
    user_id: int = 1
    message: str = "Thinking of you Mom! - Love David"


# ---------- 1. SOS ----------
@app.post("/api/sos/trigger")
async def sos_trigger(body: SosTrigger):
    incident = trigger_sos_alert(body.user_id, body.lat, body.lng, body.location_name, body.severity)
    update_user_live_coordinates(body.user_id, body.lat, body.lng)
    notify = broadcast_emergency_notification(body.user_id, incident["incident_id"], body.location_name, (body.lat, body.lng))
    return {**incident, "contacts_alerted": notify["notifications"]}


@app.get("/api/sos/active")
async def sos_active(user_id: int = 1):
    return {"active": get_active_incident(user_id)}


@app.post("/api/sos/resolve")
async def sos_resolve(body: SosResolve):
    return resolve_incident(body.incident_id)


@app.get("/api/sos/history")
async def sos_history(user_id: int = 1):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM sos_incidents WHERE user_id = ? ORDER BY id DESC LIMIT 10", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"history": rows}


# ---------- 2. Hospital ----------
@app.get("/api/hospitals")
async def hospitals():
    return {"hospitals": get_hospital_bed_capacity()}


@app.post("/api/hospital/dispatch")
async def dispatch(body: DispatchRequest):
    d = find_nearest_ambulance_and_dispatch(body.hospital_id)
    packet = generate_pre_admission_packet(1)
    return {**d, "pre_admission_packet_sent": True, "patient": packet.get("patient")}


# ---------- 3. Health ----------
@app.get("/api/vitals")
async def vitals(user_id: int = 1):
    return {"vitals": get_vitals_history(user_id)}


@app.post("/api/vitals")
async def vitals_add(body: VitalsIn):
    return log_vitals_reading(body.user_id, body.systolic, body.diastolic, body.heart_rate,
                              body.blood_sugar, body.spo2, body.temperature, body.notes)


@app.get("/api/medications")
async def meds(user_id: int = 1):
    return {"medications": get_todays_medications(user_id)}


@app.post("/api/medications/toggle")
async def meds_toggle(body: MedToggle):
    return toggle_medication_taken(body.id, body.taken)


# ---------- 4. Community ----------
@app.get("/api/community/requests")
async def errands(user_id: int = 1):
    return {"requests": get_user_errands(user_id)}


@app.post("/api/community/requests")
async def errands_add(body: ErrandIn):
    volunteer = match_volunteer_for_task(body.category)
    return create_errand_request(body.user_id, body.category, body.title,
                                 body.description, body.scheduled_time, volunteer)


# ---------- 5. User ----------
@app.get("/api/user/profile")
async def profile(user_id: int = 1):
    return get_full_user_profile(user_id)


@app.post("/api/user/subscription")
async def subscription(body: SubscriptionIn):
    return update_user_subscription(body.user_id, body.plan)


@app.get("/api/user/plans")
async def plans():
    return get_subscription_plans()


# ---------- 6. Telehealth ----------
@app.get("/api/telehealth/sessions")
async def th_list(user_id: int = 1):
    return {"sessions": get_user_telehealth_sessions(user_id)}


@app.post("/api/telehealth/sessions")
async def th_add(body: TelehealthIn):
    return schedule_telehealth_visit(body.user_id, body.doctor_name, body.specialty,
                                     body.scheduled_time, body.duration_mins, body.notes)


@app.get("/api/telehealth/prescriptions")
async def th_rx(user_id: int = 1):
    return {"prescriptions": get_synced_prescriptions(user_id)}


# ---------- 7. Insurance ----------
@app.get("/api/insurance/claims")
async def claims(user_id: int = 1):
    return {"claims": get_user_claims(user_id)}


@app.post("/api/insurance/claims")
async def claims_add(body: ClaimIn):
    return file_cashless_claim(body.user_id, body.hospital_name, body.service_type,
                               body.amount_total, body.policy_number)


@app.get("/api/insurance/policies")
async def policies(user_id: int = 1):
    return get_active_insurance_policies(user_id)


# ---------- 8. Family ----------
@app.get("/api/family/dashboard")
async def family(user_id: int = 1):
    return get_remote_family_telemetry(user_id)


@app.post("/api/family/ping")
async def ping(body: PingIn):
    return relay_caregiver_ping_to_home(body.user_id, body.message)


@app.get("/health")
async def health():
    return {"status": "ok"}
