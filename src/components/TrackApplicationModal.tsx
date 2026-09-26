import React, { useState } from 'react';
import type { ServiceRequest } from '../types';
import { 
  X, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  MessageSquare, 
  ShieldCheck, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

interface TrackApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopMobile: string;
  onViewReceipt: (req: ServiceRequest) => void;
  allLocalRequests?: ServiceRequest[];
}

export const TrackApplicationModal: React.FC<TrackApplicationModalProps> = ({
  isOpen,
  onClose,
  shopMobile,
  onViewReceipt,
  allLocalRequests = []
}) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchedRequest, setSearchedRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchInput.trim().toUpperCase();
    if (!term) return;

    setLoading(true);
    setErrorMsg('');
    setHasSearched(true);
    setSearchedRequest(null);

    try {
      // 1. Try finding by ID / Token in Firestore
      const docRef = doc(db, 'requests', term);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSearchedRequest(docSnap.data() as ServiceRequest);
        setLoading(false);
        return;
      }

      // 2. Try finding by Mobile number query in Firestore
      try {
        const q = query(collection(db, 'requests'), where('mobile', '==', searchInput.trim()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setSearchedRequest(snap.docs[0].data() as ServiceRequest);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Firestore query fallback:", err);
      }

      // 3. Fallback: Check local state array
      const localFound = allLocalRequests.find(
        r => r.trackingToken.toUpperCase() === term || r.mobile === searchInput.trim()
      );
      if (localFound) {
        setSearchedRequest(localFound);
        setLoading(false);
        return;
      }

      setErrorMsg('इस टोकन या मोबाइल नंबर से कोई आवेदन नहीं मिला। कृपया नंबर जांचें या दुकानदार से संपर्क करें।');
    } catch (err) {
      console.error(err);
      // Local fallback
      const localFound = allLocalRequests.find(
        r => r.trackingToken.toUpperCase() === term || r.mobile === searchInput.trim()
      );
      if (localFound) {
        setSearchedRequest(localFound);
      } else {
        setErrorMsg('आवेदन खोजने में त्रुटि। कृपया सीधे व्हाट्सएप पर संपर्क करें।');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            तैयार / पूर्ण (Completed)
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            प्रक्रियाधीन (Processing)
          </span>
        );
      case 'documents_needed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            कागजात अपेक्षित (Docs Needed)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            अस्वीकृत (Rejected)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            समीक्षा हेतु लंबित (Pending)
          </span>
        );
    }
  };

  const getStepActive = (status: ServiceRequest['status'], stepNumber: number) => {
    if (status === 'rejected') return false;
    if (status === 'completed') return true;
    if (status === 'processing') return stepNumber <= 2;
    if (status === 'documents_needed') return stepNumber === 1;
    return stepNumber === 1;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-sky-400 font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                आवेदन स्थिति जांचें (Track Application)
              </h2>
              <p className="text-xs text-slate-300">
                टोकन नंबर या मोबाइल नंबर द्वारा लाइव स्टेटस देखें
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              टोकन नंबर अथवा 10-अंकों का मोबाइल नंबर दर्ज करें:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="उदा: DIS-2026-9812 या 8340622912"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-hidden uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-60 shrink-0"
              >
                {loading ? 'खोज रहे हैं...' : 'स्टेटस देखें'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>सूचना</span>
              </div>
              <p>{errorMsg}</p>
              <a
                href={`https://wa.me/91${shopMobile}?text=${encodeURIComponent(`नमस्ते आकाश जी, मैं अपने आवेदन का स्टेटस चेक करना चाहता हूँ। टोकन: ${searchInput}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline pt-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                दुकानदार से व्हाट्सएप पर स्टेटस पूछें
              </a>
            </div>
          )}

          {/* Results Display */}
          {searchedRequest && (
            <div className="space-y-6 pt-2">
              
              {/* Token & Status Header */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ट्रैकिंग टोकन ID</span>
                    <h3 className="text-lg font-mono font-black text-slate-900">{searchedRequest.trackingToken}</h3>
                  </div>
                  <div>
                    {getStatusBadge(searchedRequest.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">आवेदक:</span>
                    <strong className="text-slate-900 font-bold">{searchedRequest.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">मोबाइल:</span>
                    <span className="text-slate-900 font-semibold">{searchedRequest.mobile}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[11px]">सेवा (Service):</span>
                    <span className="text-blue-900 font-bold">{searchedRequest.serviceName}</span>
                  </div>
                </div>
              </div>

              {/* Progress Timeline Tracker */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">कार्य प्रगति स्थिति (Progress Timeline):</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  
                  {/* Step 1 */}
                  <div className={`p-2.5 rounded-xl border ${
                    getStepActive(searchedRequest.status, 1)
                      ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <span className="block text-xs font-mono font-bold">1</span>
                    <span>आवेदन प्राप्त</span>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-2.5 rounded-xl border ${
                    getStepActive(searchedRequest.status, 2)
                      ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <span className="block text-xs font-mono font-bold">2</span>
                    <span>पोर्टल प्रक्रिया</span>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-2.5 rounded-xl border ${
                    getStepActive(searchedRequest.status, 3)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <span className="block text-xs font-mono font-bold">3</span>
                    <span>पूर्ण / तैयार</span>
                  </div>

                </div>
              </div>

              {/* Admin Remarks & Reference No */}
              {searchedRequest.adminRemarks && (
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs space-y-1">
                  <span className="font-bold text-sky-950 block">दुकानदार का संदेश / स्थिति अपडेट:</span>
                  <p className="text-sky-900">{searchedRequest.adminRemarks}</p>
                </div>
              )}

              {searchedRequest.acknowledgementNumber && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">
                    सरकारी पावती / आवेदन संख्या (Govt Acknowledgement No):
                  </span>
                  <span className="text-sm font-mono font-black text-amber-950">
                    {searchedRequest.acknowledgementNumber}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => onViewReceipt(searchedRequest)}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>पक्की रसीद देखें / प्रिंट करें</span>
                </button>

                <a
                  href={`https://wa.me/91${shopMobile}?text=${encodeURIComponent(`नमस्ते आकाश जी, मेरे टोकन ${searchedRequest.trackingToken} (${searchedRequest.serviceName}) के संबंध में बात करनी है।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>व्हाट्सएप पर सहायता लें</span>
                </a>
              </div>

            </div>
          )}

          {/* Quick Help Footer */}
          {!searchedRequest && !hasSearched && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
              <p className="font-bold text-slate-800">टोकन कहां मिलेगा?</p>
              <p>
                जब आप इस पोर्टल पर कोई सेवा अनुरोध करते हैं, या साइबर कैफे पर फॉर्म भरवाते हैं, तब आपको <strong>DIS-2026-XXXX</strong> प्रारूप में टोकन आईडी मिलती है।
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
