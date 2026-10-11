import math
from backend.database import get_connection

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to compute distance in kilometers between two GPS points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def update_user_live_coordinates(user_id: int, lat: float, lng: float):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET lat = ?, lng = ? WHERE id = ?", (lat, lng, user_id))
    conn.commit()
    conn.close()
    return {"user_id": user_id, "lat": lat, "lng": lng, "geofence_status": "INSIDE_HOME_RADIUS"}
