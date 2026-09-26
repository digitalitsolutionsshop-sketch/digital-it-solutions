import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  FileText, 
  Clock, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquare, 
  Sparkles, 
  Send,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FAQProps {
  shopMobile: string;
  onOpenApply: () => void;
  onOpenTrack: () => void;
}

interface FAQItem {
  id: string;
  category: 'all' | 'rtps' | 'pan_aadhaar' | 'jobs' | 'banking' | 'online_apply';
  questionHi: string;
  questionEn: string;
  answerHi: string;
  answerEn: string;
  requiredDocsHi: string[];
  requiredDocsEn: string[];
  processingTimeHi: string;
  processingTimeEn: string;
  badgeHi: string;
  badgeEn: string;
  actionTextHi?: string;
  actionTextEn?: string;
  actionType?: 'apply' | 'track' | 'whatsapp';
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-rtps-docs',
    category: 'rtps',
    questionHi: 'जाति, आय और निवास प्रमाण पत्र (RTPS Bihar) बनवाने हेतु क्या-क्या दस्तावेज चाहिए और कितना समय लगता है?',
    questionEn: 'What documents are required for Caste, Income, and Residence Certificates (RTPS Bihar) and how long does it take?',
    answerHi: 'बिहार सरकार (ServicePlus RTPS) द्वारा डिजिटल हस्ताक्षरित वैध प्रमाण पत्र जारी किया जाता है। आवेदन के पश्चात तय समय सीमा में सर्टिफिकेट तैयार होने पर ओरिजिनल डिजिटल हस्ताक्षरित PDF आपको सीधे WhatsApp पर भेज दिया जाता है अथवा आप दुकान से लेमिनेटेड कलर प्रिंट प्राप्त कर सकते हैं।',
    answerEn: 'Valid digitally signed certificates are issued by the Bihar Government (ServicePlus RTPS). Once generated within the stipulated timeframe, the original PDF with digital signature is sent to your WhatsApp or you can collect a color laminated print at the shop.',
    requiredDocsHi: [
      'आवेदक का आधार कार्ड (Aadhaar Card)',
      'हालिया पासपोर्ट साइज फोटो (Passport Photo)',
      'चालू मोबाइल नंबर (OTP सत्यापन हेतु)',
      'आय प्रमाण पत्र हेतु: परिवार की वार्षिक आय का विवरण (कृषि/वेतन/व्यवसाय)'
    ],
    requiredDocsEn: [
      "Applicant's Aadhaar Card",
      'Recent Passport-size Photograph',
      'Active Mobile Number (for OTP & SMS)',
      'For Income Certificate: Family annual income breakdown (Agriculture/Salary/Business)'
    ],
    processingTimeHi: '10 से 14 कार्यदिवस (Working Days) • तत्काल आवश्यकता हेतु भी संपर्क करें',
    processingTimeEn: '10 to 14 Working Days • Urgent priority processing support available',
    badgeHi: 'RTPS बिहार अधिकृत',
    badgeEn: 'RTPS Bihar Official',
    actionTextHi: 'RTPS प्रमाण पत्र हेतु आवेदन करें',
    actionTextEn: 'Apply for RTPS Certificate',
    actionType: 'apply'
  },
  {
    id: 'faq-pan-card',
    category: 'pan_aadhaar',
    questionHi: 'नया पैन कार्ड (New PAN Card) कितने दिनों में बनता है और क्या-क्या कागजात लगेंगे?',
    questionEn: 'How long does a new PAN Card take to arrive and what documents are required?',
    answerHi: 'हम NSDL एवं UTIITSL के अधिकृत पोर्टल से नया पैन कार्ड, सुधार (Correction) व खोए हुए पैन कार्ड की दोबारा छपाई करते हैं। यदि आधार में मोबाइल नंबर लिंक है, तो 2 से 3 घंटे के भीतर ई-पैन (e-PAN) तैयार होकर आ जाता है। मूल प्लास्टिक कार्ड डाक विभाग के स्पीड पोस्ट द्वारा घर के पते पर डिलीवर होता है।',
    answerEn: 'We process new PAN cards, corrections, and lost PAN reprints through official NSDL & UTIITSL portals. If your mobile is linked to Aadhaar, your e-PAN arrives within 2 to 3 hours. The physical plastic PAN card is delivered by India Post speed post to your doorstep.',
    requiredDocsHi: [
      'आधार कार्ड (Aadhaar Card)',
      '2 पासपोर्ट साइज रंगीन फोटो',
      'सफेद कागज पर साफ हस्ताक्षर (Sign) या अंगूठे का निशान',
      'सुधार हेतु: पूर्व पैन कार्ड की प्रति (यदि उपलब्ध हो)'
    ],
    requiredDocsEn: [
      'Aadhaar Card',
      '2 Passport-size color photos',
      'Signature on white paper (or thumb impression)',
      'For corrections: Copy of old PAN card (if available)'
    ],
    processingTimeHi: 'e-PAN: 2-3 घंटे • ओरिजिनल प्लास्टिक कार्ड: 10 से 15 दिन',
    processingTimeEn: 'e-PAN: 2-3 hours • Physical Plastic Card: 10 to 15 days',
    badgeHi: 'NSDL / UTI अधिकृत',
    badgeEn: 'NSDL / UTI Kiosk',
    actionTextHi: 'नया पैन कार्ड बनवाएं',
    actionTextEn: 'Apply for PAN Card',
    actionType: 'apply'
  },
  {
    id: 'faq-home-apply',
    category: 'online_apply',
    questionHi: 'क्या मुझे फॉर्म भरवाने के लिए दुकान पर आना जरूरी है, या घर बैठे ऑनलाइन भी काम हो सकता है?',
    questionEn: 'Do I need to visit the shop in person, or can I apply from home online?',
    answerHi: 'बिल्कुल नहीं! आपको दुकान आने की कोई बाध्यता नहीं है। आप दरभंगा के किसी भी गांव या बाहर (दिल्ली, पटना, मुंबई आदि) से भी हमारी वेबसाइट के माध्यम से सीधे फॉर्म भर सकते हैं या व्हाट्सएप (8340622912) पर डॉक्यूमेंट्स भेज सकते हैं। हम फाइनल सबमिशन से पहले आपको पूरा ड्राफ्ट दिखाते हैं, आपकी सहमति के बाद फॉर्म सबमिट कर पक्की रसीद (PDF) व्हाट्सएप पर भेजते हैं।',
    answerEn: 'Not at all! You do not need to visit the shop. Whether you reside in nearby villages in Keoti/Darbhanga or are living elsewhere (Patna, Delhi, etc.), you can apply directly through this web portal or send documents via WhatsApp (8340622912). We share a draft preview before final submission and send the official receipt PDF instantly.',
    requiredDocsHi: [
      'आवश्यक दस्तावेजों की साफ फोटो अथवा PDF',
      'व्हाट्सएप नंबर जिस पर रसीद व अपडेट चाहिए'
    ],
    requiredDocsEn: [
      'Clear photos or PDFs of the required documents',
      'WhatsApp number for instant updates and receipts'
    ],
    processingTimeHi: '15 से 30 मिनट में तत्काल फॉर्म फिलिंग व रसीद',
    processingTimeEn: '15 to 30 minutes for instant filing & receipt generation',
    badgeHi: '100% ऑनलाइन सुविधा',
    badgeEn: '100% Remote Service',
    actionTextHi: 'घर बैठे ऑनलाइन आवेदन करें',
    actionTextEn: 'Apply Online from Home',
    actionType: 'apply'
  },
  {
    id: 'faq-sarkari-jobs',
    category: 'jobs',
    questionHi: 'सरकारी नौकरी फॉर्म (BPSC, Bihar Police, SSC, Railway) भरवाते समय क्या सावधानियां रखी जाती हैं?',
    questionEn: 'What precautions and documents are needed for Government Job Applications (BPSC, SSC, Police)?',
    answerHi: 'डिजिटल आईटी सॉल्यूशंस पर पिछले कई वर्षों के अनुभव के साथ फॉर्म भरे जाते हैं। स्पेलिंग, पिता का नाम, जन्मतिथि, आरक्षण श्रेणी (EWS/NCL/SC/ST) और फोटो/हस्ताक्षर के साइज व बैकग्राउंड का 100% सरकारी दिशा-निर्देशों के अनुरूप ध्यान रखा जाता है। कोई भी फॉर्म सबमिट करने से पहले उम्मीदवार को फाइनल प्रीव्यू चेक कराया जाता है ताकि रिजेक्शन की 0% संभावना रहे।',
    answerEn: 'At Digital IT Solutions, job applications are filed with meticulous care and years of cyber cafe experience. We guarantee 100% compliance with government notification guidelines for spelling, category quotas (EWS/NCL/SC/ST), signature dimensions, and photo backgrounds. We provide a pre-submission review to ensure zero rejection risk.',
    requiredDocsHi: [
      '10वीं / 12वीं / स्नातक (Graduation) की मूल अंकतालिका (Marksheet)',
      'जाति प्रमाण पत्र / EWS / NCL सर्टिफिकेट (आरक्षण हेतु)',
      'निवास प्रमाण पत्र (Bihar Domicile)',
      'हालिया पासपोर्ट फोटो व हिंदी-अंग्रेजी हस्ताक्षर'
    ],
    requiredDocsEn: [
      '10th / 12th / Graduation Marksheets',
      'Category Certificate (EWS / OBC-NCL / SC / ST)',
      'Residential / Domicile Certificate',
      'Recent Passport Photograph & Signatures (Hindi/English)'
    ],
    processingTimeHi: 'उसी दिन तत्काल आवेदन (Same Day Submission) व सुरक्षित प्रिंट',
    processingTimeEn: 'Same-day immediate submission and color printout',
    badgeHi: '100% सही फॉर्म गारंटी',
    badgeEn: 'Zero-Error Guarantee',
    actionTextHi: 'सरकारी फॉर्म भरवाएं',
    actionTextEn: 'Fill Job Application',
    actionType: 'apply'
  },
  {
    id: 'faq-aadhaar-pvc',
    category: 'pan_aadhaar',
    questionHi: 'ओरिजिनल आधार पीवीसी (PVC) स्मार्ट कार्ड क्या है और यह कब तक घर पहुंचता है?',
    questionEn: 'What is the Original Aadhaar PVC Smart Card and when does it get delivered?',
    answerHi: 'यह UIDAI द्वारा सीधे जारी किया जाने वाला आधिकारिक, 100% वाटरप्रूफ और जेब में रखने योग्य एटीएम जैसा मजबूत प्लास्टिक कार्ड है। इसमें होलोग्राम, गिलोचे पैटर्न और सुरक्षा क्यूआर कोड होता है। यह साधारण लैमिनेटेड आधार से बिल्कुल अलग और अधिकृत होता है। स्पीड पोस्ट द्वारा डाकिये के माध्यम से सीधे आपके पते पर आता है।',
    answerEn: 'This is the official 100% waterproof, durable ATM-style plastic card issued directly by UIDAI. It includes a security hologram, micro-text, ghost image, and secure QR code. It never peels or fades like ordinary lamination and is delivered via India Post Speed Post directly to your home.',
    requiredDocsHi: [
      '12 अंकों का आधार नंबर (Aadhaar Number)',
      'मोबाइल नंबर (आधार से लिंक होना अनिवार्य नहीं है)'
    ],
    requiredDocsEn: [
      '12-digit Aadhaar Number',
      'Any active Mobile Number (Aadhaar mobile linking not mandatory)'
    ],
    processingTimeHi: '7 से 10 दिनों में स्पीड पोस्ट द्वारा होम डिलीवरी',
    processingTimeEn: '7 to 10 days home delivery via Speed Post',
    badgeHi: 'UIDAI ओरिजिनल PVC',
    badgeEn: 'UIDAI Original PVC',
    actionTextHi: 'आधार PVC कार्ड ऑर्डर करें',
    actionTextEn: 'Order Aadhaar PVC Card',
    actionType: 'apply'
  },
  {
    id: 'faq-aeps-cash',
    category: 'banking',
    questionHi: 'आधार से बैंक पैसा निकासी (AEPS) व मनी ट्रांसफर की क्या सुविधा है?',
    questionEn: 'How does Aadhaar Cash Withdrawal (AEPS) and Money Transfer work at the shop?',
    answerHi: 'हमारे केंद्र पर बायोमेट्रिक फिंगरप्रिंट मशीन द्वारा किसी भी बैंक (SBI, PNB, उत्तर बिहार ग्रामीण बैंक UBGB, Bank of Baroda, Central Bank आदि) से तुरंत नकद निकासी की जा सकती है। इसके अलावा बैंक बैलेंस चेक, मिनी स्टेटमेंट प्रिंट, और भारत के किसी भी खाते में तत्काल मनी ट्रांसफर (IMPS/NEFT) की सुविधा उपलब्ध है।',
    answerEn: 'At our kiosk, you can instantly withdraw cash using biometric fingerprint authentication from any bank (State Bank of India, PNB, Uttar Bihar Gramin Bank, BoB, etc.). In addition, balance inquiry, mini statement printouts, and instant pan-India bank money transfers (IMPS/NEFT) are available.',
    requiredDocsHi: [
      'आधार कार्ड नंबर',
      'बैंक का नाम',
      'खाताधारक का अंगूठा (Biometric Verification)'
    ],
    requiredDocsEn: [
      'Aadhaar Card Number',
      'Name of your Bank',
      'Account holder fingerprint (Biometric authentication)'
    ],
    processingTimeHi: '1 मिनट में तत्काल नकद भुगतान (Instant Cash)',
    processingTimeEn: 'Instant cash in under 1 minute',
    badgeHi: 'सुरक्षित बैंकिंग सेवा',
    badgeEn: 'Secure Kiosk Banking',
    actionTextHi: 'व्हाट्सएप पर जानकारी लें',
    actionTextEn: 'Inquire on WhatsApp',
    actionType: 'whatsapp'
  },
  {
    id: 'faq-track-receipt',
    category: 'online_apply',
    questionHi: 'मैं अपने आवेदन की स्थिति (Status) कैसे चेक करूं और यदि रसीद खो जाए तो क्या होगा?',
    questionEn: 'How do I track my application status and what happens if I lose my receipt slip?',
    answerHi: 'आप हमारी वेबसाइट के सबसे ऊपर स्थित "आवेदन स्थिति (Track Status)" बटन पर क्लिक करके अपना 10 अंकों का मोबाइल नंबर अथवा Application Number दर्ज करके लाइव स्थिति देख सकते हैं। यदि आपकी रसीद खो गई है, तो घबराने की कोई आवश्यकता नहीं है; हमारे डेटाबेस में आपका रिकॉर्ड सुरक्षित रहता है, आप सीधे संचालक आकाश कुमार लाल दास (8340622912) से संपर्क करके अपनी रसीद या सर्टिफिकेट दोबारा प्राप्त कर सकते हैं।',
    answerEn: 'You can check real-time status anytime by clicking "Track Status" in the top navigation and entering your 10-digit mobile number or Application Reference Number. If you lose your receipt, there is no need to worry; our secure database stores all records, and you can contact proprietor Akash Kumar Lal Das (8340622912) to retrieve your receipt or certificate anytime.',
    requiredDocsHi: [
      'पंजीकृत 10 अंकों का मोबाइल नंबर अथवा Application Reference ID'
    ],
    requiredDocsEn: [
      'Registered 10-digit Mobile Number or Application Reference ID'
    ],
    processingTimeHi: '24/7 लाइव ऑनलाइन ट्रैकिंग',
    processingTimeEn: '24/7 Live Online Tracking',
    badgeHi: 'डिजिटल ट्रैकिंग',
    badgeEn: 'Live Tracking',
    actionTextHi: 'आवेदन स्थिति ट्रैक करें',
    actionTextEn: 'Track Application Status',
    actionType: 'track'
  },
  {
    id: 'faq-electricity-bill',
    category: 'banking',
    questionHi: 'बिजली बिल (NBPDCL) व राशन कार्ड के लिए क्या प्रक्रिया है?',
    questionEn: 'What is the procedure for Electricity Bill payment (NBPDCL) and Ration Card services?',
    answerHi: 'नॉर्थ बिहार पावर डिस्ट्रीब्यूशन (NBPDCL) का बिजली बिल हमारे यहाँ सरकारी छूट (Rebate) के साथ तुरंत जमा होता है और तत्काल पक्की सरकारी रसीद दी जाती है। नए राशन कार्ड के लिए ऑनलाइन आवेदन, परिवार के नए सदस्यों का नाम जोड़ना अथवा राशन कार्ड में आधार सीडिंग का कार्य भी किया जाता है।',
    answerEn: 'North Bihar Power Distribution (NBPDCL) electricity bills are paid instantly with timely payment rebates and immediate official receipts. We also process new Ration Card applications, adding family members, and Aadhaar seeding with ration cards.',
    requiredDocsHi: [
      'बिजली बिल हेतु: 9 या 10 अंकों का CA / उपभोक्ता नंबर',
      'राशन कार्ड हेतु: परिवार के सभी सदस्यों का आधार, बैंक पासबुक और ग्रुप फोटो'
    ],
    requiredDocsEn: [
      'For Electricity: 9 or 10 digit CA / Consumer Number',
      'For Ration Card: Aadhaar cards of all members, family bank passbook, and group photo'
    ],
    processingTimeHi: 'बिजली बिल: तत्काल • राशन कार्ड: 20-30 कार्यदिवस',
    processingTimeEn: 'Electricity Bill: Instant • Ration Card: 20-30 working days',
    badgeHi: 'तत्काल पक्की रसीद',
    badgeEn: 'Instant Bill Receipt',
    actionTextHi: 'ऑनलाइन आवेदन करें',
    actionTextEn: 'Apply Online',
    actionType: 'apply'
  }
];

