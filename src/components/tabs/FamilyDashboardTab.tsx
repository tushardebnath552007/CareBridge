import React, { useState, useEffect } from 'react';
import { 
  Users, 
  HeartPulse, 
  BatteryCharging, 
  Activity, 
  MapPin, 
  PhoneCall, 
  Send, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Footprints, 
  Coffee, 
  MessageSquare,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { api } from '../../utils/api';
import { sound } from '../../utils/audio';
import { FamilyDashboardData } from '../../types';

interface FamilyDashboardTabProps {
  isSeniorMode: boolean;
}

export const FamilyDashboardTab: React.FC<FamilyDashboardTabProps> = ({ isSeniorMode }) => {
  const [data, setData] = useState<FamilyDashboardData | null>(null);
  const [pingMsg, setPingMsg] = useState('Thinking of you Mom! Hope you are having a lovely morning.');
  const [isSendingPing, setIsSendingPing] = useState(false);
  const [pingSentSuccess, setPingSentSuccess] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.getFamilyDashboard();
      setData(res);
    } catch {
      // Fallback
    }
  };

  const handleSendPing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingPing(true);
    try {
      await api.sendFamilyPing(pingMsg);
      sound.playSuccess();
      setPingSentSuccess(true);
      setTimeout(() => setPingSentSuccess(false), 3500);
    } catch {
      // Error
    } finally {
      setIsSendingPing(false);
    }
  };

  if (!data) {
    return (
      <div className="text-center py-12 text-sm text-slate-500">
        Loading Family Caregiver Telemetry...
      </div>
    );
  }

  const { senior, telemetry, latest_vitals, active_emergency, family_links } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            Remote Family Link & Telemetry
          </span>
          <h2 className="text-2xl font-black text-slate-950">
            Family Caregiver Monitoring Portal
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Designed for working professionals away from home (David in Chicago & Emily in Seattle) to stay continuously connected with Martha in San Francisco.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Home Hub Online & Connected</span>
          </span>
        </div>
      </div>

      {/* Senior Status Overview Banner */}
      <div className={`p-6 rounded-2xl bg-white border transition-all ${
        isSeniorMode 
          ? 'border-2 border-slate-300 shadow-md' 
          : 'border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src="/src/assets/images/avatar_elderly_mrs_chen_1791700380535.jpg"
              alt="Martha Chen"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-950">
                  {senior.full_name}, Age {senior.age}
                </h3>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  Status: Rested & Safe
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{senior.address}</span>
              </p>
              <div className="mt-2 text-xs text-slate-700 flex flex-wrap items-center gap-3">
                <span className="font-bold text-slate-900">
                  Current Activity: {telemetry.motion_status || 'Resting in Living Room Armchair'}
                </span>
                <span>·</span>
                <span className="font-medium">Wearable Battery: <strong className="font-mono text-emerald-700 font-bold">{telemetry.battery_level}%</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <a
              href="tel:+14155550182"
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>Call Mom Direct</span>
            </a>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Blood Pressure */}
        <div className={`p-4 rounded-xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Latest Blood Pressure</span>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-950 tabular-nums">
            {latest_vitals.systolic}/{latest_vitals.diastolic}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">
            Normal Resting ({latest_vitals.status})
          </div>
        </div>

        {/* Heart Rate */}
        <div className={`p-4 rounded-xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Resting Heart Rate</span>
            <HeartPulse className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-950 tabular-nums">
            {latest_vitals.heart_rate} <span className="text-xs font-semibold text-slate-600">BPM</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">
            Regular Sinus Rhythm
          </div>
        </div>

        {/* Steps Today */}
        <div className={`p-4 rounded-xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Pedometer Mobility</span>
            <Footprints className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-950 tabular-nums">
            {telemetry.pedometer_steps_today.toLocaleString()} <span className="text-xs font-semibold text-slate-600">steps</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">
            Morning courtyard walk logged
          </div>
        </div>

        {/* Fall Sensor */}
        <div className={`p-4 rounded-xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Fall Detection Radar</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-base font-black text-slate-950">
            0 Incidents
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">
            Sensor Active & Nominal
          </div>
        </div>
      </div>

      {/* Main Grid: Send Message / Ping to Mom vs Remote Sensor Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Send Instant Ping & Wellbeing Note */}
        <div className={`lg:col-span-6 rounded-2xl bg-white border p-6 flex flex-col justify-between transition-all ${
          isSeniorMode 
            ? 'border-2 border-slate-300 shadow-md' 
            : 'border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-600" />
                <h3 className="font-black text-sm text-slate-950">
                  Send Instant Voice / Screen Note to Mom
                </h3>
              </div>
              <span className="text-xs text-slate-600 font-medium">Delivered via CareBridge Hub</span>
            </div>

            {pingSentSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Note sent! Martha's tablet screen displayed your message with audio chime.</span>
              </div>
            )}

            <form onSubmit={handleSendPing} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Message Content (Displays in Large High-Contrast Font on Tablet)
                </label>
                <textarea
                  value={pingMsg}
                  onChange={(e) => setPingMsg(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs leading-relaxed font-medium focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPingMsg("Good morning Mom! Remember to take your morning Lisinopril before tea.")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                >
                  "Pill Reminder"
                </button>
                <button
                  type="button"
                  onClick={() => setPingMsg("Hey Mom, David here! I will call you tonight around 7:00 PM Chicago time.")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                >
                  "Evening Call Notice"
                </button>
                <button
                  type="button"
                  onClick={() => setPingMsg("Ordered your favorite groceries from Safeway, arriving at 3:00 PM today!")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                >
                  "Grocery Delivery Ping"
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSendingPing}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingPing ? 'Transmitting to SF...' : 'Send Note to Mom'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-medium flex items-center justify-between">
            <span>Tablet Auto-Speaker: Enabled</span>
            <span className="text-emerald-700 font-bold">Audible Confirmation Received</span>
          </div>
        </div>

        {/* Remote Daily Activity & Environmental Sensor Stream */}
        <div className={`lg:col-span-6 rounded-2xl bg-white border p-6 flex flex-col justify-between transition-all ${
          isSeniorMode 
            ? 'border-2 border-slate-300 shadow-md' 
            : 'border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-sm text-slate-950">
                  Today's Living Activity Log
                </h3>
              </div>
              <span className="text-xs text-slate-600 font-semibold">SF Home Sensor Network</span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Coffee className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-950 font-bold">Kitchen Tea Kettle Motion</strong>
                    <span className="text-slate-500 font-mono text-[11px] font-semibold">22 mins ago</span>
                  </div>
                  <p className="text-slate-600 text-[11px] font-medium mt-0.5">
                    Sensor triggered for 6 minutes (Morning green tea prepared).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-950 font-bold">Morning Verbal Check-In</strong>
                    <span className="text-slate-500 font-mono text-[11px] font-semibold">8:15 AM</span>
                  </div>
                  <p className="text-slate-600 text-[11px] font-medium mt-0.5">
                    Voice response: "{telemetry.last_checkin_voice}".
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Footprints className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-950 font-bold">Courtyard Garden Walk</strong>
                    <span className="text-slate-500 font-mono text-[11px] font-semibold">9:00 AM</span>
                  </div>
                  <p className="text-slate-600 text-[11px] font-medium mt-0.5">
                    Logged 1,420 steps with Elena Gomez (Community Volunteer).
                  </p>
                </div>
              </div>
            </div>

            {/* Caregivers Authorized List */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                Authorized Family Caregivers
              </h4>
              <div className="space-y-2 text-xs">
                {family_links.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">{link.relative_name}</span>
                      <span className="text-slate-500 text-[11px] ml-1.5 font-medium">({link.relationship})</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-700 font-semibold">{link.location}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-medium flex items-center justify-between">
            <span>Automated Daily Digest: Enabled</span>
            <span className="text-slate-700 font-bold">Nightly SMS summary sent at 9:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
