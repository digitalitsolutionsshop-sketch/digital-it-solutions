import React from 'react';
import { X, Download, FileText, ExternalLink, Calendar, HardDrive, ShieldCheck } from 'lucide-react';
import type { UploadedDoc } from '../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: UploadedDoc | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  if (!isOpen || !document) return null;

  const isExpired = document.documentStatus === 'expired' || 
    (document.expiresAt && new Date(document.expiresAt) < new Date());

  const isPdf = document.fileType?.includes('pdf') || document.fileName?.toLowerCase().endsWith('.pdf');
  const isImage = document.fileType?.startsWith('image/') || 
    document.fileName?.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/i);

  const previewSrc = document.previewUrl || document.fileData || '';
  const downloadSrc = document.downloadUrl || document.previewUrl || document.fileData || '';

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleDateString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{document.name}</span>
                {isExpired ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                    समाप्त (Expired)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    सुरक्षित (Cloudflare R2)
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {document.fileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isExpired && downloadSrc && (
              <a
                href={downloadSrc}
                download={document.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                title="Download"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">डाउनलोड</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata info strip */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
              <span>साइज: <strong>{formatFileSize(document.fileSize)}</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>अपलोड: <strong>{formatDate(document.uploadedAt)}</strong></span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            वैधता (6 माह): <strong>{formatDate(document.expiresAt)}</strong>
          </div>
        </div>

        {/* Preview Content Area */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-50 flex items-center justify-center min-h-[350px]">
          {isExpired ? (
            <div className="text-center p-8 max-w-md bg-white rounded-2xl border border-red-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <X className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                दस्तावेज 6 माह पश्चात सुरक्षित रूप से हटाया जा चुका है
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                क्लाउडफ्लेयर आर2 लाइफसाइकिल नीति (Cloudflare R2 Lifecycle Policy) के अंतर्गत ग्राहक के गोपनीय दस्तावेजों को 6 माह बाद स्वतः स्थायी रूप से हटा दिया जाता है।
              </p>
              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                नोट: आवेदक का मूल रिकॉर्ड एवं रसीद साइबर कैफे डेटाबेस में सुरक्षित है।
              </div>
            </div>
          ) : isPdf ? (
            <div className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-300 bg-white">
              <iframe
                src={`${previewSrc}#toolbar=0`}
                title={document.name}
                className="w-full h-full"
              />
            </div>
          ) : isImage ? (
            <div className="max-w-full max-h-[500px] flex items-center justify-center rounded-xl overflow-hidden bg-slate-900/5 p-2 border border-slate-200">
              <img
                src={previewSrc}
                alt={document.name}
                className="max-w-full max-h-[480px] object-contain rounded-lg shadow-md"
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-sm">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">
                {document.fileName}
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                सीधे पूर्वावलोकन समर्थित नहीं है।
              </p>
              {downloadSrc && (
                <a
                  href={downloadSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500"
                >
                  <ExternalLink className="w-4 h-4" />
                  दस्तावेज खोलें
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white p-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>डिजिटल आईटी सॉल्यूशंस • निजी एवं एन्क्रिप्टेड स्टोरेज</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
