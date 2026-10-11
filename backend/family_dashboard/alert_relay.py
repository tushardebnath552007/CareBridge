from datetime import datetime

def relay_caregiver_ping_to_home(user_id: int, message: str, sender: str = "David Chen (Chicago)"):
    return {
        "success": True,
        "delivered_to": f"Martha Chen Tablet & Smart Speaker (User #{user_id})",
        "sender": sender,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
        "read_confirmation": "Displayed on Living Room Terminal"
    }
