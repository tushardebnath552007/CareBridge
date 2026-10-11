from backend.database import get_connection

def get_remote_family_telemetry(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM family_links WHERE user_id = ?", (user_id,))
    links = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM health_vitals WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    vitals = cursor.fetchone()

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    return {
        "senior": dict(user) if user else None,
        "family_links": links,
        "latest_vitals": dict(vitals) if vitals else None,
        "telemetry": {
            "battery_level": 92,
            "device_status": "Online & Worn",
            "pedometer_steps_today": 2840,
            "last_kitchen_motion": "22 mins ago (Tea Kettle sensor)",
            "last_checkin_voice": "8:15 AM 'Feeling well, ready for day'",
            "fall_sensor_status": "Nominal (Zero anomalies detected)"
        }
    }
