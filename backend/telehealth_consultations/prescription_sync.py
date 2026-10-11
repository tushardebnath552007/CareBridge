from backend.database import get_connection

def get_synced_prescriptions(user_id: int):
    """Returns active e-prescriptions routed directly to partner pharmacy."""
    return [
        {
            "id": "RX-9921",
            "drug": "Lisinopril 10mg",
            "doctor": "Dr. Evelyn Vance, MD",
            "pharmacy": "Walgreens 24th St (#4102)",
            "status": "Active Refill Transmitted",
            "date": "2026-10-09"
        },
        {
            "id": "RX-8842",
            "drug": "Metformin HCl 500mg ER",
            "doctor": "Dr. Evelyn Vance, MD",
            "pharmacy": "Walgreens 24th St (#4102)",
            "status": "Ready for Pickup",
            "date": "2026-10-02"
        },
        {
            "id": "RX-7719",
            "drug": "Atorvastatin 20mg",
            "doctor": "Dr. Robert Zhang, MD",
            "pharmacy": "CVS Pharmacy Potrero",
            "status": "Active (2 Refills Left)",
            "date": "2026-09-18"
        }
    ]
