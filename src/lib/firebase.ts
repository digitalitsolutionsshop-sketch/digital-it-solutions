import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocFromServer,
  type Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { Service, Post, ServiceRequest, Transaction, ShopConfig, OnlineScheme } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Critical: As required by Firebase skill instructions
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot as mandated by the Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or network restricted:", error.message);
    }
    return false;
  }
}

// Admin email identification
export const ADMIN_EMAIL = 'digitalitsolutionsshop@gmail.com';
export const ADMIN_FALLBACK_PIN = '8340'; // Akash Kumar Lal Das PIN (first 4 digits of 8340622912)

// Initial default shop config
export const DEFAULT_SHOP_CONFIG: ShopConfig = {
  shopName: "DIGITAL IT SOLUTIONS",
  tagline: "CSC E-Governance Services & Online Cyber Cafe Center",
  proprietor: "AKASH KUMAR LAL DAS",
  mobile: "8340622912",
  altMobile: "8340622912",
  email: "digitalitsolutionsshop@gmail.com",
  address: {
    village: "Paighamberpur",
    post: "Darima",
    ps: "Keoti",
    district: "Darbhanga",
    state: "Bihar",
    pincode: "847121",
    landmark: "Near High School Road"
  },
  fullAddressString: "VILLAGE PAIGHAMBERPUR, POST DARIMA, PS KEOTI, DARBHANGA BIHAR 847121",
  upiId: "8340622912@paytm",
  emergencyNotice: "📢 RTPS बिहार जाति/आय/निवास प्रमाणपत्र एवं बिहार पुलिस/रेलवे ऑनलाइन फॉर्म भरना शुरू है!",
  openingHours: "सोमवार - रविवार: प्रातः 8:00 AM से रात्रि 8:30 PM (खुला है)",
  cscId: "CSC-BR-DBGA-847121"
};

