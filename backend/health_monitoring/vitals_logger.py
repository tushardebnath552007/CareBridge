from datetime import datetime
from backend.database import get_connection

def log_vitals_reading(user_id: int, systolic: int, diastolic: int, heart_rate: int, blood_sugar: float, spo2: int, temperature: float, notes: str = ""):
    """
    Logs patient vitals and automatically determines clinical status.
    """
    status = "Normal"
    if systolic >= 140 or diastolic >= 90 or heart_rate > 100 or blood_sugar > 140:
        status = "High / Warning"
    elif systolic >= 130 or diastolic >= 85 or blood_sugar > 120:
        status = "Mildly Elevated"

    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO health_vitals (user_id, systolic, diastolic, heart_rate, blood_sugar, spo2, temperature, recorded_at, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, systolic, diastolic, heart_rate, blood_sugar, spo2, temperature, now, status, notes))
    entry_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": entry_id,
        "recorded_at": now,
        "status": status,
        "systolic": systolic,
        "diastolic": diastolic,
        "heart_rate": heart_rate,
        "blood_sugar": blood_sugar,
        "spo2": spo2,
        "temperature": temperature
    }

def get_vitals_history(user_id: int, limit: int = 14):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM health_vitals WHERE user_id = ? ORDER BY id DESC LIMIT ?", (user_id, limit))
    records = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return records
