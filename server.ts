import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const db = new DatabaseSync(path.join(__dirname, 'carebridge.sqlite'));

// Create tables with raw SQL as specified
db.exec(`
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
    notify_call INTEGER NOT NULL DEFAULT 1
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
    notes TEXT
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
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    schedule_time TEXT NOT NULL,
    taken_today INTEGER NOT NULL DEFAULT 0,
    instructions TEXT NOT NULL,
    pills_remaining INTEGER NOT NULL DEFAULT 30
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
    volunteer_rating REAL
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
    prescription_issued TEXT
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
    policy_number TEXT NOT NULL
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
    allow_remote_vitals INTEGER NOT NULL DEFAULT 1
  );
`);

// Seed default data if empty
const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCheck.count === 0) {
  db.prepare(`
    INSERT INTO users (full_name, age, address, lat, lng, blood_type, allergies, chronic_conditions, primary_doctor, doctor_phone, caregiver_name, caregiver_relation, caregiver_phone, subscription_plan)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Martha Chen',
    78,
    '742 Evergreen Terrace, Apt 3B, San Francisco, CA 94110',
    37.7599,
    -122.4148,
    'O Positive (O+)',
    'Penicillin, Sulfa drugs',
    'Hypertension, Mild Osteoarthritis, Type 2 Diabetes',
    'Dr. Evelyn Vance, MD (Geriatrics)',
    '+1 (415) 555-0182',
    'David Chen',
    'Son (Working in Chicago)',
    '+1 (312) 555-0199',
    'Care+ Family'
  );

  // Contacts
  const insertContact = db.prepare(`
    INSERT INTO emergency_contacts (user_id, name, relationship, phone, priority, notify_sms, notify_call)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertContact.run(1, 'David Chen', 'Son (Caregiver)', '+1 (312) 555-0199', 1, 1, 1);
  insertContact.run(1, 'Dr. Evelyn Vance', 'Primary Physician', '+1 (415) 555-0182', 2, 1, 0);
  insertContact.run(1, 'Sarah Jenkins', 'Next-door Neighbor (Keyholder)', '+1 (415) 555-0144', 3, 1, 1);

  // Hospitals
  const insertHospital = db.prepare(`
    INSERT INTO hospitals (name, distance_km, address, phone, ambulance_eta_mins, available_icu_beds, available_er_beds, trauma_level, accepted_insurance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertHospital.run('St. Jude Metro General Hospital & Trauma Center', 1.8, '1001 Potrero Ave, San Francisco, CA', '+1 (415) 206-8000', 5, 8, 22, 'Level 1 Trauma', 'Medicare Part B, Blue Cross, Kaiser, Aetna');
  insertHospital.run('Mercy Valley Community Hospital', 3.4, '350 Parnassus Ave, San Francisco, CA', '+1 (415) 476-1000', 8, 4, 14, 'Level 2 Trauma', 'Medicare, UnitedHealthcare, Cigna');
  insertHospital.run('Mission Bay Senior Specialty Care Center', 4.1, '1855 4th St, San Francisco, CA', '+1 (415) 353-6000', 11, 12, 19, 'Geriatric Emergency Care', 'Medicare Advantage, Blue Shield, Humana');

  // Vitals logs
  const insertVital = db.prepare(`
    INSERT INTO health_vitals (user_id, systolic, diastolic, heart_rate, blood_sugar, spo2, temperature, recorded_at, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertVital.run(1, 122, 78, 72, 104, 98, 98.4, '2026-10-08 08:30:00', 'Normal', 'Morning resting vitals after light tea');
  insertVital.run(1, 126, 80, 74, 112, 98, 98.6, '2026-10-09 08:45:00', 'Normal', 'Routine check');
  insertVital.run(1, 134, 84, 76, 128, 97, 98.7, '2026-10-10 09:00:00', 'Mildly Elevated', 'Post breakfast slight BP elevation');
  insertVital.run(1, 120, 76, 71, 98, 99, 98.4, '2026-10-11 08:15:00', 'Normal', 'Optimal reading');

  // Medications
  const insertMed = db.prepare(`
    INSERT INTO medications (user_id, name, dosage, schedule_time, taken_today, instructions, pills_remaining)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertMed.run(1, 'Lisinopril', '10mg Tablet', '08:00 AM', 1, 'Take with water before breakfast for blood pressure control', 24);
  insertMed.run(1, 'Metformin HCl', '500mg Extended Release', '08:00 AM', 1, 'Take with breakfast meal to regulate blood glucose', 18);
  insertMed.run(1, 'Glucosamine Chondroitin', '750mg Capsule', '01:00 PM', 1, 'Joint mobility support, take with lunch', 45);
  insertMed.run(1, 'Vitamin D3 & Calcium', '2000 IU Tablet', '01:00 PM', 0, 'Bone density health, take with food', 30);
  insertMed.run(1, 'Atorvastatin', '20mg Tablet', '08:00 PM', 0, 'Cholesterol maintenance, take with dinner water', 28);
  insertMed.run(1, 'Melatonin Low-Dose', '2.5mg Chewable', '10:00 PM', 0, 'Sleep support as needed 30 mins before bedtime', 15);

  // Community requests
  const insertReq = db.prepare(`
    INSERT INTO community_requests (user_id, category, title, description, scheduled_time, status, volunteer_name, volunteer_phone, volunteer_rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertReq.run(1, 'Prescription Pickup', 'Pick up monthly refill at Walgreens 24th St', 'Lisinopril and Metformin refill ready under Martha Chen', 'Today, 2:30 PM', 'Assigned', 'Liam Roberts', '+1 (415) 555-0312', 4.9);
  insertReq.run(1, 'Doctor Escort', 'Escort to Geriatric Clinic checkup', 'Dr. Vance clinic at Potrero Ave. Wheelchair assistance in cab', 'Tomorrow, 10:00 AM', 'Requested', null, null, null);
  insertReq.run(1, 'Companionship Check-in', 'Afternoon garden walk & check-in', '15-minute garden walk in courtyard and tea chat', 'Yesterday, 3:00 PM', 'Completed', 'Elena Gomez', '+1 (415) 555-0455', 5.0);
}

// Seed telehealth if empty
const thCheck = db.prepare('SELECT COUNT(*) as count FROM telehealth_sessions').get() as { count: number };
if (thCheck.count === 0) {
  const insertTelehealth = db.prepare(`
    INSERT INTO telehealth_sessions (user_id, doctor_name, specialty, scheduled_time, duration_mins, status, meeting_url, notes, prescription_issued)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTelehealth.run(1, 'Dr. Evelyn Vance, MD', 'Geriatric & Internal Medicine', 'Today, 2:00 PM', 30, 'Scheduled', 'https://meet.carebridge.health/vance-chen-782', 'Quarterly hypertension and diabetes medication review', 'Lisinopril 10mg refill pending');
  insertTelehealth.run(1, 'Dr. Robert Zhang, MD', 'Cardiology & Pulse Rhythm', 'Friday, 11:30 AM', 20, 'Scheduled', 'https://meet.carebridge.health/zhang-chen-109', 'Routine ECG telemetry rhythm check', null);
  insertTelehealth.run(1, 'Dr. Evelyn Vance, MD', 'Geriatric Medicine', 'Last Month, Sep 14', 30, 'Completed', 'https://meet.carebridge.health/vance-archive-88', 'Stable blood pressure, patient walking 20 mins daily', 'Metformin extended-release renewal');
}

// Seed insurance claims if empty
const icCheck = db.prepare('SELECT COUNT(*) as count FROM insurance_claims').get() as { count: number };
if (icCheck.count === 0) {
  const insertClaim = db.prepare(`
    INSERT INTO insurance_claims (user_id, claim_number, hospital_name, service_type, amount_total, amount_covered, copay_amount, status, filed_date, policy_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertClaim.run(1, 'CLM-2026-9021', 'St. Jude Metro General Hospital', 'Emergency Code 3 Ambulance & ER Triage', 1850.00, 1800.00, 50.00, 'Cashless Authorized', '2026-09-12', 'MED-9082-SF4110');
  insertClaim.run(1, 'CLM-2026-7844', 'Mission Bay Senior Specialty Care', 'Comprehensive Geriatric Wellness & Bone Density', 680.00, 640.00, 40.00, 'Settled', '2026-08-04', 'MED-9082-SF4110');
  insertClaim.run(1, 'CLM-2026-6102', 'Walgreens Pharmacy Network', 'Quarterly Maintenance Prescriptions (Lisinopril/Metformin)', 195.00, 175.00, 20.00, 'Settled', '2026-07-19', 'MED-9082-SF4110');
}

// Seed family links if empty
const flCheck = db.prepare('SELECT COUNT(*) as count FROM family_links').get() as { count: number };
if (flCheck.count === 0) {
  const insertFamily = db.prepare(`
    INSERT INTO family_links (user_id, relative_name, relationship, location, phone, email, last_active, battery_level, motion_status, allow_remote_vitals)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertFamily.run(1, 'David Chen', 'Son & Primary Legal Proxy', 'Chicago, IL (Remote)', '+1 (312) 555-0199', 'david.chen@chicago-tech.io', '2 mins ago', 92, 'Resting in Living Room Armchair', 1);
  insertFamily.run(1, 'Emily Chen-Miller', 'Daughter', 'Seattle, WA (Remote)', '+1 (206) 555-0188', 'emily.chen@uw.edu', '1 hour ago', 92, 'Phone checked in at 8:15 AM', 1);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // REST API Routes matching the 5 functional areas
  
  // 1. SOS & Emergency
  app.post('/api/sos/trigger', (req, res) => {
    const { user_id = 1, lat = 37.7599, lng = -122.4148, location_name = 'Home: 742 Evergreen Terrace, Apt 3B', severity = 'CRITICAL' } = req.body;
    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO sos_incidents (user_id, status, triggered_at, lat, lng, location_name, severity, dispatched_unit, notes)
      VALUES (?, 'ACTIVE_EMERGENCY', ?, ?, ?, ?, ?, 'Medic-04 (St. Jude EMS)', 'One-touch SOS panic trigger received')
    `).run(user_id, now, lat, lng, location_name, severity);

    const incidentId = result.lastInsertRowid;
    const contacts = db.prepare('SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY priority ASC').all(user_id);

    res.json({
      success: true,
      incident_id: incidentId,
      status: 'ACTIVE_EMERGENCY',
      triggered_at: now,
      dispatched_unit: 'Medic-04 (St. Jude EMS)',
      eta_minutes: 5,
      contacts_alerted: contacts,
      broadcast_message: `EMERGENCY ALERT: Martha Chen activated one-touch SOS at ${location_name}. Paramedics dispatched. Live GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}.`
    });
  });

  app.get('/api/sos/active', (req, res) => {
    const active = db.prepare("SELECT * FROM sos_incidents WHERE status != 'RESOLVED' ORDER BY id DESC LIMIT 1").get();
    res.json({ active: active || null });
  });

  app.post('/api/sos/resolve', (req, res) => {
    const { incident_id } = req.body;
    const now = new Date().toISOString();
    db.prepare("UPDATE sos_incidents SET status = 'RESOLVED', resolved_at = ? WHERE id = ?").run(now, incident_id);
    res.json({ success: true, status: 'RESOLVED', resolved_at: now });
  });

  app.get('/api/sos/history', (req, res) => {
    const history = db.prepare('SELECT * FROM sos_incidents ORDER BY id DESC LIMIT 10').all();
    res.json({ history });
  });

  // 2. Hospital Coordination
  app.get('/api/hospitals', (req, res) => {
    const hospitals = db.prepare('SELECT * FROM hospitals ORDER BY distance_km ASC').all();
    res.json({ hospitals });
  });

  app.post('/api/hospital/dispatch', (req, res) => {
    const { hospital_id = 1, priority = 'Code 3 Immediate' } = req.body;
    const hospital = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(hospital_id) as any;
    res.json({
      success: true,
      dispatch_code: `EMS-${Math.floor(1000 + Math.random() * 9000)}`,
      hospital_name: hospital?.name || 'St. Jude Metro General',
      ambulance_unit: 'Medic-Unit 04 (Advanced Life Support)',
      driver_name: 'Paramedic Marcus Bell & Officer Diaz',
      eta_minutes: hospital?.ambulance_eta_mins || 6,
      pre_admission_packet_sent: true,
      patient_name: 'Martha Chen',
      blood_type: 'O+',
      allergies: 'Penicillin, Sulfa drugs',
      insurance_authorized: 'Medicare Part B Verified'
    });
  });

  // 3. Health Monitoring & Vitals
  app.get('/api/vitals', (req, res) => {
    const vitals = db.prepare('SELECT * FROM health_vitals WHERE user_id = 1 ORDER BY id DESC LIMIT 14').all();
    res.json({ vitals });
  });

  app.post('/api/vitals', (req, res) => {
    const { systolic, diastolic, heart_rate, blood_sugar, spo2, temperature, notes = '' } = req.body;
    let status = 'Normal';
    if (systolic >= 140 || diastolic >= 90 || heart_rate > 100 || blood_sugar > 140) {
      status = 'High / Warning';
    } else if (systolic >= 130 || diastolic >= 85 || blood_sugar > 120) {
      status = 'Mildly Elevated';
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const result = db.prepare(`
      INSERT INTO health_vitals (user_id, systolic, diastolic, heart_rate, blood_sugar, spo2, temperature, recorded_at, status, notes)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(systolic, diastolic, heart_rate, blood_sugar, spo2, temperature, now, status, notes);

    res.json({ success: true, id: result.lastInsertRowid, status });
  });

  // Medications
  app.get('/api/medications', (req, res) => {
    const meds = db.prepare('SELECT * FROM medications WHERE user_id = 1 ORDER BY id ASC').all();
    res.json({ medications: meds });
  });

  app.post('/api/medications', (req, res) => {
    const { name, dosage, schedule_time, instructions, pills_remaining = 30 } = req.body;
    const result = db.prepare(`
      INSERT INTO medications (user_id, name, dosage, schedule_time, taken_today, instructions, pills_remaining)
      VALUES (1, ?, ?, ?, 0, ?, ?)
    `).run(name, dosage, schedule_time, instructions, pills_remaining);
    res.json({ success: true, id: result.lastInsertRowid });
  });

  app.post('/api/medications/toggle', (req, res) => {
    const { id, taken } = req.body;
    db.prepare('UPDATE medications SET taken_today = ? WHERE id = ?').run(taken ? 1 : 0, id);
    res.json({ success: true });
  });

  // 4. Community Care
  app.get('/api/community/requests', (req, res) => {
    const requests = db.prepare('SELECT * FROM community_requests WHERE user_id = 1 ORDER BY id DESC').all();
    res.json({ requests });
  });

  app.post('/api/community/requests', (req, res) => {
    const { category, title, description, scheduled_time } = req.body;
    const result = db.prepare(`
      INSERT INTO community_requests (user_id, category, title, description, scheduled_time, status)
      VALUES (1, ?, ?, ?, ?, 'Requested')
    `).run(category, title, description, scheduled_time);
    res.json({ success: true, id: result.lastInsertRowid });
  });

  // 5. User Management & Profile
  app.get('/api/user/profile', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    const contacts = db.prepare('SELECT * FROM emergency_contacts WHERE user_id = 1 ORDER BY priority ASC').all();
    res.json({ user, contacts });
  });

  app.post('/api/user/contacts', (req, res) => {
    const { name, relationship, phone, priority, notify_sms = 1, notify_call = 1 } = req.body;
    const result = db.prepare(`
      INSERT INTO emergency_contacts (user_id, name, relationship, phone, priority, notify_sms, notify_call)
      VALUES (1, ?, ?, ?, ?, ?, ?)
    `).run(name, relationship, phone, priority, notify_sms ? 1 : 0, notify_call ? 1 : 0);
    res.json({ success: true, id: result.lastInsertRowid });
  });

  app.delete('/api/user/contacts/:id', (req, res) => {
    db.prepare('DELETE FROM emergency_contacts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/user/subscription', (req, res) => {
    const { plan } = req.body;
    db.prepare('UPDATE users SET subscription_plan = ? WHERE id = 1').run(plan);
    res.json({ success: true, plan });
  });

  // 6. Telehealth & Video Consultations
  app.get('/api/telehealth/sessions', (req, res) => {
    const sessions = db.prepare('SELECT * FROM telehealth_sessions WHERE user_id = 1 ORDER BY id DESC').all();
    res.json({ sessions });
  });

  app.post('/api/telehealth/sessions', (req, res) => {
    const { doctor_name, specialty, scheduled_time, duration_mins = 30, notes = '' } = req.body;
    const meeting_url = `https://meet.carebridge.health/vance-chen-${Math.floor(100 + Math.random() * 900)}`;
    const result = db.prepare(`
      INSERT INTO telehealth_sessions (user_id, doctor_name, specialty, scheduled_time, duration_mins, status, meeting_url, notes)
      VALUES (1, ?, ?, ?, ?, 'Scheduled', ?, ?)
    `).run(doctor_name, specialty, scheduled_time, duration_mins, meeting_url, notes);
    res.json({ success: true, id: result.lastInsertRowid, meeting_url });
  });

  app.get('/api/telehealth/prescriptions', (req, res) => {
    const prescriptions = [
      { id: 'RX-9921', drug: 'Lisinopril 10mg', doctor: 'Dr. Evelyn Vance, MD', pharmacy: 'Walgreens 24th St (#4102)', status: 'Active Refill Transmitted', date: '2026-10-09' },
      { id: 'RX-8842', drug: 'Metformin HCl 500mg ER', doctor: 'Dr. Evelyn Vance, MD', pharmacy: 'Walgreens 24th St (#4102)', status: 'Ready for Pickup', date: '2026-10-02' },
      { id: 'RX-7719', drug: 'Atorvastatin 20mg', doctor: 'Dr. Robert Zhang, MD', pharmacy: 'CVS Pharmacy Potrero', status: 'Active (2 Refills Left)', date: '2026-09-18' }
    ];
    res.json({ prescriptions });
  });

  // 7. Insurance Claims & Policy Vault
  app.get('/api/insurance/claims', (req, res) => {
    const claims = db.prepare('SELECT * FROM insurance_claims WHERE user_id = 1 ORDER BY id DESC').all();
    res.json({ claims });
  });

  app.post('/api/insurance/claims', (req, res) => {
    const { hospital_name, service_type, amount_total, policy_number = 'MED-9082-SF4110' } = req.body;
    const claim_number = `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const amount_covered = amount_total * 0.95;
    const copay_amount = amount_total * 0.05;
    const now = new Date().toISOString().substring(0, 10);
    const result = db.prepare(`
      INSERT INTO insurance_claims (user_id, claim_number, hospital_name, service_type, amount_total, amount_covered, copay_amount, status, filed_date, policy_number)
      VALUES (1, ?, ?, ?, ?, ?, ?, 'Cashless Pre-Authorized', ?, ?)
    `).run(claim_number, hospital_name, service_type, amount_total, amount_covered, copay_amount, now, policy_number);
    res.json({ success: true, id: result.lastInsertRowid, claim_number, status: 'Cashless Pre-Authorized' });
  });

  app.get('/api/insurance/policies', (req, res) => {
    res.json({
      primary: {
        provider: 'Medicare Part B (Medical Insurance)',
        policy_number: 'MED-9082-SF4110',
        group_id: 'CMS-FEDERAL-CA',
        holder: 'Martha Chen',
        effective_date: 'Jan 01, 2013',
        emergency_copay: '$50.00 (Waived on inpatient admission)',
        ambulance_deductible: '100% Emergency Paramedic Covered',
        status: 'Active & In Good Standing'
      },
      secondary: {
        provider: 'Blue Cross Blue Shield Senior Advantage Plus',
        policy_number: 'BC-9924-88A',
        group_id: 'GRP-882104',
        rx_bin: '004336',
        rx_pcn: 'MEDDPRX',
        status: 'Active Supplemental'
      }
    });
  });

  // 8. Family Dashboard
  app.get('/api/family/dashboard', (req, res) => {
    const links = db.prepare('SELECT * FROM family_links WHERE user_id = 1').all();
    const latestVital = db.prepare('SELECT * FROM health_vitals WHERE user_id = 1 ORDER BY id DESC LIMIT 1').get();
    const activeSos = db.prepare("SELECT * FROM sos_incidents WHERE status != 'RESOLVED' ORDER BY id DESC LIMIT 1").get();
    const recentIncidents = db.prepare('SELECT * FROM sos_incidents ORDER BY id DESC LIMIT 3').all();
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();

    res.json({
      senior: user,
      family_links: links,
      latest_vitals: latestVital,
      active_emergency: activeSos || null,
      recent_incidents: recentIncidents,
      telemetry: {
        battery_level: 92,
        device_status: 'Online & Worn',
        motion_status: 'Resting in Living Room Armchair',
        pedometer_steps_today: 2840,
        last_kitchen_motion: '22 mins ago (Tea Kettle sensor)',
        last_checkin_voice: '8:15 AM "Feeling well, ready for day"',
        fall_sensor_status: 'Nominal (Zero anomalies detected)'
      }
    });
  });

  app.post('/api/family/ping', (req, res) => {
    const { message = 'Thinking of you Mom! - Love David' } = req.body;
    res.json({ success: true, delivered_at: new Date().toISOString(), message });
  });

  // Vite middleware in dev
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`CareBridge server running on http://0.0.0.0:${port}`);
  });
}

startServer();
