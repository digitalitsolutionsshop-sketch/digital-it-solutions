import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Smartphone, 
  Building2, 
  Download,
  IndianRupee,
  CreditCard
} from 'lucide-react';
import type { ShopConfig } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ShopConfig;
  defaultAmount?: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  config,
  defaultAmount = 50
}) => {
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const upiId = config.upiId || '8340622912@paytm';
  const payeeName = encodeURIComponent(config.proprietor || 'Akash Kumar Lal Das');
  const upiPayload = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=Digital%20IT%20Solutions%20Fee`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(upiPayload)}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetAmounts = [20, 50, 100, 200, 500];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">ऑनलाइन पेमेंट (UPI QR Code)</h2>
              <p className="text-xs text-blue-200">{config.shopName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-center">
          
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              भुगतान राशि (Amount in ₹):
            </label>
            <div className="relative max-w-[180px] mx-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-black text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Presets */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {presetAmounts.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    amount === p 
                      ? 'bg-blue-900 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ₹{p}
                </button>
              ))}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 max-w-[280px] mx-auto shadow-inner relative">
            <div className="bg-white p-2 rounded-xl shadow-xs inline-block">
              <img
                src={qrUrl}
                alt="Digital IT Solutions UPI QR Code"
                className="w-48 h-48 mx-auto object-contain rounded-lg"
              />
            </div>
            
            <div className="mt-2 text-center">
              <p className="text-xs font-extrabold text-slate-900">{config.proprietor}</p>
              <p className="text-[10px] text-slate-500 font-medium">Digital IT Solutions • पैगम्बरपुर, दरभंगा</p>
            </div>
          </div>

          {/* UPI ID copy strip */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-2">
            <div className="text-left truncate">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">UPI आईडी</span>
              <span className="text-xs font-mono font-bold text-slate-900 truncate block">{upiId}</span>
            </div>
            <button
              onClick={handleCopyUPI}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1 shrink-0 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'कॉपी हुआ!' : 'कॉपी करें'}</span>
            </button>
          </div>

          {/* Quick UPI Intent Link on Mobile */}
          <a
            href={upiPayload}
            className="block sm:hidden w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-md transition"
          >
            Google Pay / PhonePe / Paytm से सीधा पे करें
          </a>

          <div className="text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center justify-center gap-1 font-medium text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% सुरक्षित एवं अधिकृत डिजिटल भुगतान
            </p>
            <p>भुगतान के पश्चात स्क्रीनशॉट <strong>8340622912</strong> पर भेजें।</p>
          </div>

        </div>

      </div>
    </div>
  );
};
