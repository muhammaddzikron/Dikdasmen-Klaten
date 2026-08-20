import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useData();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 text-white dark:bg-slate-800 border-slate-700';
        let Icon = Info;
        let iconColor = 'text-sky-400';

        if (toast.type === 'success') {
          bg = 'bg-emerald-900/95 text-emerald-50 border-emerald-700/80 shadow-emerald-950/20';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          bg = 'bg-rose-900/95 text-rose-50 border-rose-700/80 shadow-rose-950/20';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-900/95 text-amber-50 border-amber-700/80 shadow-amber-950/20';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        } else {
          bg = 'bg-sky-900/95 text-sky-50 border-sky-700/80 shadow-sky-950/20';
          Icon = Info;
          iconColor = 'text-sky-400';
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 backdrop-blur-sm ${bg}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 p-0.5 rounded transition-opacity"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
