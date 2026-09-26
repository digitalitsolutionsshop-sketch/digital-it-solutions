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

export interface UploadedDoc {
  name: string;
  docType: string;
  fileName: string;
  fileData?: string; // Base64 data or placeholder URL
}

export interface ServiceRequest {
  id: string; // Token ID e.g. DIS-2026-7842
  trackingToken: string;
  customerName: string;
  mobile: string;
  email?: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  address: string;
  village: string;
  postOffice: string;
  policeStation: string;
  district: string;
  pincode: string;
  additionalNotes?: string;
  uploadedDocs: UploadedDoc[];
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
