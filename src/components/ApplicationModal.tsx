import React, { useState, useEffect } from 'react';
import type { Service, ServiceRequest, UploadedDoc, DocumentCategoryType } from '../types';
import { 
  X, 
  Send, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  MapPin, 
  Copy,
  Check,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  preselectedService?: Service | null;
  shopMobile: string;
  onViewReceipt: (req: ServiceRequest) => void;
}

// 8 Standard Document Upload fields specified in Requirement #3
const DOCUMENT_FIELDS: { type: DocumentCategoryType; name: string; hindiName: string; hint: string }[] = [
  { 
    type: 'caste_certificate', 
    name: 'Caste Certificate', 
    hindiName: 'जाति प्रमाण पत्र', 
    hint: 'राजस्व अधिकारी / अंचल स्तर' 
  },
  { 
    type: 'residence_certificate', 
    name: 'Residence Certificate', 
    hindiName: 'निवास प्रमाण पत्र', 
    hint: 'स्थायी / निवास प्रमाण' 
  },
  { 
    type: 'income_certificate', 
    name: 'Income Certificate', 
    hindiName: 'आय प्रमाण पत्र', 
    hint: 'अद्यतन वार्षिक आय घोषणा' 
  },
  { 
    type: 'tenth_certificate', 
    name: '10th Certificate / Marksheet', 
    hindiName: '10वीं अंक पत्र / प्रमाण पत्र', 
    hint: 'मैट्रिक बोर्ड अंक पत्र' 
  },
  { 
    type: 'twelfth_certificate', 
    name: '12th Certificate / Marksheet', 
    hindiName: '12वीं अंक पत्र / प्रमाण पत्र', 
    hint: 'इंटरमीडिएट बोर्ड अंक पत्र' 
  },
  { 
    type: 'aadhaar_card', 
    name: 'Aadhaar Card', 
    hindiName: 'आधार कार्ड', 
    hint: 'फ्रंट एवं बैक स्पष्ट प्रति' 
  },
  { 
    type: 'address_proof', 
    name: 'Address Proof', 
    hindiName: 'पते का प्रमाण', 
    hint: 'बिजली बिल / राशन कार्ड / वोटर कार्ड' 
  },
  { 
    type: 'id_proof', 
    name: 'ID Proof', 
    hindiName: 'पहचान पत्र', 
    hint: 'पैन कार्ड / ड्राइविंग लाइसेंस / पासपोर्ट' 
  },
];

