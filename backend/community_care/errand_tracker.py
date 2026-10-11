from backend.database import get_connection

def create_errand_request(user_id: int, category: str, title: str, description: str, scheduled_time: str, volunteer: dict = None):
    conn = get_connection()
    cursor = conn.cursor()
    vol_name = volunteer["name"] if volunteer else None
    vol_phone = volunteer["phone"] if volunteer else None
    vol_rating = volunteer["rating"] if volunteer else None
    status = "Assigned" if volunteer else "Requested"

    cursor.execute("""
        INSERT INTO community_requests (user_id, category, title, description, scheduled_time, status, volunteer_name, volunteer_phone, volunteer_rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, category, title, description, scheduled_time, status, vol_name, vol_phone, vol_rating))
    req_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"id": req_id, "status": status, "volunteer": volunteer}

def get_user_errands(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM community_requests WHERE user_id = ? ORDER BY id DESC", (user_id,))
    errands = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return errands
