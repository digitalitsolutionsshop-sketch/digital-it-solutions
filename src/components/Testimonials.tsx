import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  Plus, 
  X, 
  ThumbsUp, 
  Award, 
  ShieldCheck, 
  User, 
  MapPin, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Logo } from './Logo';

export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  service: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

interface TestimonialsProps {
  shopMobile?: string;
}

const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'rev-1',
    name: 'रवि रंजन कुमार',
    location: 'ग्राम: पैगम्बरपुर, केवटी',
    service: 'BPSC शिक्षक भर्ती व बिहार पुलिस फॉर्म',
    rating: 5,
    date: '2 दिन पहले',
    comment: 'आकाश जी ने मेरा BPSC Teacher का फॉर्म बहुत ही सावधानी और सही-सही भरा। सर्वर डाउन होने के बावजूद देर रात तक जागकर मेरा चालान जमा किया और प्रिंटआउट दिया। पूरे केवटी में सबसे भरोसेमंद साइबर कैफे है।',
    verified: true
  },
  {
    id: 'rev-2',
    name: 'आरती कुमारी',
    location: 'दरिमा, दरभंगा',
    service: 'RTPS बिहार - जाति, आय, निवास प्रमाण पत्र',
    rating: 5,
    date: '5 दिन पहले',
    comment: 'घर बैठे ही ऑनलाइन आवेदन का टोकन लिया और आकाश भाई ने सर्विस प्लस पर तुरंत अप्लाई कर दिया। 10 दिन के अंदर मुझे बिना ब्लॉक गए असली सर्टिफिकेट मिल गया। बहुत ही शानदार सेवा!',
    verified: true
  },
  {
    id: 'rev-3',
    name: 'मोहम्मद अफ़रोज़ आलम',
    location: 'केवटी बाज़ार, दरभंगा',
    service: 'नया पैन कार्ड (Form 49A) व आधार सुधार',
    rating: 5,
    date: '1 हफ्ता पहले',
    comment: 'मेरे पैन कार्ड में पिता के नाम की स्पेलिंग गलत थी जिसके कारण बैंक में खाता नहीं खुल रहा था। डिजिटल आईटी सॉल्यूशंस पर सुधार करवाया, 8 दिन में ई-पैन आ गया और प्लास्टिक कार्ड भी घर पहुंच गया।',
    verified: true
  },
  {
    id: 'rev-4',
    name: 'सुनील कुमार साहनी',
    location: 'पैगम्बरपुर, दरभंगा',
    service: 'आधार एटीएम (AEPS) नकद निकासी व बिजली बिल',
    rating: 5,
    date: '2 हफ्ता पहले',
    comment: 'बैंक की शाखा 8 किलोमीटर दूर है, यहाँ फिंगरप्रिंट लगाकर तुरंत बिना लाइन लगे पैसा निकल जाता है। साथ ही हर महीने का नॉर्थ बिहार बिजली बिल भी यहीं से 2 मिनट में भरवाता हूँ।',
    verified: true
  },
  {
    id: 'rev-5',
    name: 'प्रीति कुमारी',
    location: 'एलएनएमयू छात्रा, दरभंगा',
    service: 'बिहार पोस्ट मैट्रिक छात्रवृत्ति (PMS)',
    rating: 5,
    date: '3 हफ्ता पहले',
    comment: 'कॉलेज बोनाफाइड और फी रसीद सही फॉर्मेट में स्कैन करके अपलोड की गई। फॉर्म बिल्कुल बिना गलती के सबमिट हुआ और स्कॉलरशिप की राशि सीधे मेरे खाते में आई। थैंक यू आकाश भइया!',
    verified: true
  },
  {
    id: 'rev-6',
    name: 'संजय लाल दास',
    location: 'पैगम्बरपुर, केवटी',
    service: 'वाटरप्रूफ आधार पीवीसी कार्ड व लैमिनेशन',
    rating: 5,
    date: '1 महीना पहले',
    comment: 'डाक द्वारा असली ओरिजिनल प्लास्टिक आधार कार्ड घर आ गया। यहाँ कभी कोई मनमाना चार्ज नहीं लिया जाता, जो उचित सरकारी और कैफे फीस है वही लेते हैं। व्यवहार बहुत ही नम्र और सहयोगी है।',
    verified: true
  }
];

