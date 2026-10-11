import random
from datetime import datetime
from backend.database import get_connection

def file_cashless_claim(user_id: int, hospital_name: str, service_type: str, amount_total: float, policy_number: str = "MED-9082-SF4110"):
    conn = get_connection()
    cursor = conn.cursor()
    claim_number = f"CLM-2026-{random.randint(1000, 9999)}"
    amount_covered = round(amount_total * 0.95, 2)
    copay_amount = round(amount_total * 0.05, 2)
    now = datetime.utcnow().strftime("%Y-%m-%d")

    cursor.execute("""
        INSERT INTO insurance_claims (user_id, claim_number, hospital_name, service_type, amount_total, amount_covered, copay_amount, status, filed_date, policy_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Cashless Pre-Authorized', ?, ?)
    """, (user_id, claim_number, hospital_name, service_type, amount_total, amount_covered, copay_amount, now, policy_number))
    
    claim_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": claim_id,
        "claim_number": claim_number,
        "amount_total": amount_total,
        "amount_covered": amount_covered,
        "copay_amount": copay_amount,
        "status": "Cashless Pre-Authorized"
    }

def get_user_claims(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM insurance_claims WHERE user_id = ? ORDER BY id DESC", (user_id,))
    claims = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return claims