// Initial realistic default services for Bihar Cyber Cafe / CSC center
export const INITIAL_SERVICES: Omit<Service, 'id'>[] = [
  {
    name: "RTPS Bihar - Jati Praman Patra (Caste Certificate)",
    hindiName: "जाति प्रमाण पत्र (राजस्व अधिकारी / अंचल स्तर)",
    category: "RTPS Bihar",
    description: "बिहार सरकार सामान्य प्रशासन विभाग द्वारा निर्गत जाति प्रमाण पत्र हेतु ऑनलाइन आवेदन।",
    govFee: 0,
    serviceFee: 50,
    totalFee: 50,
    processingTime: "10-15 कार्य दिवस (Working Days)",
    requiredDocs: ["आधार कार्ड (Aadhar Card)", "पासपोर्ट साइज फोटो", "स्व-घोषणा पत्र", "सक्रिय मोबाइल नंबर"],
    isActive: true,
    popular: true
  },
  {
    name: "RTPS Bihar - Niwas Praman Patra (Residence Certificate)",
    hindiName: "निवास प्रमाण पत्र (स्थायी / अस्थायी)",
    category: "RTPS Bihar",
    description: "बिहार का मूल स्थायी निवासी होने का आधिकारिक प्रमाण पत्र।",
    govFee: 0,
    serviceFee: 50,
    totalFee: 50,
    processingTime: "10-12 कार्य दिवस",
    requiredDocs: ["आधार कार्ड", "पासपोर्ट फोटो", "वार्ड / पंचायत का नाम", "मोबाइल नंबर"],
    isActive: true,
    popular: true
  },
  {
    name: "RTPS Bihar - Aay Praman Patra (Income Certificate)",
    hindiName: "आय प्रमाण पत्र (वार्षिक आय घोषणा)",
    category: "RTPS Bihar",
    description: "सरकारी योजनाओं, छात्रवृत्ति व दाखिले हेतु वार्षिक आय प्रमाण पत्र।",
    govFee: 0,
    serviceFee: 50,
    totalFee: 50,
    processingTime: "10-15 कार्य दिवस",
    requiredDocs: ["आधार कार्ड", "पासपोर्ट फोटो", "कृषि / व्यवसाय / नौकरी आय ब्योरा", "मोबाइल नंबर"],
    isActive: true,
    popular: true
  },
  {
    name: "RTPS Bihar - Non-Creamy Layer (OBC / EBC Certificate)",
    hindiName: "नॉन-क्रीमी लेयर प्रमाण पत्र (NCL - बिहार व केंद्र स्तर)",
    category: "RTPS Bihar",
    description: "सरकारी नौकरी व प्रवेश परीक्षाओं में आरक्षण लाभ हेतु NCL प्रमाण पत्र।",
    govFee: 0,
    serviceFee: 80,
    totalFee: 80,
    processingTime: "15-21 कार्य दिवस",
    requiredDocs: ["जाति, आय, निवास प्रमाण पत्र", "आधार कार्ड", "फोटो", "जमीन रसीद / शपथ पत्र"],
    isActive: true,
    popular: true
  },
  {
    name: "New PAN Card Apply (Form 49A / NSDL)",
    hindiName: "नया पैन कार्ड आवेदन (फिजिकल + ई-पैन)",
    category: "PAN Card",
    description: "भारत सरकार आयकर विभाग का नया 10 डिजिट परमानेंट अकाउंट नंबर कार्ड।",
    govFee: 107,
    serviceFee: 93,
    totalFee: 200,
    processingTime: "ई-पैन 3 दिन, प्लास्टिक कार्ड 12-15 दिन",
    requiredDocs: ["आधार कार्ड (मोबाइल लिंक)", "2 रंगीन पासपोर्ट फोटो", "हस्ताक्षर", "पिता का नाम"],
    isActive: true,
    popular: true
  },
  {
    name: "PAN Card Correction / Name / DOB Change",
    hindiName: "पैन कार्ड सुधार / नाम, जन्मतिथि, पिता का नाम सुधार",
    category: "PAN Card",
    description: "खोए हुए या गलत नाम/जन्मतिथि वाले पैन कार्ड का शुद्धिकरण।",
    govFee: 107,
    serviceFee: 113,
    totalFee: 220,
    processingTime: "15-20 कार्य दिवस",
    requiredDocs: ["मौजूदा पैन कार्ड कॉपी", "आधार कार्ड", "मैट्रिक मार्कशीट या सपोर्टिंग प्रूफ", "2 फोटो"],
    isActive: true,
    popular: false
  },
  {
    name: "Aadhar PVC Card Order (Original Plastic Card)",
    hindiName: "आधार पीवीसी कार्ड ऑनलाइन आर्डर (UIDAI स्पीड पोस्ट डिलीवरी)",
    category: "Aadhar Services",
    description: "मौसम सुरक्षित, क्यूआर कोड एवं माइक्रोटेक्स्ट युक्त वाटरप्रूफ असली आधार कार्ड।",
    govFee: 50,
    serviceFee: 50,
    totalFee: 100,
    processingTime: "7-10 दिन (सीधे घर पर डाक द्वारा)",
    requiredDocs: ["आधार नंबर या वर्चुअल आईडी", "कोई भी चालू मोबाइल नंबर (OTP हेतु)"],
    isActive: true,
    popular: true
  },
  {
    name: "Ayushman Bharat Golden Card (PM-JAY)",
    hindiName: "आयुष्मान भारत गोल्डन कार्ड (5 लाख मुफ्त इलाज)",
    category: "Aadhar Services",
    description: "प्रधानमंत्री जन आरोग्य योजना अंतर्गत हर साल 5 लाख तक मुफ्त अस्पताल इलाज कार्ड।",
    govFee: 0,
    serviceFee: 40,
    totalFee: 40,
    processingTime: "तुरंत (Same Day)",
    requiredDocs: ["राशन कार्ड (पात्र सूची में नाम)", "आधार कार्ड", "बायोमेट्रिक / फिंगरप्रिंट या मोबाइल OTP"],
    isActive: true,
    popular: true
  },
  {
    name: "Voter ID Card Online Apply / Correction (NVSP)",
    hindiName: "नया मतदाता पहचान पत्र (वोटर कार्ड) / सुधार",
    category: "Aadhar Services",
    description: "फॉर्म 6 द्वारा 18 वर्ष पूर्ण होने पर नया वोटर कार्ड अथवा एड्रेस चेंज।",
    govFee: 0,
    serviceFee: 60,
    totalFee: 60,
    processingTime: "20-30 दिन",
    requiredDocs: ["आधार कार्ड", "पासपोर्ट फोटो", "उम्र प्रमाण पत्र", "परिवार के किसी सदस्य का EPIC No."],
    isActive: true,
    popular: false
  },
  {
    name: "Sarkari Job / Online Form Apply (BPSC, SSC, Railway)",
    hindiName: "सरकारी नौकरी ऑनलाइन फॉर्म भरना (Bihar SSC, BPSC, Railway, Defense)",
    category: "Sarkari Jobs & Results",
    description: "बिना किसी गलती के फॉर्म भरना, फोटो-हस्ताक्षर रीसाइजिंग व चालान भुगतान।",
    govFee: 0,
    serviceFee: 80,
    totalFee: 80,
    processingTime: "तुरंत प्रिंटआउट व कन्फर्मेशन पेज",
    requiredDocs: ["शैक्षणिक प्रमाण पत्र (10th/12th/Graduation)", "जाति/निवास", "फोटो व सिग्नेचर", "आधार कार्ड"],
    isActive: true,
    popular: true
  },
  {
    name: "Admit Card Download & Color Printout",
    hindiName: "एडमिट कार्ड डाउनलोड व हाई-क्वालिटी प्रिंट",
    category: "Sarkari Jobs & Results",
    description: "परीक्षा प्रवेश पत्र डाउनलोड कर लेमिनेशन व अतिरिक्त निर्देशों सहित प्रिंट।",
    govFee: 0,
    serviceFee: 20,
    totalFee: 20,
    processingTime: "तुरंत (2 मिनट)",
    requiredDocs: ["रजिस्ट्रेशन नंबर / रोल नंबर", "जन्मतिथि / पासवर्ड"],
    isActive: true,
    popular: true
  },
  {
    name: "Bihar Post Matric Scholarship (PMS)",
    hindiName: "बिहार पोस्ट मैट्रिक स्कॉलरशिप ऑनलाइन फॉर्म (SC/ST/BC/EBC)",
    category: "Student & Admission",
    description: "11वीं, 12वीं, आईटीआई, डिप्लोमा, बीए, बीएससी, एमए हेतु सरकारी छात्रवृत्ति।",
    govFee: 0,
    serviceFee: 100,
    totalFee: 100,
    processingTime: "सफलतापूर्वक सबमिट व रिसिप्ट",
    requiredDocs: ["कॉलेज बोनाफाइड सर्टिफिकेट", "फी रसीद", "जाति, आय, निवास", "बैंक पासबुक", "आधार कार्ड"],
    isActive: true,
    popular: true
  },
  {
    name: "LNMU Darbhanga Degree Admission & Exam Form",
    hindiName: "एलएनएमयू दरभंगा यूनिवर्सिटी एडमिशन व परीक्षा फॉर्म",
    category: "Student & Admission",
    description: "ललित नारायण मिथिला विश्वविद्यालय दरभंगा यूजी / पीजी फॉर्म व रजिस्ट्रेशन।",
    govFee: 0,
    serviceFee: 70,
    totalFee: 70,
    processingTime: "तुरंत",
    requiredDocs: ["पूर्व परीक्षा अंक पत्र (Marksheet)", "कॉलेज रोल नंबर", "फोटो व हस्ताक्षर"],
    isActive: true,
    popular: true
  },
  {
    name: "AEPS Aadhar Cash Withdrawal & Balance Check",
    hindiName: "आधार एटीएम (AEPS) - किसी भी बैंक से नकद निकासी व बैलेंस जांच",
    category: "Banking & AEPS",
    description: "फिंगरप्रिंट द्वारा तुरंत बिना बैंक जाए किसी भी बैंक खाते से पैसा निकालें।",
    govFee: 0,
    serviceFee: 20,
    totalFee: 20,
    processingTime: "तुरंत (1 मिनट)",
    requiredDocs: ["आधार कार्ड नंबर", "बैंक का नाम", "फिंगरप्रिंट वेरिफिकेशन"],
    isActive: true,
    popular: true
  },
  {
    name: "Money Transfer to Any Bank in India (DMT)",
    hindiName: "घरेलू मनी ट्रांसफर - भारत के किसी भी बैंक खाते में तुरंत पैसा भेजें",
    category: "Banking & AEPS",
    description: "IMPS / NEFT के माध्यम से 24x7 किसी भी खाते में तुरंत सुरक्षित स्थानांतरण।",
    govFee: 0,
    serviceFee: 30,
    totalFee: 30,
    processingTime: "तुरंत",
    requiredDocs: ["खाताधारक का नाम", "खाता संख्या", "IFSC कोड"],
    isActive: true,
    popular: true
  },
  {
    name: "NBPDCL Bihar Electricity Bill Payment",
    hindiName: "बिजली बिल भुगतान (नॉर्थ बिहार पावर डिस्ट्रीब्यूशन - NBPDCL)",
    category: "Electricity & Utilities",
    description: "उपभोक्ता संख्या (CA Number) द्वारा बिजली बिल चेक व सरकारी छूट सहित भुगतान।",
    govFee: 0,
    serviceFee: 20,
    totalFee: 20,
    processingTime: "तुरंत रसीद",
    requiredDocs: ["कंज्यूमर नंबर (CA Number)", "मोबाइल नंबर"],
    isActive: true,
    popular: true
  },
  {
    name: "Passport Size Urgent Photo (8 Copies)",
    hindiName: "अर्जेंट पासपोर्ट साइज फोटो (8 प्रतियां) - 5 मिनट में",
    category: "Printing & Documentation",
    description: "स्टूडियो क्वालिटी व्हाइट/ब्लू बैकग्राउंड पासपोर्ट फोटो तुरंत तैयार।",
    govFee: 0,
    serviceFee: 50,
    totalFee: 50,
    processingTime: "5 मिनट",
    requiredDocs: ["स्वयं उपस्थित हों या स्पष्ट सेल्फी/फोटो भेजें"],
    isActive: true,
    popular: true
  },
  {
    name: "Document Lamination & PVC Smart Card Print",
    hindiName: "दस्तावेज लैमिनेशन एवं स्मार्ट पीवीसी कार्ड प्रिंटिंग",
    category: "Printing & Documentation",
    description: "मार्कशीट, सर्टिफिकेट लैमिनेशन और आधार/पैन/ई-श्रम का हार्ड प्लास्टिक कार्ड प्रिंट।",
    govFee: 0,
    serviceFee: 50,
    totalFee: 50,
    processingTime: "तुरंत",
    requiredDocs: ["मूल दस्तावेज या पीडीएफ फाइल"],
    isActive: true,
    popular: false
  }
];

