import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ApplicationStatus } from '../types';

export type ToastType = 'new_request' | 'status_update' | 'success' | 'info' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
  requestData?: {
    trackingToken: string;
    customerName: string;
    serviceName: string;
    status?: ApplicationStatus;
    amount?: number;
    mobile?: string;
  };
  action?: ToastAction;
}

export type ToastOptions = Omit<ToastItem, 'id' | 'timestamp'>;

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playChime: (type?: 'new_request' | 'status_update') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Web Audio API chime synthesizer for notification alerts
const synthesizeChime = (type: 'new_request' | 'status_update' = 'new_request') => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    if (type === 'new_request') {
      // Cheerful ascending chime (D5 -> A5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.18); // A5

      osc2.frequency.setValueAtTime(1174.66, now); // D6 harmonic
      osc2.frequency.exponentialRampToValueAtTime(1760.00, now + 0.18);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } else {
      // Gentle status chime (C5 -> E5 -> G5)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.24); // G5

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    }
  } catch (e) {
    // Audio autoplay might be restricted before first gesture; silently ignore
    console.debug('Notification audio playback prevented:', e);
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dis_toast_sound');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem('dis_toast_sound', enabled ? 'true' : 'false');
    } catch {}
  };

  const playChime = useCallback((type: 'new_request' | 'status_update' = 'new_request') => {
    if (soundEnabled) {
      synthesizeChime(type);
    }
  }, [soundEnabled]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      ...options,
      id,
      timestamp: new Date(),
      duration: options.duration ?? (options.type === 'new_request' || options.type === 'status_update' ? 7000 : 4500)
    };

    setToasts(prev => {
      // Limit to max 4 stacked toasts to avoid screen clutter
      const filtered = prev.slice(-3);
      return [...filtered, newToast];
    });

    if (options.type === 'new_request' || options.type === 'status_update') {
      playChime(options.type);
    }

    return id;
  }, [playChime]);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      clearToasts,
      soundEnabled,
      setSoundEnabled,
      playChime
    }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
