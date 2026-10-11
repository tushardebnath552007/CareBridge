export interface UserProfile {
  id: number;
  full_name: string;
  age: number;
  address: string;
  lat: number;
  lng: number;
  blood_type: string;
  allergies: string;
  chronic_conditions: string;
  primary_doctor: string;
  doctor_phone: string;
  caregiver_name: string;
  caregiver_relation: string;
  caregiver_phone: string;
  subscription_plan: string;
}

export interface EmergencyContact {
  id: number;
  user_id: number;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
  notify_sms: number;
  notify_call: number;
}

export interface SosIncident {
  id: number;
  user_id: number;
  status: 'ACTIVE_EMERGENCY' | 'DISPATCHED' | 'PARAMEDIC_EN_ROUTE' | 'RESOLVED';
  triggered_at: string;
  resolved_at?: string | null;
  lat: number;
  lng: number;
  location_name: string;
  severity: string;
  dispatched_unit?: string | null;
  notes?: string | null;
}

export interface Hospital {
  id: number;
  name: string;
  distance_km: number;
  address: string;
  phone: string;
  ambulance_eta_mins: number;
  available_icu_beds: number;
  available_er_beds: number;
  trauma_level: string;
  accepted_insurance: string;
}

export interface HealthVital {
  id: number;
  user_id: number;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  blood_sugar: number;
  spo2: number;
  temperature: number;
  recorded_at: string;
  status: string;
  notes?: string;
}

export interface Medication {
  id: number;
  user_id: number;
  name: string;
  dosage: string;
  schedule_time: string;
  taken_today: number;
  instructions: string;
  pills_remaining: number;
}

export interface CommunityRequest {
  id: number;
  user_id: number;
  category: string;
  title: string;
  description: string;
  scheduled_time: string;
  status: 'Requested' | 'Assigned' | 'In Progress' | 'Completed';
  volunteer_name?: string | null;
  volunteer_phone?: string | null;
  volunteer_rating?: number | null;
}

export interface TelehealthSession {
  id: number;
  user_id: number;
  doctor_name: string;
  specialty: string;
  scheduled_time: string;
  duration_mins: number;
  status: 'Scheduled' | 'Live' | 'Completed';
  meeting_url: string;
  notes?: string | null;
  prescription_issued?: string | null;
}

export interface Prescription {
  id: string;
  drug: string;
  doctor: string;
  pharmacy: string;
  status: string;
  date: string;
}

export interface InsuranceClaim {
  id: number;
  user_id: number;
  claim_number: string;
  hospital_name: string;
  service_type: string;
  amount_total: number;
  amount_covered: number;
  copay_amount: number;
  status: 'Pre-Approved' | 'In Review' | 'Settled' | 'Cashless Authorized' | 'Cashless Pre-Authorized';
  filed_date: string;
  policy_number: string;
}

export interface FamilyLink {
  id: number;
  user_id: number;
  relative_name: string;
  relationship: string;
  location: string;
  phone: string;
  email: string;
  last_active: string;
  battery_level: number;
  motion_status: string;
  allow_remote_vitals: number;
}

export interface FamilyDashboardData {
  senior: UserProfile;
  family_links: FamilyLink[];
  latest_vitals: HealthVital;
  active_emergency: SosIncident | null;
  recent_incidents: SosIncident[];
  telemetry: {
    battery_level: number;
    device_status: string;
    motion_status?: string;
    pedometer_steps_today: number;
    last_kitchen_motion: string;
    last_checkin_voice: string;
    fall_sensor_status: string;
  };
}
