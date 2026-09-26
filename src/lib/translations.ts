export type Language = 'hi' | 'en';

export interface Translations {
  // Top bar
  shopLocation: string;
  shopOpen: string;
  callOwner: string;
  whatsappSupport: string;
  upiQrPay: string;

  // Nav
  navHome: string;
  navServices: string;
  navJobs: string;
  navPortals: string;
  navReviews: string;
  trackBtn: string;
  applyBtn: string;
  adminBtn: string;
  adminLoggedIn: string;

  // Hero
  cscBadge: string;
  heroHeadline1: string;
  heroHeadline2: string;
  heroDesc: string;
  searchPlaceholder: string;
  trendingLabel: string;
  searchResultTitle: string;
  servicesFound: string;
  close: string;
  noServicesFound: string;
  fillCustomForm: string;
  totalFeeLabel: string;
  applyShort: string;
  viewAllServices: string;
  shopAddressTitle: string;
  shopAddressValue: string;
  proprietorLabel: string;
  hoursLabel: string;
  applyHomeBtn: string;
  trackStatusBtn: string;
  servicesListBtn: string;
  callUsBtn: string;
  sendDocsWhatsapp: string;
  keyServicesTitle: string;
  verifiedKiosk: string;
  payOnlineUpi: string;
  accurateGuarantee: string;
  instantReceipt: string;

  // Services
  servicesCatalogBadge: string;
  servicesCatalogTitle: string;
  servicesCatalogDesc: string;
  searchServicePlaceholder: string;
  clear: string;
  allCategories: string;
  popularBadge: string;
  estimatedTime: string;
  requiredDocsLabel: string;
  andMore: string;
  totalServiceFee: string;
  govFeeLabel: string;
  govFeeFree: string;
  applyNowBtn: string;
  inquiryBtn: string;
  noServiceMatch: string;
  tryDifferentSearch: string;
  viewAllBtn: string;

  // Posts / Notices
  noticesBadge: string;
  noticesTitle: string;
  noticesDesc: string;
  allNotices: string;
  pinnedNotice: string;
  lastDateLabel: string;
  eligibilityLabel: string;
  applyFeeLabel: string;
  applyViaShop: string;
  officialPortalLink: string;

  // Testimonials
  testimonialsBadge: string;
  testimonialsTitle: string;
  testimonialsDesc: string;
  totalAppsMetric: string;
  accurateMetric: string;
  avgTimeMetric: string;
  noHiddenMetric: string;
  allReviewsFilter: string;
  writeReviewBtn: string;
  verifiedCustomerBadge: string;
  whatsappServiceChat: string;
  trustPledgeTitle: string;
  trustPledgeDesc: string;

  // Quick Links
  portalsBadge: string;
  portalsTitle: string;
  portalsDesc: string;
  openWebsite: string;

  // FAQ
  navFaq: string;
  faqBadge: string;
  faqTitle: string;
  faqDesc: string;
  faqSearchPlaceholder: string;
  faqAllCategory: string;
  faqRtpsCategory: string;
  faqPanAadhaarCategory: string;
  faqJobsCategory: string;
  faqBankingCategory: string;
  faqOnlineApplyCategory: string;
  faqStillHaveQuestions: string;
  faqStillHaveQuestionsDesc: string;
  faqContactAkash: string;
  faqCallNow: string;
  faqProcessingTimeLabel: string;
  faqRequiredDocsLabel: string;
  faqApplyNowForThis: string;
  faqAskOnWhatsapp: string;

  // Mobile bar
  mobileCall: string;
  mobileWhatsapp: string;
  mobileForm: string;
  mobileStatus: string;

  // Footer
  footerDesc: string;
  permanentAddressTitle: string;
  quickNavTitle: string;
  keyServicesFooterTitle: string;
  copyrightText: string;
  cscIdLabel: string;
  adminLoginFooter: string;
}

