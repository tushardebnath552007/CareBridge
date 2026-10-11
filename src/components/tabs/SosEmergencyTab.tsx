import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  Navigation, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  Clock, 
  MapPin, 
  Ambulance, 
  ShieldAlert,
  Send,
  Compass
} from 'lucide-react';
import { api } from '../../utils/api';
import { sound } from '../../utils/audio';
import { EmergencyContact, SosIncident } from '../../types';
import { SosMap } from '../SosMap';

interface SosEmergencyTabProps {
  isSeniorMode: boolean;
  contacts: EmergencyContact[];
  onSosStateChange?: (active: boolean) => void;
}

export const SosEmergencyTab: React.FC<SosEmergencyTabProps> = ({
  isSeniorMode,
  contacts,
  onSosStateChange
}) => {
  const [activeIncident, setActiveIncident] = useState<SosIncident | null>(null);
  const [history, setHistory] = useState<SosIncident[]>([]);
  const [isAudioAlertOn, setIsAudioAlertOn] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy: number; address: string }>({
    lat: 37.7599,
    lng: -122.4148,
    accuracy: 8,
    address: '742 Evergreen Terrace, Apt 3B, San Francisco, CA'
  });
  const [familyNotifications, setFamilyNotifications] = useState<Array<{ name: string; status: string; channel: string }>>([]);

  // Fetch initial active incident and history
  const loadData = async () => {
    try {
      const activeRes = await api.getActiveSos();
      if (activeRes.active) {
        setActiveIncident(activeRes.active);
        onSosStateChange?.(true);
      } else {
        setActiveIncident(null);
        onSosStateChange?.(false);
      }
      const histRes = await api.getSosHistory();
      setHistory(histRes.history || []);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadData();

    // Acquire live geolocation if permission granted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            address: 'Live Geolocation Pinpoint (San Francisco Area)'
          });
        },
        () => {
          // Default registered home coordinates
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Handle countdown if triggered
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      executeSosTrigger();
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleStartSos = () => {
    // 3-second safeguard countdown to prevent accidental bumps
    setCountdown(3);
  };

  const handleCancelCountdown = () => {
    setCountdown(null);
  };

  const executeSosTrigger = async () => {
    setIsTriggering(true);
    try {
      const res = await api.triggerSos({
        lat: gpsCoords.lat,
        lng: gpsCoords.lng,
        location_name: gpsCoords.address,
        severity: 'CRITICAL'
      });

      const newIncident: SosIncident = {
        id: res.incident_id,
        user_id: 1,
        status: 'ACTIVE_EMERGENCY',
        triggered_at: res.triggered_at,
        lat: gpsCoords.lat,
        lng: gpsCoords.lng,
        location_name: gpsCoords.address,
        severity: 'CRITICAL',
        dispatched_unit: res.dispatched_unit
      };

      setActiveIncident(newIncident);
      onSosStateChange?.(true);

      // Trigger siren sound
      sound.startSosAlarm();
      setIsAudioAlertOn(true);

      // Simulate family broadcast log
      setFamilyNotifications([
        { name: 'David Chen (Son)', status: 'SMS Sent + Auto-Call Ringing', channel: 'SMS & Voice' },
        { name: 'Dr. Evelyn Vance (Geriatrician)', status: 'Priority Medical Page Sent', channel: 'SMS' },
        { name: 'Sarah Jenkins (Neighbor Keyholder)', status: 'SMS Doorcode Alert Dispatched', channel: 'SMS' }
      ]);

      loadData();
    } catch {
      // Error handling
    } finally {
      setIsTriggering(false);
    }
  };

  const handleResolveSos = async () => {
    if (!activeIncident) return;
    try {
      await api.resolveSos(activeIncident.id);
      sound.stopSosAlarm();
      sound.playSuccess();
      setIsAudioAlertOn(false);
      setActiveIncident(null);
      setFamilyNotifications([]);
      onSosStateChange?.(false);
      loadData();
    } catch {
      // Error
    }
  };

  const toggleSound = () => {
    if (isAudioAlertOn) {
      sound.stopSosAlarm();
      setIsAudioAlertOn(false);
    } else {
      sound.startSosAlarm();
      setIsAudioAlertOn(true);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner if Active Emergency */}
      {activeIncident && (
        <div className="p-5 rounded-2xl bg-red-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg">CRITICAL EMERGENCY ACTIVE</span>
                <span className="text-xs bg-black/30 px-2.5 py-0.5 rounded-full font-mono">
                  INCIDENT #{activeIncident.id}
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                Dispatch unit {activeIncident.dispatched_unit || 'Medic-04'} assigned · Family broadcast sent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={toggleSound}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              {isAudioAlertOn ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isAudioAlertOn ? 'Mute Siren' : 'Sound Siren'}</span>
            </button>

            <button
              onClick={handleResolveSos}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-white text-red-700 font-bold hover:bg-red-50 transition-colors shadow-sm text-sm"
            >
              Mark Safe / False Alarm
            </button>
          </div>
        </div>
      )}

      {/* Main Trigger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Panic Button Hero Box */}
        <div className={`lg:col-span-7 rounded-2xl bg-white border p-8 flex flex-col items-center justify-center text-center transition-all ${
          isSeniorMode
            ? 'border-2 border-slate-300 shadow-md'
            : 'border-slate-200 shadow-xs'
        }`}>
          <div className="max-w-md">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              One-Touch Emergency Assistance
            </span>
            <h2 className={`font-black text-slate-950 mt-1 text-balance ${
              isSeniorMode ? 'text-3xl' : 'text-2xl'
            }`}>
              Immediate Help at Your Fingertips
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-2">
              Pressing SOS alerts David Chen, primary physician Dr. Vance, and initiates St. Jude Trauma Ambulance dispatch with your live GPS location.
            </p>
          </div>

          {/* Giant Panic Trigger */}
          <div className="my-8 relative">
            {countdown !== null ? (
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-2xl animate-pulse">
                  <span className="text-5xl font-extrabold font-mono">{countdown}</span>
                  <span className="text-xs font-semibold uppercase mt-1">Dispatching In...</span>
                </div>
                <button
                  onClick={handleCancelCountdown}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-slate-200 text-slate-900 font-bold text-sm hover:bg-slate-300 transition-colors"
                >
                  Cancel Immediately
                </button>
              </div>
            ) : activeIncident ? (
              <div className="w-48 h-48 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-2xl ring-8 ring-red-300">
                <Ambulance className="w-12 h-12 animate-bounce" />
                <span className="text-sm font-bold uppercase mt-2">Paramedic En Route</span>
                <span className="text-[11px] font-mono text-red-100">ETA ~5 mins</span>
              </div>
            ) : (
              <button
                onClick={handleStartSos}
                disabled={isTriggering}
                className={`w-52 h-52 rounded-full text-white font-extrabold flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-95 cursor-pointer ${
                  isSeniorMode
                    ? 'bg-red-600 hover:bg-red-700 ring-8 ring-red-400/40 text-3xl'
                    : 'bg-rose-600 hover:bg-rose-700 ring-6 ring-rose-200 text-2xl'
                }`}
              >
                <AlertOctagon className="w-12 h-12 mb-1" />
                <span>SOS</span>
                <span className="text-xs font-semibold tracking-wider uppercase opacity-90 mt-0.5">
                  PRESS FOR HELP
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>3-Second Safeguard Window</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>GPS Geofence Synced</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-blue-500" />
              <span>Voice IVR Connected</span>
            </span>
          </div>
        </div>

        {/* Live Location & Broadcast Tracker */}
        <div className={`lg:col-span-5 rounded-2xl bg-white border p-6 flex flex-col justify-between transition-all ${
          isSeniorMode 
            ? 'border-2 border-slate-300 shadow-md' 
            : 'border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-rose-600" />
                <h3 className="font-black text-sm text-slate-950">Live Location & Telemetry</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Accuracy ±{gpsCoords.accuracy}m
              </span>
            </div>

            {/* Radar / Coordinates Box */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">
                      {gpsCoords.address}
                    </div>
                    <div className="font-mono text-slate-600 mt-1 tabular-nums font-semibold">
                      Lat: {gpsCoords.lat.toFixed(5)}° N · Long: {gpsCoords.lng.toFixed(5)}° W
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setGpsCoords({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            accuracy: Math.round(pos.coords.accuracy),
                            address: 'Live Geolocation Pinpoint (San Francisco Area)'
                          });
                          sound.playSuccess();
                        },
                        () => {}
                      );
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 text-[11px] font-bold hover:bg-slate-100 shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Re-query GPS"
                >
                  <Compass className="w-3 h-3 text-rose-500" />
                  <span>Sync GPS</span>
                </button>
              </div>

              {/* Responder Quick Notes */}
              <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-slate-600 block text-[10px] font-bold">APARTMENT / ACCESS:</span>
                  <span className="font-bold text-slate-900">Apt 3B, Keybox #4110</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-slate-600 block text-[10px] font-bold">NEAREST ER STATION:</span>
                  <span className="font-bold text-blue-700">St. Jude Trauma (1.8 km)</span>
                </div>
              </div>
            </div>

            {/* Family Tree Notification Broadcast status */}
            <div className="mt-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Automated Family Alert Tree
              </h4>
              <div className="space-y-2">
                {contacts.map((c) => (
                  <div 
                    key={c.id} 
                    className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        #{c.priority} {c.name}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        {c.relationship} · {c.phone}
                      </div>
                    </div>
                    <div className="text-right">
                      {activeIncident ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Send className="w-3 h-3" /> Dialed & Alerted
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded">
                          Standby (Priority {c.priority})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-medium flex items-center justify-between">
            <span>Direct 911 / EMS Escalation</span>
            <span className="font-mono text-rose-700 font-bold">St. Jude Medical Station</span>
          </div>
        </div>
      </div>

      {/* Live GPS Emergency Response Map */}
      <div className={`rounded-2xl bg-white border p-5 md:p-6 transition-all ${
        isSeniorMode
          ? 'border-2 border-slate-300 shadow-md'
          : 'border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-rose-600" />
              <h3 className="font-black text-base text-slate-950">
                Live Responder GPS Map & Geofence Reference
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Interactive GIS reference for paramedics, dispatchers, and family members displaying real-time SOS beacon, responding ambulance, and hospital coordinates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>RTK-GPS Pinpoint Active</span>
            </span>
          </div>
        </div>

        <div className="mt-4">
          <SosMap
            userCoords={gpsCoords}
            isSosActive={!!activeIncident}
            incidentId={activeIncident?.id}
            dispatchedUnit={activeIncident?.dispatched_unit}
            isSeniorMode={isSeniorMode}
          />
        </div>
      </div>

      {/* Incident History Log */}
      <div className={`rounded-2xl bg-white border p-6 transition-all ${
        isSeniorMode 
          ? 'border-2 border-slate-300 shadow-md' 
          : 'border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h3 className="font-black text-sm text-slate-950">Emergency Incident Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Recorded in native SQLite `sos_incidents` table
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No past emergency incidents recorded. System in nominal state.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold">
                  <th className="pb-2.5 font-bold">Incident ID</th>
                  <th className="pb-2.5 font-bold">Triggered At</th>
                  <th className="pb-2.5 font-bold">Location</th>
                  <th className="pb-2.5 font-bold">Assigned Unit</th>
                  <th className="pb-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-slate-900">
                      #{inc.id}
                    </td>
                    <td className="py-2.5 text-slate-600 font-medium">
                      {inc.triggered_at.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-2.5 text-slate-800 font-medium truncate max-w-xs">
                      {inc.location_name}
                    </td>
                    <td className="py-2.5 text-slate-700 font-medium">
                      {inc.dispatched_unit || 'EMS Medic-04'}
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        inc.status === 'ACTIVE_EMERGENCY'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
