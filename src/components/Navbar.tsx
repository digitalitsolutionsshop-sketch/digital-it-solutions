import React, { useState } from 'react';
import { Logo } from './Logo';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { 
  Phone, 
  MessageCircle, 
  Search, 
  Clock, 
  ShieldCheck, 
  Menu, 
  X, 
  QrCode, 
  Lock, 
  Send,
  FileCheck2,
  MapPin,
  ExternalLink,
  Languages
} from 'lucide-react';
import type { ShopConfig } from '../types';

interface NavbarProps {
  config: ShopConfig;
  onOpenTrack: () => void;
  onOpenApply: () => void;
  onOpenPayment: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  onOpenTrack,
  onOpenApply,
  onOpenPayment,
  onOpenAdmin,
  isAdminLoggedIn,
  activeTab,
  setActiveTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language } = useLanguage();

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
      {/* Top Notification / Contact Bar */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Location & Status */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">{t.shopLocation}</span>
              <span className="sm:hidden">दरभंगा (847121)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t.shopOpen}
            </span>
          </div>

          {/* Quick Contact, Language & WhatsApp */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Toggle in Top Bar */}
            <LanguageToggle variant="pill" />

            <a 
              href={`tel:${config.mobile}`} 
              className="flex items-center gap-1 font-semibold text-slate-200 hover:text-amber-400 transition"
              title="Call Akash Kumar Lal Das"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{config.mobile}</span>
            </a>

            <a 
              href={`https://wa.me/91${config.mobile}?text=${encodeURIComponent(
                language === 'hi' 
                  ? 'नमस्ते आकाश जी, मुझे डिजिटल आईटी सॉल्यूशंस साइबर कैफे की सेवा के संबंध में जानकारी चाहिए।' 
                  : 'Hello Akash ji, I need information regarding Digital IT Solutions cyber cafe services.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-500 text-emerald-950" />
              <span className="hidden md:inline">{t.whatsappSupport}</span>
            </a>

            <button
              onClick={onOpenPayment}
              className="hidden lg:flex items-center gap-1 text-sky-300 hover:text-sky-200 transition font-medium"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{t.upiQrPay}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('home')} 
          className="cursor-pointer transition-transform hover:scale-[1.01]"
        >
          <Logo size="md" variant="full" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'home' 
                ? 'bg-blue-50 text-blue-800' 
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            {t.navHome}
          </button>

          <button
            onClick={() => handleNavClick('services')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'services' 
                ? 'bg-blue-50 text-blue-800' 
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            {t.navServices}
          </button>

          <button
            onClick={() => handleNavClick('posts')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'posts' 
                ? 'bg-blue-50 text-blue-800' 
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            {t.navJobs}
          </button>

          <button
            onClick={() => handleNavClick('links')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'links' 
                ? 'bg-blue-50 text-blue-800' 
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            {t.navPortals}
          </button>

          <button
            onClick={() => handleNavClick('testimonials')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'testimonials' 
                ? 'bg-blue-50 text-blue-800' 
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            {t.navReviews}
          </button>

          <button
            onClick={() => handleNavClick('faq')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'faq' 
                ? 'bg-blue-50 text-blue-800' 
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            {t.navFaq}
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Track Application Button */}
          <button
            onClick={onOpenTrack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition shadow-xs"
          >
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.trackBtn}</span>
          </button>

          {/* Quick Apply Online */}
          <button
            onClick={onOpenApply}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-sm shadow-orange-500/20 transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.applyBtn}</span>
          </button>

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              isAdminLoggedIn 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-slate-800 text-slate-200 hover:bg-slate-900'
            }`}
            title="Admin Login / Dashboard"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isAdminLoggedIn ? t.adminLoggedIn : t.adminBtn}</span>
          </button>
        </div>

        {/* Mobile Hamburger & Controls */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenTrack}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
            title="Track Application"
          >
            <Search className="w-4 h-4 text-blue-700" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-2 pt-2">
            
            {/* Mobile Language Switcher Row */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-blue-700" />
                <span>भाषा / Language</span>
              </span>
              <LanguageToggle variant="pill" />
            </div>

            <button
              onClick={() => handleNavClick('home')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-bold ${
                activeTab === 'home' ? 'bg-blue-50 text-blue-800' : 'text-slate-800'
              }`}
            >
              🏠 {t.navHome}
            </button>

            <button
              onClick={() => handleNavClick('services')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-bold ${
                activeTab === 'services' ? 'bg-blue-50 text-blue-800' : 'text-slate-800'
              }`}
            >
              📑 {t.navServices}
            </button>

            <button
              onClick={() => handleNavClick('posts')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-bold ${
                activeTab === 'posts' ? 'bg-blue-50 text-blue-800' : 'text-slate-800'
              }`}
            >
              📢 {t.navJobs}
            </button>

            <button
              onClick={() => handleNavClick('links')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-bold ${
                activeTab === 'links' ? 'bg-blue-50 text-blue-800' : 'text-slate-800'
              }`}
            >
              🌐 {t.navPortals}
            </button>

            <button
              onClick={() => handleNavClick('testimonials')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-bold ${
                activeTab === 'testimonials' ? 'bg-blue-50 text-blue-800' : 'text-slate-800'
              }`}
            >
              ⭐ {t.navReviews}
            </button>

            <button
              onClick={() => handleNavClick('faq')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-bold ${
                activeTab === 'faq' ? 'bg-blue-50 text-blue-800' : 'text-slate-800'
              }`}
            >
              ❓ {t.navFaq}
            </button>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenApply();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-orange-600 text-white font-bold text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {t.applyBtn}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTrack();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300"
              >
                <Search className="w-3.5 h-3.5 text-blue-600" />
                {t.trackBtn}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPayment();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-50 text-sky-900 border border-sky-200 font-bold text-xs"
              >
                <QrCode className="w-3.5 h-3.5 text-sky-600" />
                {t.upiQrPay}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                {isAdminLoggedIn ? t.adminLoggedIn : t.adminBtn}
              </button>
            </div>

            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {t.proprietorLabel} {config.proprietor}
              </p>
              <p>📍 {t.shopLocation}</p>
              <p>📞 {config.mobile}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
