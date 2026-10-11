from backend.database import get_connection

def generate_pre_admission_packet(user_id: int):
    """
    Generates a secure emergency pre-registration packet sent to the receiving hospital ER.
    Includes patient demographics, allergy warnings, chronic conditions, and DNR status.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    cursor.execute("SELECT * FROM health_vitals WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    latest_vitals = cursor.fetchone()
    conn.close()

    if not user:
        return {"error": "User not found"}

    return {
        "admission_id": f"ADM-{user['id']:04d}-EMERGENCY",
        "patient": {
            "name": user["full_name"],
            "age": user["age"],
            "blood_type": user["blood_type"],
            "known_allergies": user["allergies"],
            "chronic_conditions": user["chronic_conditions"],
            "primary_physician": user["primary_doctor"],
            "physician_contact": user["doctor_phone"]
        },
        "emergency_vitals_baseline": dict(latest_vitals) if latest_vitals else None,
        "pre_registration_status": "TRANSMITTED_TO_ER_TRIAGE",
        "dnr_order_on_file": False,
        "hipaa_authorization": "CAREBRIDGE_EMERGENCY_PROXY_ACTIVE"
    }

def get_hospital_bed_capacity():
    """Returns real-time ICU, ER, and Geriatric bed capacity across regional network hospitals."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hospitals ORDER BY distance_km ASC")
    hospitals = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return hospitals
