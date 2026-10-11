from backend.database import get_connection

PLANS = {
    "Basic Community": {
        "price_monthly": "$0 / mo",
        "description": "Essential volunteer check-ins and standard profile vault",
        "features": ["Emergency contacts registry", "Community volunteer booking", "Standard SMS alerts"]
    },
    "Care+ Family": {
        "price_monthly": "$29 / mo",
        "description": "Priority one-touch SOS dispatch, remote family caregiver app, daily vitals alerts",
        "features": ["One-touch 24/7 SOS dispatch", "Automated family phone tree calling", "Live GPS ambulance radar", "Vitals telemetry & medication tracker"]
    },
    "CareShield 24/7 Concierge": {
        "price_monthly": "$69 / mo",
        "description": "Dedicated registered nurse coordinator, fall sensor hardware sync, direct ER concierge",
        "features": ["All Care+ features", "Dedicated Nurse Care Manager", "Automated Fall Detection integration", "Unlimited hospital pre-registration guarantee"]
    }
}

def get_subscription_plans(current_plan: str = "Care+ Family"):
    return {
        "current_plan": current_plan,
        "catalog": PLANS
    }

def update_user_subscription(user_id: int, new_plan: str):
    if new_plan not in PLANS:
        return {"error": "Invalid subscription tier"}
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET subscription_plan = ? WHERE id = ?", (new_plan, user_id))
    conn.commit()
    conn.close()
    return {"success": True, "subscription_plan": new_plan, "details": PLANS[new_plan]}
