import React, { useState, useEffect } from 'react';
import { Phone, Shield, Bell, CheckCircle2, Clock, MapPin } from 'lucide-react';

interface TopHeaderProps {
  currentTabName: string;
  isSeniorMode: boolean;
  onQuickSosClick: () => void;
  activeSos: boolean;
  onQuickCheckIn: () => void;
  checkInSuccess: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTabName,
  isSeniorMode,
  onQuickSosClick,
  activeSos,
  onQuickCheckIn,
  checkInSuccess
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
        ' · ' +
        now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={`h-16 px-6 flex items-center justify-between gap-8 shrink-0 transition-colors ${
      isSeniorMode 
        ? 'bg-white border-b-2 border-slate-300 text-slate-950 shadow-xs' 
        : 'bg-white border-b border-slate-200 text-slate-900'
    }`}>
      {/* Zone 1: Context Breadcrumb */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <span className="text-xs uppercase tracking-wider text-rose-600 font-extrabold">
          CareBridge
        </span>
        <span className="text-slate-300 font-bold">/</span>
        <span className={`font-black tracking-tight ${isSeniorMode ? 'text-lg text-slate-950' : 'text-base text-slate-900'}`}>
          {currentTabName}
        </span>
      </div>

      {/* Zone 2: Informational trust & persona markers */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-slate-700 font-medium whitespace-nowrap shrink-0">
        {timeStr && (
          <span className="flex items-center gap-1.5 font-mono text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            <span>{timeStr}</span>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600 font-bold" />
          <span className="text-slate-900 font-bold">24/7 Monitored</span>
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="flex items-center gap-1 text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          742 Evergreen Terr, SF
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="text-slate-700">Proxy: <strong className="text-slate-950 font-bold">David Chen (Son)</strong></span>
      </div>

      {/* Zone 3: Primary Quick Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onQuickCheckIn}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs ${
            checkInSuccess
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:text-slate-950'
          }`}
          title="Send a quick 'I am doing well' ping to David"
        >
          {checkInSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ping Sent to Son ✓</span>
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 text-slate-600" />
              <span>Send Daily Check-in</span>
            </>
          )}
        </button>

        <button
          onClick={onQuickSosClick}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer ${
            activeSos
              ? 'bg-red-700 text-white animate-pulse'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{activeSos ? 'EMERGENCY IN PROGRESS' : 'Emergency SOS'}</span>
        </button>
      </div>
    </header>
  );
};
