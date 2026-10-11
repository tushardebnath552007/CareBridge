import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Activity, 
  Droplet, 
  Thermometer, 
  Wind, 
  Plus, 
  Pill, 
  BellRing, 
  Check, 
  Volume2, 
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sun,
  Sunset,
  Moon,
  Coffee
} from 'lucide-react';
import { api } from '../../utils/api';
import { sound } from '../../utils/audio';
import { HealthVital, Medication } from '../../types';

interface HealthMonitoringTabProps {
  isSeniorMode: boolean;
}

export const HealthMonitoringTab: React.FC<HealthMonitoringTabProps> = ({ isSeniorMode }) => {
  const [vitals, setVitals] = useState<HealthVital[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [isAlarmTesting, setIsAlarmTesting] = useState(false);
  const [activeAlarmMedId, setActiveAlarmMedId] = useState<number | null>(null);
  const [medFilter, setMedFilter] = useState<'all' | 'pending' | 'morning' | 'afternoon' | 'evening' | 'bedtime'>('all');
  const [lastLoggedMessage, setLastLoggedMessage] = useState<string | null>(null);

  // New vital form state
  const [newVital, setNewVital] = useState({
    systolic: 120,
    diastolic: 80,
    heart_rate: 72,
    blood_sugar: 105,
    spo2: 98,
    temperature: 98.6,
    notes: 'Routine daily check'
  });

  // New medication form state
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    schedule_time: '08:00 AM',
    instructions: 'Take with full glass of water with meals',
    pills_remaining: 30
  });

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      const [vitalsRes, medsRes] = await Promise.all([
        api.getVitals(),
        api.getMedications()
      ]);
      setVitals(vitalsRes.vitals || []);
      setMedications(medsRes.medications || []);
    } catch {
      // Fallback
    }
  };

  const handleToggleMedication = async (med: Medication) => {
    try {
      const willBeTaken = med.taken_today === 1 ? false : true;
      await api.toggleMedication(med.id, willBeTaken);
      
      if (willBeTaken) {
        sound.playSuccess();
        setLastLoggedMessage(`✓ Dose of ${med.name} (${med.dosage}) recorded successfully!`);
      } else {
        sound.playChime();
        setLastLoggedMessage(`Dose of ${med.name} unmarked.`);
      }
      setTimeout(() => setLastLoggedMessage(null), 4000);

      // Optimistically update or reload
      setMedications((prev) =>
        prev.map((m) => (m.id === med.id ? { ...m, taken_today: willBeTaken ? 1 : 0 } : m))
      );
    } catch {
      // Error
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name) return;
    try {
      await api.addMedication(newMed);
      sound.playSuccess();
      setIsAddMedModalOpen(false);
      setNewMed({
        name: '',
        dosage: '',
        schedule_time: '08:00 AM',
        instructions: 'Take with full glass of water with meals',
        pills_remaining: 30
      });
      loadHealthData();
      setLastLoggedMessage(`✓ Added new medication ${newMed.name} to schedule!`);
      setTimeout(() => setLastLoggedMessage(null), 4000);
    } catch {
      // Error
    }
  };

  const handleLogVital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logVital(newVital);
      sound.playSuccess();
      setIsLogModalOpen(false);
      loadHealthData();
      setLastLoggedMessage('✓ New clinical vitals recorded and synced to EHR portal.');
      setTimeout(() => setLastLoggedMessage(null), 4000);
    } catch {
      // Error
    }
  };

  const testMedicationChime = (medId?: number) => {
    if (medId) {
      setActiveAlarmMedId(medId);
    } else {
      setIsAlarmTesting(true);
    }
    sound.playChime();
    setTimeout(() => {
      setIsAlarmTesting(false);
      setActiveAlarmMedId(null);
    }, 1200);
  };

  const latestVital = vitals[0] || {
    systolic: 120,
    diastolic: 78,
    heart_rate: 72,
    blood_sugar: 104,
    spo2: 98,
    temperature: 98.4,
    status: 'Normal',
    recorded_at: 'Today, 8:30 AM'
  };

  // Medication calculations & categorizations
  const totalMedsCount = medications.length;
  const takenMedsCount = medications.filter(m => m.taken_today === 1).length;
  const pendingMedsCount = totalMedsCount - takenMedsCount;
  const adherencePercent = totalMedsCount > 0 ? Math.round((takenMedsCount / totalMedsCount) * 100) : 0;

  // Filtered medications
  const filteredMedications = medications.filter(m => {
    if (medFilter === 'pending') return m.taken_today === 0;
    if (medFilter === 'morning') return m.schedule_time.includes('AM') && !m.schedule_time.startsWith('11') && !m.schedule_time.startsWith('10');
    if (medFilter === 'afternoon') return m.schedule_time.includes('01:') || m.schedule_time.includes('02:') || m.schedule_time.includes('12:');
    if (medFilter === 'evening') return m.schedule_time.includes('06:') || m.schedule_time.includes('07:') || m.schedule_time.includes('08:');
    if (medFilter === 'bedtime') return m.schedule_time.includes('09:') || m.schedule_time.includes('10:') || m.schedule_time.includes('11:');
    return true;
  });

  // Next upcoming dose
  const nextPendingMed = medications.find(m => m.taken_today === 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Row with High-Contrast Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            Clinical Telemetry & Medication Adherence
          </span>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">
            Daily Health & Vitals Monitoring
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Synchronized with remote caregiver David Chen (Chicago) and Dr. Evelyn Vance's clinical patient portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => testMedicationChime()}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-rose-600" />
            <span>{isAlarmTesting ? 'Sounding Alert...' : 'Test Pill Reminder Sound'}</span>
          </button>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Vitals</span>
          </button>
        </div>
      </div>

      {/* Real-Time Toast Notification Banner */}
      {lastLoggedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{lastLoggedMessage}</span>
          </div>
          <button onClick={() => setLastLoggedMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Primary Vitals KPI Metric Strip with Deep Contrast */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Blood Pressure */}
        <div className={`p-4 rounded-2xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Blood Pressure</span>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono tabular-nums text-slate-950">
            {latestVital.systolic}/{latestVital.diastolic}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between font-semibold">
            <span>mmHg</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Optimal</span>
          </div>
        </div>

        {/* Heart Rate */}
        <div className={`p-4 rounded-2xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Heart Rate</span>
            <HeartPulse className="w-4 h-4 text-rose-600 animate-heart-pulse" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono tabular-nums text-slate-950">
            {latestVital.heart_rate}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between font-semibold">
            <span>BPM</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Resting</span>
          </div>
        </div>

        {/* Blood Sugar */}
        <div className={`p-4 rounded-2xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Blood Sugar</span>
            <Droplet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono tabular-nums text-slate-950">
            {latestVital.blood_sugar}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between font-semibold">
            <span>mg/dL</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Target Range</span>
          </div>
        </div>

        {/* SpO2 */}
        <div className={`p-4 rounded-2xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Oxygen (SpO2)</span>
            <Wind className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono tabular-nums text-slate-950">
            {latestVital.spo2}%
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between font-semibold">
            <span>Pulse Ox</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Excellent</span>
          </div>
        </div>

        {/* Temperature */}
        <div className={`p-4 rounded-2xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Temperature</span>
            <Thermometer className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono tabular-nums text-slate-950">
            {latestVital.temperature}°F
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between font-semibold">
            <span>Oral Temp</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Normal</span>
          </div>
        </div>
      </div>

      {/* FEATURE SECTION: Daily Medication Schedule with Checkboxes & Visual Reminders */}
      <div className={`rounded-2xl bg-white border p-6 transition-all ${
        isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
      }`}>
        {/* Medication Header Strip & Adherence Score */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-950">
                  Daily Medication Schedule & Dose Logger
                </h3>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                  Smart Reminders Active
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Check off doses as you take them. Your son David and physician receive automated adherence confirmation pings.
              </p>
            </div>
          </div>

          {/* Adherence Gauge & Actions */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
              <div className="text-right">
                <div className="text-xs font-black text-slate-950">
                  {takenMedsCount} of {totalMedsCount} Taken Today
                </div>
                <div className="text-[11px] text-slate-600 font-semibold">
                  {adherencePercent}% Daily Adherence
                </div>
              </div>
              {/* Circular Mini Progress */}
              <div className="w-9 h-9 rounded-full bg-slate-200 relative flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                <span className="z-10">{adherencePercent}%</span>
                <div 
                  className="absolute inset-0 rounded-full bg-emerald-500 opacity-30" 
                  style={{ clipPath: `inset(0 0 ${100 - adherencePercent}% 0)` }} 
                />
              </div>
            </div>

            <button
              onClick={() => setIsAddMedModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-rose-400" />
              <span>Add Medication</span>
            </button>
          </div>
        </div>

        {/* Visual Pillbox Schedule Timeline (4 Day Segments) */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Morning Bucket */}
          <div 
            onClick={() => setMedFilter('morning')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              medFilter === 'morning' ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-400' : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-600" />
                <span>Morning (8 AM)</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                2 Logged ✓
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
              Lisinopril, Metformin HCl
            </p>
          </div>

          {/* Afternoon Bucket */}
          <div 
            onClick={() => setMedFilter('afternoon')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              medFilter === 'afternoon' ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-400' : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-orange-500" />
                <span>Lunch (1 PM)</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                1 of 2 Taken
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
              Glucosamine, Vitamin D3
            </p>
          </div>

          {/* Evening Bucket */}
          <div 
            onClick={() => setMedFilter('evening')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              medFilter === 'evening' ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-400' : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Sunset className="w-4 h-4 text-rose-500" />
                <span>Dinner (8 PM)</span>
              </span>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                Pending Due
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
              Atorvastatin (20mg)
            </p>
          </div>

          {/* Bedtime Bucket */}
          <div 
            onClick={() => setMedFilter('bedtime')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              medFilter === 'bedtime' ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-400' : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Bedtime (10 PM)</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                As Needed
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
              Melatonin Low-Dose
            </p>
          </div>
        </div>

        {/* Filter Segmented Control Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setMedFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                medFilter === 'all' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              All Medications ({medications.length})
            </button>
            <button
              onClick={() => setMedFilter('pending')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                medFilter === 'pending' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-700 hover:text-rose-700'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Pending Doses ({pendingMedsCount})</span>
            </button>
            <button
              onClick={() => setMedFilter('morning')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                medFilter === 'morning' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Morning
            </button>
            <button
              onClick={() => setMedFilter('afternoon')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                medFilter === 'afternoon' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Afternoon
            </button>
            <button
              onClick={() => setMedFilter('evening')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                medFilter === 'evening' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Evening
            </button>
            <button
              onClick={() => setMedFilter('bedtime')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                medFilter === 'bedtime' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Bedtime
            </button>
          </div>

          {/* Active Reminder Callout */}
          {nextPendingMed && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Next Reminder: {nextPendingMed.name} ({nextPendingMed.schedule_time})</span>
            </div>
          )}
        </div>

        {/* List of Medications with Large Checkboxes & Visual Reminders */}
        <div className="mt-4 space-y-3">
          {filteredMedications.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Pill className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No medications matching filter</h4>
              <p className="text-xs text-slate-500 mt-1">Try switching back to "All Medications" or add a new schedule.</p>
              <button
                onClick={() => setMedFilter('all')}
                className="mt-3 px-3 py-1.5 bg-white border border-slate-300 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-100"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            filteredMedications.map((m) => {
              const isTaken = m.taken_today === 1;
              const isTestingThis = activeAlarmMedId === m.id;

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isTaken
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : 'bg-white border-slate-300 hover:border-slate-400 shadow-xs'
                  } ${isSeniorMode ? 'border-2' : ''}`}
                >
                  {/* Left: Interactive Checkbox + Pill Details */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* ACCESSIBLE DOSE LOGGING CHECKBOX */}
                    <button
                      onClick={() => handleToggleMedication(m)}
                      role="checkbox"
                      aria-checked={isTaken}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        isTaken
                          ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                          : 'bg-white border-2 border-slate-400 hover:border-rose-500 text-transparent hover:text-slate-300 shadow-xs animate-reminder-pulse'
                      }`}
                      title={isTaken ? 'Dose marked as taken (Click to undo)' : 'Click to log dose as taken now'}
                    >
                      <Check className={`w-5 h-5 font-black ${isTaken ? 'text-white' : 'text-slate-300'}`} />
                    </button>

                    {/* Pill Demographics & Schedule */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-base font-extrabold text-slate-950 ${isTaken ? 'line-through text-slate-600' : ''}`}>
                          {m.name}
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {m.dosage}
                        </span>

                        {/* Visual Status Badges */}
                        {isTaken ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Logged Today</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <BellRing className="w-3.5 h-3.5 text-amber-700" />
                            <span>Dose Due · Reminder Active</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 font-semibold mt-1">
                        {m.instructions}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1 text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                          <Clock className="w-3.5 h-3.5 text-rose-600" />
                          {m.schedule_time}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-slate-700">
                          {m.pills_remaining} pills left in dispenser
                        </span>
                        <span>·</span>
                        <span className="text-emerald-700 font-bold">
                          Walgreens Rx #9028
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Test Tone Chime & Large Quick Toggle */}
                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <button
                      onClick={() => testMedicationChime(m.id)}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Test acoustic reminder tone for this medication"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isTestingThis ? 'text-rose-600 animate-spin' : 'text-slate-500'}`} />
                      <span className="hidden md:inline">{isTestingThis ? 'Sounding...' : 'Alarm Tone'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleMedication(m)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isTaken
                          ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                          : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                      }`}
                    >
                      {isTaken ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Dose Taken ✓</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Log Dose Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pharmacy Refill Footer Strip */}
        <div className="mt-5 pt-3.5 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Prescription Sync: Walgreens 24th St (#4110) · Primary: Dr. Evelyn Vance</span>
          </span>
          <span className="text-emerald-700 font-bold">
            Automated CareBridge Refill Courier Synced
          </span>
        </div>
      </div>

      {/* Historical Vitals Table & Visual Trend Analytics */}
      <div className={`rounded-2xl bg-white border p-6 transition-all ${
        isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-600" />
            <h3 className="font-black text-base text-slate-950">
              Vitals History & Clinical Readings
            </h3>
          </div>
          <span className="text-xs text-slate-600 font-semibold">
            {vitals.length} Recorded Readings
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Visual Trend Bars (Systolic Blood Pressure) */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
              <span>Systolic BP Trend</span>
              <span className="text-[11px] text-emerald-700 font-bold">Optimal: &lt;130 mmHg</span>
            </div>
            <div className="flex items-end justify-between gap-3 h-28 pt-2">
              {vitals.slice(0, 5).reverse().map((v, idx) => {
                const heightPercent = Math.min(100, Math.max(30, ((v.systolic - 90) / 70) * 100));
                const isElevated = v.systolic >= 130;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[11px] font-mono font-bold tabular-nums text-slate-900">
                      {v.systolic}
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isElevated ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-slate-600 font-semibold truncate max-w-full">
                      {v.recorded_at.split(' ')[0].substring(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Log Table */}
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Blood Pressure</th>
                  <th className="pb-2">Heart Rate</th>
                  <th className="pb-2">Blood Sugar</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vitals.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 font-medium">
                    <td className="py-2.5 text-slate-700 font-semibold">
                      {v.recorded_at.substring(0, 16)}
                    </td>
                    <td className="py-2.5 font-mono font-bold tabular-nums text-slate-950">
                      {v.systolic}/{v.diastolic} mmHg
                    </td>
                    <td className="py-2.5 font-mono font-semibold tabular-nums text-slate-800">
                      {v.heart_rate} bpm
                    </td>
                    <td className="py-2.5 font-mono font-semibold tabular-nums text-slate-800">
                      {v.blood_sugar} mg/dL
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        v.status === 'Normal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Record New Vitals Entry */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-slate-950">
                  Record New Vitals Entry
                </h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogVital} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Systolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={newVital.systolic}
                    onChange={(e) => setNewVital({ ...newVital, systolic: parseInt(e.target.value) || 120 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Diastolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={newVital.diastolic}
                    onChange={(e) => setNewVital({ ...newVital, diastolic: parseInt(e.target.value) || 80 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    value={newVital.heart_rate}
                    onChange={(e) => setNewVital({ ...newVital, heart_rate: parseInt(e.target.value) || 72 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Blood Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={newVital.blood_sugar}
                    onChange={(e) => setNewVital({ ...newVital, blood_sugar: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    SpO2 Oxygen (%)
                  </label>
                  <input
                    type="number"
                    value={newVital.spo2}
                    onChange={(e) => setNewVital({ ...newVital, spo2: parseInt(e.target.value) || 98 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Temperature (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVital.temperature}
                    onChange={(e) => setNewVital({ ...newVital, temperature: parseFloat(e.target.value) || 98.6 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Clinician or Self Notes
                </label>
                <input
                  type="text"
                  value={newVital.notes}
                  onChange={(e) => setNewVital({ ...newVital, notes: e.target.value })}
                  placeholder="e.g. Taken 30 mins after breakfast walk"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors"
                >
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add New Medication */}
      {isAddMedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-slate-950">
                  Add New Daily Medication
                </h3>
              </div>
              <button
                onClick={() => setIsAddMedModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder="e.g. Amlodipine, Vitamin B12, Lisinopril"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Dosage & Form
                  </label>
                  <input
                    type="text"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    placeholder="e.g. 5mg Tablet, 10ml Liquid"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Schedule Time
                  </label>
                  <select
                    value={newMed.schedule_time}
                    onChange={(e) => setNewMed({ ...newMed, schedule_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 text-sm font-semibold"
                  >
                    <option value="08:00 AM">08:00 AM (Morning / Breakfast)</option>
                    <option value="01:00 PM">01:00 PM (Afternoon / Lunch)</option>
                    <option value="08:00 PM">08:00 PM (Evening / Dinner)</option>
                    <option value="10:00 PM">10:00 PM (Night / Bedtime)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Patient Instructions & Food Directions
                </label>
                <input
                  type="text"
                  value={newMed.instructions}
                  onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                  placeholder="e.g. Take with a full glass of water after breakfast"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Initial Pill Supply in Dispenser
                </label>
                <input
                  type="number"
                  value={newMed.pills_remaining}
                  onChange={(e) => setNewMed({ ...newMed, pills_remaining: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 text-sm font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddMedModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