export const FAQ: React.FC<FAQProps> = ({
  shopMobile,
  onOpenApply,
  onOpenTrack
}) => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-rtps-docs': true // Open first item by default
  });

  const categories = [
    { id: 'all', label: t.faqAllCategory },
    { id: 'rtps', label: t.faqRtpsCategory },
    { id: 'pan_aadhaar', label: t.faqPanAadhaarCategory },
    { id: 'jobs', label: t.faqJobsCategory },
    { id: 'banking', label: t.faqBankingCategory },
    { id: 'online_apply', label: t.faqOnlineApplyCategory }
  ];

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesHi = 
          item.questionHi.toLowerCase().includes(q) ||
          item.answerHi.toLowerCase().includes(q) ||
          item.requiredDocsHi.some(d => d.toLowerCase().includes(q));
        const matchesEn = 
          item.questionEn.toLowerCase().includes(q) ||
          item.answerEn.toLowerCase().includes(q) ||
          item.requiredDocsEn.some(d => d.toLowerCase().includes(q));
        return matchesHi || matchesEn;
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleAction = (item: FAQItem) => {
    if (item.actionType === 'apply') {
      onOpenApply();
    } else if (item.actionType === 'track') {
      onOpenTrack();
    } else {
      const msg = language === 'hi'
        ? `नमस्ते आकाश जी, मुझे डिजिटल आईटी सॉल्यूशंस की सेवा "${item.questionHi}" के संबंध में जानकारी चाहिए।`
        : `Hello Akash ji, I would like to inquire about "${item.questionEn}".`;
      window.open(`https://wa.me/91${shopMobile}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  return (
    <section id="faq-section" className="py-14 sm:py-18 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
            <span>{t.faqBadge}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {t.faqTitle}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t.faqDesc}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.faqSearchPlaceholder}
              className="block w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium text-sm sm:text-base focus:bg-white focus:outline-hidden focus:ring-3 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Clear Search"
              >
                <X className="w-5 h-5 bg-slate-200 rounded-full p-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-10 max-w-4xl mx-auto space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-slate-200">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                {language === 'hi' ? 'कोई प्रश्न नहीं मिला' : 'No matching questions found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                {language === 'hi' 
                  ? 'आप सीधे संचालक आकाश कुमार लाल दास से व्हाट्सएप या फोन पर संपर्क कर सकते हैं।' 
                  : 'You can directly contact proprietor Akash Kumar Lal Das over WhatsApp or phone.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  {language === 'hi' ? 'सर्च हटाएं (Reset)' : 'Reset Search'}
                </button>
                <a
                  href={`https://wa.me/91${shopMobile}?text=${encodeURIComponent(
                    language === 'hi' ? 'नमस्ते आकाश जी, मुझे साइबर कैफे सेवाओं के बारे में जानकारी चाहिए।' : 'Hello Akash ji, I need help with cyber cafe services.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.faqContactAkash}</span>
                </a>
              </div>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              const question = language === 'hi' ? faq.questionHi : faq.questionEn;
              const answer = language === 'hi' ? faq.answerHi : faq.answerEn;
              const docs = language === 'hi' ? faq.requiredDocsHi : faq.requiredDocsEn;
              const processingTime = language === 'hi' ? faq.processingTimeHi : faq.processingTimeEn;
              const badge = language === 'hi' ? faq.badgeHi : faq.badgeEn;
              const actionText = language === 'hi' ? faq.actionTextHi : faq.actionTextEn;

              return (
                <div 
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'bg-white border-blue-300 shadow-md ring-1 ring-blue-100' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full py-4 px-5 sm:px-6 text-left flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200/80">
                          {badge}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {question}
                      </h3>
                    </div>

                    <div className={`p-1.5 rounded-full transition-transform duration-200 shrink-0 mt-1 ${
                      isOpen ? 'bg-blue-100 text-blue-800 rotate-180' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                      
                      {/* Detailed Answer Text */}
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {answer}
                      </p>

                      {/* Required Documents Highlight Box */}
                      {docs && docs.length > 0 && (
                        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-2">
                          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>{t.faqRequiredDocsLabel}</span>
                          </div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs text-slate-800">
                            {docs.map((doc, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Timeline & Action Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                        {processingTime && (
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-slate-800">{t.faqProcessingTimeLabel}</span>
                            <span className="text-emerald-700 font-bold">{processingTime}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          {actionText && (
                            <button
                              onClick={() => handleAction(faq)}
                              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{actionText}</span>
                            </button>
                          )}

                          <a
                            href={`https://wa.me/91${shopMobile}?text=${encodeURIComponent(
                              language === 'hi' 
                                ? `नमस्ते आकाश जी, मुझे "${faq.questionHi}" के बारे में सहायता चाहिए।` 
                                : `Hello Akash ji, I need help regarding "${faq.questionEn}".`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1.5 transition"
                            title="WhatsApp Inquiry"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden sm:inline">{t.faqAskOnWhatsapp}</span>
                          </a>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions? Direct Contact Banner */}
        <div className="mt-12 max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>24/7 सहायता • पैगम्बरपुर, दरभंगा</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {t.faqStillHaveQuestions}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
                {t.faqStillHaveQuestionsDesc}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href={`https://wa.me/91${shopMobile}?text=${encodeURIComponent(
                  language === 'hi' 
                    ? 'नमस्ते आकाश जी! मुझे साइबर कैफे सेवाओं के संबंध में सीधे आपसे परामर्श चाहिए।' 
                    : 'Hello Akash ji, I would like personalized consultation regarding cyber cafe services.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition transform active:scale-95"
              >
                <MessageSquare className="w-4 h-4 fill-slate-950" />
                <span>{t.faqContactAkash}</span>
              </a>

              <a
                href={`tel:${shopMobile}`}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>{t.faqCallNow}: {shopMobile}</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
