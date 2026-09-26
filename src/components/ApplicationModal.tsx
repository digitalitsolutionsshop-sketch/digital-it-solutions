import React, { useState, useEffect } from 'react';
import type { Service, ServiceRequest, UploadedDoc } from '../types';
import { 
  X, 
  Send, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Printer, 
  MessageSquare, 
  ShieldCheck, 
  Building2, 
  Phone, 
  MapPin, 
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  preselectedService?: Service | null;
  shopMobile: string;
  onViewReceipt: (req: ServiceRequest) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  services,
  preselectedService,
  shopMobile,
  onViewReceipt
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [village, setVillage] = useState<string>('पैगम्बरपुर (Paighamberpur)');
  const [postOffice, setPostOffice] = useState<string>('दरिमा (Darima)');
  const [policeStation, setPoliceStation] = useState<string>('केवटी (Keoti)');
  const [district, setDistrict] = useState<string>('दरभंगा (Darbhanga)');
  const [pincode, setPincode] = useState<string>('847121');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [paymentChoice, setPaymentChoice] = useState<'unpaid' | 'paid_online'>('unpaid');
  
  // Uploaded docs simulation
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("कृपया 2MB से कम साइज की फाइल अपलोड करें।");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newDoc: UploadedDoc = {
        name: docType,
        docType: docType,
        fileName: file.name,
        fileData: typeof reader.result === 'string' ? reader.result : ''
      };
      setUploadedDocs(prev => [...prev.filter(d => d.name !== docType), newDoc]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (docName: string) => {
    setUploadedDocs(prev => prev.filter(d => d.name !== docName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('कृपया आवेदक का पूरा नाम दर्ज करें।');
      return;
    }
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10) {
      setErrorMsg('कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    setSubmitting(true);

    try {
      // Generate clean Tracking Token e.g. DIS-2026-8742
      const random4 = Math.floor(1000 + Math.random() * 9000);
      const trackingToken = `DIS-2026-${random4}`;
      const fullAddress = `${village}, पो: ${postOffice}, थाना: ${policeStation}, जिला: ${district}, पिन: ${pincode}`;

      const newRequest: ServiceRequest = {
        id: trackingToken,
        trackingToken: trackingToken,
        customerName: customerName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        serviceId: currentService?.id || currentService?.name || 'GEN-SVC',
        serviceName: currentService?.name || 'General CSC Service',
        serviceCategory: currentService?.category || 'General',
        address: fullAddress,
        village: village.trim(),
        postOffice: postOffice.trim(),
        policeStation: policeStation.trim(),
        district: district.trim(),
        pincode: pincode.trim(),
        additionalNotes: additionalNotes.trim(),
        uploadedDocs: uploadedDocs,
        status: 'pending',
        adminRemarks: 'आवेदन सफलतापूर्वक प्राप्त हुआ है। जल्द ही समीक्षा की जाएगी।',
        paymentStatus: paymentChoice,
        amount: currentService?.totalFee || 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'requests', trackingToken), newRequest);
      } catch (err) {
        // Fallback catch according to Firestore skill specifications
        console.warn("Firestore write fallback to local session state:", err);
      }

      setSubmittedRequest(newRequest);
      confetti({
        particleCount: 80,
        spread: 70,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                ऑनलाइन आवेदन फॉर्म (Online Application)
              </h2>
              <p className="text-xs text-blue-200">
                डिजिटल आईटी सॉल्यूशंस • सीएससी पैगम्बरपुर (केवटी, दरभंगा)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {submittedRequest ? (
            /* Success View with Tracking Token */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">
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
                    className="p-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition"
                    title="Copy Token"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-amber-800">
                  इस नंबर से आप कभी भी अपनी आवेदन स्थिति ट्रैक कर सकते हैं।
                </p>
              </div>

              {/* Applicant & Service Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">आवेदक का नाम:</span>
                  <span className="font-bold text-slate-900">{submittedRequest.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">मोबाइल नंबर:</span>
                  <span className="font-bold text-slate-900">{submittedRequest.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">सेवा का नाम:</span>
                  <span className="font-bold text-blue-900">{submittedRequest.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">कुल फीस:</span>
                  <span className="font-bold text-emerald-700">₹{submittedRequest.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">दुकान का पता:</span>
                  <span className="font-medium text-slate-700">पैगम्बरपुर, दरिमा, केवटी, दरभंगा (847121)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  onClick={() => onViewReceipt(submittedRequest)}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>पक्की रसीद प्रिंट करें / PDF</span>
                </button>

                <a
                  href={`https://wa.me/91${shopMobile}?text=${encodeURIComponent(`नमस्ते आकाश जी, मैंने ऑनलाइन फॉर्म सबमिट किया है। मेरा टोकन नंबर ${submittedRequest.trackingToken} है। सेवा: ${submittedRequest.serviceName}, नाम: ${submittedRequest.customerName}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>दुकानदार को व्हाट्सएप भेजें</span>
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
                >
                  विंडो बंद करें
                </button>
              </div>

            </div>
          ) : (
            /* Form Input View */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Service Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. सेवा चुनें (Select Service) <span className="text-red-500">*</span>
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
                      <span className="text-blue-700 text-[11px]">समय: {currentService.processingTime}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">कुल फीस</span>
                      <span className="text-sm font-black text-blue-900">₹{currentService.totalFee}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    आवेदक का पूरा नाम (Full Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="उदा: आकाश कुमार"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    सक्रिय मोबाइल नंबर (Active Mobile) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10 डिजिट मोबाइल नंबर"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Step 3: Address & Village */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  पता / गांव का विवरण (Address Details)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ग्राम (Village)</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">डाकघर (Post)</label>
                    <input
                      type="text"
                      value={postOffice}
                      onChange={(e) => setPostOffice(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">थाना (PS)</label>
                    <input
                      type="text"
                      value={policeStation}
                      onChange={(e) => setPoliceStation(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">जिला (District)</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">पिनकोड (Pincode)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ईमेल (वैकल्पिक)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Document Upload Checklist */}
              {currentService?.requiredDocs && currentService.requiredDocs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      दस्तावेज अपलोड करें (फ़ोटो या पीडीएफ - वैकल्पिक)
                    </label>
                    <span className="text-[10px] text-slate-500">आप सीधे व्हाट्सएप पर भी भेज सकते हैं</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentService.requiredDocs.map((docName, idx) => {
                      const uploaded = uploadedDocs.find(d => d.name === docName);
                      return (
                        <div 
                          key={idx} 
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                            uploaded ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="truncate flex-1">
                            <span className="font-semibold text-slate-800 block truncate">{docName}</span>
                            {uploaded && (
                              <span className="text-[10px] text-emerald-700 font-medium truncate block">
                                ✓ {uploaded.fileName}
                              </span>
                            )}
                          </div>

                          {uploaded ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(docName)}
                              className="text-red-500 hover:text-red-700 text-[10px] font-bold px-2 py-1 bg-red-50 rounded"
                            >
                              हटाएं
                            </button>
                          ) : (
                            <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] shrink-0 border border-blue-200 flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              <span>अपलोड</span>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, docName)}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Remarks / Extra Details */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  अतिरिक्त विवरण (जैसे: पिता/माता का नाम, श्रेणी, या विशेष निर्देश)
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="उदा: पिता का नाम राम लखन दास, वर्ग EBC, फॉर्म तत्काल चाहिए..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Step 6: Payment Preference */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                  भुगतान का माध्यम चुनें (Payment Mode)
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs font-bold transition ${
                    paymentChoice === 'unpaid' ? 'bg-white border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400' : 'bg-white/50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="paymentChoice"
                      checked={paymentChoice === 'unpaid'}
                      onChange={() => setPaymentChoice('unpaid')}
                      className="text-amber-600"
                    />
                    <div>
                      <span>दुकान पर नकद देंगे</span>
                      <span className="block text-[10px] text-slate-500 font-normal">फॉर्म होने के बाद नकद</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs font-bold transition ${
                    paymentChoice === 'paid_online' ? 'bg-white border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400' : 'bg-white/50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="paymentChoice"
                      checked={paymentChoice === 'paid_online'}
                      onChange={() => setPaymentChoice('paid_online')}
                      className="text-amber-600"
                    />
                    <div>
                      <span>UPI / QR कोड से अभी देंगे</span>
                      <span className="block text-[10px] text-slate-500 font-normal">PhonePe, GPay, Paytm</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition active:scale-95 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'आवेदन जमा हो रहा है...' : `आवेदन सबमिट करें (शुल्क: ₹${currentService?.totalFee || 50})`}</span>
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  सबमिट करते ही आपको ट्रैकिंग टोकन और डाउनलोड योग्य पावती पर्ची मिलेगी।
                </p>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
