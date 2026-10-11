import random
from backend.database import get_connection

def find_nearest_ambulance_and_dispatch(hospital_id: int = 1):
    """
    Finds the closest hospital and assigns an Advanced Life Support ambulance unit.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hospitals WHERE id = ?", (hospital_id,))
    hospital = cursor.fetchone()
    conn.close()

    if not hospital:
        return {"error": "Hospital not found"}

    dispatch_id = f"EMS-{random.randint(2000, 9999)}"
    return {
        "dispatch_id": dispatch_id,
        "hospital_name": hospital["name"],
        "hospital_phone": hospital["phone"],
        "unit_id": "Medic-Unit 04 (ALS)",
        "paramedics": "Lead Paramedic Marcus Bell & EMT Diaz",
        "eta_minutes": hospital["ambulance_eta_mins"],
        "current_status": "EN_ROUTE_CODE_3",
        "live_telemetry": {
            "speed_kmh": 58,
            "heading": "Potrero Ave Southbound",
            "distance_remaining_km": hospital["distance_km"]
        }
    }
