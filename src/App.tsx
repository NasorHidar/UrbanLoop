/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UrbanLoopProvider, useUrbanLoop } from './context/UrbanLoopContext';
import { Header } from './components/layout/Header';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { ToastContainer } from './components/layout/ToastContainer';
import { CommandMapPage } from './components/pages/CommandMapPage';
import { SurplusServePage } from './components/pages/SurplusServePage';
import { RecyclingPassportPage } from './components/pages/RecyclingPassportPage';
import { DrainBountyPage } from './components/pages/DrainBountyPage';
import { GreenWalletPage } from './components/pages/GreenWalletPage';
import { UrpGovernancePage } from './components/pages/UrpGovernancePage';
import { CivicChatPage } from './components/pages/CivicChatPage';
import { FloatingChatWidget } from './components/chat/FloatingChatWidget';

const AppContent: React.FC = () => {
  const { currentRoute, viewMode, lang } = useUrbanLoop();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentRoute]);

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'map':
        return <CommandMapPage />;
      case 'surplus-serve':
        return <SurplusServePage />;
      case 'recycling-passport':
        return <RecyclingPassportPage />;
      case 'drain-bounty':
        return <DrainBountyPage />;
      case 'green-wallet':
        return <GreenWalletPage />;
      case 'urp-governance':
        return <UrpGovernancePage />;
      case 'civic-chat':
        return <CivicChatPage />;
      default:
        return <CommandMapPage />;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col font-sans transition-all ${
      viewMode === 'mobile' ? 'py-4 sm:py-6' : ''
    }`}>
      
      {/* Container framing for Mobile Mode vs Full Web Mode */}
      <div className={`w-full flex-1 flex flex-col ${
        viewMode === 'mobile' 
          ? 'max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl border-x border-slate-300 relative pb-20' 
          : 'bg-slate-50'
      }`}>
        
        {/* Top Header Bar */}
        <Header />

        {/* Main Routed Page Content */}
        <main className={`flex-1 ${
          viewMode === 'mobile' ? 'p-3.5' : 'max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8'
        }`}>
          {renderCurrentPage()}
        </main>

        {/* Mobile View Bottom Tab Bar */}
        {viewMode === 'mobile' && <MobileTabBar />}

        {/* Quiet Desktop Footer */}
        {viewMode === 'web' && (
          <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-slate-500 text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-bold text-slate-800">UrbanLoop</span> · Powered by Surplus2Serve, Drain2Value 2.0 & Urban Canopy
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Pilot Ward 15 Deployment (Dhanmondi, Dhaka) · Closed-Loop Civic Circularity
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-right">
                <span>Proposed Pilot Model · Adheres to BSTI/FSSAI Food Protocols & UN SDGs</span>
              </div>
            </div>
          </footer>
        )}

      </div>

      {/* Global Floating Toast Alert Queue */}
      <ToastContainer />

      {/* Persistent Floating Gemini AI Chatbot Widget */}
      <FloatingChatWidget />

    </div>
  );
};

export default function App() {
  return (
    <UrbanLoopProvider>
      <AppContent />
    </UrbanLoopProvider>
  );
}
