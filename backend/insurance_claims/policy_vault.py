from backend.database import get_connection

def get_active_insurance_policies(user_id: int):
    return {
        "primary": {
            "provider": "Medicare Part B (Medical Insurance)",
            "policy_number": "MED-9082-SF4110",
            "group_id": "CMS-FEDERAL-CA",
            "holder": "Martha Chen",
            "effective_date": "Jan 01, 2013",
            "emergency_copay": "$50.00 (Waived on inpatient admission)",
            "ambulance_deductible": "100% Emergency Paramedic Covered",
            "status": "Active & In Good Standing"
        },
        "secondary": {
            "provider": "Blue Cross Blue Shield Senior Advantage Plus",
            "policy_number": "BC-9924-88A",
            "group_id": "GRP-882104",
            "rx_bin": "004336",
            "rx_pcn": "MEDDPRX",
            "status": "Active Supplemental"
        }
    }
