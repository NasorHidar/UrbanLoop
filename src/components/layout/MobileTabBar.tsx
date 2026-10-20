/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import { PageRoute } from '../../types';
import { 
  MapPin, 
  UtensilsCrossed, 
  QrCode, 
  ShieldCheck, 
  Wallet, 
  Building2,
  Sparkles
} from 'lucide-react';

export const MobileTabBar: React.FC = () => {
  const { currentRoute, setCurrentRoute, t } = useUrbanLoop();

  const tabs: { route: PageRoute; label: string; icon: React.ElementType }[] = [
    { route: 'map', label: t.nav.map, icon: MapPin },
    { route: 'surplus-serve', label: t.nav.surplus, icon: UtensilsCrossed },
    { route: 'recycling-passport', label: t.nav.passport, icon: QrCode },
    { route: 'drain-bounty', label: t.nav.drain, icon: ShieldCheck },
    { route: 'green-wallet', label: t.nav.wallet, icon: Wallet },
    { route: 'urp-governance', label: t.nav.governance, icon: Building2 },
    { route: 'civic-chat', label: t.nav.chat, icon: Sparkles },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentRoute === tab.route;
          return (
            <button
              key={tab.route}
              onClick={() => setCurrentRoute(tab.route)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors cursor-pointer min-w-[50px] ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5 whitespace-nowrap tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
