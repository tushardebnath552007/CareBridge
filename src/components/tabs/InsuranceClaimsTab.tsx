import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Building2, 
  AlertCircle, 
  Download,
  DollarSign
} from 'lucide-react';
import { api } from '../../utils/api';
import { sound } from '../../utils/audio';
import { InsuranceClaim } from '../../types';

interface InsuranceClaimsTabProps {
  isSeniorMode: boolean;
}

export const InsuranceClaimsTab: React.FC<InsuranceClaimsTabProps> = ({ isSeniorMode }) => {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [policies, setPolicies] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClaim, setNewClaim] = useState({
    hospital_name: 'St. Jude Metro General Hospital',
    service_type: 'Inpatient Emergency Observation & Diagnostics',
    amount_total: 1200
  });

  useEffect(() => {
    loadInsuranceData();
  }, []);

  const loadInsuranceData = async () => {
    try {
      const [claimsRes, polRes] = await Promise.all([
        api.getInsuranceClaims(),
        api.getInsurancePolicies()
      ]);
      setClaims(claimsRes.claims);
      setPolicies(polRes);
    } catch {
      // Fallback
    }
  };

  const handleFileClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.fileInsuranceClaim(newClaim);
      sound.playSuccess();
      setIsModalOpen(false);
      loadInsuranceData();
    } catch {
      // Error
    }
  };

  const totalBilled = claims.reduce((acc, c) => acc + c.amount_total, 0);
  const totalCovered = claims.reduce((acc, c) => acc + c.amount_covered, 0);
  const totalCopay = claims.reduce((acc, c) => acc + c.copay_amount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Cashless Triage & Medical Claims
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Insurance Claims & Policy Vault
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Active Medicare Part B and Blue Cross Senior Advantage coverage with instant cashless hospitalization pre-clearance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Request Cashless Pre-Auth</span>
        </button>
      </div>

      {/* Policy Card Vault Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Primary Medicare Card */}
        <div className={`p-6 rounded-2xl bg-white border transition-all ${
          isSeniorMode 
            ? 'border-2 border-slate-300 shadow-md' 
            : 'border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                CMS
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-950">
                  Medicare Part B
                </h3>
                <span className="text-[11px] text-slate-600 font-semibold">Government Senior Healthcare</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              Active Coverage
            </span>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Policy Number:</span>
              <span className="font-mono font-bold text-slate-950">MED-9082-SF4110</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Beneficiary:</span>
              <span className="font-bold text-slate-900">Martha Chen</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">ER Emergency Copay:</span>
              <span className="text-emerald-700 font-bold">$50.00 (Waived if admitted)</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-600 font-medium pt-3 border-t border-slate-200">
            <span>Ambulance Deductible: 100% Covered</span>
            <span className="font-mono font-bold">Group: CMS-CA-94110</span>
          </div>
        </div>

        {/* Secondary Blue Cross Card */}
        <div className={`p-6 rounded-2xl bg-white border transition-all ${
          isSeniorMode 
            ? 'border-2 border-slate-300 shadow-md' 
            : 'border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                BCBS
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-950">
                  Blue Cross Senior Advantage Plus
                </h3>
                <span className="text-[11px] text-slate-600 font-semibold">Secondary Supplement & Pharmacy</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              Supplemental Link
            </span>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Supplemental ID:</span>
              <span className="font-mono font-bold text-slate-950">BC-9924-88A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Rx Pharmacy BIN:</span>
              <span className="font-mono font-bold text-slate-900">004336 (PCN: MEDDPRX)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Prescription Copay:</span>
              <span className="text-emerald-700 font-bold">$0 - $10 Generic Tier 1</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-600 font-medium pt-3 border-t border-slate-200">
            <span>Coordination of Benefits: Auto-Filing</span>
            <span className="font-mono font-bold">Group: GRP-882104</span>
          </div>
        </div>
      </div>

      {/* Financial Claims Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <span className="text-xs text-slate-600 font-bold">Total Billed Medical Expenses</span>
          <div className="mt-1 text-2xl font-black font-mono text-slate-950 tabular-nums">
            ${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Past 6 months claims</span>
        </div>

        <div className={`p-4 rounded-xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <span className="text-xs text-slate-600 font-bold">Amount Covered by Medicare / BCBS</span>
          <div className="mt-1 text-2xl font-black font-mono text-emerald-700 tabular-nums">
            ${totalCovered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 block">95.4% Coverage Rate</span>
        </div>

        <div className={`p-4 rounded-xl bg-white border transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <span className="text-xs text-slate-600 font-bold">Patient Out-of-Pocket Copay</span>
          <div className="mt-1 text-2xl font-black font-mono text-slate-950 tabular-nums">
            ${totalCopay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Paid or scheduled for settlement</span>
        </div>
      </div>

      {/* Claims History Table */}
      <div className={`rounded-2xl bg-white border p-6 transition-all ${
        isSeniorMode 
          ? 'border-2 border-slate-300 shadow-md' 
          : 'border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-600" />
            <h3 className="font-black text-sm text-slate-950">
              Insurance Claims & Pre-Authorizations
            </h3>
          </div>
          <span className="text-xs text-slate-600 font-semibold">
            Real-Time Settlement Telemetry
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 font-bold">
                <th className="pb-2.5 font-bold">Claim ID</th>
                <th className="pb-2.5 font-bold">Facility / Hospital</th>
                <th className="pb-2.5 font-bold">Service Description</th>
                <th className="pb-2.5 font-bold">Total Amount</th>
                <th className="pb-2.5 font-bold">Covered</th>
                <th className="pb-2.5 font-bold">Copay</th>
                <th className="pb-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-900">
                    {c.claim_number}
                  </td>
                  <td className="py-3 font-bold text-slate-900">
                    {c.hospital_name}
                  </td>
                  <td className="py-3 text-slate-700 font-medium">
                    {c.service_type}
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-900 tabular-nums">
                    ${c.amount_total.toFixed(2)}
                  </td>
                  <td className="py-3 font-mono text-emerald-700 tabular-nums font-bold">
                    ${c.amount_covered.toFixed(2)}
                  </td>
                  <td className="py-3 font-mono text-slate-800 tabular-nums font-semibold">
                    ${c.copay_amount.toFixed(2)}
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      c.status.includes('Authorized') || c.status === 'Settled'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-50 text-amber-900 border border-amber-300'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pre-Authorization Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-slate-950">
                  Request Cashless Hospital Pre-Clearance
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFileClaim} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Healthcare Provider / Facility
                </label>
                <select
                  value={newClaim.hospital_name}
                  onChange={(e) => setNewClaim({ ...newClaim, hospital_name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                >
                  <option>St. Jude Metro General Hospital & Trauma Center</option>
                  <option>Mercy Valley Community Hospital</option>
                  <option>Mission Bay Senior Specialty Care Center</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Service / Admission Category
                </label>
                <input
                  type="text"
                  value={newClaim.service_type}
                  onChange={(e) => setNewClaim({ ...newClaim, service_type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Estimated Medical Bill ($ USD)
                </label>
                <input
                  type="number"
                  value={newClaim.amount_total}
                  onChange={(e) => setNewClaim({ ...newClaim, amount_total: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-sm font-bold focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-600">Estimated Insurance Coverage (95%):</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    ${(newClaim.amount_total * 0.95).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Estimated Copay (5%):</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${(newClaim.amount_total * 0.05).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Authorize Cashless Pre-Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
