import React, { useState, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  FileText, 
  HeartPulse, 
  Stethoscope, 
  Pill, 
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { api } from '../../utils/api';
import { sound } from '../../utils/audio';
import { TelehealthSession, Prescription } from '../../types';

interface TelehealthConsultationsTabProps {
  isSeniorMode: boolean;
}

export const TelehealthConsultationsTab: React.FC<TelehealthConsultationsTabProps> = ({ isSeniorMode }) => {
  const [sessions, setSessions] = useState<TelehealthSession[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [activeCallSession, setActiveCallSession] = useState<TelehealthSession | null>(null);

  // Video call simulated state
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  // New session form
  const [newSession, setNewSession] = useState({
    doctor_name: 'Dr. Evelyn Vance, MD',
    specialty: 'Geriatric & Internal Medicine',
    scheduled_time: 'Tomorrow, 10:00 AM',
    duration_mins: 30,
    notes: 'Routine hypertension and quarterly blood pressure follow-up'
  });

  useEffect(() => {
    loadTelehealthData();
  }, []);

  const loadTelehealthData = async () => {
    try {
      const [sessRes, rxRes] = await Promise.all([
        api.getTelehealthSessions(),
        api.getPrescriptions()
      ]);
      setSessions(sessRes.sessions);
      setPrescriptions(rxRes.prescriptions);
    } catch {
      // Fallback
    }
  };

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.scheduleTelehealthSession(newSession);
      sound.playSuccess();
      setIsScheduleModalOpen(false);
      loadTelehealthData();
    } catch {
      // Error
    }
  };

  const startVideoCall = (session: TelehealthSession) => {
    sound.playChime();
    setActiveCallSession(session);
  };

  const endVideoCall = () => {
    sound.playSuccess();
    setActiveCallSession(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Call to Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Virtual Care & Remote Clinic
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Telehealth & Video Consultations
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Encrypted HIPAA-compliant video visits with Martha Chen's geriatricians, cardiologists, and digital pharmacy prescription syncing.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Book Doctor Consultation</span>
        </button>
      </div>

      {/* Primary Doctor Spotlight Card */}
      <div className={`p-6 rounded-2xl bg-white border transition-all ${
        isSeniorMode 
          ? 'border-2 border-slate-300 shadow-md' 
          : 'border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src="/src/assets/images/doctor_evelyn_vance_1791717678448.jpg"
              alt="Dr. Evelyn Vance"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shrink-0 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-950">
                  Dr. Evelyn Vance, MD
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  Primary Physician
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                Chief of Geriatrics · St. Jude Metro Medical Network
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Licensed in CA & Medicare Approved</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-bold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Next Available: Today at 2:00 PM</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                const sampleSession: TelehealthSession = {
                  id: 1,
                  user_id: 1,
                  doctor_name: 'Dr. Evelyn Vance, MD',
                  specialty: 'Geriatric Medicine',
                  scheduled_time: 'Live Now',
                  duration_mins: 30,
                  status: 'Live',
                  meeting_url: 'https://meet.carebridge.health/vance-chen-782'
                };
                startVideoCall(sampleSession);
              }}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Launch Virtual Exam Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Scheduled Consultations vs Digital Prescription Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Sessions List */}
        <div className={`lg:col-span-7 rounded-2xl bg-white border p-6 flex flex-col justify-between transition-all ${
          isSeniorMode 
            ? 'border-2 border-slate-300 shadow-md' 
            : 'border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-600" />
                <h3 className="font-black text-sm text-slate-950">
                  Consultation Appointments
                </h3>
              </div>
              <span className="text-xs text-slate-600 font-semibold">
                {sessions.length} recorded
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {sessions.map((sess) => {
                const isScheduled = sess.status === 'Scheduled';
                return (
                  <div
                    key={sess.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-950">
                            {sess.doctor_name}
                          </h4>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                            {sess.specialty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-1">
                          {sess.notes || 'Routine follow-up visit'}
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 ${
                        sess.status === 'Completed'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sess.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-slate-800 font-bold">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        <span>{sess.scheduled_time} ({sess.duration_mins} min)</span>
                      </div>

                      {isScheduled && (
                        <button
                          onClick={() => startVideoCall(sess)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Enter Call</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Video Engine: WebRTC 256-bit AES Encrypted</span>
            <span>Caregiver David Chen invited as proxy</span>
          </div>
        </div>

        {/* Digital Prescription Syncing */}
        <div className={`lg:col-span-5 rounded-2xl bg-white border p-6 flex flex-col justify-between transition-all ${
          isSeniorMode 
            ? 'border-2 border-slate-300 shadow-md' 
            : 'border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-sm text-slate-950">
                  Synced e-Prescriptions
                </h3>
              </div>
              <span className="text-xs text-slate-600 font-semibold">Auto-sent to Pharmacy</span>
            </div>

            <div className="mt-4 space-y-3">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {rx.drug}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 font-medium">
                        Prescribed by {rx.doctor}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                      {rx.id}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-800 font-medium">
                    Fulfillment: {rx.pharmacy}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {rx.status}
                    </span>
                    <span className="text-slate-600 font-mono font-medium">
                      {rx.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-medium flex items-center justify-between">
            <span>Surescripts e-Prescribe Network</span>
            <span>Refills synced with Walgreens</span>
          </div>
        </div>
      </div>

      {/* Simulated Live Telehealth Video Call Overlay */}
      {activeCallSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
            {/* Call Header */}
            <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Virtual Consultation: {activeCallSession.doctor_name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Encrypted Session ID: #ENC-9942 · Patient: Martha Chen (78)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-red-950 text-red-300 text-[11px] font-mono font-bold border border-red-800">
                  REC · HIPAA SECURE
                </span>
              </div>
            </div>

            {/* Video Canvas Stage */}
            <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
              {/* Doctor Main Video Stream */}
              <img
                src="/src/assets/images/doctor_evelyn_vance_1791717678448.jpg"
                alt="Doctor Video"
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />

              {/* Patient Self-View Picture-in-Picture */}
              <div className="absolute top-4 right-4 w-44 h-32 rounded-2xl overflow-hidden border-2 border-white/60 shadow-2xl bg-black">
                {isVideoOn ? (
                  <img
                    src="/src/assets/images/avatar_elderly_mrs_chen_1791700380535.jpg"
                    alt="Martha Chen"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                    Camera Off
                  </div>
                )}
                <div className="absolute bottom-1 left-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Martha (You)
                </div>
              </div>

              {/* Live Vitals Telemetry HUD Overlay for the Doctor */}
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 text-white max-w-sm">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500 animate-heart-pulse" />
                  <span>Real-Time Patient Vitals Relay</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">BP</span>
                    <strong className="font-mono text-white">122/78</strong>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Pulse</span>
                    <strong className="font-mono text-emerald-400">72 bpm</strong>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Blood Sugar</span>
                    <strong className="font-mono text-amber-400">104 mg</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-3 rounded-2xl transition-colors ${
                    isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
                  }`}
                  title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-2xl transition-colors ${
                    isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
                  }`}
                  title={isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
                >
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              </div>

              <div className="text-center text-xs text-slate-400">
                Dr. Vance is speaking · Audio connected
              </div>

              <button
                onClick={endVideoCall}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Consultation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Session Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Schedule Telehealth Visit
                </h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSession} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Physician Specialist
                </label>
                <select
                  value={newSession.doctor_name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const spec = name.includes('Vance') ? 'Geriatric & Internal Medicine' : 'Cardiology & Pulse Rhythm';
                    setNewSession({ ...newSession, doctor_name: name, specialty: spec });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option>Dr. Evelyn Vance, MD (Geriatrician)</option>
                  <option>Dr. Robert Zhang, MD (Cardiologist)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Appointment Time
                </label>
                <input
                  type="text"
                  value={newSession.scheduled_time}
                  onChange={(e) => setNewSession({ ...newSession, scheduled_time: e.target.value })}
                  placeholder="e.g. Tomorrow at 10:00 AM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Consultation
                </label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  placeholder="e.g. Blood pressure checkup and joint stiffness review"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
