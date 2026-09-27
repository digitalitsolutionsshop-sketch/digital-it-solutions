import React, { useState, useMemo } from 'react';
import type { OnlineScheme, SchemeCategory } from '../types';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Calendar, 
  Building2, 
  Award, 
  FileCheck, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  CheckSquare, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  Sparkles
} from 'lucide-react';

interface OnlineSchemesSectionProps {
  schemes: OnlineScheme[];
  onApplyViaCafe: (scheme: OnlineScheme) => void;
  shopMobile: string;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'सभी योजनाएं (All)', value: 'ALL' },
  { label: 'छात्र व शिक्षा (Student & Education)', value: 'Student & Education' },
  { label: 'किसान व कृषि (Agriculture & Farmer)', value: 'Agriculture & Farmer Schemes' },
  { label: 'रोजगार व नौकरी (Jobs & Employment)', value: 'Employment & Jobs' },
  { label: 'बिहार सरकारी सेवाएं (Bihar RTPS)', value: 'Bihar Government Services' },
  { label: 'प्रवेश व परीक्षा (Admission)', value: 'Admission & Examination' },
  { label: 'जन कल्याण (Public Welfare)', value: 'Government Forms & Public Welfare' }
];

export const OnlineSchemesSection: React.FC<OnlineSchemesSectionProps> = ({
  schemes,
  onApplyViaCafe,
  shopMobile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter and search computation
  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      // Status check (published only for public users, plus expired check)
      if (scheme.status === 'draft' || scheme.status === 'rejected') {
        return false;
      }

      // Check date expiry
      const isDateExpired = scheme.lastDate && new Date(scheme.lastDate) < new Date();
      const effectiveStatus = (scheme.status === 'expired' || isDateExpired) ? 'EXPIRED' : 'ACTIVE';

      if (statusFilter !== 'ALL' && effectiveStatus !== statusFilter) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && scheme.category !== selectedCategory) {
        return false;
      }

      // State filter
      if (selectedState !== 'ALL') {
        if (selectedState === 'Bihar' && !scheme.state?.toLowerCase().includes('bihar')) return false;
        if (selectedState === 'Central' && !scheme.state?.toLowerCase().includes('central') && !scheme.state?.toLowerCase().includes('all india')) return false;
      }

      // Search keyword filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = scheme.title.toLowerCase().includes(query);
        const descMatch = scheme.description.toLowerCase().includes(query);
        const deptMatch = scheme.department.toLowerCase().includes(query);
        const eligMatch = scheme.eligibility.toLowerCase().includes(query);
        const docsMatch = scheme.requiredDocs?.some(d => d.toLowerCase().includes(query));
        return titleMatch || descMatch || deptMatch || eligMatch || docsMatch;
      }

      return true;
    });
  }, [schemes, searchQuery, selectedCategory, selectedState, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage) || 1;
  const paginatedSchemes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSchemes.slice(start, start + itemsPerPage);
  }, [filteredSchemes, currentPage]);

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleStateChange = (val: string) => {
    setSelectedState(val);
    setCurrentPage(1);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'निरंतर (Ongoing)';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>सत्यापित सरकारी पोर्टल एवं आधिकारिक योजनाएं (Official Sources)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ऑनलाइन योजनाएं, छात्रवृत्ति एवं सरकारी फॉर्म
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            बिहार एवं भारत सरकार की सभी नई कल्याणकारी योजनाओं, छात्रवृत्तियों और प्रतियोगी परीक्षाओं की आधिकारिक जानकारी एवं ऑनलाइन आवेदन सुविधा।
          </p>
        </div>

        {/* Search & Filter Controls (Mobile-First) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="खोजें: स्कॉलरशिप, किसान, सिपाही, RTPS, बिहार, 10वीं..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* State Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="ALL">सभी राज्य व केंद्र (All States)</option>
                <option value="Bihar">बिहार राज्य (Bihar)</option>
                <option value="Central">केंद्र सरकार (Central / All India)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="ALL">सभी स्थिति (All Status)</option>
                <option value="ACTIVE">सक्रिय आवेदन (Active Only)</option>
                <option value="EXPIRED">अंतिम तिथि समाप्त (Expired)</option>
              </select>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                  selectedCategory === cat.value
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            कुल <strong>{filteredSchemes.length}</strong> योजनाएं एवं सेवाएं उपलब्ध
          </span>
          {totalPages > 1 && (
            <span>
              पेज <strong>{currentPage}</strong> / {totalPages}
            </span>
          )}
        </div>

        {/* Scheme Cards Grid (Mobile-First) */}
        {paginatedSchemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedSchemes.map((scheme) => {
              const isExpired = scheme.status === 'expired' || 
                (scheme.lastDate && new Date(scheme.lastDate) < new Date());

              return (
                <div
                  key={scheme.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-xl hover:border-blue-300 transition flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200 line-clamp-1">
                        {scheme.category}
                      </span>

                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 shrink-0">
                          समाप्त (Expired)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          सक्रिय (Active)
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition leading-snug">
                        {scheme.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{scheme.department}</span>
                        <span className="font-semibold text-blue-900">({scheme.state})</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {scheme.description}
                    </p>

                    {/* Eligibility & Documents Snippet */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-start gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-slate-700 leading-tight">
                          <strong>पात्रता:</strong> {scheme.eligibility}
                        </span>
                      </div>

                      {scheme.requiredDocs && scheme.requiredDocs.length > 0 && (
                        <div className="flex items-start gap-1.5 pt-1 border-t border-slate-200/70">
                          <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                            <strong>दस्तावेज:</strong> {scheme.requiredDocs.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Date info strip */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>अंतिम तिथि:</span>
                      </span>
                      <span className={`font-bold ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatDate(scheme.lastDate)}
                      </span>
                    </div>

                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    {/* Apply Online button directly to verified official portal */}
                    {isExpired ? (
                      <button
                        disabled
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed text-center"
                      >
                        तिथि समाप्त
                      </button>
                    ) : (
                      <a
                        href={scheme.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                        title="आधिकारिक पोर्टल पर ऑनलाइन आवेदन करें"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>APPLY ONLINE</span>
                      </a>
                    )}

                    {/* Apply through Cyber Cafe button */}
                    <button
                      onClick={() => onApplyViaCafe(scheme)}
                      className="py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-950 font-bold text-xs flex items-center justify-center gap-1 transition"
                      title="कैफे द्वारा फॉर्म भरवाएं"
                    >
                      <Send className="w-3.5 h-3.5 text-orange-600" />
                      <span className="hidden sm:inline">कैफे सहायता</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">कोई योजना नहीं मिली</h3>
            <p className="text-xs text-slate-500">
              आपके खोज मापदंड के अनुसार कोई परिणाम उपलब्ध नहीं है। कृपया फ़िल्टर रीसेट करें।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedState('ALL');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              फ़िल्टर रीसेट करें
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
              title="पिछला पेज"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                  currentPage === page
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
              title="अगला पेज"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
