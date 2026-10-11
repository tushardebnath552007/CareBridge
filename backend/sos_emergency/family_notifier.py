from backend.database import get_connection

def broadcast_emergency_notification(user_id: int, incident_id: int, location_name: str, coords: tuple):
    """
    Simulates multi-channel family notification broadcast (SMS, automated IVR phone call, push alert)
    to registered contacts ordered by priority.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name, relationship, phone, priority, notify_sms, notify_call 
        FROM emergency_contacts 
        WHERE user_id = ? 
        ORDER BY priority ASC
    """, (user_id,))
    contacts = [dict(row) for row in cursor.fetchall()]
    conn.close()

    dispatch_log = []
    for c in contacts:
        log_entry = {
            "contact_name": c["name"],
            "relationship": c["relationship"],
            "phone": c["phone"],
            "priority": c["priority"],
            "sms_status": "SENT" if c["notify_sms"] else "SKIPPED",
            "call_status": "DIALED_CONNECTED" if c["notify_call"] else "SKIPPED",
            "message": f"🚨 EMERGENCY: Martha Chen triggered SOS at {location_name}. GPS: {coords[0]:.4f}, {coords[1]:.4f}. Paramedics en route."
        }
        dispatch_log.append(log_entry)

    return {
        "incident_id": incident_id,
        "total_contacts": len(contacts),
        "notifications": dispatch_log,
        "family_summary": "All primary caregivers alerted via SMS & automated emergency voice dispatch."
    }
