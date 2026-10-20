/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FloatingChatWidget - Persistent floating chatbot launcher accessible from any page
 */

import React, { useState } from 'react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import { CivicChatInterface } from './CivicChatInterface';
import { Sparkles, MessageSquare, X, Bot } from 'lucide-react';

export const FloatingChatWidget: React.FC = () => {
  const { currentRoute, lang } = useUrbanLoop();
  const [isOpen, setIsOpen] = useState(false);

  // If already on the dedicated full-page chat view, avoid duplicate floating widget
  if (currentRoute === 'civic-chat') {
    return null;
  }

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <aside 
        aria-label="AI Assistant Quick Access"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end"
      >
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg mb-2 border border-emerald-500/30 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'bn' ? 'এআই কোপাইলটকে প্রশ্ন করুন' : 'Ask UrbanLoop AI Copilot'}</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 group ${
            isOpen
              ? 'bg-slate-900 text-white rotate-90 shadow-slate-900/40'
              : 'bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white shadow-emerald-700/35 hover:scale-105'
          }`}
          title={isOpen ? 'Close AI Chat' : 'Open UrbanLoop AI Copilot (Gemini 3.8 Flash)'}
          aria-label="Toggle AI Chatbot"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Bot className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-emerald-700 animate-pulse" />
            </div>
          )}
        </button>
      </aside>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div 
          role="dialog"
          aria-label="UrbanLoop AI Copilot Dialog"
          className="fixed bottom-24 sm:bottom-22 right-4 sm:right-6 z-50 w-[92vw] sm:w-[460px] max-w-[480px] drop-shadow-2xl animate-fade-in"
        >
          <CivicChatInterface isDrawer={true} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};
