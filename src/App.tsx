/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CodeVaultModal } from './components/CodeVaultModal';
import { SosEmergencyTab } from './components/tabs/SosEmergencyTab';
import { HospitalCoordinationTab } from './components/tabs/HospitalCoordinationTab';
import { HealthMonitoringTab } from './components/tabs/HealthMonitoringTab';
import { CommunityCareTab } from './components/tabs/CommunityCareTab';
import { UserManagementTab } from './components/tabs/UserManagementTab';
import { TelehealthConsultationsTab } from './components/tabs/TelehealthConsultationsTab';
import { InsuranceClaimsTab } from './components/tabs/InsuranceClaimsTab';
import { FamilyDashboardTab } from './components/tabs/FamilyDashboardTab';
import { api } from './utils/api';
import { sound } from './utils/audio';
import { UserProfile, EmergencyContact } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('sos_emergency');
  const [isSeniorMode, setIsSeniorMode] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isCodeVaultOpen, setIsCodeVaultOpen] = useState<boolean>(false);
  const [activeSos, setActiveSos] = useState<boolean>(false);
  const [checkInSuccess, setCheckInSuccess] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    loadInitialProfile();
  }, []);

  // Sync Tailwind `dark` variant class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Senior Accessibility ON -> force Dark Mode ON (sensor accessibility link)
  const handleToggleSeniorMode = () => {
    const next = !isSeniorMode;
    setIsSeniorMode(next);
    if (next) setIsDarkMode(true);
    else setIsDarkMode(false);
  };

  const loadInitialProfile = async () => {
    try {
      const res = await api.getUserProfile();
      setProfile(res.user);
      setContacts(res.contacts || []);
    } catch {
      // Fallback
    }
  };

  const handleQuickCheckIn = () => {
    sound.playSuccess();
    setCheckInSuccess(true);
    setTimeout(() => setCheckInSuccess(false), 3000);
  };

  const tabTitles: Record<string, string> = {
    sos_emergency: 'One-Touch SOS & Emergency Response',
    hospital_coordination: 'Hospital & Ambulance Coordination',
    health_monitoring: 'Daily Vitals & Medication Monitoring',
    community_care: 'Community Care & Volunteer Errands',
    user_management: 'User Profile & Family Caregiver Link',
    telehealth_consultations: 'Telehealth & Virtual Doctor Consultations',
    insurance_claims: 'Insurance Claims & Cashless Hospitalization Vault',
    family_dashboard: 'Family Caregiver Monitoring Portal'
  };

  return (
    <div className={`min-h-screen flex ${isSeniorMode ? 'elder-mode' : ''} ${isDarkMode ? 'bg-slate-950 text-slate-100' : isSeniorMode ? 'bg-slate-100 text-slate-950' : 'bg-slate-50 text-slate-900'}`}>
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isSeniorMode={isSeniorMode}
        onToggleSeniorMode={handleToggleSeniorMode}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenCodeVault={() => setIsCodeVaultOpen(true)}
        activeSosCount={activeSos ? 1 : 0}
      />

      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader
          currentTabName={tabTitles[currentTab] || 'Dashboard'}
          isSeniorMode={isSeniorMode}
          onQuickSosClick={() => {
            setCurrentTab('sos_emergency');
          }}
          activeSos={activeSos}
          onQuickCheckIn={handleQuickCheckIn}
          checkInSuccess={checkInSuccess}
        />

        {/* Viewport Content */}
        <main className={`flex-1 overflow-y-auto p-6 md:p-8 transition-colors ${
          isDarkMode ? 'bg-slate-950/95' : isSeniorMode ? 'bg-slate-100/80' : 'bg-slate-50/80'
        }`}>
          {currentTab === 'sos_emergency' && (
            <SosEmergencyTab
              isSeniorMode={isSeniorMode}
              contacts={contacts}
              onSosStateChange={(active) => setActiveSos(active)}
            />
          )}

          {currentTab === 'hospital_coordination' && (
            <HospitalCoordinationTab
              isSeniorMode={isSeniorMode}
              userProfile={profile}
            />
          )}

          {currentTab === 'health_monitoring' && (
            <HealthMonitoringTab
              isSeniorMode={isSeniorMode}
            />
          )}

          {currentTab === 'community_care' && (
            <CommunityCareTab
              isSeniorMode={isSeniorMode}
            />
          )}

          {currentTab === 'user_management' && (
            <UserManagementTab
              isSeniorMode={isSeniorMode}
              profile={profile}
              contacts={contacts}
              onRefreshProfile={loadInitialProfile}
            />
          )}

          {currentTab === 'telehealth_consultations' && (
            <TelehealthConsultationsTab
              isSeniorMode={isSeniorMode}
            />
          )}

          {currentTab === 'insurance_claims' && (
            <InsuranceClaimsTab
              isSeniorMode={isSeniorMode}
            />
          )}

          {currentTab === 'family_dashboard' && (
            <FamilyDashboardTab
              isSeniorMode={isSeniorMode}
            />
          )}
        </main>
      </div>

      {/* Code & Architecture Vault Modal */}
      <CodeVaultModal
        isOpen={isCodeVaultOpen}
        onClose={() => setIsCodeVaultOpen(false)}
      />
    </div>
  );
}
