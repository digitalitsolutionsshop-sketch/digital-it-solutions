import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { 
  FileText, 
  Search, 
  PhoneCall, 
  MessageSquare, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Send, 
  CreditCard, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight,
  Landmark,
  UserCheck,
  X,
  ArrowRight,
  Check
} from 'lucide-react';
import type { ShopConfig, Service } from '../types';

interface HeroProps {
  config: ShopConfig;
  services?: Service[];
  onSelectService?: (service: Service) => void;
  onOpenApply: () => void;
  onOpenTrack: () => void;
  onOpenPayment: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  config,
  services = [],
  onSelectService,
  onOpenApply,
  onOpenTrack,
  onOpenPayment,
  onExploreServices
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter services by typed keywords
  const matchedServices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return services.filter(service => {
      if (!service.isActive) return false;
      return (
        service.name.toLowerCase().includes(q) ||
        service.hindiName.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        (service.requiredDocs && service.requiredDocs.some(d => d.toLowerCase().includes(q)))
      );
    }).slice(0, 6);
  }, [searchQuery, services]);

  const trendingTags = language === 'hi' ? [
    'जाति प्रमाण पत्र',
    'नया पैन कार्ड',
    'आधार PVC',
    'BPSC फॉर्म',
    'बिजली बिल',
    'पोस्ट मैट्रिक स्कॉलरशिप'
  ] : [
    'Caste Certificate',
    'New PAN Card',
    'Aadhar PVC',
    'BPSC Job Form',
    'Electricity Bill',
    'PMS Scholarship'
  ];

  const handleSelectServiceItem = (service: Service) => {
    setIsDropdownOpen(false);
    if (onSelectService) {
      onSelectService(service);
    } else {
      onOpenApply();
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white">
      {/* Background Decorative patterns */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
      
      {/* Tricolor top border accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-500" />

      {/* Live Announcement Marquee Ticker */}
      <div className="bg-amber-500 text-slate-950 font-bold text-xs py-2 px-4 overflow-hidden relative shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="shrink-0 flex items-center gap-1 bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {language === 'hi' ? 'नवीनतम सूचना' : 'Latest Alert'}
          </span>
          <div className="whitespace-nowrap overflow-x-auto no-scrollbar scroll-smooth text-xs font-semibold">
            {config.emergencyNotice} • {t.proprietorLabel} {config.proprietor} ({config.mobile}) • {t.shopAddressTitle}: {config.fullAddressString}
          </div>
        </div>
      </div>

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading, Shop Credentials, Integrated Search & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Government Authorized CSC Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-800/40 border border-blue-400/30 text-xs font-medium text-blue-200 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t.cscBadge}</span>
              </div>
            </div>

            {/* Official Digital IT Solutions Brand Logo Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 inline-flex items-center shadow-2xl border border-white/30">
              <Logo size="lg" variant="full" />
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
                  {config.shopName}
                </span>
                <span className="block text-2xl sm:text-3xl text-slate-200 font-extrabold mt-1">
                  {t.heroHeadline2}
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                {t.heroDesc}
              </p>
            </div>

            {/* ===================== INTEGRATED HERO SEARCH BAR ===================== */}
            <div className="relative z-30 pt-1" ref={searchContainerRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-amber-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim()) setIsDropdownOpen(true);
                  }}
                  placeholder={t.searchPlaceholder}
                  className="block w-full pl-11 pr-11 py-3.5 sm:py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 font-semibold text-sm sm:text-base shadow-2xl focus:outline-hidden focus:ring-4 focus:ring-amber-400/50 border-2 border-amber-400 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition"
                    title="Clear search"
                  >
                    <X className="w-5 h-5 bg-slate-100 rounded-full p-0.5" />
                  </button>
                )}
              </div>

              {/* Trending Quick Search Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2.5 text-xs">
                <span className="text-amber-300 font-bold flex items-center gap-1 text-[11px] shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {t.trendingLabel}
                </span>
                {trendingTags.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      setIsDropdownOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 text-[11px] font-semibold transition active:scale-95"
                  >
                    {term}
                  </button>
                ))}
              </div>

              {/* Autocomplete Results Dropdown */}
              {isDropdownOpen && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-900 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      {t.searchResultTitle} <span className="text-blue-900">"{searchQuery}"</span> ({matchedServices.length} {t.servicesFound})
                    </span>
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
                    >
                      {t.close}
                    </button>
                  </div>

                  {matchedServices.length === 0 ? (
                    <div className="p-6 text-center space-y-3">
                      <p className="text-xs text-slate-600">
                        "<strong>{searchQuery}</strong>" {t.noServicesFound}
                      </p>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenApply();
                        }}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        {t.fillCustomForm}
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {matchedServices.map((service) => (
                        <div
                          key={service.id || service.name}
                          className="p-3.5 hover:bg-blue-50/70 transition flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {service.category}
                              </span>
                              <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {service.processingTime}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-sm truncate">
                              {language === 'hi' ? service.hindiName : service.name}
                            </h4>
                            <p className="text-[11px] font-semibold text-blue-700 truncate">
                              {language === 'hi' ? service.name : service.hindiName}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">{t.totalFeeLabel}</span>
                              <span className="text-sm font-black text-slate-900">₹{service.totalFee}</span>
                            </div>

                            <button
                              onClick={() => handleSelectServiceItem(service)}
                              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition active:scale-95"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{t.applyShort}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onExploreServices();
                      }}
                      className="text-xs text-blue-800 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{t.viewAllServices}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Shop Address & Proprietor Info Card */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xl space-y-2.5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-300 font-bold">{t.shopAddressTitle}</p>
                  <p className="text-sm font-semibold text-white leading-snug">
                    {config.fullAddressString}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">{t.proprietorLabel}</span>
                  <span className="font-bold text-white uppercase">{config.proprietor}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-200">{config.openingHours}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onOpenApply}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 transition transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{t.applyHomeBtn}</span>
              </button>

              <button
                onClick={onOpenTrack}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600 shadow-md transition"
              >
                <Search className="w-4 h-4 text-sky-400" />
                <span>{t.trackStatusBtn}</span>
              </button>

              <button
                onClick={onExploreServices}
                className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
              >
                <span>{t.servicesListBtn}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Contact Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={`tel:${config.mobile}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.callUsBtn} {config.mobile}</span>
              </a>

              <a
                href={`https://wa.me/91${config.mobile}?text=${encodeURIComponent(
                  language === 'hi' 
                    ? 'नमस्ते आकाश जी! मुझे फॉर्म भरवाना है।' 
                    : 'Hello Akash ji! I want to apply for a form at Digital IT Solutions.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
                <span>{t.sendDocsWhatsapp}</span>
              </a>
            </div>

          </div>

          {/* Right Column: Quick Portal Action Board */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                    <Logo size="sm" variant="badge" showCscBadge={false} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white leading-tight">{t.keyServicesTitle}</h2>
                    <p className="text-[11px] text-slate-400">डिजिटल आईटी सॉल्यूशंस पैगम्बरपुर</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {t.verifiedKiosk}
                </span>
              </div>

              {/* Service Quick Links Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div 
                  onClick={onOpenApply}
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between">
                    <Landmark className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
                    <span className="text-[10px] text-amber-400 font-bold">₹50</span>
                  </div>
                  <h3 className="text-xs font-bold text-white mt-2">
                    {language === 'hi' ? 'RTPS बिहार' : 'RTPS Bihar'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {language === 'hi' ? 'जाति, आय, निवास प्रमाण पत्र' : 'Caste, Income, Residence'}
                  </p>
                </div>

                <div 
                  onClick={onOpenApply}
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between">
                    <CreditCard className="w-5 h-5 text-sky-400 group-hover:scale-110 transition" />
                    <span className="text-[10px] text-sky-400 font-bold">₹200</span>
                  </div>
                  <h3 className="text-xs font-bold text-white mt-2">
                    {language === 'hi' ? 'नया पैन कार्ड' : 'New PAN Card'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {language === 'hi' ? 'NSDL / e-PAN व सुधार' : 'NSDL / e-PAN & Correction'}
                  </p>
                </div>

                <div 
                  onClick={onOpenApply}
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between">
                    <FileText className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {language === 'hi' ? 'लाइव' : 'Live'}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white mt-2">
                    {language === 'hi' ? 'सरकारी नौकरी फॉर्म' : 'Sarkari Job Forms'}
                  </h3>
                  <p className="text-[10px] text-slate-400">BPSC, Bihar Police, RPF</p>
                </div>

                <div 
                  onClick={onOpenApply}
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-purple-500/50 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between">
                    <Printer className="w-5 h-5 text-purple-400 group-hover:scale-110 transition" />
                    <span className="text-[10px] text-purple-400 font-bold">₹100</span>
                  </div>
                  <h3 className="text-xs font-bold text-white mt-2">
                    {language === 'hi' ? 'आधार पीवीसी कार्ड' : 'Aadhar PVC Card'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {language === 'hi' ? 'वाटरप्रूफ ओरिजिनल कार्ड' : 'Original Waterproof Card'}
                  </p>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {t.accurateGuarantee}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {t.instantReceipt}
                </span>
              </div>

              {/* Instant UPI Pay Button */}
              <div className="mt-4">
                <button
                  onClick={onOpenPayment}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t.payOnlineUpi}</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
