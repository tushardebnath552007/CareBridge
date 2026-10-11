import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  Pill, 
  Car, 
  HeartHandshake, 
  PhoneCall, 
  CheckCircle2, 
  Plus, 
  Star, 
  ShieldCheck, 
  Clock, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { api } from '../../utils/api';
import { sound } from '../../utils/audio';
import { CommunityRequest } from '../../types';

interface CommunityCareTabProps {
  isSeniorMode: boolean;
}

export const CommunityCareTab: React.FC<CommunityCareTabProps> = ({ isSeniorMode }) => {
  const [requests, setRequests] = useState<CommunityRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'Assigned' | 'Requested' | 'Completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckInSimulating, setIsCheckInSimulating] = useState(false);
  const [checkInDone, setCheckInDone] = useState(true);

  // New Request Form state
  const [category, setCategory] = useState('Prescription Pickup');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState('Today, 3:30 PM');

  const verifiedVolunteers = [
    {
      name: 'Liam Roberts',
      role: 'Prescription & Pharmacy Courier',
      phone: '+1 (415) 555-0312',
      rating: 4.9,
      tasks: 38,
      badges: ['Background Checked', 'CPR Certified', 'Insured Driver']
    },
    {
      name: 'Elena Gomez',
      role: 'Companionship & Garden Escort',
      phone: '+1 (415) 555-0455',
      rating: 5.0,
      tasks: 52,
      badges: ['Certified Senior Companion', 'Bilingual (ES/EN)']
    },
    {
      name: 'Marcus Wright',
      role: 'Mobility & Doctor Escort',
      phone: '+1 (415) 555-0671',
      rating: 4.8,
      tasks: 29,
      badges: ['Wheelchair Trained', 'First Aid Certified']
    }
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await api.getCommunityRequests();
      setRequests(res.requests);
    } catch {
      // Fallback
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCommunityRequest({
        category,
        title,
        description,
        scheduled_time: scheduledTime
      });
      sound.playSuccess();
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      loadRequests();
    } catch {
      // Error
    }
  };

  const triggerDailyCall = () => {
    setIsCheckInSimulating(true);
    sound.playChime();
    setTimeout(() => {
      setIsCheckInSimulating(false);
      setCheckInDone(true);
      sound.playSuccess();
    }, 2500);
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Call to Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Neighborhood Network & Daily Social Care
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Community Care & Errands
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified local volunteers providing grocery delivery, pharmacy pickup, and daily social check-in calls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerDailyCall}
            disabled={isCheckInSimulating}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>{isCheckInSimulating ? 'Connecting Call...' : 'Simulate Companion Check-in Call'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Book Volunteer Errand</span>
          </button>
        </div>
      </div>

      {/* Daily Check-in Status Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-950">
              Morning Wellbeing Check-in Completed
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
              Martha answered at 8:15 AM: "Feeling cheerful, finished breakfast, ready for garden walk."
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 text-xs text-emerald-900">
          <span className="font-bold">Next Scheduled:</span> 6:00 PM Evening Ping
        </div>
      </div>

      {/* Main Grid: Errand Requests vs Verified Volunteers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Errands List */}
        <div className={`lg:col-span-7 rounded-2xl bg-white border p-6 flex flex-col justify-between transition-all ${
          isSeniorMode 
            ? 'border-2 border-slate-300 shadow-md' 
            : 'border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-rose-600" />
                <h3 className="font-black text-sm text-slate-950">Volunteer Errand Requests</h3>
              </div>

              {/* Segmented Filter Controls */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                {(['all', 'Assigned', 'Requested', 'Completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-2.5 py-1 rounded-md font-bold capitalize transition-colors cursor-pointer ${
                      filter === tab
                        ? 'bg-white text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests List */}
            <div className="mt-4 space-y-3">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-medium">
                  No errand requests found matching this filter.
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-950">
                            {req.title}
                          </span>
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {req.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-1">
                          {req.description}
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 ${
                        req.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5 font-mono text-slate-800 font-bold">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        <span>{req.scheduled_time}</span>
                      </div>

                      {req.volunteer_name ? (
                        <div className="flex items-center gap-2">
                          <span>Assigned: <strong className="text-slate-950 font-bold">{req.volunteer_name}</strong></span>
                          <span className="text-amber-600 font-bold flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {req.volunteer_rating}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-700 font-bold">
                          Matching nearby volunteer...
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Volunteer Background Check: Live verified</span>
            <span>Zero errand service fee for seniors</span>
          </div>
        </div>

        {/* Verified Community Volunteers Directory */}
        <div className={`lg:col-span-5 rounded-2xl bg-white border p-6 flex flex-col justify-between transition-all ${
          isSeniorMode 
            ? 'border-2 border-slate-300 shadow-md' 
            : 'border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-sm text-slate-950">Verified Neighborhood Helpers</h3>
              </div>
              <span className="text-xs text-slate-600 font-semibold">Mission District Hub</span>
            </div>

            <div className="mt-4 space-y-3">
              {verifiedVolunteers.map((vol, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-950">
                          {vol.name}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {vol.role}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-xs text-amber-600 flex items-center gap-1 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {vol.rating}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        {vol.tasks} completed
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] text-slate-700 font-medium">
                    {vol.badges.map((b, bIdx) => (
                      <span
                        key={bIdx}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-mono font-medium">
                      {vol.phone}
                    </span>
                    <button
                      onClick={() => {
                        setTitle(`Assistance with ${vol.name}`);
                        setCategory(vol.role.includes('Pharmacy') ? 'Prescription Pickup' : 'Companionship Check-in');
                        setIsModalOpen(true);
                      }}
                      className="text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Request Helper →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-medium flex items-center justify-between">
            <span>Community Care Coordinator: Sarah Lin, MSW</span>
            <span className="font-semibold text-slate-700">Emergency fallback: (415) 555-CARE</span>
          </div>
        </div>
      </div>

      {/* Book New Errand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-slate-950">
                  Schedule Volunteer Assistance
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Service Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                >
                  <option>Prescription Pickup</option>
                  <option>Grocery Delivery</option>
                  <option>Doctor Escort & Mobility</option>
                  <option>Companionship Check-in</option>
                  <option>Household Tech Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Errand Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Walgreens 24th St Prescription Pickup"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Instructions & Details
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Pick up Lisinopril refill under Martha Chen. Apt buzzer #302."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Preferred Time
                </label>
                <input
                  type="text"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  required
                />
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
