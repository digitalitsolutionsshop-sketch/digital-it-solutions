import React from 'react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  ExternalLink
} from 'lucide-react';
import type { ShopConfig } from '../types';

interface FooterProps {
  config: ShopConfig;
  onOpenApply: () => void;
  onOpenTrack: () => void;
  onOpenPayment: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  onOpenApply,
  onOpenTrack,
  onOpenPayment,
  onOpenAdmin,
}) => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      
      {/* Tricolor Ribbon top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-500" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand & Address Column */}
          <div className="lg:col-span-5 space-y-4">
            <Logo size="md" variant="full" />
            
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footerDesc}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-amber-400 font-bold block text-[11px] uppercase">
                    {t.permanentAddressTitle}
                  </span>
                  <span className="text-white font-medium">{config.fullAddressString}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1 border-t border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  {t.proprietorLabel} <strong className="text-white uppercase">{config.proprietor}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`tel:${config.mobile}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>{config.mobile}</span>
              </a>

              <a
                href={`https://wa.me/91${config.mobile}?text=${encodeURIComponent(
                  language === 'hi' 
                    ? 'नमस्ते आकाश जी, मुझे साइबर कैफे सेवा के बारे में पूछना है।' 
                    : 'Hello Akash ji, I want to inquire about cyber cafe services.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-white text-emerald-900" />
                <span>{t.whatsappSupport}</span>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {t.quickNavTitle}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenApply} className="text-slate-400 hover:text-white transition">
                  • {t.applyHomeBtn}
                </button>
              </li>
              <li>
                <button onClick={onOpenTrack} className="text-slate-400 hover:text-white transition">
                  • {t.trackStatusBtn}
                </button>
              </li>
              <li>
                <button onClick={onOpenPayment} className="text-slate-400 hover:text-white transition">
                  • {t.payOnlineUpi}
                </button>
              </li>
              <li>
                <a 
                  href="#faq-section" 
                  className="text-slate-400 hover:text-white transition"
                >
                  • {t.navFaq}
                </a>
              </li>
              <li>
                <a 
                  href="https://serviceonline.bihar.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition inline-flex items-center gap-1"
                >
                  • {language === 'hi' ? 'आरटीपीएस सर्विस प्लस बिहार' : 'RTPS ServicePlus Bihar'}
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.sarkariresult.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition inline-flex items-center gap-1"
                >
                  • {language === 'hi' ? 'सरकारी रिजल्ट (लेटेस्ट जॉब्स)' : 'Sarkari Result Official'}
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Major Services Column */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {t.keyServicesFooterTitle}
            </h3>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <span className="p-1.5 bg-slate-900 rounded border border-slate-800">
                {language === 'hi' ? 'जाति, आय, निवास' : 'Caste/Income/Niwas'}
              </span>
              <span className="p-1.5 bg-slate-900 rounded border border-slate-800">
                {language === 'hi' ? 'नया पैन कार्ड' : 'New PAN Card'}
              </span>
              <span className="p-1.5 bg-slate-900 rounded border border-slate-800">
                {language === 'hi' ? 'आधार पीवीसी कार्ड' : 'Aadhar PVC Card'}
              </span>
              <span className="p-1.5 bg-slate-900 rounded border border-slate-800">
                {language === 'hi' ? 'आयुष्मान गोल्डन कार्ड' : 'Ayushman Card'}
              </span>
              <span className="p-1.5 bg-slate-900 rounded border border-slate-800">
                {language === 'hi' ? 'सरकारी नौकरी फॉर्म' : 'Sarkari Job Forms'}
              </span>
              <span className="p-1.5 bg-slate-900 rounded border border-slate-800">
                {language === 'hi' ? 'पोस्ट मैट्रिक छात्रवृत्ति' : 'PMS Scholarship'}
              </span>
              <span className="p-1.5 bg-slate-900 rounded border border-slate-800">
                {language === 'hi' ? 'बिजली बिल भुगतान' : 'Electricity Bills'}
              </span>
              <span className="p-1.5 bg-slate-900 rounded border border-slate-800">
                {language === 'hi' ? 'आधार से नकद निकासी' : 'AEPS Cash Withdrawal'}
              </span>
            </div>

            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{config.openingHours}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{config.email}</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Admin Trigger */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} <strong>{config.shopName}</strong> (Paighamberpur, Darbhanga Bihar). {t.copyrightText}
          </p>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">
              {t.cscIdLabel} <strong className="text-slate-300">{config.cscId}</strong>
            </span>

            <button
              onClick={onOpenAdmin}
              className="text-slate-400 hover:text-amber-400 font-bold transition flex items-center gap-1"
            >
              <span>{t.adminLoginFooter}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
