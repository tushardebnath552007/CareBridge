from backend.database import get_connection

def get_medication_schedule(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM medications WHERE user_id = ? ORDER BY schedule_time ASC", (user_id,))
    meds = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return meds

def mark_medication_taken(medication_id: int, taken: bool = True):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE medications SET taken_today = ? WHERE id = ?", (1 if taken else 0, medication_id))
    conn.commit()
    conn.close()
    return {"medication_id": medication_id, "taken_today": taken}
