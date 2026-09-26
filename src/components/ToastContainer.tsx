import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  FileText
} from 'lucide-react';
import { useToast, type ToastItem, type ToastType } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import type { ApplicationStatus } from '../types';

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const getStatusBadge = (status?: ApplicationStatus, language: 'hi' | 'en' = 'hi') => {
  switch (status) {
    case 'completed':
      return {
        label: language === 'hi' ? 'पूर्ण / तैयार' : 'Completed',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: CheckCircle2,
      };
    case 'processing':
      return {
        label: language === 'hi' ? 'प्रक्रियाधीन' : 'Processing',
        bg: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: Clock,
      };
    case 'documents_needed':
      return {
        label: language === 'hi' ? 'दस्तावेज अपेक्षित' : 'Docs Required',
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: AlertTriangle,
      };
    case 'rejected':
      return {
        label: language === 'hi' ? 'अस्वीकृत' : 'Rejected',
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        icon: AlertCircle,
      };
    case 'pending':
    default:
      return {
        label: language === 'hi' ? 'लंबित' : 'Pending',
        bg: 'bg-slate-100 text-slate-800 border-slate-300',
        icon: Clock,
      };
  }
};

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const duration = toast.duration || 6000;

  useEffect(() => {
    if (isHovered) return;

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, isHovered, onDismiss, toast.id]);

  const renderIcon = () => {
    switch (toast.type) {
      case 'new_request':
        return (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        );
      case 'status_update': {
        const badge = getStatusBadge(toast.requestData?.status, language);
        const IconComponent = badge.icon;
        return (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs border ${badge.bg}`}>
            <IconComponent className="w-5 h-5" />
          </div>
        );
      }
      case 'success':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'error':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-300">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-300">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  const borderClass = () => {
    switch (toast.type) {
      case 'new_request':
        return 'border-amber-400 bg-linear-to-br from-amber-50/90 via-white to-orange-50/70 shadow-amber-500/20';
      case 'status_update':
        return 'border-blue-400 bg-linear-to-br from-blue-50/90 via-white to-indigo-50/70 shadow-blue-500/20';
      case 'success':
        return 'border-emerald-300 bg-white shadow-emerald-500/10';
      case 'warning':
        return 'border-amber-300 bg-white shadow-amber-500/10';
      case 'error':
        return 'border-rose-300 bg-white shadow-rose-500/10';
      default:
        return 'border-slate-300 bg-white shadow-slate-500/10';
    }
  };

  const progressBarColor = () => {
    switch (toast.type) {
      case 'new_request':
        return 'bg-gradient-to-r from-amber-500 to-orange-500';
      case 'status_update':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      case 'success':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'error':
        return 'bg-rose-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full max-w-sm sm:max-w-md rounded-2xl border-2 shadow-xl backdrop-blur-md overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${borderClass()}`}
      role="alert"
    >
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          {renderIcon()}

          <div className="flex-1 min-w-0">
            {/* Header row with badge and dismiss */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-slate-900 leading-tight">
                  {toast.title}
                </span>

                {toast.type === 'new_request' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-600 text-white text-[9px] font-extrabold uppercase tracking-wider animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    LIVE
                  </span>
                )}

                {toast.type === 'status_update' && toast.requestData?.status && (
                  <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold border ${getStatusBadge(toast.requestData.status, language).bg}`}>
                    {getStatusBadge(toast.requestData.status, language).label}
                  </span>
                )}
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-slate-100 transition shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Body */}
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {toast.message}
            </p>

            {/* Details Box for Request / Tracking */}
            {toast.requestData && (
              <div className="mt-2 p-2 rounded-xl bg-white/80 border border-slate-200/90 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-800 truncate">
                    {toast.requestData.serviceName}
                  </span>
                  {toast.requestData.amount ? (
                    <span className="font-bold text-slate-900 shrink-0">
                      ₹{toast.requestData.amount}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>ID: #{toast.requestData.trackingToken}</span>
                  {toast.requestData.mobile ? (
                    <span>📱 {toast.requestData.mobile}</span>
                  ) : null}
                </div>
              </div>
            )}

            {/* Action Button */}
            {toast.action && (
              <div className="mt-2.5 flex items-center justify-end">
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    onDismiss(toast.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition active:scale-95"
                >
                  <span>{toast.action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Countdown Progress Bar */}
      <div className="h-1 w-full bg-slate-100 overflow-hidden">
        <div 
          className={`h-full transition-all ease-linear ${progressBarColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, clearToasts, soundEnabled, setSoundEnabled } = useToast();
  const { language } = useLanguage();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex flex-col gap-2.5 max-w-[94vw] sm:max-w-md w-full pointer-events-none"
      aria-live="polite"
    >
      {/* Toast Bar Controls */}
      <div className="flex items-center justify-end gap-2 pr-1 pointer-events-auto">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition shadow-xs ${
            soundEnabled 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
          }`}
          title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3 h-3 text-emerald-600" />
              <span>{language === 'hi' ? 'सूचना ध्वनि चालू' : 'Sound ON'}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3 h-3 text-slate-400" />
              <span>{language === 'hi' ? 'ध्वनि म्यूट है' : 'Sound OFF'}</span>
            </>
          )}
        </button>

        {toasts.length > 1 && (
          <button
            onClick={clearToasts}
            className="px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold border border-slate-300 transition"
          >
            {language === 'hi' ? 'सभी हटाएं' : 'Clear All'}
          </button>
        )}
      </div>

      {/* Toast Stack */}
      <div className="flex flex-col gap-2.5 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastCard 
            key={toast.id} 
            toast={toast} 
            onDismiss={removeToast} 
          />
        ))}
      </div>
    </div>
  );
};
