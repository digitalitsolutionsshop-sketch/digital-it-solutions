import React, { useState } from 'react';
import type { Post } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Bell, 
  Calendar, 
  ExternalLink, 
  Send, 
  Share2, 
  Pin
} from 'lucide-react';

interface SarkariPostsProps {
  posts: Post[];
  onApplyForPost: (post: Post) => void;
  shopMobile: string;
}

export const SarkariPosts: React.FC<SarkariPostsProps> = ({
  posts,
  onApplyForPost,
  shopMobile,
}) => {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    { key: 'All', label: t.allNotices },
    { key: 'Sarkari Job', label: language === 'hi' ? '💼 सरकारी नौकरी' : '💼 Sarkari Jobs' },
    { key: 'Admit Card', label: language === 'hi' ? '🎟️ एडमिट कार्ड' : '🎟️ Admit Card' },
    { key: 'Result', label: language === 'hi' ? '📊 रिजल्ट' : '📊 Results' },
    { key: 'Bihar RTPS', label: language === 'hi' ? '🏛️ बिहार योजना' : '🏛️ Bihar RTPS' },
    { key: 'Admission / Scholarship', label: language === 'hi' ? '🎓 दाखिला/छात्रवृत्ति' : '🎓 Scholarship/Admission' },
    { key: 'CSC Update', label: language === 'hi' ? '📢 सीएससी सूचना' : '📢 CSC Updates' }
  ];

  const filteredPosts = posts.filter(post => {
    if (selectedCategory === 'All') return true;
    return post.category === selectedCategory;
  });

  const handleShare = (post: Post) => {
    const text = language === 'hi'
      ? `📢 *${post.title}*\nश्रेणी: ${post.category}\nअंतिम तिथि: ${post.lastDate || 'लागू नहीं'}\nयोग्यता: ${post.eligibility || 'विवरण देखें'}\n\nऑनलाइन फॉर्म भरवाने हेतु संपर्क करें:\n*डिजिटल आईटी सॉल्यूशंस (पैगम्बरपुर, दरभंगा)*\nसंचालक: आकाश कुमार लाल दास (मो: ${shopMobile})`
      : `📢 *${post.title}*\nCategory: ${post.category}\nLast Date: ${post.lastDate || 'N/A'}\nEligibility: ${post.eligibility || 'See details'}\n\nApply online via:\n*Digital IT Solutions (Paighamberpur, Darbhanga)*\nProprietor: Akash Kumar Lal Das (Mob: ${shopMobile})`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold">
          <Bell className="w-3.5 h-3.5 text-orange-600" />
          <span>{t.noticesBadge}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.noticesTitle}
        </h2>
        <p className="text-sm text-slate-600">
          {t.noticesDesc}
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar scroll-smooth">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedCategory === cat.key
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => (
          <div
            key={post.id || post.title}
            className={`bg-white rounded-3xl border transition shadow-xs hover:shadow-lg flex flex-col justify-between overflow-hidden relative ${
              post.isPinned ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
            }`}
          >
            {post.isPinned && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                <Pin className="w-3 h-3 fill-white" />
                <span>{t.pinnedNotice}</span>
              </div>
            )}

            <div className="p-6 pb-4 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  {post.category}
                </span>

                {post.lastDate && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {post.lastDate}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {post.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {post.content}
              </p>

              {/* Eligibility & Fee metadata tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                {post.eligibility && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.eligibilityLabel}</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{post.eligibility}</span>
                  </div>
                )}
                {post.applyFee && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.applyFeeLabel}</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{post.applyFee}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pt-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onApplyForPost(post)}
                  className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.applyViaShop}</span>
                </button>

                {post.officialLink && (
                  <a
                    href={post.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition"
                  >
                    <span>{t.officialPortalLink}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>

              <button
                onClick={() => handleShare(post)}
                className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                title="Share on WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};
