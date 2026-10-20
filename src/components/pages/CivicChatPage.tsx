/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CivicChatPage - Dedicated Gemini AI Copilot Page
 */

import React from 'react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import { CivicChatInterface } from '../chat/CivicChatInterface';
import { 
  Sparkles, 
  Bot, 
  UtensilsCrossed, 
  ShieldCheck, 
  Leaf, 
  Building2, 
  Zap, 
  Cpu 
} from 'lucide-react';

export const CivicChatPage: React.FC = () => {
  const { lang, role, walletBalance } = useUrbanLoop();

  return (
    <div className="space-y-6">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Multi-Turn Gemini 3.8 Flash Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {lang === 'bn' ? 'আরবানলুপ এআই সহকারী ও নাগরিক কোপাইলট' : 'UrbanLoop Civic AI Copilot'}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              {lang === 'bn'
                ? 'ওয়ার্ড ১৫ (ধানমন্ডি)-এর সার্কুলার ইকোলজি ও বন্যা সহনশীলতা গাইড। খাদ্য উদ্ধার সুরক্ষা, ড্রেন বাউন্টি যাচাইকরণ, ৯৫/৫ গ্রিন ওয়ালেট নিয়ম ও নগর পরিকল্পনা বিষয়ক যেকোনো প্রশ্নে তৎক্ষণাৎ সমাধান পান।'
                : 'Real-time multi-turn conversational AI grounded in Ward 15 civic telemetry, BSTI food hygiene standards, monsoon drainage hydrology, and the 95/5 Green Wallet circular economy.'}
            </p>
          </div>

          {/* Quick Capability Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-left">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs mb-1">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Surplus2Serve</span>
              </div>
              <p className="text-[11px] text-slate-300">Thermal containment & 2-hr safety protocols</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-left">
              <div className="flex items-center gap-1.5 text-sky-300 font-bold text-xs mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Drain Bounties</span>
              </div>
              <p className="text-[11px] text-slate-300">50–75 credit bounties & photo audits</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-left">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs mb-1">
                <Leaf className="w-3.5 h-3.5" />
                <span>Canopy Fund</span>
              </div>
              <p className="text-[11px] text-slate-300">95/5 split & native urban tree species</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-left">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>URP Hydrology</span>
              </div>
              <p className="text-[11px] text-slate-300">35–45% monsoon flood risk reduction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Turn Chatbot Interface */}
      <CivicChatInterface />

    </div>
  );
};
