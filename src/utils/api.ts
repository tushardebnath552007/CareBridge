import { 
  UserProfile, 
  EmergencyContact, 
  SosIncident, 
  Hospital, 
  HealthVital, 
  Medication, 
  CommunityRequest 
} from '../types';

export const api = {
  // SOS & Emergency
  async triggerSos(payload: { user_id?: number; lat: number; lng: number; location_name: string; severity?: string }) {
    const res = await fetch('/api/sos/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to trigger SOS');
    return res.json();
  },

  async getActiveSos(): Promise<{ active: SosIncident | null }> {
    const res = await fetch('/api/sos/active');
    if (!res.ok) throw new Error('Failed to fetch active SOS');
    return res.json();
  },

  async resolveSos(incident_id: number) {
    const res = await fetch('/api/sos/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id })
    });
    if (!res.ok) throw new Error('Failed to resolve SOS');
    return res.json();
  },

  async getSosHistory(): Promise<{ history: SosIncident[] }> {
    const res = await fetch('/api/sos/history');
    if (!res.ok) throw new Error('Failed to fetch SOS history');
    return res.json();
  },

  // Hospital Coordination
  async getHospitals(): Promise<{ hospitals: Hospital[] }> {
    const res = await fetch('/api/hospitals');
    if (!res.ok) throw new Error('Failed to fetch hospitals');
    return res.json();
  },

  async dispatchAmbulance(hospital_id: number = 1) {
    const res = await fetch('/api/hospital/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospital_id })
    });
    if (!res.ok) throw new Error('Failed to dispatch ambulance');
    return res.json();
  },

  // Health Monitoring
  async getVitals(): Promise<{ vitals: HealthVital[] }> {
    const res = await fetch('/api/vitals');
    if (!res.ok) throw new Error('Failed to fetch vitals');
    return res.json();
  },

  async logVital(vital: Partial<HealthVital>) {
    const res = await fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vital)
    });
    if (!res.ok) throw new Error('Failed to log vital');
    return res.json();
  },

  // Medications
  async getMedications(): Promise<{ medications: Medication[] }> {
    const res = await fetch('/api/medications');
    if (!res.ok) throw new Error('Failed to fetch medications');
    return res.json();
  },

  async addMedication(med: Partial<Medication>) {
    const res = await fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(med)
    });
    if (!res.ok) throw new Error('Failed to add medication');
    return res.json();
  },

  async toggleMedication(id: number, taken: boolean) {
    const res = await fetch('/api/medications/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, taken })
    });
    if (!res.ok) throw new Error('Failed to toggle medication');
    return res.json();
  },

  // Community Care
  async getCommunityRequests(): Promise<{ requests: CommunityRequest[] }> {
    const res = await fetch('/api/community/requests');
    if (!res.ok) throw new Error('Failed to fetch community requests');
    return res.json();
  },

  async createCommunityRequest(data: { category: string; title: string; description: string; scheduled_time: string }) {
    const res = await fetch('/api/community/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create community request');
    return res.json();
  },

  // User Management
  async getUserProfile(): Promise<{ user: UserProfile; contacts: EmergencyContact[] }> {
    const res = await fetch('/api/user/profile');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async addContact(contact: { name: string; relationship: string; phone: string; priority: number; notify_sms?: number; notify_call?: number }) {
    const res = await fetch('/api/user/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });
    if (!res.ok) throw new Error('Failed to add contact');
    return res.json();
  },

  async deleteContact(id: number) {
    const res = await fetch(`/api/user/contacts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete contact');
    return res.json();
  },

  async updateSubscription(plan: string) {
    const res = await fetch('/api/user/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    if (!res.ok) throw new Error('Failed to update subscription');
    return res.json();
  },

  // 6. Telehealth & Video Consultations
  async getTelehealthSessions(): Promise<{ sessions: import('../types').TelehealthSession[] }> {
    const res = await fetch('/api/telehealth/sessions');
    if (!res.ok) throw new Error('Failed to fetch telehealth sessions');
    return res.json();
  },

  async scheduleTelehealthSession(session: { doctor_name: string; specialty: string; scheduled_time: string; duration_mins?: number; notes?: string }) {
    const res = await fetch('/api/telehealth/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    if (!res.ok) throw new Error('Failed to schedule session');
    return res.json();
  },

  async getPrescriptions(): Promise<{ prescriptions: import('../types').Prescription[] }> {
    const res = await fetch('/api/telehealth/prescriptions');
    if (!res.ok) throw new Error('Failed to fetch prescriptions');
    return res.json();
  },

  // 7. Insurance Claims & Policy Vault
  async getInsuranceClaims(): Promise<{ claims: import('../types').InsuranceClaim[] }> {
    const res = await fetch('/api/insurance/claims');
    if (!res.ok) throw new Error('Failed to fetch claims');
    return res.json();
  },

  async fileInsuranceClaim(claim: { hospital_name: string; service_type: string; amount_total: number; policy_number?: string }) {
    const res = await fetch('/api/insurance/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim)
    });
    if (!res.ok) throw new Error('Failed to file claim');
    return res.json();
  },

  async getInsurancePolicies() {
    const res = await fetch('/api/insurance/policies');
    if (!res.ok) throw new Error('Failed to fetch policies');
    return res.json();
  },

  // 8. Family Dashboard
  async getFamilyDashboard(): Promise<import('../types').FamilyDashboardData> {
    const res = await fetch('/api/family/dashboard');
    if (!res.ok) throw new Error('Failed to fetch family dashboard');
    return res.json();
  },

  async sendFamilyPing(message?: string) {
    const res = await fetch('/api/family/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error('Failed to send family ping');
    return res.json();
  }
};
