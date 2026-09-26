import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'button' | 'compact';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  className = '', 
  variant = 'pill' 
}) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition active:scale-95 ${className}`}
        title="Change Language / भाषा बदलें"
      >
        <Languages className="w-4 h-4 text-blue-700" />
        <span>{language === 'hi' ? 'English' : 'हिन्दी'}</span>
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-300 text-xs select-none ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
          language === 'hi'
            ? 'bg-blue-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>🇮🇳</span>
        <span>हिन्दी</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
          language === 'en'
            ? 'bg-blue-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
};
