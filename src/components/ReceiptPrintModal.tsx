import React from 'react';
import type { ServiceRequest, ShopConfig } from '../types';
import { Logo } from './Logo';
import { X, Printer, Download, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

interface ReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  config: ShopConfig;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  isOpen,
  onClose,
  request,
  config,
}) => {
  if (!isOpen || !request) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(request.createdAt).toLocaleString('hi-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const qrVerifyData = `https://ais-dev-fvd3pyhmeadeonzcwiqdmu-960580419028.asia-southeast1.run.app/?track=${request.trackingToken}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=2&data=${encodeURIComponent(qrVerifyData)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white animate-in fade-in duration-200">
      
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold">आधिकारिक ग्राहक पावती पर्ची (CSC Receipt)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट करें (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-4">
          
          {/* Official Shop Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center relative">
            <div className="flex items-center justify-between gap-4 mb-2">
              <Logo size="lg" variant="badge" />
              
              <div className="text-center flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-700 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded">
                  CSC E-GOVERNANCE & DIGITAL INDIA KIOSK
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
                  {config.shopName}
                </h1>
                <p className="text-xs font-bold text-blue-900">
                  ऑनलाइन साइबर कैफे, आरटीपीएस, पैन, आधार एवं नागरिक सेवा केंद्र
                </p>
                <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                  ग्राम: पैगम्बरपुर, पोस्ट: दरिमा, थाना: केवटी, जिला: दरभंगा (बिहार) - 847121
                </p>
                <p className="text-[11px] text-slate-800 font-bold">
                  संचालक: {config.proprietor} | मोबाइल: {config.mobile} | ईमेल: {config.email}
                </p>
              </div>

              {/* QR Verification */}
              <div className="shrink-0 text-center">
                <img src={qrUrl} alt="Verify QR" className="w-18 h-18 border border-slate-300 p-1 rounded" />
                <span className="text-[8px] font-bold text-slate-500 block mt-0.5">स्कैन कर जांचें</span>
              </div>
            </div>

            <div className="bg-slate-950 text-white py-1 px-3 text-xs font-bold tracking-wider uppercase flex justify-between items-center rounded-sm">
              <span>सेवा आवेदन पावती रसीद (SERVICE ACKNOWLEDGEMENT SLIP)</span>
              <span>CSC ID: {config.cscId}</span>
            </div>
          </div>

          {/* Token & Booking Details */}
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">ट्रैकिंग टोकन नंबर (Token ID)</span>
              <span className="text-base font-mono font-black text-blue-900">{request.trackingToken}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">दिनांक व समय (Date & Time)</span>
              <span className="font-semibold text-slate-800">{formattedDate}</span>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="py-3 border-b border-slate-300 space-y-2 text-xs">
            <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider bg-slate-100 p-1 rounded">
              1. आवेदक का विवरण (APPLICANT DETAILS)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 text-[11px] block">आवेदक का नाम:</span>
                <span className="font-bold text-slate-900 text-sm">{request.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">मोबाइल नंबर:</span>
                <span className="font-bold text-slate-900">{request.mobile}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">ईमेल:</span>
                <span className="font-medium text-slate-700">{request.email || 'उपलब्ध नहीं'}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-500 text-[11px] block">पूरा पता:</span>
                <span className="font-medium text-slate-800">{request.address}</span>
              </div>
            </div>
          </div>

          {/* Service & Fees Breakdown */}
          <div className="py-3 border-b border-slate-300 space-y-2 text-xs">
            <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider bg-slate-100 p-1 rounded">
              2. सेवा एवं शुल्क विवरण (SERVICE & FEE DETAILS)
            </h2>
            
            <table className="w-full border-collapse border border-slate-300 text-left mt-2">
              <thead>
                <tr className="bg-slate-50 text-[11px]">
                  <th className="border border-slate-300 p-2 font-bold">विवरण (Description)</th>
                  <th className="border border-slate-300 p-2 font-bold text-center">श्रेणी (Category)</th>
                  <th className="border border-slate-300 p-2 font-bold text-center">स्थिति (Status)</th>
                  <th className="border border-slate-300 p-2 font-bold text-right">राशि (Amount)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 font-semibold">
                    {request.serviceName}
                    {request.acknowledgementNumber && (
                      <span className="block text-[10px] text-blue-700 font-mono mt-0.5">
                        सरकारी आवेदन सं: {request.acknowledgementNumber}
                      </span>
                    )}
                  </td>
                  <td className="border border-slate-300 p-2 text-center">{request.serviceCategory}</td>
                  <td className="border border-slate-300 p-2 text-center uppercase font-bold text-[10px]">
                    {request.status}
                  </td>
                  <td className="border border-slate-300 p-2 text-right font-bold text-sm">
                    ₹{request.amount}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="border border-slate-300 p-2 text-right">
                    कुल देय राशि (Total Amount):
                  </td>
                  <td className="border border-slate-300 p-2 text-right text-base text-slate-950 font-black">
                    ₹{request.amount}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between items-center text-xs pt-1">
              <div>
                <span className="text-slate-500">भुगतान स्थिति: </span>
                <span className="font-bold uppercase text-emerald-700">
                  {request.paymentStatus === 'paid_online' ? '✓ ऑनलाइन भुगतान प्राप्त (Paid Online)' : 'दुकान पर देय (Cash on Delivery)'}
                </span>
              </div>
            </div>
          </div>

          {/* Remarks & Attached Docs */}
          {request.adminRemarks && (
            <div className="py-2 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-700">संचालक नोट / निर्देश: </span>
              <span className="text-slate-900">{request.adminRemarks}</span>
            </div>
          )}

          {/* Signatures & Seal */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <div className="w-24 h-24 mx-auto border-2 border-dashed border-blue-900/40 rounded-full flex flex-col items-center justify-center p-2 text-blue-900/60 uppercase text-[9px] font-black leading-tight">
                <span>DIGITAL IT</span>
                <span>SOLUTIONS</span>
                <span>PAIGHAMBERPUR</span>
                <span>★ CSC SEAL ★</span>
              </div>
              <p className="mt-1 font-bold text-slate-700">आधिकारिक सील (Official Seal)</p>
            </div>

            <div className="flex flex-col justify-end">
              <div className="border-b border-slate-900 w-44 mx-auto mb-1">
                <span className="font-serif italic font-bold text-slate-800 text-sm">Akash Kumar</span>
              </div>
              <p className="font-bold text-slate-900">अधिकृत हस्ताक्षरकर्ता (Authorized Signatory)</p>
              <p className="text-[10px] text-slate-500 font-medium">डिजिटल आईटी सॉल्यूशंस (दरभंगा)</p>
            </div>
          </div>

          {/* Notice & Disclaimer */}
          <div className="mt-6 pt-3 border-t border-slate-300 text-[10px] text-slate-500 text-center leading-normal">
            <p>
              * यह रसीद डिजिटल आईटी सॉल्यूशंस पैगम्बरपुर (दरभंगा) द्वारा अधिकृत है। मूल प्रमाण पत्र जारी होने पर SMS या इस पर्ची से प्राप्त करें।
            </p>
            <p>किसी भी सहायता हेतु संपर्क करें: 8340622912 | दुकान का पता: ग्राम पैगम्बरपुर, पो. दरिमा, थाना केवटी, दरभंगा 847121</p>
          </div>

        </div>

      </div>
    </div>
  );
};