export const Testimonials: React.FC<TestimonialsProps> = ({ shopMobile = '8340622912' }) => {
  const { t, language } = useLanguage();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);
  const [filterService, setFilterService] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  
  // New review form state
  const [authorName, setAuthorName] = useState('');
  const [authorLocation, setAuthorLocation] = useState(language === 'hi' ? 'पैगम्बरपुर, दरभंगा' : 'Paighamberpur, Darbhanga');
  const [authorService, setAuthorService] = useState('RTPS जाति/आय/निवास');
  const [authorRating, setAuthorRating] = useState(5);
  const [authorComment, setAuthorComment] = useState('');
  const [submittedThanks, setSubmittedThanks] = useState(false);

  const categories = [
    { key: 'All', label: t.allReviewsFilter },
    { key: 'jobs', label: language === 'hi' ? 'सरकारी नौकरी व फॉर्म' : 'Sarkari Jobs' },
    { key: 'rtps', label: language === 'hi' ? 'RTPS प्रमाण पत्र' : 'RTPS Certificates' },
    { key: 'pan_aadhar', label: language === 'hi' ? 'पैन व आधार सेवाएं' : 'PAN & Aadhar' },
    { key: 'banking', label: language === 'hi' ? 'बैंकिंग व बिल' : 'Banking & Bills' }
  ];

  const filteredTestimonials = testimonials.filter(item => {
    if (filterService === 'All') return true;
    if (filterService === 'jobs') return item.service.includes('भर्ती') || item.service.includes('फॉर्म') || item.service.toLowerCase().includes('job');
    if (filterService === 'rtps') return item.service.includes('RTPS') || item.service.includes('प्रमाण पत्र');
    if (filterService === 'pan_aadhar') return item.service.includes('पैन') || item.service.includes('आधार') || item.service.includes('PAN');
    if (filterService === 'banking') return item.service.includes('बैंकिंग') || item.service.includes('बिजली') || item.service.includes('AEPS');
    return true;
  });

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorComment.trim()) return;

    const newRev: TestimonialItem = {
      id: `rev-${Date.now()}`,
      name: authorName.trim(),
      location: authorLocation.trim(),
      service: authorService,
      rating: authorRating,
      date: language === 'hi' ? 'आज' : 'Today',
      comment: authorComment.trim(),
      verified: true
    };

    setTestimonials([newRev, ...testimonials]);
    setSubmittedThanks(true);
    setTimeout(() => {
      setSubmittedThanks(false);
      setShowAddModal(false);
      setAuthorName('');
      setAuthorComment('');
    }, 2000);
  };

  return (
    <section className="py-14 px-4 sm:px-6 max-w-7xl mx-auto">
      
      {/* Trust Header with Official Logo accent */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span>{t.testimonialsBadge}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          {t.testimonialsTitle}
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {t.testimonialsDesc}
        </p>

        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
            <span className="text-xl sm:text-2xl font-black text-blue-900 block">10,000+</span>
            <span className="text-[11px] text-slate-500 font-semibold">{t.totalAppsMetric}</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
            <span className="text-xl sm:text-2xl font-black text-emerald-700 block">100%</span>
            <span className="text-[11px] text-slate-500 font-semibold">{t.accurateMetric}</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
            <span className="text-xl sm:text-2xl font-black text-amber-600 block">15 min</span>
            <span className="text-[11px] text-slate-500 font-semibold">{t.avgTimeMetric}</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
            <span className="text-xl sm:text-2xl font-black text-indigo-900 block">0%</span>
            <span className="text-[11px] text-slate-500 font-semibold">{t.noHiddenMetric}</span>
          </div>
        </div>

      </div>

      {/* Filter and Write Review Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilterService(cat.key)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                filterService === cat.key
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Write a Review Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.writeReviewBtn}</span>
        </button>

      </div>

      {/* Testimonials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-400/80 shadow-xs hover:shadow-lg transition flex flex-col justify-between space-y-4 group relative overflow-hidden"
          >
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500 opacity-80" />

            <div className="space-y-3">
              
              {/* Rating Stars & Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
              </div>

              {/* Service Tag */}
              <div className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-100">
                सेवा: {item.service}
              </div>

              {/* Comment Quote */}
              <p className="text-xs text-slate-700 leading-relaxed italic font-normal">
                "{item.comment}"
              </p>

            </div>

            {/* Author Details Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-none">{item.name}</h4>
                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-amber-500" />
                    {item.location}
                  </span>
                </div>
              </div>

              {item.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {t.verifiedCustomerBadge}
                </span>
              )}
            </div>

            {/* Direct WhatsApp Contact Button for this Specific Service Experience */}
            <div className="pt-2.5 border-t border-slate-100/90 flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 -mx-6 -mb-6 p-3 px-6 rounded-b-3xl">
              <span className="text-[10px] text-slate-500 font-medium">
                {language === 'hi' ? 'समान सेवा चाहिए?' : 'Need this service?'}
              </span>

              <a
                href={`https://wa.me/91${shopMobile}?text=${encodeURIComponent(
                  language === 'hi'
                    ? `नमस्ते आकाश जी, मैंने डिजिटल आईटी सॉल्यूशंस पोर्टल पर ${item.name} जी का रिव्यू देखा: "${item.service}" (${item.rating}★)। मुझे भी इसी सेवा के संबंध में आपसे जानकारी चाहिए और ऑनलाइन फॉर्म भरवाना है।`
                    : `Hello Akash ji, I saw ${item.name}'s review on Digital IT Solutions for "${item.service}" (${item.rating}★). I also need information regarding this service and want to apply.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs hover:shadow-md transition active:scale-95 group/btn"
                title={`WhatsApp Akash Kumar about ${item.service}`}
              >
                <MessageSquare className="w-3.5 h-3.5 fill-white text-emerald-800" />
                <span>Contact Us on WhatsApp</span>
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* Trust Seal Banner */}
      <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center p-2 shrink-0">
            <Logo size="sm" variant="badge" showCscBadge={false} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {t.trustPledgeTitle}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {t.trustPledgeDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:8340622912"
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition"
          >
            कॉल करें: 8340622912
          </a>
        </div>
      </div>

      {/* ===================== MODAL: WRITE A REVIEW ===================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-sm text-slate-900">अपनी समीक्षा व रेटिंग दर्ज करें</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedThanks ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base text-slate-900">समीक्षा दर्ज करने के लिए धन्यवाद!</h4>
                <p className="text-xs text-slate-600">आपकी राय हमारे लिए अत्यंत मूल्यवान है।</p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-3.5 text-xs">
                
                {/* Rating selection */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">रेटिंग चुनें (Star Rating):</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setAuthorRating(star)}
                        className="p-1 text-slate-300 hover:text-amber-400 transition"
                      >
                        <Star className={`w-6 h-6 ${star <= authorRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{authorRating} स्टार</span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">आपका पूरा नाम *</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="उदा: संतोष कुमार"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">आपका गांव / शहर</label>
                  <input
                    type="text"
                    value={authorLocation}
                    onChange={(e) => setAuthorLocation(e.target.value)}
                    placeholder="उदा: पैगम्बरपुर / केवटी / दरभंगा"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                {/* Service Used */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">आपने कौन सी सेवा ली?</label>
                  <select
                    value={authorService}
                    onChange={(e) => setAuthorService(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="RTPS जाति/आय/निवास">RTPS जाति/आय/निवास प्रमाण पत्र</option>
                    <option value="सरकारी नौकरी ऑनलाइन फॉर्म">सरकारी नौकरी ऑनलाइन फॉर्म (BPSC/Police/SSC)</option>
                    <option value="नया पैन कार्ड व सुधार">नया पैन कार्ड व सुधार</option>
                    <option value="आधार पीवीसी व आयुष्मान कार्ड">आधार पीवीसी व आयुष्मान कार्ड</option>
                    <option value="आधार एटीएम नकद निकासी (AEPS)">आधार एटीएम नकद निकासी (AEPS)</option>
                    <option value="बिजली बिल भुगतान व रिचार्ज">बिजली बिल भुगतान व रिचार्ज</option>
                    <option value="पोस्ट मैट्रिक स्कॉलरशिप / एडमिशन">पोस्ट मैट्रिक स्कॉलरशिप / एडमिशन</option>
                    <option value="पासपोर्ट फोटो व लेमिनेशन">पासपोर्ट फोटो व लेमिनेशन</option>
                  </select>
                </div>

                {/* Comments */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">आपकी समीक्षा / अनुभव *</label>
                  <textarea
                    rows={3}
                    required
                    value={authorComment}
                    onChange={(e) => setAuthorComment(e.target.value)}
                    placeholder="डिजिटल आईटी सॉल्यूशंस की सेवा, समय और व्यवहार के बारे में अपनी राय लिखें..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-xs transition"
                  >
                    समीक्षा सबमिट करें
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                  >
                    रद्द
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
