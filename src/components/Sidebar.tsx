import React from 'react';
import {
  AlertTriangle,
  Building2,
  HeartPulse,
  Users,
  UserCheck,
  Video,
  ShieldCheck,
  LayoutDashboard,
  Code2,
  Eye,
  Moon
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isSeniorMode: boolean;
  onToggleSeniorMode: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCodeVault: () => void;
  activeSosCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isSeniorMode,
  onToggleSeniorMode,
  isDarkMode,
  onToggleDarkMode,
  onOpenCodeVault,
  activeSosCount
}) => {
  const navItems = [
    {
      id: 'sos_emergency',
      label: 'SOS & Emergency',
      sublabel: 'One-touch panic & dispatch',
      icon: AlertTriangle,
      alertBadge: activeSosCount > 0
    },
    {
      id: 'hospital_coordination',
      label: 'Hospital & Ambulance',
      sublabel: 'Dispatch, beds & pre-admission',
      icon: Building2
    },
    {
      id: 'health_monitoring',
      label: 'Health & Vitals',
      sublabel: 'BP, sugar, heart & meds',
      icon: HeartPulse
    },
    {
      id: 'community_care',
      label: 'Community Care',
      sublabel: 'Volunteer errands & check-ins',
      icon: Users
    },
    {
      id: 'user_management',
      label: 'User & Profile',
      sublabel: 'Caregiver sync & medical vault',
      icon: UserCheck
    },
    {
      id: 'telehealth_consultations',
      label: 'Telehealth Consults',
      sublabel: 'Video visits & e-prescriptions',
      icon: Video
    },
    {
      id: 'insurance_claims',
      label: 'Insurance & Claims',
      sublabel: 'Medicare pre-auth & cashless',
      icon: ShieldCheck
    },
    {
      id: 'family_dashboard',
      label: 'Family Dashboard',
      sublabel: 'Remote telemetry & caregiver hub',
      icon: LayoutDashboard
    }
  ];

  return (
    <aside className={`w-72 shrink-0 flex flex-col justify-between transition-colors duration-200 ${
      isSeniorMode 
        ? 'bg-white border-r-2 border-slate-300 text-slate-950 shadow-md' 
        : 'bg-white border-r border-slate-200 text-slate-800'
    }`}>
      {/* Brand Header */}
      <div className={`p-5 border-b ${isSeniorMode ? 'border-slate-300' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-950">
              CareBridge
            </h1>
            <p className="text-xs text-slate-600 font-semibold">
              Elderly Care & Family Link
            </p>
          </div>
        </div>

        {/* Accessibility Senior Mode Toggle */}
        <div className={`mt-4 p-3 rounded-xl border transition-colors ${
          isSeniorMode ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-slate-950">
                Senior Accessibility
              </span>
            </div>
            <button
              onClick={onToggleSeniorMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                isSeniorMode ? 'bg-rose-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={isSeniorMode}
              title="Toggle Large Text & High Contrast Mode"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSeniorMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-medium">
            {isSeniorMode ? 'High contrast & enlarged text active' : 'Standard caregiver layout'}
          </p>
          {/* Dark Mode follows Senior Accessibility: ON -> dark ON */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-bold text-slate-950">
                Dark Mode
              </span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                isDarkMode ? 'bg-slate-900' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={isDarkMode}
              title="Toggle Dark Mode (auto-enabled with Senior Accessibility)"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {isSeniorMode && !isDarkMode && (
            <p className="text-[11px] text-amber-700 mt-1 font-semibold">
              Senior mode normally enables dark mode
            </p>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3.5 flex-1 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Platform Modules (8 Tabs)
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full text-left rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                isSeniorMode ? 'p-3' : 'p-2.5'
              } ${
                isActive
                  ? isSeniorMode
                    ? 'bg-rose-600 text-white font-black shadow-sm'
                    : 'bg-rose-50 text-rose-950 font-bold border border-rose-300 shadow-xs'
                  : isSeniorMode
                    ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className={`mt-0.5 shrink-0 ${
                isActive 
                  ? (isSeniorMode ? 'text-white' : 'text-rose-600') 
                  : (isSeniorMode ? 'text-slate-700' : 'text-slate-500')
              }`}>
                <Icon className={isSeniorMode ? 'w-5 h-5' : 'w-4 h-4'} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`truncate ${isSeniorMode ? 'text-base font-bold text-slate-950' : 'text-xs font-bold'} ${isActive && isSeniorMode ? '!text-white' : ''}`}>
                    {item.label}
                  </span>
                  {item.alertBadge && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
                  )}
                </div>
                <div className={`truncate ${isSeniorMode ? 'text-xs text-slate-600 font-semibold' : 'text-[11px] text-slate-500 font-normal'} ${isActive && isSeniorMode ? '!text-rose-100' : ''}`}>
                  {item.sublabel}
                </div>
              </div>
            </button>
          );
        })}

        {/* Source Code & Architecture Vault trigger */}
        <div className={`pt-2.5 border-t ${isSeniorMode ? 'border-slate-300' : 'border-slate-200'}`}>
          <button
            onClick={onOpenCodeVault}
            className="w-full text-left rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2.5 text-xs font-medium cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex-1 truncate">
              <span className="font-bold text-slate-900">Backend & SQL Vault</span>
              <p className="text-[10px] text-slate-500">8 FastAPI modules & SQLite</p>
            </div>
          </button>
        </div>
      </nav>

      {/* User Status Footer */}
      <div className={`p-3.5 border-t ${isSeniorMode ? 'border-slate-300' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <img
            src="/src/assets/images/avatar_elderly_mrs_chen_1791700380535.jpg"
            alt="Martha Chen"
            className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-950 truncate">
              Martha Chen, 78
            </div>
            <div className="text-[11px] text-slate-600 flex items-center gap-1.5 truncate">
              <span>San Francisco, CA</span>
              <span>·</span>
              <span className="text-emerald-700 font-bold">Safe</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 px-1 font-semibold">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            Care+ Active
          </span>
          <span>911 / EMS Ready</span>
        </div>
      </div>
    </aside>
  );
};