// Initial realistic default posts (Sarkari job notices, admit cards, Bihar RTPS schemes)
export const INITIAL_POSTS: Omit<Post, 'id'>[] = [
  {
    title: "बिहार पुलिस सिपाही (Bihar Police Constable) एडमिट कार्ड व परीक्षा तिथि घोषित",
    category: "Admit Card",
    content: "बिहार पुलिस सिपाही भर्ती परीक्षा की नई तिथियां जारी कर दी गई हैं। अभ्यर्थी अपना एडमिट कार्ड डिजिटल आईटी सॉल्यूशंस पैगम्बरपुर केंद्र पर आकर डाउनलोड व प्रिंट करवा सकते हैं।",
    lastDate: "परीक्षा तिथि: 12 अक्टूबर 2026",
    eligibility: "12वीं पास (इंटरमीडिएट)",
    applyFee: "एडमिट कार्ड डाउनलोड चार्ज: ₹20 मात्र",
    officialLink: "https://csbc.bih.nic.in",
    isPinned: true,
    author: "Akash Kumar Lal Das",
    createdAt: "2026-09-20T10:00:00.000Z"
  },
  {
    title: "बिहार पोस्ट मैट्रिक छात्रवृत्ति (PMS) सत्र 2026-27 ऑनलाइन आवेदन प्रारंभ",
    category: "Admission / Scholarship",
    content: "बिहार के सभी एससी, एसटी, बीसी एवं ईबीसी छात्र-छात्राओं के लिए पोस्ट मैट्रिक स्कॉलरशिप पोर्टल सक्रिय कर दिया गया है। अपने आवश्यक दस्तावेज लेकर केंद्र पर संपर्क करें।",
    lastDate: "अंतिम तिथि: 30 नवंबर 2026",
    eligibility: "11वीं, 12वीं, ग्रेजुएशन, आईटीआई, पॉलिटेक्निक विद्यार्थी",
    applyFee: "निःशुल्क सरकारी पोर्टल (साइबर कैफे चार्ज: ₹100)",
    officialLink: "http://pmsonline.bih.nic.in",
    isPinned: true,
    author: "Akash Kumar Lal Das",
    createdAt: "2026-09-22T08:30:00.000Z"
  },
  {
    title: "रेलवे सुरक्षा बल (RPF SI & Constable) 4660 पदों पर सीधी भर्ती",
    category: "Sarkari Job",
    content: "रेलवे रिक्रूटमेंट बोर्ड (RRB) द्वारा आरपीएफ सब-इंस्पेक्टर और कांस्टेबल पदों के लिए आधिकारिक सूचना। बिना किसी त्रुटि के ऑनलाइन आवेदन के लिए हमारे केंद्र पर पधारें।",
    lastDate: "अंतिम तिथि: 15 अक्टूबर 2026",
    eligibility: "कांस्टेबल: 10वीं पास | सब इंस्पेक्टर: स्नातक",
    applyFee: "Gen/OBC: ₹500 | SC/ST/Female: ₹250",
    officialLink: "https://rrbapply.gov.in",
    isPinned: false,
    author: "Akash Kumar Lal Das",
    createdAt: "2026-09-24T12:00:00.000Z"
  },
  {
    title: "RTPS बिहार: जाति, आय, निवास प्रमाणपत्र अब 10 दिनों में प्राप्त करें",
    category: "Bihar RTPS",
    content: "सर्विस प्लस बिहार पोर्टल पर जाति, निवास और आय प्रमाणपत्र के लिए आवेदन शुरू हैं। आवेदन के बाद आपको SMS और डिजिटल आईटी सॉल्यूशंस ट्रैकिंग टोकन मिलेगा।",
    lastDate: "सदा खुला (24x7)",
    eligibility: "बिहार राज्य के सभी नागरिक",
    applyFee: "सरकारी शुल्क: ₹0 | कैफे सर्विस चार्ज: ₹50",
    officialLink: "https://serviceonline.bihar.gov.in",
    isPinned: false,
    author: "Akash Kumar Lal Das",
    createdAt: "2026-09-25T09:15:00.000Z"
  }
];

