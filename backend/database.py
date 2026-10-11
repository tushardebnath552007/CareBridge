"""
CareBridge Backend - Database Initializer
Uses native Python sqlite3 executing raw SQL queries without ORM overhead.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "carebridge.db")

def get_connection():
    """Returns a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes schema and tables using raw SQL statements."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        address TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        blood_type TEXT NOT NULL,
        allergies TEXT NOT NULL,
        chronic_conditions TEXT NOT NULL,
        primary_doctor TEXT NOT NULL,
        doctor_phone TEXT NOT NULL,
        caregiver_name TEXT NOT NULL,
        caregiver_relation TEXT NOT NULL,
        caregiver_phone TEXT NOT NULL,
        subscription_plan TEXT NOT NULL DEFAULT 'Care+ Family'
    );

    CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        phone TEXT NOT NULL,
        priority INTEGER NOT NULL,
        notify_sms INTEGER NOT NULL DEFAULT 1,
        notify_call INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sos_incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        triggered_at TEXT NOT NULL,
        resolved_at TEXT,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        location_name TEXT NOT NULL,
        severity TEXT NOT NULL,
        dispatched_unit TEXT,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        distance_km REAL NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        ambulance_eta_mins INTEGER NOT NULL,
        available_icu_beds INTEGER NOT NULL,
        available_er_beds INTEGER NOT NULL,
        trauma_level TEXT NOT NULL,
        accepted_insurance TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS health_vitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        systolic INTEGER NOT NULL,
        diastolic INTEGER NOT NULL,
        heart_rate INTEGER NOT NULL,
        blood_sugar REAL NOT NULL,
        spo2 INTEGER NOT NULL,
        temperature REAL NOT NULL,
        recorded_at TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        schedule_time TEXT NOT NULL,
        taken_today INTEGER NOT NULL DEFAULT 0,
        instructions TEXT NOT NULL,
        pills_remaining INTEGER NOT NULL DEFAULT 30,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS community_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Requested',
        volunteer_name TEXT,
        volunteer_phone TEXT,
        volunteer_rating REAL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS telehealth_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        doctor_name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        duration_mins INTEGER NOT NULL DEFAULT 30,
        status TEXT NOT NULL DEFAULT 'Scheduled',
        meeting_url TEXT NOT NULL,
        notes TEXT,
        prescription_issued TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS insurance_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        claim_number TEXT NOT NULL,
        hospital_name TEXT NOT NULL,
        service_type TEXT NOT NULL,
        amount_total REAL NOT NULL,
        amount_covered REAL NOT NULL,
        copay_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pre-Approved',
        filed_date TEXT NOT NULL,
        policy_number TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS family_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        relative_name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        location TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        last_active TEXT NOT NULL,
        battery_level INTEGER NOT NULL DEFAULT 88,
        motion_status TEXT NOT NULL DEFAULT 'Active in Living Room',
        allow_remote_vitals INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # Seed initial user if not present
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO users (full_name, age, address, lat, lng, blood_type, allergies, chronic_conditions, primary_doctor, doctor_phone, caregiver_name, caregiver_relation, caregiver_phone, subscription_plan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'Martha Chen', 78, '742 Evergreen Terrace, Apt 3B, San Francisco, CA 94110',
            37.7599, -122.4148, 'O Positive (O+)', 'Penicillin, Sulfa drugs',
            'Hypertension, Mild Osteoarthritis, Type 2 Diabetes',
            'Dr. Evelyn Vance, MD (Geriatrics)', '+1 (415) 555-0182',
            'David Chen', 'Son (Working in Chicago)', '+1 (312) 555-0199', 'Care+ Family'
        ))

        cursor.executemany("""
            INSERT INTO emergency_contacts (user_id, name, relationship, phone, priority, notify_sms, notify_call)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 'David Chen', 'Son (Caregiver)', '+1 (312) 555-0199', 1, 1, 1),
            (1, 'Dr. Evelyn Vance', 'Primary Physician', '+1 (415) 555-0182', 2, 1, 0),
            (1, 'Sarah Jenkins', 'Next-door Neighbor (Keyholder)', '+1 (415) 555-0144', 3, 1, 1)
        ])

        cursor.executemany("""
            INSERT INTO hospitals (name, distance_km, address, phone, ambulance_eta_mins, available_icu_beds, available_er_beds, trauma_level, accepted_insurance)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            ('St. Jude Metro General Hospital & Trauma Center', 1.8, '1001 Potrero Ave, San Francisco, CA', '+1 (415) 206-8000', 5, 8, 22, 'Level 1 Trauma', 'Medicare Part B, Blue Cross, Kaiser, Aetna'),
            ('Mercy Valley Community Hospital', 3.4, '350 Parnassus Ave, San Francisco, CA', '+1 (415) 476-1000', 8, 4, 14, 'Level 2 Trauma', 'Medicare, UnitedHealthcare, Cigna'),
            ('Mission Bay Senior Specialty Care Center', 4.1, '1855 4th St, San Francisco, CA', '+1 (415) 353-6000', 11, 12, 19, 'Geriatric Emergency Care', 'Medicare Advantage, Blue Shield, Humana')
        ])

        cursor.executemany("""
            INSERT INTO health_vitals (user_id, systolic, diastolic, heart_rate, blood_sugar, spo2, temperature, recorded_at, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 122, 78, 72, 104, 98, 98.4, '2026-10-08 08:30:00', 'Normal', 'Morning resting vitals after light tea'),
            (1, 126, 80, 74, 112, 98, 98.6, '2026-10-09 08:45:00', 'Normal', 'Routine check'),
            (1, 134, 84, 76, 128, 97, 98.7, '2026-10-10 09:00:00', 'Mildly Elevated', 'Post breakfast slight BP elevation'),
            (1, 120, 76, 71, 98, 99, 98.4, '2026-10-11 08:15:00', 'Normal', 'Optimal reading'),
        ])

        cursor.executemany("""
            INSERT INTO medications (user_id, name, dosage, schedule_time, taken_today, instructions, pills_remaining)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 'Lisinopril', '10mg Tablet', '08:00 AM', 1, 'Take with water before breakfast for blood pressure control', 24),
            (1, 'Metformin HCl', '500mg Extended Release', '08:00 AM', 1, 'Take with breakfast meal to regulate blood glucose', 18),
            (1, 'Glucosamine Chondroitin', '750mg Capsule', '01:00 PM', 1, 'Joint mobility support, take with lunch', 45),
            (1, 'Vitamin D3 & Calcium', '2000 IU Tablet', '01:00 PM', 0, 'Bone density health, take with food', 30),
            (1, 'Atorvastatin', '20mg Tablet', '08:00 PM', 0, 'Cholesterol maintenance, take with dinner water', 28),
            (1, 'Melatonin Low-Dose', '2.5mg Chewable', '10:00 PM', 0, 'Sleep support as needed 30 mins before bedtime', 15),
        ])

        cursor.executemany("""
            INSERT INTO community_requests (user_id, category, title, description, scheduled_time, status, volunteer_name, volunteer_phone, volunteer_rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 'Prescription Pickup', 'Pick up monthly refill at Walgreens 24th St', 'Lisinopril and Metformin refill ready under Martha Chen', 'Today, 2:30 PM', 'Assigned', 'Liam Roberts', '+1 (415) 555-0312', 4.9),
            (1, 'Doctor Escort', 'Escort to Geriatric Clinic checkup', 'Dr. Vance clinic at Potrero Ave. Wheelchair assistance in cab', 'Tomorrow, 10:00 AM', 'Requested', None, None, None),
            (1, 'Companionship Check-in', 'Afternoon garden walk & check-in', '15-minute garden walk in courtyard and tea chat', 'Yesterday, 3:00 PM', 'Completed', 'Elena Gomez', '+1 (415) 555-0455', 5.0),
        ])

        cursor.executemany("""
            INSERT INTO telehealth_sessions (user_id, doctor_name, specialty, scheduled_time, duration_mins, status, meeting_url, notes, prescription_issued)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 'Dr. Evelyn Vance, MD', 'Geriatric & Internal Medicine', 'Today, 2:00 PM', 30, 'Scheduled', 'https://meet.carebridge.health/vance-chen-782', 'Quarterly hypertension and diabetes medication review', 'Lisinopril 10mg refill pending'),
            (1, 'Dr. Robert Zhang, MD', 'Cardiology & Pulse Rhythm', 'Friday, 11:30 AM', 20, 'Scheduled', 'https://meet.carebridge.health/zhang-chen-109', 'Routine ECG telemetry rhythm check', None),
            (1, 'Dr. Evelyn Vance, MD', 'Geriatric Medicine', 'Last Month, Sep 14', 30, 'Completed', 'https://meet.carebridge.health/vance-archive-88', 'Stable blood pressure, patient walking 20 mins daily', 'Metformin extended-release renewal'),
        ])

        cursor.executemany("""
            INSERT INTO insurance_claims (user_id, claim_number, hospital_name, service_type, amount_total, amount_covered, copay_amount, status, filed_date, policy_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 'CLM-2026-9021', 'St. Jude Metro General Hospital', 'Emergency Code 3 Ambulance & ER Triage', 1850.00, 1800.00, 50.00, 'Cashless Authorized', '2026-09-12', 'MED-9082-SF4110'),
            (1, 'CLM-2026-7844', 'Mission Bay Senior Specialty Care', 'Comprehensive Geriatric Wellness & Bone Density', 680.00, 640.00, 40.00, 'Settled', '2026-08-04', 'MED-9082-SF4110'),
            (1, 'CLM-2026-6102', 'Walgreens Pharmacy Network', 'Quarterly Maintenance Prescriptions (Lisinopril/Metformin)', 195.00, 175.00, 20.00, 'Settled', '2026-07-19', 'MED-9082-SF4110'),
        ])

        cursor.executemany("""
            INSERT INTO family_links (user_id, relative_name, relationship, location, phone, email, last_active, battery_level, motion_status, allow_remote_vitals)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 'David Chen', 'Son & Primary Legal Proxy', 'Chicago, IL (Remote)', '+1 (312) 555-0199', 'david.chen@chicago-tech.io', '2 mins ago', 92, 'Resting in Living Room Armchair', 1),
            (1, 'Emily Chen-Miller', 'Daughter', 'Seattle, WA (Remote)', '+1 (206) 555-0188', 'emily.chen@uw.edu', '1 hour ago', 92, 'Phone checked in at 8:15 AM', 1),
        ])

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("CareBridge SQLite database initialized successfully.")
