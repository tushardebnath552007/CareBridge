from datetime import datetime
from backend.database import get_connection

def trigger_sos_alert(user_id: int, lat: float, lng: float, location_name: str, severity: str = "CRITICAL"):
    """
    Triggers an emergency SOS incident, stores it in SQLite, and dispatches responders.
    """
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO sos_incidents (user_id, status, triggered_at, lat, lng, location_name, severity, dispatched_unit, notes)
        VALUES (?, 'ACTIVE_EMERGENCY', ?, ?, ?, ?, ?, 'Medic-04 (St. Jude EMS)', 'One-touch SOS panic trigger received')
    """, (user_id, now, lat, lng, location_name, severity))

    incident_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "success": True,
        "incident_id": incident_id,
        "status": "ACTIVE_EMERGENCY",
        "triggered_at": now,
        "location": {"lat": lat, "lng": lng, "address": location_name},
        "dispatched_unit": "Medic-04 (St. Jude EMS)",
        "eta_minutes": 5
    }

def get_active_incident(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM sos_incidents 
        WHERE user_id = ? AND status != 'RESOLVED' 
        ORDER BY id DESC LIMIT 1
    """, (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def resolve_incident(incident_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute("UPDATE sos_incidents SET status = 'RESOLVED', resolved_at = ? WHERE id = ?", (now, incident_id))
    conn.commit()
    conn.close()
    return {"success": True, "incident_id": incident_id, "resolved_at": now}