// Initial realistic default transactions for ledger demonstration
export const INITIAL_TRANSACTIONS: Omit<Transaction, 'id'>[] = [
  {
    transactionNumber: "TXN-2026-0926-001",
    date: "2026-09-26 09:15 AM",
    customerName: "Rameshwar Yadav",
    customerMobile: "9876543210",
    serviceName: "RTPS Bihar - Jati Praman Patra",
    amount: 50,
    govFee: 0,
    cyberCafeFee: 50,
    profit: 50,
    paymentMode: "Cash",
    paymentStatus: "success",
    notes: "Applied for circle level caste certificate",
    createdAt: "2026-09-26T03:45:00.000Z"
  },
  {
    transactionNumber: "TXN-2026-0926-002",
    date: "2026-09-26 10:20 AM",
    customerName: "Mohammad Imran",
    customerMobile: "9431209876",
    serviceName: "New PAN Card Apply (Form 49A)",
    amount: 200,
    govFee: 107,
    cyberCafeFee: 93,
    profit: 93,
    paymentMode: "UPI",
    paymentStatus: "success",
    referenceId: "UPI/626912384729",
    notes: "NSDL biometric verification completed",
    createdAt: "2026-09-26T04:50:00.000Z"
  },
  {
    transactionNumber: "TXN-2026-0926-003",
    date: "2026-09-26 11:05 AM",
    customerName: "Sanjay Kumar Sahni",
    customerMobile: "8210987654",
    serviceName: "NBPDCL Bihar Electricity Bill Payment",
    amount: 780,
    govFee: 760,
    cyberCafeFee: 20,
    profit: 20,
    paymentMode: "Cash",
    paymentStatus: "success",
    notes: "CA No. 102938475 bill paid with receipt",
    createdAt: "2026-09-26T05:35:00.000Z"
  },
  {
    transactionNumber: "TXN-2026-0926-004",
    date: "2026-09-26 11:40 AM",
    customerName: "Pooja Kumari",
    customerMobile: "7004123456",
    serviceName: "Bihar Post Matric Scholarship (PMS)",
    amount: 100,
    govFee: 0,
    cyberCafeFee: 100,
    profit: 100,
    paymentMode: "UPI",
    paymentStatus: "success",
    referenceId: "UPI/626914589211",
    notes: "Intermediate college bonafide uploaded",
    createdAt: "2026-09-26T06:10:00.000Z"
  }
];

