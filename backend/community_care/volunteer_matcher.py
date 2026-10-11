from backend.database import get_connection

VERIFIED_VOLUNTEERS = [
    {"name": "Liam Roberts", "phone": "+1 (415) 555-0312", "rating": 4.9, "badges": ["Background Checked", "CPR Certified", "Car Owner"], "completed_tasks": 38},
    {"name": "Elena Gomez", "phone": "+1 (415) 555-0455", "rating": 5.0, "badges": ["Senior Companion Certified", "Spanish / English"], "completed_tasks": 52},
    {"name": "Marcus Wright", "phone": "+1 (415) 555-0671", "rating": 4.8, "badges": ["Background Checked", "Mobility Escort"], "completed_tasks": 29}
]

def match_volunteer_for_task(category: str):
    """Matches an available community volunteer based on request category."""
    if category in ["Prescription Pickup", "Grocery Delivery"]:
        return VERIFIED_VOLUNTEERS[0]
    elif category in ["Companionship Check-in", "Daily Check-in Call"]:
        return VERIFIED_VOLUNTEERS[1]
    else:
        return VERIFIED_VOLUNTEERS[2]