export const translations: Record<Language, Translations> = {
  hi: {
    // Top bar
    shopLocation: 'ग्राम पैगम्बरपुर, डाक दरिमा, थाना केवटी, दरभंगा (847121)',
    shopOpen: 'दुकान खुली है (8 AM - 8:30 PM)',
    callOwner: 'कॉल करें',
    whatsappSupport: 'व्हाट्सएप सहायता',
    upiQrPay: 'UPI क्यूआर कोड',

    // Nav
    navHome: 'होम (Home)',
    navServices: 'सभी सेवाएं (Services)',
    navJobs: 'सरकारी नौकरी व रिजल्ट',
    navPortals: 'महत्वपूर्ण पोर्टल',
    navReviews: 'ग्राहक अनुभव (Reviews)',
    trackBtn: 'आवेदन ट्रैक करें',
    applyBtn: 'ऑनलाइन आवेदन',
    adminBtn: 'दुकानदार लॉगिन',
    adminLoggedIn: 'एडमिन पैनल',

    // Hero
    cscBadge: 'डिजिटल इंडिया अधिकृत सीएससी केंद्र • दरभंगा (बिहार)',
    heroHeadline1: 'DIGITAL IT SOLUTIONS',
    heroHeadline2: 'ऑनलाइन साइबर कैफे एवं नागरिक सेवा केंद्र',
    heroDesc: 'जाति, आय, निवास प्रमाण पत्र (RTPS बिहार), नया पैन कार्ड, आधार पीवीसी, आयुष्मान कार्ड, सरकारी नौकरी फॉर्म, छात्रवृत्ति, एडमिट कार्ड और आधार से बैंक पैसा निकासी की संपूर्ण ऑनलाइन सुविधा।',
    searchPlaceholder: 'सेवा खोजें (उदा: जाति प्रमाण पत्र, नया पैन कार्ड, BPSC फॉर्म, बिजली बिल)...',
    trendingLabel: 'त्वरित खोज:',
    searchResultTitle: 'खोज परिणाम:',
    servicesFound: 'सेवाएं',
    close: 'बंद करें',
    noServicesFound: 'से संबंधित कोई विशिष्ट सेवा नहीं मिली।',
    fillCustomForm: 'कस्टम सेवा हेतु फॉर्म भरें →',
    totalFeeLabel: 'कुल फीस',
    applyShort: 'आवेदन',
    viewAllServices: 'सभी उपलब्ध सेवाएं देखें',
    shopAddressTitle: 'दुकान का स्थायी पता (Shop Location)',
    shopAddressValue: 'ग्राम - पैगम्बरपुर, पोस्ट - दरिमा, थाना - केवटी, जिला - दरभंगा (बिहार) - 847121',
    proprietorLabel: 'संचालक:',
    hoursLabel: 'सोमवार - रविवार: प्रातः 8:00 AM से रात्रि 8:30 PM (खुला है)',
    applyHomeBtn: 'घर बैठे ऑनलाइन आवेदन करें',
    trackStatusBtn: 'आवेदन स्थिति (Track Status)',
    servicesListBtn: 'सेवाओं की सूची',
    callUsBtn: 'कॉल करें:',
    sendDocsWhatsapp: 'व्हाट्सएप पर दस्तावेज भेजें',
    keyServicesTitle: 'प्रमुख नागरिक सेवाएं',
    verifiedKiosk: 'सत्यापित केंद्र',
    payOnlineUpi: 'दुकान पर ऑनलाइन पेमेंट करें (UPI / QR Code)',
    accurateGuarantee: '100% सही फॉर्म गारंटी',
    instantReceipt: 'तत्काल पक्की रसीद',

    // Services
    servicesCatalogBadge: 'डिजिटल आईटी सॉल्यूशंस सेवा सूची',
    servicesCatalogTitle: 'नागरिक एवं ऑनलाइन साइबर कैफे सेवाएं',
    servicesCatalogDesc: 'पारदर्शी सरकारी व साइबर कैफे शुल्क, आवश्यक दस्तावेजों की पूरी जानकारी के साथ घर बैठे या दुकान पर आकर सेवा प्राप्त करें।',
    searchServicePlaceholder: 'सेवा खोजें (उदा: जाति प्रमाण पत्र, पैन कार्ड, बिजली बिल, स्कॉलरशिप)...',
    clear: 'हटाएं',
    allCategories: '🌟 सभी सेवाएं (All)',
    popularBadge: '★ लोकप्रिय',
    estimatedTime: 'अनुमानित समय:',
    requiredDocsLabel: 'ज़रूरी दस्तावेज:',
    andMore: 'और',
    totalServiceFee: 'कुल सेवा शुल्क',
    govFeeLabel: 'सरकारी:',
    govFeeFree: '(सरकारी शुल्क निःशुल्क)',
    applyNowBtn: 'आवेदन करें',
    inquiryBtn: 'पूछताछ',
    noServiceMatch: 'कोई सेवा नहीं मिली',
    tryDifferentSearch: 'कृपया अन्य शब्द खोजें या आकाश जी से सीधे संपर्क करें।',
    viewAllBtn: 'सभी सेवाएं देखें',

    // Posts / Notices
    noticesBadge: 'सूचना पट्ट (Notice & Updates)',
    noticesTitle: 'सरकारी नौकरी, एडमिट कार्ड व आवश्यक सूचनाएं',
    noticesDesc: 'बिहार एवं केंद्र सरकार की नवीनतम बहालियां, छात्रवृत्ति, यूनिवर्सिटी नामांकन व महत्वपूर्ण तिथियां।',
    allNotices: '🌟 सभी सूचनाएं (All)',
    pinnedNotice: 'महत्वपूर्ण सूचना (Pinned Notice)',
    lastDateLabel: 'अंतिम तिथि:',
    eligibilityLabel: 'शैक्षणिक योग्यता',
    applyFeeLabel: 'आवेदन शुल्क',
    applyViaShop: 'दुकान से आवेदन करवाएं',
    officialPortalLink: 'आधिकारिक पोर्टल',

    // Testimonials
    testimonialsBadge: '4.9 / 5 रेटिंग (500+ संतुष्ट स्थानीय ग्राहक)',
    testimonialsTitle: 'हमारे संतुष्ट ग्राहकों के अनुभव',
    testimonialsDesc: 'पैगम्बरपुर, दरिमा, केवटी, और पूरे दरभंगा जिले के छात्र, किसान व ग्रामीण भाई-बहन डिजिटल आईटी सॉल्यूशंस की तेज, पारदर्शी और त्रुटिरहित सेवाओं पर भरोसा करते हैं।',
    totalAppsMetric: 'सफल ऑनलाइन आवेदन',
    accurateMetric: 'त्रुटिरहित फॉर्म गारंटी',
    avgTimeMetric: 'औसत तत्काल सेवा समय',
    noHiddenMetric: 'छुपा हुआ कोई शुल्क नहीं',
    allReviewsFilter: '🌟 सभी समीक्षाएं',
    writeReviewBtn: 'अपनी समीक्षा / रेटिंग लिखें',
    verifiedCustomerBadge: 'सत्यापित',
    whatsappServiceChat: 'Contact Us on WhatsApp',
    trustPledgeTitle: 'डिजिटल आईटी सॉल्यूशंस का ग्राहक सेवा संकल्प',
    trustPledgeDesc: 'हम आपके हर दस्तावेज की गोपनीयता और आपके समय की पूरी कद्र करते हैं। किसी भी सेवा में सहायता हेतु सीधे संचालक आकाश कुमार लाल दास से मिलें।',

    // Quick Links
    portalsBadge: 'सत्यापित सरकारी पोर्टल (Official Portals)',
    portalsTitle: 'सीधे सरकारी वेबसाइट्स पर जाएं',
    portalsDesc: 'सत्यापित एवं सुरक्षित लिंक — फॉर्म भरवाने में किसी भी असुविधा पर डिजिटल आईटी सॉल्यूशंस पैगम्बरपुर में संपर्क करें।',
    openWebsite: 'वेबसाइट खोलें',

    // FAQ
    navFaq: 'अक्सर पूछे जाने वाले सवाल (FAQ)',
    faqBadge: 'नागरिक सहायता एवं सामान्य प्रश्न (Help & FAQ)',
    faqTitle: 'साइबर कैफे सेवाओं से संबंधित जरूरी सवाल-जवाब',
    faqDesc: 'जाति-आय-निवास प्रमाण पत्र, नया पैन कार्ड, आधार पीवीसी, और सरकारी नौकरी फॉर्म भरवाने हेतु आवश्यक कागजात और समय सीमा की पूरी जानकारी।',
    faqSearchPlaceholder: 'कोई भी प्रश्न खोजें (उदा: जाति प्रमाण पत्र, पैन कार्ड समय, आधार निकासी, फीस)...',
    faqAllCategory: 'सभी प्रश्न (All)',
    faqRtpsCategory: 'RTPS बिहार (जाति/आय/निवास)',
    faqPanAadhaarCategory: 'पैन कार्ड व आधार',
    faqJobsCategory: 'सरकारी नौकरी फॉर्म',
    faqBankingCategory: 'बैंकिंग व बिल भुगतान',
    faqOnlineApplyCategory: 'ऑनलाइन आवेदन व ट्रैकिंग',
    faqStillHaveQuestions: 'क्या आपका कोई और सवाल है?',
    faqStillHaveQuestionsDesc: 'दुकान संचालक आकाश कुमार लाल दास से सीधे व्हाट्सएप पर बात करें या फोन कॉल पर तत्काल समाधान पाएं।',
    faqContactAkash: 'व्हाट्सएप पर पूछें',
    faqCallNow: 'सीधे कॉल करें',
    faqProcessingTimeLabel: 'अनुमानित समय:',
    faqRequiredDocsLabel: 'जरूरी कागजात:',
    faqApplyNowForThis: 'इसके लिए आवेदन करें',
    faqAskOnWhatsapp: 'WhatsApp पर पूछें',

    // Mobile bar
    mobileCall: 'कॉल',
    mobileWhatsapp: 'व्हाट्सएप',
    mobileForm: 'ऑनलाइन फॉर्म',
    mobileStatus: 'स्टेटस',

    // Footer
    footerDesc: 'डिजिटल इंडिया, भारत सरकार एवं बिहार सरकार की सभी ई-गवर्नेंस सेवाओं, आरटीपीएस प्रमाण पत्र, पैन कार्ड, आधार पीवीसी, और सरकारी नौकरी फॉर्म का अधिकृत व विश्वसनीय केंद्र।',
    permanentAddressTitle: 'स्थायी पता:',
    quickNavTitle: 'त्वरित नेविगेशन (Quick Links)',
    keyServicesFooterTitle: 'प्रमुख नागरिक सेवाएं (Key Services)',
    copyrightText: 'सर्वाधिकार सुरक्षित।',
    cscIdLabel: 'सीएससी आईडी:',
    adminLoginFooter: 'संचालक एडमिन लॉगिन'
  },
  en: {
    // Top bar
    shopLocation: 'Village Paighamberpur, Post Darima, PS Keoti, Darbhanga (847121)',
    shopOpen: 'Shop Open (8 AM - 8:30 PM)',
    callOwner: 'Call Us',
    whatsappSupport: 'WhatsApp Support',
    upiQrPay: 'UPI QR Payment',

    // Nav
    navHome: 'Home',
    navServices: 'All Services',
    navJobs: 'Sarkari Jobs & Results',
    navPortals: 'Gov Portals',
    navReviews: 'Customer Reviews',
    trackBtn: 'Track Application',
    applyBtn: 'Apply Online',
    adminBtn: 'Owner Login',
    adminLoggedIn: 'Admin Panel',

    // Hero
    cscBadge: 'Digital India Authorized CSC Center • Darbhanga (Bihar)',
    heroHeadline1: 'DIGITAL IT SOLUTIONS',
    heroHeadline2: 'Online Cyber Cafe & Citizen Service Kiosk',
    heroDesc: 'Complete online facilitation for Caste, Income, Residence Certificates (RTPS Bihar), New PAN Card, Aadhar PVC, Ayushman Card, Govt Job Forms, Scholarships, Admit Cards, and AEPS Bank Cash Withdrawal.',
    searchPlaceholder: 'Search services (e.g. Caste Certificate, PAN Card, BPSC Form, Electricity Bill)...',
    trendingLabel: 'Trending:',
    searchResultTitle: 'Search Results:',
    servicesFound: 'Services',
    close: 'Close',
    noServicesFound: 'No specific service found matching',
    fillCustomForm: 'Submit Custom Request Form →',
    totalFeeLabel: 'Total Fee',
    applyShort: 'Apply',
    viewAllServices: 'View All Available Services',
    shopAddressTitle: 'Shop Location & Address',
    shopAddressValue: 'Village Paighamberpur, Post Darima, PS Keoti, District Darbhanga (Bihar) - 847121',
    proprietorLabel: 'Proprietor:',
    hoursLabel: 'Mon - Sun: 8:00 AM to 8:30 PM (Open Today)',
    applyHomeBtn: 'Apply Online from Home',
    trackStatusBtn: 'Track Application Status',
    servicesListBtn: 'View All Services',
    callUsBtn: 'Call:',
    sendDocsWhatsapp: 'Send Documents via WhatsApp',
    keyServicesTitle: 'Major Citizen Services',
    verifiedKiosk: 'Verified Center',
    payOnlineUpi: 'Pay Online via UPI / QR Code',
    accurateGuarantee: '100% Accurate Form Guarantee',
    instantReceipt: 'Instant Official Receipt',

    // Services
    servicesCatalogBadge: 'Digital IT Solutions Catalog',
    servicesCatalogTitle: 'Citizen & Cyber Cafe Services',
    servicesCatalogDesc: 'Transparent government and cyber cafe fees with complete required document checklists. Apply online or visit our kiosk in Paighamberpur.',
    searchServicePlaceholder: 'Search services (e.g. Caste Certificate, PAN Card, Electricity Bill, Scholarship)...',
    clear: 'Clear',
    allCategories: '🌟 All Services',
    popularBadge: '★ Popular',
    estimatedTime: 'Estimated Time:',
    requiredDocsLabel: 'Required Documents:',
    andMore: 'more',
    totalServiceFee: 'Total Service Fee',
    govFeeLabel: 'Gov:',
    govFeeFree: '(Free Government Fee)',
    applyNowBtn: 'Apply Online',
    inquiryBtn: 'Inquire',
    noServiceMatch: 'No services found',
    tryDifferentSearch: 'Please try different keywords or contact Akash Kumar directly.',
    viewAllBtn: 'View All Services',

    // Posts / Notices
    noticesBadge: 'Notice Board & Updates',
    noticesTitle: 'Government Jobs, Admit Cards & Notices',
    noticesDesc: 'Latest Bihar and Central Government vacancies, scholarships, university admissions, and crucial deadlines.',
    allNotices: '🌟 All Notices',
    pinnedNotice: 'Pinned Notice',
    lastDateLabel: 'Last Date:',
    eligibilityLabel: 'Eligibility',
    applyFeeLabel: 'Application Fee',
    applyViaShop: 'Apply at Digital IT Solutions',
    officialPortalLink: 'Official Portal',

    // Testimonials
    testimonialsBadge: '4.9 / 5 Rating (500+ Verified Local Customers)',
    testimonialsTitle: 'Customer Reviews & Feedback',
    testimonialsDesc: 'Students, farmers, and citizens across Paighamberpur, Darima, Keoti, and Darbhanga trust Digital IT Solutions for rapid, accurate e-governance services.',
    totalAppsMetric: 'Successful Applications',
    accurateMetric: 'Error-Free Form Guarantee',
    avgTimeMetric: 'Average Turnaround Time',
    noHiddenMetric: 'Zero Hidden Charges',
    allReviewsFilter: '🌟 All Reviews',
    writeReviewBtn: 'Write a Review & Rating',
    verifiedCustomerBadge: 'Verified',
    whatsappServiceChat: 'Contact Us on WhatsApp',
    trustPledgeTitle: 'Digital IT Solutions Customer Service Pledge',
    trustPledgeDesc: 'We respect the privacy of your documents and the value of your time. For any personalized assistance, meet proprietor Akash Kumar Lal Das directly.',

    // Quick Links
    portalsBadge: 'Verified Portals',
    portalsTitle: 'Direct Government Websites Directory',
    portalsDesc: 'Authentic government portal links. For assistance with forms or error-free filing, visit Digital IT Solutions Paighamberpur.',
    openWebsite: 'Open Website',

    // FAQ
    navFaq: 'FAQs & Help',
    faqBadge: 'Customer Support & Common Queries',
    faqTitle: 'Frequently Asked Questions About Cyber Cafe Services',
    faqDesc: 'Clear guidelines regarding required documents, delivery timelines, and processing details for RTPS certificates, PAN cards, Aadhar PVC, and job forms.',
    faqSearchPlaceholder: 'Search any question (e.g., RTPS docs, PAN card time, cash withdrawal, fees)...',
    faqAllCategory: 'All Questions',
    faqRtpsCategory: 'RTPS Bihar (Caste/Income/Residence)',
    faqPanAadhaarCategory: 'PAN & Aadhar Services',
    faqJobsCategory: 'Sarkari Job Applications',
    faqBankingCategory: 'Banking & Bill Payments',
    faqOnlineApplyCategory: 'Online Apply & Tracking',
    faqStillHaveQuestions: 'Still have a question or need personalized help?',
    faqStillHaveQuestionsDesc: 'Connect directly with proprietor Akash Kumar Lal Das over WhatsApp or a direct call for immediate guidance.',
    faqContactAkash: 'Ask on WhatsApp',
    faqCallNow: 'Call Directly',
    faqProcessingTimeLabel: 'Estimated Processing Time:',
    faqRequiredDocsLabel: 'Required Documents:',
    faqApplyNowForThis: 'Apply for this Service',
    faqAskOnWhatsapp: 'Inquire on WhatsApp',

    // Mobile bar
    mobileCall: 'Call',
    mobileWhatsapp: 'WhatsApp',
    mobileForm: 'Apply Form',
    mobileStatus: 'Status',

    // Footer
    footerDesc: 'Authorized and trusted cyber cafe and e-governance kiosk for RTPS Bihar, PAN Card, Aadhar PVC, Scholarships, Electricity Bills, and Sarkari Jobs.',
    permanentAddressTitle: 'Permanent Address:',
    quickNavTitle: 'Quick Navigation',
    keyServicesFooterTitle: 'Key Citizen Services',
    copyrightText: 'All Rights Reserved.',
    cscIdLabel: 'CSC ID:',
    adminLoginFooter: 'Kiosk Owner Login'
  }
};
