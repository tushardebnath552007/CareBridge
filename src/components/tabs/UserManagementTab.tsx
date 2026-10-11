import React, { useState } from 'react';
import { 
  User, 
  Users, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  PhoneCall, 
  Mail, 
  MapPin, 
  CreditCard, 
  AlertCircle, 
  Check, 
  Heart,
  Stethoscope,
  Clock
} from 'lucide-react';
import { api } from '../../utils/api';
import { sound } from '../../utils/audio';
import { UserProfile, EmergencyContact } from '../../types';

interface UserManagementTabProps {
  isSeniorMode: boolean;
  profile: UserProfile | null;
  contacts: EmergencyContact[];
  onRefreshProfile: () => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  isSeniorMode,
  profile,
  contacts,
  onRefreshProfile
}) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>(profile?.subscription_plan || 'Care+ Family');
  const [planSuccessMsg, setPlanSuccessMsg] = useState(false);

  // New Contact form state
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    priority: 4,
    notify_sms: 1,
    notify_call: 1
  });

  const subscriptionPlans = [
    {
      id: 'Basic Community',
      name: 'Basic Community',
      price: '$0',
      period: 'Forever free',
      description: 'Essential volunteer check-ins and self-managed profile vault',
      features: [
        'Profile & Medical Vault storage',
        'Community volunteer booking',
        'Standard SMS emergency notifications',
        'Local doctor contact directory'
      ]
    },
    {
      id: 'Care+ Family',
      name: 'Care+ Family',
      price: '$29',
      period: 'per month',
      description: 'Priority one-touch SOS dispatch, remote family caregiver app & telemetry',
      popular: true,
      features: [
        'One-touch 24/7 emergency dispatch',
        'Automated family voice call tree',
        'Live GPS ambulance tracking radar',
        'Real-time vitals telemetry & medication alerts',
        'Emergency hospital pre-admission packet'
      ]
    },
    {
      id: 'CareShield 24/7 Concierge',
      name: 'CareShield 24/7 Concierge',
      price: '$69',
      period: 'per month',
      description: 'Dedicated Registered Nurse coordinator, fall sensor hardware sync, ER concierge',
      features: [
        'All Care+ features included',
        'Dedicated Registered Nurse Case Manager',
        'Automated Fall Detection sensor sync',
        'Priority trauma ER pre-clearance guarantee',
        'Monthly home safety pharmacist review'
      ]
    }
  ];

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addContact(newContact);
      sound.playSuccess();
      setIsContactModalOpen(false);
      setNewContact({
        name: '',
        relationship: '',
        phone: '',
        priority: contacts.length + 1,
        notify_sms: 1,
        notify_call: 1
      });
      onRefreshProfile();
    } catch {
      // Error
    }
  };

  const handleDeleteContact = async (id: number) => {
    try {
      await api.deleteContact(id);
      sound.playSuccess();
      onRefreshProfile();
    } catch {
      // Error
    }
  };

  const handleSelectPlan = async (planName: string) => {
    try {
      await api.updateSubscription(planName);
      setSelectedPlan(planName);
      sound.playSuccess();
      setPlanSuccessMsg(true);
      setTimeout(() => setPlanSuccessMsg(false), 3000);
      onRefreshProfile();
    } catch {
      // Error
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          Account Administration & Care Network Vault
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          User & Family Caregiver Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage elderly patient identity, family caregiver links, emergency contacts call tree, and CareBridge subscription tiers.
        </p>
      </div>

      {/* Plan success alert */}
      {planSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 font-black" />
          <span>Subscription plan successfully updated to {selectedPlan}!</span>
        </div>
      )}

      {/* Senior User & Remote Caregiver Dual Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Martha Chen (Senior) */}
        <div className={`p-6 rounded-2xl bg-white border flex flex-col justify-between transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex items-start gap-4">
              <img
                src="/src/assets/images/avatar_elderly_mrs_chen_1791700380535.jpg"
                alt="Martha Chen"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-200 shrink-0 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                  Protected Senior Resident
                </span>
                <h3 className="text-lg font-black text-slate-950 mt-0.5">
                  {profile.full_name}, Age {profile.age}
                </h3>
                <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.address}</span>
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-600 font-medium">Blood Type:</span>
                <span className="font-mono font-bold text-slate-950">{profile.blood_type}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex justify-between">
                <span className="font-bold text-rose-800">Allergies:</span>
                <span className="font-bold text-rose-950">{profile.allergies}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-600 font-medium">Primary Physician:</span>
                <span className="font-bold text-slate-900">{profile.primary_doctor}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-medium flex items-center justify-between">
            <span>Doctor Tel: {profile.doctor_phone}</span>
            <span className="text-emerald-700 font-bold">Active Care+</span>
          </div>
        </div>

        {/* David Chen (Remote Son & Caregiver) */}
        <div className={`p-6 rounded-2xl bg-white border flex flex-col justify-between transition-all ${
          isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex items-start gap-4">
              <img
                src="/src/assets/images/avatar_caregiver_david_1791700396222.jpg"
                alt="David Chen"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-200 shrink-0 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Authorized Family Caregiver
                </span>
                <h3 className="text-lg font-black text-slate-950 mt-0.5">
                  {profile.caregiver_name}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Relation: {profile.caregiver_relation}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-600 font-medium">Caregiver Phone:</span>
                <span className="font-mono font-bold text-slate-950">{profile.caregiver_phone}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex justify-between">
                <span className="text-blue-800 font-bold">Remote Sync:</span>
                <span className="font-bold text-blue-950">Chicago to SF Real-Time Relay</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-600 font-medium">Notification Access:</span>
                <span className="font-bold text-slate-900">SMS, Push & Priority Voice IVR</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-medium flex items-center justify-between">
            <span>Full Medical Proxy: Verified</span>
            <span className="text-blue-700 font-bold">Caregiver Connected</span>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Management CRUD */}
      <div className={`rounded-2xl bg-white border p-6 transition-all ${
        isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-black text-sm text-slate-950 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>Emergency Call Tree Hierarchy (CRUD)</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Contacts dialed automatically in priority sequence when SOS panic trigger is pressed.
            </p>
          </div>

          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Emergency Contact</span>
          </button>
        </div>

        {/* Contacts Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-2">Priority</th>
                <th className="pb-2">Full Name</th>
                <th className="pb-2">Relationship</th>
                <th className="pb-2">Phone Number</th>
                <th className="pb-2">Alert Channels</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 font-medium">
                  <td className="py-3 font-mono font-bold text-rose-600">
                    #{c.priority}
                  </td>
                  <td className="py-3 font-extrabold text-slate-950">
                    {c.name}
                  </td>
                  <td className="py-3 text-slate-700 font-semibold">
                    {c.relationship}
                  </td>
                  <td className="py-3 font-mono text-slate-800 font-semibold">
                    {c.phone}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2 text-[11px]">
                      {c.notify_sms === 1 && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                          SMS
                        </span>
                      )}
                      {c.notify_call === 1 && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          Voice Call
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Plan Manager */}
      <div className={`rounded-2xl bg-white border p-6 transition-all ${
        isSeniorMode ? 'border-2 border-slate-300 shadow-md' : 'border-slate-200 shadow-xs'
      }`}>
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-rose-600" />
            <h3 className="font-black text-sm text-slate-950">
              CareBridge Subscription Tier Manager
            </h3>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Current Active Plan: <strong className="text-rose-600">{selectedPlan}</strong>
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {subscriptionPlans.map((plan) => {
            const isCurrent = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-950">
                      {plan.name}
                    </h4>
                    {plan.popular && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-950 font-mono">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-600 font-semibold">
                      /{plan.period}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium mt-2">
                    {plan.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-800 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 font-bold" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <Check className="w-4 h-4 font-black" />
                      <span>Current Active Plan</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-600 hover:text-white text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      Switch to {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-slate-950">
                  Add Emergency Contact
                </h3>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContact} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  placeholder="e.g. Neighbor / Keyholder"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="e.g. +1 (415) 555-0144"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Dial Priority Sequence (1 = First to call)
                </label>
                <input
                  type="number"
                  value={newContact.priority}
                  onChange={(e) => setNewContact({ ...newContact, priority: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500"
                  required
                  min={1}
                  max={10}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Save to Call Tree
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