const INDIAN_STATES = [
  'Bihar',
  'Uttar Pradesh',
  'Jharkhand',
  'West Bengal',
  'Delhi',
  'Madhya Pradesh',
  'Rajasthan',
  'Maharashtra',
  'Haryana',
  'Punjab',
  'Odisha',
  'Assam',
  'Other'
];

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  services,
  preselectedService,
  shopMobile,
  onViewReceipt
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  
  // Requirement #2: Applicant Personal Details
  const [applicantName, setApplicantName] = useState<string>(''); // MANDATORY *
  const [fatherName, setFatherName] = useState<string>(''); // MANDATORY *
  const [motherName, setMotherName] = useState<string>(''); // MANDATORY *
  const [husbandName, setHusbandName] = useState<string>(''); // OPTIONAL
  
  // Requirement #2: Contact Details
  const [mobile, setMobile] = useState<string>(''); // MANDATORY *
  const [email, setEmail] = useState<string>(''); // OPTIONAL
  
  // Requirement #2: Complete Address Details
  const [houseBuildingFlat, setHouseBuildingFlat] = useState<string>('');
  const [villageTown, setVillageTown] = useState<string>('पैगम्बरपुर (Paighamberpur)');
  const [postOffice, setPostOffice] = useState<string>('दरिमा (Darima)');
  const [policeStation, setPoliceStation] = useState<string>('केवटी (Keoti)');
  const [panchayatWard, setPanchayatWard] = useState<string>('वार्ड 04 / पैगम्बरपुर पंचायत');
  const [block, setBlock] = useState<string>('केवटी (Keoti)');
  const [district, setDistrict] = useState<string>('दरभंगा (Darbhanga)');
  const [state, setState] = useState<string>('Bihar');
  const [pincode, setPincode] = useState<string>('847121');
  
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [paymentChoice, setPaymentChoice] = useState<'unpaid' | 'paid_online'>('unpaid');
  
  // Requirement #3, 4, 5, 8: Cloudflare R2 Uploaded Documents
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  
  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<UploadedDoc | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<ServiceRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    if (preselectedService) {
      setSelectedServiceId(preselectedService.id || preselectedService.name);
    } else if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id || services[0].name);
    }
  }, [preselectedService, services]);

  if (!isOpen) return null;

  const currentService = services.find(s => (s.id || s.name) === selectedServiceId) || services[0];

  // Helper: Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper: Format date
  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleDateString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  // Requirement #4, 5, 6, 7: Client-side file validation & Cloudflare R2 upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: DocumentCategoryType, docLabel: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');

    // Allowed extensions check: PDF, JPG, JPEG, PNG
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(fileExt)) {
      setErrorMsg(`अमान्य फाइल प्रारूप! "${file.name}" अस्वीकृत है। केवल PDF, JPG, JPEG या PNG फाइल अपलोड करें।`);
      return;
    }

    // File size check: 5MB maximum
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(`फाइल साइज 5MB से अधिक है (${formatFileSize(file.size)})। कृपया संपीड़ित (compress) करके अपलोड करें।`);
      return;
    }

    setUploadingDocType(docType);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', docType);
      formData.append('applicationId', 'APP-' + (mobile.slice(-4) || 'WEB'));

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'दस्तावेज अपलोड करने में विफलता।');
      }

      const resData = await response.json();
      const uploadedDoc: UploadedDoc = {
        ...resData.document,
        name: docLabel,
        docType: docType
      };

      setUploadedDocs(prev => [...prev.filter(d => d.docType !== docType), uploadedDoc]);
    } catch (err: any) {
      console.error('File upload error:', err);
      // Fallback local reader for preview if network or offline
      const reader = new FileReader();
      reader.onload = () => {
        const now = new Date();
        const fallbackDoc: UploadedDoc = {
          documentId: `DOC-${Date.now()}`,
          name: docLabel,
          docType: docType,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          r2ObjectKey: `applications/local/documents/${file.name}`,
          uploadedAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          documentStatus: 'active',
          fileData: typeof reader.result === 'string' ? reader.result : '',
          previewUrl: typeof reader.result === 'string' ? reader.result : '',
          downloadUrl: typeof reader.result === 'string' ? reader.result : ''
        };
        setUploadedDocs(prev => [...prev.filter(d => d.docType !== docType), fallbackDoc]);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingDocType(null);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleRemoveDoc = async (documentId: string, docType: string) => {
    try {
      await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete API call fallback:', e);
    }
    setUploadedDocs(prev => prev.filter(d => d.docType !== docType && d.documentId !== documentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Strict Validations as per Requirement #2
    if (!applicantName.trim()) {
      setErrorMsg('कृपया आवेदक का पूरा नाम (Applicant Name *) दर्ज करें।');
      return;
    }
    if (!fatherName.trim()) {
      setErrorMsg('कृपया पिता का नाम (Father Name *) दर्ज करें।');
      return;
    }
    if (!motherName.trim()) {
      setErrorMsg('कृपया माता का नाम (Mother Name *) दर्ज करें।');
      return;
    }

    // Strict Indian mobile validation: 10 digits starting with 6, 7, 8, 9
    const cleanedMobile = mobile.replace(/\D/g, '');
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(cleanedMobile)) {
      setErrorMsg('कृपया वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू होने वाला)।');
      return;
    }

    // Optional email validation
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMsg('कृपया वैध ईमेल आईडी दर्ज करें अथवा इसे रिक्त छोड़ दें।');
        return;
      }
    }

    // Address validation
    if (!houseBuildingFlat.trim()) {
      setErrorMsg('कृपया मकान संख्या / भवन / फ्लैट (House / Building / Flat *) दर्ज करें।');
      return;
    }
    if (!villageTown.trim()) {
      setErrorMsg('कृपया ग्राम / कस्बा (Village / Town *) दर्ज करें।');
      return;
    }
    if (!postOffice.trim()) {
      setErrorMsg('कृपया डाकघर (Post Office *) दर्ज करें।');
      return;
    }
    if (!policeStation.trim()) {
      setErrorMsg('कृपया थाना (Police Station *) दर्ज करें।');
      return;
    }
    if (!panchayatWard.trim()) {
      setErrorMsg('कृपया पंचायत / वार्ड (Panchayat / Ward *) दर्ज करें।');
      return;
    }
    if (!block.trim()) {
      setErrorMsg('कृपया प्रखंड (Block *) दर्ज करें।');
      return;
    }
    if (!district.trim()) {
      setErrorMsg('कृपया जिला (District *) दर्ज करें।');
      return;
    }
    if (!pincode.trim() || pincode.replace(/\D/g, '').length !== 6) {
      setErrorMsg('कृपया 6 अंकों का वैध पिन कोड (PIN Code *) दर्ज करें।');
      return;
    }

    setSubmitting(true);

    try {
      const random4 = Math.floor(1000 + Math.random() * 9000);
      const trackingToken = `DIS-2026-${random4}`;
      const fullAddressString = `${houseBuildingFlat.trim()}, ${villageTown.trim()}, पो: ${postOffice.trim()}, थाना: ${policeStation.trim()}, वार्ड/पंचायत: ${panchayatWard.trim()}, प्रखंड: ${block.trim()}, जिला: ${district.trim()}, राज्य: ${state}, पिन: ${pincode.trim()}`;

      const newRequest: ServiceRequest = {
        id: trackingToken,
        trackingToken: trackingToken,
        customerName: applicantName.trim(), // Backward compatible
        applicantName: applicantName.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        husbandName: husbandName.trim() || undefined,
        mobile: cleanedMobile,
        email: email.trim() || undefined,
        serviceId: currentService?.id || currentService?.name || 'GEN-SVC',
        serviceName: currentService?.name || 'General CSC Service',
        serviceCategory: currentService?.category || 'General',
        address: fullAddressString,
        addressDetails: {
          houseBuildingFlat: houseBuildingFlat.trim(),
          villageTown: villageTown.trim(),
          postOffice: postOffice.trim(),
          policeStation: policeStation.trim(),
          panchayatWard: panchayatWard.trim(),
          block: block.trim(),
          district: district.trim(),
          state: state,
          pincode: pincode.trim()
        },
        village: villageTown.trim(),
        postOffice: postOffice.trim(),
        policeStation: policeStation.trim(),
        district: district.trim(),
        pincode: pincode.trim(),
        additionalNotes: additionalNotes.trim() || undefined,
        uploadedDocs: uploadedDocs,
        status: 'pending',
        adminRemarks: 'आवेदन सफलतापूर्वक प्राप्त हुआ है। डिजिटल आईटी सॉल्यूशंस टीम द्वारा शीघ्र समीक्षा की जाएगी।',
        paymentStatus: paymentChoice,
        amount: currentService?.totalFee || 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'requests', trackingToken), newRequest);
      } catch (err) {
        console.warn("Firestore write fallback to local session state:", err);
      }

      setSubmittedRequest(newRequest);
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('आवेदन सबमिट करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold leading-tight">
                  ऑनलाइन आवेदन फॉर्म (Online Application Form)
                </h2>
                <p className="text-xs text-blue-200">
                  डिजिटल आईटी सॉल्यूशंस • सीएससी ई-गवर्नेंस केंद्र, पैगम्बरपुर (दरभंगा)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {submittedRequest ? (
              /* Success View */
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    आवेदन सफलतापूर्वक प्राप्त हुआ!
                  </h3>
                  <p className="text-xs text-slate-600">
                    आपका सेवा अनुरोध डिजिटल आईटी सॉल्यूशंस साइबर कैफे में दर्ज हो चुका है।
                  </p>
                </div>

                {/* Token Display Box */}
                <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 max-w-md mx-auto space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                    आपका ट्रैकिंग टोकन नंबर (Tracking Token ID)
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl sm:text-3xl font-mono font-black text-amber-950 tracking-wider">
                      {submittedRequest.trackingToken}
                    </span>
                    <button
                      onClick={() => copyToken(submittedRequest.trackingToken)}
                      className="p-2 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition"
                      title="Copy Token"
                    >
                      {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    इस टोकन नंबर से आप कभी भी अपनी आवेदन स्थिति ट्रैक कर सकते हैं।
                  </p>
                </div>

                {/* Details Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">आवेदक का नाम:</span>
                    <span className="font-bold text-slate-800">{submittedRequest.applicantName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">पिता का नाम:</span>
                    <span className="font-semibold text-slate-800">{submittedRequest.fatherName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">माता का नाम:</span>
                    <span className="font-semibold text-slate-800">{submittedRequest.motherName}</span>
                  </div>
                  {submittedRequest.husbandName && (
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-slate-500">पति का नाम:</span>
                      <span className="font-semibold text-slate-800">{submittedRequest.husbandName}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">मोबाइल नंबर:</span>
                    <span className="font-semibold text-slate-800">+91 {submittedRequest.mobile}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">चयनित सेवा:</span>
                    <span className="font-bold text-blue-900">{submittedRequest.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">अपलोड किए गए दस्तावेज:</span>
                    <span className="font-semibold text-emerald-700">{submittedRequest.uploadedDocs.length} फाइल्स (R2 सुरक्षित)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={() => onViewReceipt(submittedRequest)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    पावती रसीद प्रिंट करें (Print Receipt)
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 text-xs"
                  >
                    पोर्टल पर वापस जाएं
                  </button>
                </div>
              </div>
            ) : (
              /* Form View */
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* 1. Service Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    1. सेवा चुनें (Select Service) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    {services.map(s => (
                      <option key={s.id || s.name} value={s.id || s.name}>
                        [{s.category}] {s.name} - ₹{s.totalFee}
                      </option>
                    ))}
                  </select>

                  {currentService && (
                    <div className="mt-2 p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-blue-950 block">{currentService.hindiName}</span>
                        <span className="text-blue-700 text-[11px]">अनुमानित समय: {currentService.processingTime}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">कुल कैफे फीस</span>
                        <span className="text-sm font-black text-blue-900">₹{currentService.totalFee}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Applicant Personal Details (Requirement #2) */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      2. आवेदक का व्यक्तिगत विवरण (Personal Details)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Applicant Name * MANDATORY */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Applicant Name (आवेदक का नाम) <span className="text-red-500 text-sm font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="उदा: आकाश कुमार लाल दास"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Father Name * MANDATORY */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Father Name (पिता का नाम) <span className="text-red-500 text-sm font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        placeholder="उदा: राम लखन लाल दास"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Mother Name * MANDATORY */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Mother Name (माता का नाम) <span className="text-red-500 text-sm font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={motherName}
                        onChange={(e) => setMotherName(e.target.value)}
                        placeholder="उदा: सीता देवी"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Husband Name OPTIONAL (NO STAR) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Husband Name (पति का नाम - केवल विवाहित महिलाओं हेतु / वैकल्पिक)
                      </label>
                      <input
                        type="text"
                        value={husbandName}
                        onChange={(e) => setHusbandName(e.target.value)}
                        placeholder="यदि लागू न हो तो खाली छोड़ें"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Contact Details (Requirement #2) */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block border-b border-slate-200 pb-2">
                    3. संपर्क विवरण (Contact Details)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Mobile Number * MANDATORY */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Mobile Number (सक्रिय मोबाइल नंबर) <span className="text-red-500 text-sm font-bold">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                          placeholder="10 अंकों का मोबाइल नंबर"
                          className="w-full pl-12 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        OTP एवं आवेदन की स्थिति इसी नंबर पर भेजी जाएगी।
                      </span>
                    </div>

                    {/* Email ID OPTIONAL (NO STAR) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Email ID (ईमेल आईडी - वैकल्पिक)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="उदा: digitalit@example.com"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        पावती रसीद व प्रमाणपत्र की प्रति प्राप्त करने हेतु।
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Complete Address Details (Requirement #2) */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      4. पूरा पता (Complete Address Details)
                    </span>
                    <span className="text-[10px] text-slate-500">सभी अनिवार्य फील्ड्स पर (*) अंकित है</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* House / Building / Flat * */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        House / Building / Flat (मकान / भवन / फ्लैट) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={houseBuildingFlat}
                        onChange={(e) => setHouseBuildingFlat(e.target.value)}
                        placeholder="उदा: वार्ड 04, मकान सं. 12 या हाई स्कूल रोड"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Village / Town * */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Village / Town (ग्राम / नगर) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={villageTown}
                        onChange={(e) => setVillageTown(e.target.value)}
                        placeholder="उदा: पैगम्बरपुर"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Post Office * */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Post Office (डाकघर) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={postOffice}
                        onChange={(e) => setPostOffice(e.target.value)}
                        placeholder="उदा: दरिमा"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Police Station * */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Police Station (थाना) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={policeStation}
                        onChange={(e) => setPoliceStation(e.target.value)}
                        placeholder="उदा: केवटी"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Panchayat / Ward * */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Panchayat / Ward (पंचायत / वार्ड) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={panchayatWard}
                        onChange={(e) => setPanchayatWard(e.target.value)}
                        placeholder="उदा: पैगम्बरपुर / वार्ड 04"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Block * */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Block (प्रखंड / ब्लॉक) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
                        placeholder="उदा: केवटी"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* District * */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        District (जिला) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="उदा: दरभंगा"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* State Selection (Default Bihar) * */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        State (राज्य) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-semibold"
                      >
                        {INDIAN_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* PIN Code * */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        PIN Code (पिन कोड) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        placeholder="उदा: 847121"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Document Upload System (Requirements #3, 4, 5, 8, 10) */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                        5. आवश्यक दस्तावेज अपलोड (Document Upload System)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        अनुमत फाइल प्रारूप: <strong>PDF, JPG, JPEG, PNG</strong> (अधिकतम 5MB प्रति दस्तावेज)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold w-fit">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cloudflare R2 प्राइवेट स्टोरेज • 6 माह स्वतः समाप्ति</span>
                    </div>
                  </div>

                  {/* 8 Distinct Document Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DOCUMENT_FIELDS.map((docField) => {
                      const uploaded = uploadedDocs.find(d => d.docType === docField.type);
                      const isUploading = uploadingDocType === docField.type;

                      return (
                        <div 
                          key={docField.type} 
                          className={`p-3 rounded-2xl border transition ${
                            uploaded 
                              ? 'bg-emerald-50/70 border-emerald-300 shadow-xs' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-slate-900 block truncate">
                                {docField.hindiName}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {docField.name} • {docField.hint}
                              </span>
                            </div>

                            {/* Status Indicator */}
                            {uploaded ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>अपलोड हुआ</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 shrink-0">
                                लंबित
                              </span>
                            )}
                          </div>

                          {/* Uploaded File Details Strip */}
                          {uploaded ? (
                            <div className="mt-2.5 pt-2 border-t border-emerald-200/80 space-y-2">
                              <div className="text-[11px] text-slate-700 flex items-center justify-between">
                                <span className="truncate font-medium max-w-[180px] sm:max-w-[200px]" title={uploaded.fileName}>
                                  📄 {uploaded.fileName}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                  {formatFileSize(uploaded.fileSize)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span>अपलोड: {formatDate(uploaded.uploadedAt)}</span>
                                <span className="text-amber-700">वैध: 6 माह</span>
                              </div>

                              {/* Action Buttons: Preview, Download, Replace, Delete */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewDoc(uploaded);
                                    setIsPreviewOpen(true);
                                  }}
                                  className="flex-1 py-1.5 px-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition"
                                  title="दस्तावेज देखें"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>पूर्वावलोकन</span>
                                </button>

                                {uploaded.downloadUrl && (
                                  <a
                                    href={uploaded.downloadUrl}
                                    download={uploaded.fileName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center justify-center"
                                    title="डाउनलोड"
                                  >
                                    <Download className="w-3 h-3" />
                                  </a>
                                )}

                                {/* Replace */}
                                <label className="cursor-pointer p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center justify-center">
                                  <RefreshCw className="w-3 h-3" />
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, docField.type, docField.hindiName)}
                                  />
                                </label>

                                {/* Delete / Remove */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDoc(uploaded.documentId, docField.type)}
                                  className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[10px] font-bold transition flex items-center justify-center"
                                  title="हटाएं"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Choose File / Upload Controls */
                            <div className="mt-2.5 flex items-center gap-2">
                              <label className="cursor-pointer flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition">
                                {isUploading ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                    <span>अपलोड हो रहा है...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                                    <span>[फाइल चुनें] अपलोड</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
                                  disabled={isUploading}
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, docField.type, docField.hindiName)}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Additional Remarks */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    6. अतिरिक्त निर्देश या विवरण (Additional Instructions - Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="उदा: फॉर्म तत्काल चाहिए, जाति श्रेणी EBC, पूर्व आवेदन टोकन संदर्भ..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* 7. Payment Preference */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                    7. भुगतान का माध्यम चुनें (Payment Preference)
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs font-bold transition ${
                      paymentChoice === 'unpaid' ? 'bg-white border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400' : 'bg-white/50 border-slate-200 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="paymentChoice"
                        value="unpaid"
                        checked={paymentChoice === 'unpaid'}
                        onChange={() => setPaymentChoice('unpaid')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span>दुकान पर नकद / बाद में भुगतान</span>
                        <span className="block text-[10px] text-slate-500 font-normal">फॉर्म बनने के बाद केंद्र पर दें</span>
                      </div>
                    </label>

                    <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs font-bold transition ${
                      paymentChoice === 'paid_online' ? 'bg-white border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400' : 'bg-white/50 border-slate-200 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="paymentChoice"
                        value="paid_online"
                        checked={paymentChoice === 'paid_online'}
                        onChange={() => setPaymentChoice('paid_online')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span>ऑनलाइन UPI द्वारा भुगतान</span>
                        <span className="block text-[10px] text-slate-500 font-normal">PhonePe / GPay / Paytm (8340622912)</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-500">
                    * सबमिट करने पर आपको ट्रैकिंग आईडी मिलेगी जिससे स्थिति जानी जा सकेगी।
                  </p>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 text-xs transition"
                    >
                      रद्द करें
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>सबमिट हो रहा है...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>आवेदन सबमिट करें</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </form>
            )}
          </div>

        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={previewDoc}
      />
    </>
  );
};
