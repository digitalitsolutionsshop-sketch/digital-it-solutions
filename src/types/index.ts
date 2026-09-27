export type ServiceCategory = 
  | 'RTPS Bihar'
  | 'PAN Card'
  | 'Aadhar Services'
  | 'Sarkari Jobs & Results'
  | 'Student & Admission'
  | 'Banking & AEPS'
  | 'Electricity & Utilities'
  | 'Printing & Documentation';

export interface Service {
  id: string;
  name: string;
  hindiName: string;
  category: ServiceCategory;
  description: string;
  govFee: number;
  serviceFee: number;
  totalFee: number;
  processingTime: string;
  requiredDocs: string[];
  isActive: boolean;
  popular?: boolean;
  createdAt?: string;
}

export type PostCategory = 
  | 'Sarkari Job' 
  | 'Admit Card' 
  | 'Result' 
  | 'Bihar RTPS' 
  | 'CSC Update' 
  | 'Admission / Scholarship';

export interface Post {
  id: string;
  title: string;
  category: PostCategory;
  content: string;
  lastDate?: string;
  eligibility?: string;
  applyFee?: string;
  officialLink?: string;
  isPinned: boolean;
  author: string;
  createdAt: string;
  updatedAt?: string;
}

export type ApplicationStatus = 'pending' | 'processing' | 'documents_needed' | 'completed' | 'rejected';
export type PaymentStatus = 'unpaid' | 'paid_online' | 'paid_cash';

// Standard 8 document upload types as per requirement #3
export type DocumentCategoryType = 
  | 'caste_certificate'
  | 'residence_certificate'
  | 'income_certificate'
  | 'tenth_certificate'
  | 'twelfth_certificate'
  | 'aadhaar_card'
  | 'address_proof'
  | 'id_proof';

export interface DocumentUploadFieldConfig {
  type: DocumentCategoryType;
  label: string;
  labelHindi: string;
  description: string;
}

export interface UploadedDoc {
  documentId: string;
  applicationId?: string;
  userId?: string;
  name: string; // Document label e.g. "Caste Certificate"
  docType: DocumentCategoryType | string;
  fileName: string;
  fileType: string; // e.g. "application/pdf", "image/jpeg"
  fileSize: number; // in bytes
  r2ObjectKey: string;
  uploadedAt: string;
  documentStatus: 'active' | 'expired' | 'deleted';
  expiresAt: string; // uploadedAt + 6 months
  previewUrl?: string;
  downloadUrl?: string;
  fileData?: string; // Fallback inline preview data if needed
}

export interface CompleteAddress {
  houseBuildingFlat: string;
  villageTown: string;
  postOffice: string;
  policeStation: string;
  panchayatWard: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
}

export interface ServiceRequest {
  id: string; // Token ID e.g. DIS-2026-7842
  trackingToken: string;
  userId?: string;
  
  // Mandatory personal details
  applicantName: string;
  customerName: string; // Backward compatibility with existing records
  fatherName: string;
  motherName: string;
  // Optional personal details
  husbandName?: string;
  
  // Contact details
  mobile: string; // Mandatory 10-digit Indian mobile
  email?: string; // Optional
  
  // Service
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  
  // Complete address structure + backward compatible string
  address: string;
  addressDetails?: CompleteAddress;
  village: string;
  postOffice: string;
  policeStation: string;
  district: string;
  pincode: string;
  
  // Notes & Documents
  additionalNotes?: string;
  uploadedDocs: UploadedDoc[];
  
  // Workflow & Status
  status: ApplicationStatus;
  adminRemarks?: string;
  paymentStatus: PaymentStatus;
  amount: number;
  acknowledgementNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMode = 'UPI' | 'Cash' | 'AEPS' | 'Card';

export interface Transaction {
  id: string;
  transactionNumber: string;
  date: string;
  customerName: string;
  customerMobile: string;
  serviceName: string;
  amount: number;
  govFee: number;
  cyberCafeFee: number;
  profit: number;
  paymentMode: PaymentMode;
  paymentStatus: 'success' | 'pending' | 'failed';
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export interface ShopConfig {
  shopName: string;
  tagline: string;
  proprietor: string;
  mobile: string;
  altMobile: string;
  email: string;
  address: {
    village: string;
    post: string;
    ps: string;
    district: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  fullAddressString: string;
  upiId: string;
  emergencyNotice: string;
  openingHours: string;
  cscId: string;
}

// ----------------------------------------------------
// Requirements #19-26: Online Services / Schemes System
// ----------------------------------------------------
export type SchemeCategory = 
  | 'Student & Education'
  | 'Admission & Examination'
  | 'Government Student Schemes'
  | 'Agriculture & Farmer Schemes'
  | 'Agriculture Survey'
  | 'Employment & Jobs'
  | 'Skill Development'
  | 'Government Forms & Public Welfare'
  | 'Bihar Government Services'
  | 'Central Government Services'
  | 'Other Verified Online Services';

export type SchemeStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'expired';

export interface OnlineScheme {
  id: string;
  title: string;
  description: string;
  category: SchemeCategory;
  department: string;
  state: string; // 'Bihar' | 'Central / All India' | etc.
  startDate?: string;
  lastDate?: string;
  eligibility: string;
  requiredDocs: string[];
  officialUrl: string;
  sourceName: string;
  sourceUrl: string;
  detectedDate: string;
  status: SchemeStatus;
  isAutoPublished?: boolean;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// Requirements #16, 18, 23: AI Chatbot, Voice & Admin Settings
// ----------------------------------------------------
export interface AISettings {
  chatbotEnabled: boolean;
  voiceInputEnabled: boolean;
  voiceOutputEnabled: boolean;
  defaultLanguage: 'hi' | 'en';
  welcomeMessage: string;
  autoCollectionEnabled: boolean;
  autoPublishEnabled: boolean;
  officialSourcesOnly: boolean;
  adminApprovalRequired: boolean;
  documentRetentionMonths: number; // 3 | 6 | 12 (default 6)
}

// ----------------------------------------------------
// Requirement #37: Cloudflare R2 Connection Status
// ----------------------------------------------------
export interface R2ConnectionStatus {
  isConfigured: boolean;
  bucketName: string;
  accountIdConfigured: boolean;
  accessKeyConfigured: boolean;
  secretKeyConfigured: boolean;
  endpoint: string;
  retentionMonths: number;
  lifecycleRuleName: string;
}
