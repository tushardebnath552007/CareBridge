from backend.database import get_connection

def get_full_user_profile(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    cursor.execute("SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY priority ASC", (user_id,))
    contacts = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "user": dict(user) if user else None,
        "contacts": contacts
    }

def update_user_profile(user_id: int, fields: dict):
    conn = get_connection()
    cursor = conn.cursor()
    set_clauses = [f"{k} = ?" for k in fields.keys()]
    values = list(fields.values()) + [user_id]
    query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?"
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    return {"success": True, "updated_fields": list(fields.keys())}
