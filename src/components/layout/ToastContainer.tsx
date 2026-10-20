/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUrbanLoop();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = 'border-emerald-200 bg-white text-slate-900';
        let iconColor = 'text-emerald-600';

        if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-200 bg-white text-slate-900';
          iconColor = 'text-amber-600';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderClass = 'border-sky-200 bg-white text-slate-900';
          iconColor = 'text-sky-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg transition-all duration-200 flex items-start gap-3 ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                {toast.title}
              </h4>
              <p className="text-sm text-slate-600 mt-0.5 leading-snug">
                {toast.description}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
