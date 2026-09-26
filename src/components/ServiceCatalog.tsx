import React, { useState, useMemo } from 'react';
import type { Service } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  Clock, 
  Send, 
  MessageCircle, 
  Layers, 
  AlertCircle
} from 'lucide-react';

interface ServiceCatalogProps {
  services: Service[];
  onSelectService: (service: Service) => void;
  shopMobile: string;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  services,
  onSelectService,
  shopMobile,
}) => {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { key: 'All', label: t.allCategories },
    { key: 'RTPS Bihar', label: language === 'hi' ? '🏛️ RTPS बिहार' : '🏛️ RTPS Bihar' },
    { key: 'PAN Card', label: language === 'hi' ? '💳 पैन कार्ड' : '💳 PAN Card' },
    { key: 'Aadhar Services', label: language === 'hi' ? '🆔 आधार सेवाएं' : '🆔 Aadhar Services' },
    { key: 'Sarkari Jobs & Results', label: language === 'hi' ? '💼 नौकरी व रिजल्ट' : '💼 Sarkari Jobs' },
    { key: 'Student & Admission', label: language === 'hi' ? '🎓 स्कॉलरशिप व दाखिला' : '🎓 Admission & Scholarship' },
    { key: 'Banking & AEPS', label: language === 'hi' ? '🏦 नकद निकासी व AEPS' : '🏦 Banking & AEPS' },
    { key: 'Electricity & Utilities', label: language === 'hi' ? '⚡ बिजली बिल' : '⚡ Electricity & Bills' },
    { key: 'Printing & Documentation', label: language === 'hi' ? '🖨️ प्रिंट व लेमिनेशन' : '🖨️ Printing & Docs' },
  ];

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      if (!service.isActive) return false;
      const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        service.name.toLowerCase().includes(q) || 
        service.hindiName.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>{t.servicesCatalogBadge}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.servicesCatalogTitle}
        </h2>
        <p className="text-sm text-slate-600">
          {t.servicesCatalogDesc}
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchServicePlaceholder}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
            >
              {t.clear}
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  isSelected
                    ? 'bg-blue-900 text-white shadow-md shadow-blue-900/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">{t.noServiceMatch}</h3>
          <p className="text-xs text-slate-500">
            {t.tryDifferentSearch}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition"
          >
            {t.viewAllBtn}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id || service.name}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400/80 shadow-xs hover:shadow-lg transition flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header & Badges */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {service.category}
                  </span>
                  {service.popular && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                      {t.popularBadge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition leading-snug">
                  {language === 'hi' ? service.hindiName : service.name}
                </h3>
                <p className="text-xs font-semibold text-blue-700 mt-0.5">
                  {language === 'hi' ? service.name : service.hindiName}
                </p>

                <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Middle: Details & Documents */}
              <div className="px-5 py-3 bg-slate-50/70 border-y border-slate-100 space-y-2 text-xs">
                {/* Processing time */}
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px]">{t.estimatedTime} <strong className="text-slate-800">{service.processingTime}</strong></span>
                </div>

                {/* Required Docs */}
                {service.requiredDocs && service.requiredDocs.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      {t.requiredDocsLabel}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {service.requiredDocs.slice(0, 3).map((doc, i) => (
                        <span key={i} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                          {doc}
                        </span>
                      ))}
                      {service.requiredDocs.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium">+{service.requiredDocs.length - 3} {t.andMore}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom: Pricing & Actions */}
              <div className="p-5 pt-3">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{t.totalServiceFee}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-slate-900">₹{service.totalFee}</span>
                      {service.govFee > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({t.govFeeLabel} ₹{service.govFee} + कैफे: ₹{service.serviceFee})
                        </span>
                      )}
                      {service.govFee === 0 && (
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          {t.govFeeFree}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectService(service)}
                    className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.applyNowBtn}</span>
                  </button>

                  <a
                    href={`https://wa.me/91${shopMobile}?text=${encodeURIComponent(
                      language === 'hi'
                        ? `नमस्ते आकाश जी, मुझे "${service.name}" (${service.hindiName}) के बारे में जानकारी और फॉर्म भरवाना है।`
                        : `Hello Akash ji, I need details about "${service.name}" and want to apply.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.inquiryBtn}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
