import random
from backend.database import get_connection

def schedule_telehealth_visit(user_id: int, doctor_name: str, specialty: str, scheduled_time: str, duration_mins: int = 30, notes: str = ""):
    conn = get_connection()
    cursor = conn.cursor()
    meeting_url = f"https://meet.carebridge.health/vance-chen-{random.randint(100, 999)}"

    cursor.execute("""
        INSERT INTO telehealth_sessions (user_id, doctor_name, specialty, scheduled_time, duration_mins, status, meeting_url, notes)
        VALUES (?, ?, ?, ?, ?, 'Scheduled', ?, ?)
    """, (user_id, doctor_name, specialty, scheduled_time, duration_mins, meeting_url, notes))
    session_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": session_id,
        "doctor_name": doctor_name,
        "specialty": specialty,
        "scheduled_time": scheduled_time,
        "meeting_url": meeting_url,
        "status": "Scheduled"
    }

def get_user_telehealth_sessions(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM telehealth_sessions WHERE user_id = ? ORDER BY id DESC", (user_id,))
    sessions = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return sessions
