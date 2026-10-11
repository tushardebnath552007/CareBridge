import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Ambulance, 
  FileCheck2, 
  ShieldCheck, 
  Navigation, 
  PhoneCall, 
  AlertCircle,
  Activity,
  BedDouble,
  Clock
} from 'lucide-react';
import { api } from '../../utils/api';
import { Hospital, UserProfile } from '../../types';

interface HospitalCoordinationTabProps {
  isSeniorMode: boolean;
  userProfile?: UserProfile | null;
}

export const HospitalCoordinationTab: React.FC<HospitalCoordinationTabProps> = ({
  isSeniorMode,
  userProfile
}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchInfo, setDispatchInfo] = useState<any | null>(null);
  const [isVerifyingInsurance, setIsVerifyingInsurance] = useState(false);
  const [insuranceStatus, setInsuranceStatus] = useState<any | null>({
    verified: true,
    policy_name: 'Medicare Part B + Blue Cross Blue Shield Senior Advantage',
    policy_number: 'MED-9082-SF4110',
    ambulance_coverage: '100% Emergency Coverage Authorized',
    copay: '$50.00 (Waived on inpatient admission)',
    pre_clearance_code: 'AUTH-2026-99182A'
  });

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const res = await api.getHospitals();
      setHospitals(res.hospitals);
      if (res.hospitals.length > 0) {
        setSelectedHospital(res.hospitals[0]);
      }
    } catch {
      // Fallback
    }
  };

  const handleDispatch = async (hospitalId: number) => {
    setIsDispatching(true);
    try {
      const res = await api.dispatchAmbulance(hospitalId);
      setDispatchInfo(res);
    } catch {
      // Error handling
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Banner with Generated Hospital Image */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs h-48 md:h-56">
        <img
          src="/src/assets/images/hospital_medical_center_1791700406506.jpg"
          alt="St. Jude Metro General Hospital & Trauma Center"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent flex flex-col justify-end p-6 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
            <Building2 className="w-4 h-4" />
            <span>Trauma Center & Geriatric Emergency Network</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
            Hospital & Ambulance Coordination Command
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Real-time ambulance fleet dispatch, digital pre-admission packet transmission, and live bed occupancy telemetry across San Francisco emergency medical centers.
          </p>
        </div>
      </div>

      {/* Dispatch Status Card if Dispatched */}
      {dispatchInfo && (
        <div className="p-5 rounded-2xl bg-blue-900/90 border border-blue-500 text-white shadow-xl animate-in fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center justify-center shrink-0 animate-pulse">
                <Ambulance className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base">AMBULANCE UNIT DISPATCHED</span>
                  <span className="font-mono text-xs bg-blue-800 px-2 py-0.5 rounded-full">
                    {dispatchInfo.dispatch_code}
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-1">
                  {dispatchInfo.ambulance_unit} · Crew: {dispatchInfo.driver_name} · Destination: {dispatchInfo.hospital_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-blue-300">Estimated Arrival</div>
                <div className="text-xl font-bold font-mono tabular-nums">
                  {dispatchInfo.eta_minutes} MINUTES
                </div>
              </div>
              <button
                onClick={() => setDispatchInfo(null)}
                className="px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-xs font-semibold"
              >
                Dismiss Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Regional Hospital Network vs Digital Admission Packet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Hospital Fleet & Bed Monitor */}
        <div className={`lg:col-span-7 rounded-2xl bg-white border p-6 flex flex-col justify-between transition-all ${
          isSeniorMode 
            ? 'border-2 border-slate-300 shadow-md' 
            : 'border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600" />
                <h3 className="font-black text-sm text-slate-950">Nearby Trauma Centers & Bed Availability</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Live Telemetry</span>
            </div>

            {/* Hospital Cards List */}
            <div className="mt-4 space-y-3">
              {hospitals.map((h) => {
                const isSelected = selectedHospital?.id === h.id;
                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHospital(h)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-950">
                            {h.name}
                          </h4>
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {h.trauma_level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-1">
                          {h.address} · Tel: {h.phone}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5" />
                          {h.ambulance_eta_mins} min ETA
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {h.distance_km} km away
                        </span>
                      </div>
                    </div>

                    {/* Bed Capacity Counters */}
                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                          <span>ER Beds: <strong className="tabular-nums font-mono font-black text-slate-950">{h.available_er_beds} open</strong></span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <span>ICU: <strong className="tabular-nums font-mono font-black text-slate-950">{h.available_icu_beds} open</strong></span>
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDispatch(h.id);
                        }}
                        disabled={isDispatching}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Ambulance className="w-3.5 h-3.5" />
                        <span>Dispatch Unit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Direct Computer Aided Dispatch (CAD) Link</span>
            <span>San Francisco Department of Emergency Management (DEM)</span>
          </div>
        </div>

        {/* Digital Admission Pre-Registration & Insurance Vault */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pre-Registration Packet */}
          <div className={`rounded-2xl bg-white border p-6 transition-all ${
            isSeniorMode 
              ? 'border-2 border-slate-300 shadow-md' 
              : 'border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-sm text-slate-950">Digital ER Pre-Admission Packet</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Auto-Transmitted
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-600 font-medium">Patient Demographics:</span>
                <span className="font-bold text-slate-950">Martha Chen, 78 yrs (DOB 1948)</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex justify-between text-rose-900">
                <span className="font-semibold">Blood Group:</span>
                <span className="font-mono font-black text-rose-950">O Positive (O+)</span>
              </div>

              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <div className="text-[11px] font-bold text-red-800 uppercase">
                  Known Severe Allergies:
                </div>
                <div className="font-bold text-red-950 mt-0.5">
                  Penicillin, Sulfa drugs
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-600 text-[11px] font-medium">Chronic Medical Conditions:</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  Hypertension, Mild Osteoarthritis, Type 2 Diabetes
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-600 font-medium">Primary Physician:</span>
                <span className="font-bold text-slate-900">Dr. Evelyn Vance, MD (+1 415-555-0182)</span>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-600 font-medium">
              ✓ HIPAA Emergency Care Proxy pre-signed by David Chen (Son).
            </div>
          </div>

          {/* Insurance Verification Box */}
          <div className={`rounded-2xl bg-white border p-6 transition-all ${
            isSeniorMode 
              ? 'border-2 border-slate-300 shadow-md' 
              : 'border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-sm text-slate-950">Insurance Pre-Verification</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Pre-Approved
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="font-extrabold text-slate-950">
                {insuranceStatus.policy_name}
              </div>
              <div className="text-slate-600 font-mono font-medium">
                Policy ID: {insuranceStatus.policy_number}
              </div>
              <div className="text-emerald-700 font-bold">
                ✓ {insuranceStatus.ambulance_coverage}
              </div>
              <div className="text-slate-700 font-medium">
                Copay: {insuranceStatus.copay}
              </div>
              <div className="text-[11px] font-mono text-slate-500 font-semibold mt-2">
                Clearance Token: {insuranceStatus.pre_clearance_code}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
