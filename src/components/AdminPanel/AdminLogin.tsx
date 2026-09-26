import React, { useState } from 'react';
import { 
  Lock, 
  X, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  LogIn, 
  UserCheck 
} from 'lucide-react';
import { auth, googleProvider, ADMIN_EMAIL, ADMIN_FALLBACK_PIN } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { Logo } from '../Logo';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      if (user.email) {
        onLoginSuccess(user.email);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('गूगल लॉगिन में समस्या आई। आप नीचे संचालक पिन (8340) से भी लॉगिन कर सकते हैं।');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (pin === ADMIN_FALLBACK_PIN) {
      onLoginSuccess(ADMIN_EMAIL);
      onClose();
    } else {
      setErrorMsg('गलत पिन! कृपया संचालक आकाश कुमार लाल दास का पिन (8340) दर्ज करें।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
              <Logo size="sm" variant="badge" showCscBadge={false} />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">दुकानदार एडमिन पैनल</h2>
              <p className="text-xs text-slate-300">DIGITAL IT SOLUTIONS • पैगम्बरपुर</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Option 1: Official Google Account */}
          <div className="space-y-3 text-center">
            <p className="text-xs font-semibold text-slate-700">
              अधिकृत गूगल ईमेल (digitalitsolutionsshop@gmail.com) से लॉगिन करें:
            </p>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition disabled:opacity-60"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>{loading ? 'प्रमाणित किया जा रहा है...' : 'Google से साइन-इन करें'}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase">
              अथवा दुकान पिन (Fast Kiosk PIN)
            </span>
          </div>

          {/* Option 2: Quick Store PIN */}
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                संचालक सुरक्षा पिन कोड (Enter Store PIN):
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="सुरक्षा पिन (उदा: 8340)"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-sm font-black tracking-widest focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                संचालक: आकाश कुमार लाल दास (डिफ़ॉल्ट पिन: 8340)
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-md transition"
            >
              एडमिन पैनल में प्रवेश करें
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <span>सुरक्षित सीएससी एडमिन पोर्टल • रियल-टाइम डेटा सिंक सक्रिय</span>
          </div>
        </div>

      </div>
    </div>
  );
};
