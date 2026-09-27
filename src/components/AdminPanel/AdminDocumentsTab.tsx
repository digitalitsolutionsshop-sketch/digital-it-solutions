import React, { useState, useMemo } from 'react';
import type { ServiceRequest, UploadedDoc } from '../../types';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  HardDrive,
  CheckCircle,
  Clock,
  ExternalLink,
  Lock
} from 'lucide-react';
import { DocumentPreviewModal } from '../DocumentPreviewModal';

interface AdminDocumentsTabProps {
  requests: ServiceRequest[];
  onUpdateRequests: (requests: ServiceRequest[]) => void;
}

export const AdminDocumentsTab: React.FC<AdminDocumentsTabProps> = ({
  requests,
  onUpdateRequests,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
  
  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<UploadedDoc | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Flatten all documents across all requests
  const allDocuments = useMemo(() => {
    const list: { doc: UploadedDoc; request: ServiceRequest }[] = [];
    requests.forEach(req => {
      if (req.uploadedDocs && Array.isArray(req.uploadedDocs)) {
        req.uploadedDocs.forEach(d => {
          list.push({ doc: d, request: req });
        });
      }
    });
    return list;
  }, [requests]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return allDocuments.filter(({ doc, request }) => {
      const isExpired = doc.documentStatus === 'expired' || 
        (doc.expiresAt && new Date(doc.expiresAt) < new Date());

      if (statusFilter === 'ACTIVE' && isExpired) return false;
      if (statusFilter === 'EXPIRED' && !isExpired) return false;

      if (docTypeFilter !== 'ALL' && doc.docType !== docTypeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const applicantMatch = (request.applicantName || request.customerName || '').toLowerCase().includes(q);
        const tokenMatch = request.trackingToken.toLowerCase().includes(q);
        const fileMatch = doc.fileName.toLowerCase().includes(q);
        const nameMatch = doc.name.toLowerCase().includes(q);
        return applicantMatch || tokenMatch || fileMatch || nameMatch;
      }

      return true;
    });
  }, [allDocuments, searchQuery, docTypeFilter, statusFilter]);

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
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const handleDeleteDocument = async (reqId: string, docId: string) => {
    if (!window.confirm('क्या आप वाकई इस दस्तावेज को हटाना चाहते हैं? यह Cloudflare R2 से स्थायी रूप से हटा दिया जाएगा।')) {
      return;
    }

    try {
      await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete document API error:', e);
    }

    // Update parent requests state
    const updated = requests.map(req => {
      if (req.id === reqId || req.trackingToken === reqId) {
        return {
          ...req,
          uploadedDocs: req.uploadedDocs.filter(d => d.documentId !== docId)
        };
      }
      return req;
    });

    onUpdateRequests(updated);
  };

  return (
    <div className="space-y-5">
      
      {/* Overview Info Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Cloudflare R2 प्राइवेट दस्तावेज प्रबंधन (Private Document Vault)
            </h3>
          </div>
          <p className="text-xs text-blue-200 leading-relaxed max-w-2xl">
            सभी ग्राहकों के निजी पहचान व प्रमाणपत्र दस्तावेज क्लाउडफ्लेयर आर2 बकेट (cybercafe-private-documents) में सुरक्षित हैं। 6 माह की लाइफसाइकिल नीति के अनुसार पुराने दस्तावेज स्वतः सुरक्षित रूप से समाप्त हो जाते हैं।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-center">
            <span className="text-[10px] text-blue-200 block uppercase font-bold">कुल दस्तावेज</span>
            <span className="text-xl font-black text-white">{allDocuments.length}</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-center">
            <span className="text-[10px] text-emerald-300 block uppercase font-bold">सक्रिय</span>
            <span className="text-xl font-black text-emerald-300">
              {allDocuments.filter(d => d.doc.documentStatus !== 'expired').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="आवेदक का नाम, ट्रैकिंग टोकन या फाइल का नाम खोजें..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden flex-1 sm:flex-none"
          >
            <option value="ALL">सभी दस्तावेज प्रकार</option>
            <option value="caste_certificate">जाति प्रमाण पत्र</option>
            <option value="residence_certificate">निवास प्रमाण पत्र</option>
            <option value="income_certificate">आय प्रमाण पत्र</option>
            <option value="tenth_certificate">10वीं अंक पत्र</option>
            <option value="twelfth_certificate">12वीं अंक पत्र</option>
            <option value="aadhaar_card">आधार कार्ड</option>
            <option value="address_proof">पते का प्रमाण</option>
            <option value="id_proof">पहचान पत्र</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden flex-1 sm:flex-none"
          >
            <option value="ALL">सभी स्थिति</option>
            <option value="ACTIVE">सक्रिय (Active)</option>
            <option value="EXPIRED">समाप्त (Expired)</option>
          </select>
        </div>
      </div>

      {/* Documents Table / Card List */}
      {filteredDocs.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">दस्तावेज का प्रकार</th>
                  <th className="p-3.5">आवेदक / टोकन</th>
                  <th className="p-3.5">फाइल नाम व साइज</th>
                  <th className="p-3.5">अपलोड तिथि</th>
                  <th className="p-3.5">समाप्ति (6 माह)</th>
                  <th className="p-3.5">स्थिति</th>
                  <th className="p-3.5 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDocs.map(({ doc, request }) => {
                  const isExpired = doc.documentStatus === 'expired' || 
                    (doc.expiresAt && new Date(doc.expiresAt) < new Date());

                  return (
                    <tr key={doc.documentId} className="hover:bg-slate-50/80 transition">
                      
                      {/* Document Type */}
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block">{doc.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{doc.docType}</span>
                          </div>
                        </div>
                      </td>

                      {/* Applicant & Token */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">
                          {request.applicantName || request.customerName}
                        </span>
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {request.trackingToken}
                        </span>
                      </td>

                      {/* File Details */}
                      <td className="p-3.5">
                        <span className="font-medium text-slate-700 block truncate max-w-[150px]" title={doc.fileName}>
                          {doc.fileName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatFileSize(doc.fileSize)} • {doc.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                      </td>

                      {/* Upload Date */}
                      <td className="p-3.5 text-slate-600">
                        {formatDate(doc.uploadedAt)}
                      </td>

                      {/* Expiry Date */}
                      <td className="p-3.5">
                        <span className={isExpired ? 'text-red-600 font-bold' : 'text-slate-700'}>
                          {formatDate(doc.expiresAt)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            समाप्त (Expired)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            सक्रिय (R2)
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Button */}
                          <button
                            onClick={() => {
                              setPreviewDoc(doc);
                              setIsPreviewOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                            title="पूर्वावलोकन देखें (Preview)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Download Button */}
                          {isExpired ? (
                            <button
                              disabled
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-300 cursor-not-allowed"
                              title="दस्तावेज समाप्त हो चुका है"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <a
                              href={doc.downloadUrl || doc.previewUrl || `/api/documents/${doc.documentId}/download`}
                              download={doc.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                              title="डाउनलोड करें"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteDocument(request.id, doc.documentId)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                            title="दस्तावेज हटाएं (Delete from R2)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">कोई दस्तावेज नहीं मिला</h4>
          <p className="text-xs text-slate-500">
            वर्तमान में कोई अपलोड किया गया दस्तावेज मौजूद नहीं है या खोज मापदंड से मेल नहीं खा रहा।
          </p>
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={previewDoc}
      />

    </div>
  );
};