// Initial realistic verified official schemes for Bihar & India
export const INITIAL_SCHEMES: Omit<OnlineScheme, 'id'>[] = [
  {
    title: "बिहार RTPS ऑनलाइन सेवा - जाति, आय एवं निवास प्रमाण पत्र 2026",
    description: "बिहार सरकार सामान्य प्रशासन विभाग द्वारा आरटीपीएस सेवा प्लस पोर्टल पर सभी अंचलों में ऑनलाइन प्रमाण पत्र निर्गत किए जा रहे हैं।",
    category: "Bihar Government Services",
    department: "General Administration Department, Bihar",
    state: "Bihar",
    startDate: "2026-01-01",
    lastDate: "2026-12-31",
    eligibility: "बिहार राज्य के सभी स्थायी नागरिक",
    requiredDocs: ["आधार कार्ड", "पासपोर्ट साइज रंगीन फोटो", "स्वयं का घोषणा पत्र", "सक्रिय मोबाइल नंबर"],
    officialUrl: "https://serviceonline.bihar.gov.in",
    sourceName: "RTPS Bihar ServicePlus Portal",
    sourceUrl: "https://serviceonline.bihar.gov.in",
    detectedDate: "2026-09-20",
    status: "published",
    createdAt: "2026-09-20T10:00:00.000Z"
  },
  {
    title: "बिहार पोस्ट मैट्रिक छात्रवृत्ति (PMS) 2026-27 (SC, ST, BC, EBC छात्र)",
    description: "मैट्रिक (10वीं) उत्तीर्ण विद्यार्थियों के लिए 11वीं, 12वीं, ग्रेजुएशन, आईटीआई, डिप्लोमा एवं अन्य उच्च शिक्षा हेतु छात्रवृत्ति।",
    category: "Student & Education",
    department: "Education Department, Bihar",
    state: "Bihar",
    startDate: "2026-09-01",
    lastDate: "2026-11-30",
    eligibility: "बिहार के मान्यता प्राप्त संस्थानों में नामांकित SC/ST/BC/EBC छात्र जिनकी पारिवारिक वार्षिक आय ₹3 लाख से कम हो",
    requiredDocs: ["10वीं मार्कशीट", "कॉलेज बोनाफाइड सर्टिफिकेट", "कॉलेज फीस रसीद", "जाति प्रमाण पत्र", "आय प्रमाण पत्र", "निवास प्रमाण पत्र", "आधार कार्ड", "बैंक पासबुक"],
    officialUrl: "http://pmsonline.bih.nic.in",
    sourceName: "Bihar PMS Official Portal",
    sourceUrl: "http://pmsonline.bih.nic.in",
    detectedDate: "2026-09-22",
    status: "published",
    createdAt: "2026-09-22T08:30:00.000Z"
  },
  {
    title: "प्रधानमंत्री किसान सम्मान निधि योजना (19वीं किस्त ई-केवाईसी)",
    description: "पात्र किसान परिवारों को प्रतिवर्ष ₹6,000 की आर्थिक सहायता तीन समान किस्तों में सीधे बैंक खाते में। अगली किस्त हेतु ई-केवाईसी अनिवार्य।",
    category: "Agriculture & Farmer Schemes",
    department: "Ministry of Agriculture & Farmers Welfare",
    state: "Central / All India",
    startDate: "2026-01-01",
    lastDate: "2026-10-31",
    eligibility: "खेती योग्य भूमि रखने वाले सभी पंजीकृत किसान परिवार",
    requiredDocs: ["आधार कार्ड", "जमीन की अद्यतन रसीद / एलपीसी", "बैंक पासबुक", "आधार लिंक मोबाइल नंबर"],
    officialUrl: "https://pmkisan.gov.in",
    sourceName: "PM Kisan Official Portal",
    sourceUrl: "https://pmkisan.gov.in",
    detectedDate: "2026-09-24",
    status: "published",
    createdAt: "2026-09-24T12:00:00.000Z"
  },
  {
    title: "बिहार पुलिस सिपाही भर्ती परीक्षा 2026 (CSBC)",
    description: "केंद्रीय चयन पर्षद (सिपाही भर्ती) द्वारा सिपाही पदों हेतु ऑनलाइन आवेदन एवं परीक्षा प्रवेश पत्र जारी।",
    category: "Employment & Jobs",
    department: "Central Selection Board of Constable, Bihar",
    state: "Bihar",
    startDate: "2026-09-10",
    lastDate: "2026-10-15",
    eligibility: "12वीं (इंटरमीडिएट) उत्तीर्ण, आयु 18 से 25 वर्ष",
    requiredDocs: ["10वीं एवं 12वीं मार्कशीट", "जाति व निवास प्रमाण पत्र", "फोटो एवं हस्ताक्षर", "पहचान पत्र (आधार कार्ड)"],
    officialUrl: "https://csbc.bih.nic.in",
    sourceName: "CSBC Bihar Portal",
    sourceUrl: "https://csbc.bih.nic.in",
    detectedDate: "2026-09-25",
    status: "published",
    createdAt: "2026-09-25T09:15:00.000Z"
  },
  {
    title: "बिहार डीजल अनुदान एवं कृषि यांत्रिकरण योजना 2026",
    description: "फसलों की सिंचाई हेतु किसानों को प्रति एकड़ ₹750 प्रति सिंचाई डीजल अनुदान एवं 50% से 80% तक कृषि यंत्रों पर सरकारी सब्सिडी।",
    category: "Agriculture & Farmer Schemes",
    department: "Department of Agriculture, Bihar",
    state: "Bihar",
    startDate: "2026-08-15",
    lastDate: "2026-10-30",
    eligibility: "डीबीटी एग्रीकल्चर पोर्टल पर 13 अंकों के किसान पंजीकरण वाले किसान",
    requiredDocs: ["किसान पंजीकरण संख्या", "डीजल क्रय डिजिटल रसीद", "जमीन रसीद / स्व-घोषणा पत्र"],
    officialUrl: "https://dbtagriculture.bihar.gov.in",
    sourceName: "DBT Agriculture Bihar",
    sourceUrl: "https://dbtagriculture.bihar.gov.in",
    detectedDate: "2026-09-26",
    status: "published",
    createdAt: "2026-09-26T07:00:00.000Z"
  }
];

