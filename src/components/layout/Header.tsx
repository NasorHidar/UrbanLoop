/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import { UserRole, PageRoute } from '../../types';
import { 
  Languages, 
  Smartphone, 
  Monitor, 
  Users, 
  MapPin, 
  Leaf, 
  UtensilsCrossed, 
  QrCode, 
  ShieldCheck, 
  Wallet, 
  Building2,
  LogIn,
  LogOut,
  Cloud,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    lang,
    setLang,
    viewMode,
    setViewMode,
    currentRoute,
    setCurrentRoute,
    t,
    walletBalance,
    currentUser,
    signInWithGoogle,
    signOutGoogle,
    isCloudSynced,
  } = useUrbanLoop();

  const navItems: { route: PageRoute; label: string; icon: React.ElementType }[] = [
    { route: 'map', label: t.nav.map, icon: MapPin },
    { route: 'surplus-serve', label: t.nav.surplus, icon: UtensilsCrossed },
    { route: 'recycling-passport', label: t.nav.passport, icon: QrCode },
    { route: 'drain-bounty', label: t.nav.drain, icon: ShieldCheck },
    { route: 'green-wallet', label: t.nav.wallet, icon: Wallet },
    { route: 'urp-governance', label: t.nav.governance, icon: Building2 },
    { route: 'civic-chat', label: t.nav.chat, icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentRoute('map')}
            className="flex items-center gap-1.5 sm:gap-2 group text-left cursor-pointer focus:outline-none"
            aria-label="UrbanLoop Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-emerald-800 transition-colors shrink-0">
              <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors whitespace-nowrap block leading-none">
                {t.brand}
              </span>
              <span className="text-[9px] sm:text-[11px] text-slate-500 font-medium whitespace-nowrap block mt-0.5">
                Ward 15 · Dhaka
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Large Desktop) */}
        {viewMode === 'web' && (
          <nav 
            className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              const isChat = item.route === 'civic-chat';
              return (
                <button
                  key={item.route}
                  onClick={() => setCurrentRoute(item.route)}
                  className={`px-2 py-1 xl:px-2.5 xl:py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : isChat
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : isChat ? 'text-emerald-600 animate-pulse' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Zone 3: Global Action & Switcher Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Green Credits Badge (hidden on very small viewports) */}
          <button
            onClick={() => setCurrentRoute('green-wallet')}
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono transition-colors hover:bg-emerald-100 cursor-pointer"
            title="Current Green Credit Balance"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="tabular-nums">{walletBalance}</span>
            <span className="text-[10px] font-sans font-medium text-emerald-700">pts</span>
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative flex items-center">
            <label htmlFor="role-select" className="sr-only">Select User Role</label>
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 text-[11px] sm:text-xs font-medium focus-within:ring-2 focus-within:ring-emerald-600">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
              <select
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="bg-transparent text-[11px] sm:text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer max-w-[95px] sm:max-w-none truncate"
                aria-label="User Role Switcher"
              >
                <option value="vendor">{lang === 'en' ? 'Vendor' : 'ভেন্ডর'}</option>
                <option value="ngo">{lang === 'en' ? 'NGO' : 'এনজিও'}</option>
                <option value="collector">{lang === 'en' ? 'Collector' : 'সংগ্রাহক'}</option>
                <option value="planner">{lang === 'en' ? 'Planner' : 'পরিকল্পনাবিদ'}</option>
              </select>
            </div>
          </div>

          {/* Language Toggle: EN ⇄ BN */}
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1 px-2 py-1 sm:py-1.5 rounded-lg border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Switch Language (English / বাংলা)"
            aria-label={`Switch language to ${lang === 'en' ? 'Bangla' : 'English'}`}
          >
            <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
            <span className="font-mono font-bold uppercase">{lang === 'en' ? 'BN' : 'EN'}</span>
          </button>

          {/* Device View Mode Switcher: Web ⇄ Mobile */}
          <button
            onClick={() => setViewMode(viewMode === 'web' ? 'mobile' : 'web')}
            className={`flex items-center gap-1 px-2 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Toggle Web App View / Mobile App View"
            aria-label="Toggle View Mode"
          >
            {viewMode === 'web' ? (
              <>
                <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden lg:inline">{t.mode.mobile}</span>
              </>
            ) : (
              <>
                <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden lg:inline">{t.mode.web}</span>
              </>
            )}
          </button>

          {/* Firebase Google Auth Pill */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
              <span className="hidden lg:inline font-semibold text-slate-800 max-w-[70px] truncate">
                {currentUser.displayName?.split(' ')[0] || 'User'}
              </span>
              <span title="Firestore Connected">
                <Cloud className="w-3 h-3 text-emerald-600" />
              </span>
              <button
                onClick={() => signOutGoogle()}
                className="text-slate-400 hover:text-rose-600 ml-0.5 p-0.5 rounded cursor-pointer"
                title={lang === 'en' ? 'Sign out' : 'সাইন আউট'}
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1 px-2 py-1 sm:py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              title={lang === 'en' ? 'Sign in with Google' : 'গুগল দিয়ে সাইন ইন করুন'}
            >
              <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600 shrink-0" />
              <span className="hidden lg:inline">{lang === 'en' ? 'Sign In' : 'লগইন'}</span>
            </button>
          )}

        </div>
      </div>

      {/* Secondary Sub-nav for tablet/mobile screens when in Web mode */}
      {viewMode === 'web' && (
        <div className="lg:hidden border-t border-slate-100 bg-slate-50/80 px-2 sm:px-4 py-1.5 overflow-x-auto flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => setCurrentRoute(item.route)}
                className={`px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-md whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <item.icon className={`w-3 h-3 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