// Helper to seed or get Firestore collections safely
export async function seedInitialDataIfNeeded() {
  try {
    const servicesSnap = await getDocs(collection(db, 'services'));
    if (servicesSnap.empty) {
      console.log('Seeding initial CSC services...');
      for (const s of INITIAL_SERVICES) {
        await addDoc(collection(db, 'services'), s);
      }
    }

    const postsSnap = await getDocs(collection(db, 'posts'));
    if (postsSnap.empty) {
      console.log('Seeding initial Sarkari notices...');
      for (const p of INITIAL_POSTS) {
        await addDoc(collection(db, 'posts'), p);
      }
    }

    const txSnap = await getDocs(collection(db, 'transactions'));
    if (txSnap.empty) {
      console.log('Seeding initial transactions...');
      for (const t of INITIAL_TRANSACTIONS) {
        await addDoc(collection(db, 'transactions'), t);
      }
    }

    const schemesSnap = await getDocs(collection(db, 'schemes'));
    if (schemesSnap.empty) {
      console.log('Seeding initial verified government schemes...');
      for (const sc of INITIAL_SCHEMES) {
        await addDoc(collection(db, 'schemes'), sc);
      }
    }

    const configDoc = await getDoc(doc(db, 'shopConfig', 'main'));
    if (!configDoc.exists()) {
      await setDoc(doc(db, 'shopConfig', 'main'), DEFAULT_SHOP_CONFIG);
    }
  } catch (error) {
    console.warn("Notice: Firestore seeding skipped or restricted by rules:", error);
  }
}

