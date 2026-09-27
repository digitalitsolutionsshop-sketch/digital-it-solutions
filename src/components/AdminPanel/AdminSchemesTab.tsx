import React, { useState } from 'react';
import type { OnlineScheme, SchemeStatus, SchemeCategory } from '../../types';
import { 
  Award, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Building2, 
  Calendar,
  AlertTriangle,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

interface AdminSchemesTabProps {
  schemes: OnlineScheme[];
  onUpdateSchemes: (schemes: OnlineScheme[]) => void;
}

const SCHEME_CATEGORIES: SchemeCategory[] = [
  'Student & Education',
  'Admission & Examination',
  'Government Student Schemes',
  'Agriculture & Farmer Schemes',
  'Agriculture Survey',
  'Employment & Jobs',
  'Skill Development',
  'Government Forms & Public Welfare',
  'Bihar Government Services',
  'Central Government Services',
  'Other Verified Online Services'
];

export const AdminSchemesTab: React.FC<AdminSchemesTabProps> = ({
  schemes,
  onUpdateSchemes,
}) => {
  const [activeStatusTab, setActiveStatusTab] = useState<SchemeStatus | 'ALL'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // New Scheme Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newScheme, setNewScheme] = useState<Partial<OnlineScheme>>({
    title: '',
    description: '',
    category: 'Student & Education',
    department: '',
    state: 'Bihar',
    startDate: '',
    lastDate: '',
    eligibility: '',
    requiredDocs: [],
    officialUrl: '',
    sourceName: 'Official Portal',
    sourceUrl: '',
    status: 'pending'
  });
  const [docsInput, setDocsInput] = useState('');

  // Settings
  const [autoCollection, setAutoCollection] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [adminApprovalRequired, setAdminApprovalRequired] = useState(true);

  // Filter schemes
  const filteredSchemes = schemes.filter(s => {
    if (activeStatusTab !== 'ALL' && s.status !== activeStatusTab) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        s.title.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = schemes.filter(s => s.status === 'pending').length;
  const publishedCount = schemes.filter(s => s.status === 'published').length;
  const draftCount = schemes.filter(s => s.status === 'draft').length;
  const rejectedCount = schemes.filter(s => s.status === 'rejected').length;
  const expiredCount = schemes.filter(s => s.status === 'expired').length;

  // Sync official schemes from backend
  const handleSyncOfficial = async () => {
    setIsSyncing(true);
    setSyncMessage('');

    try {
      const res = await fetch('/api/schemes/official-sync');
      const data = await res.json();

      if (data.schemes && Array.isArray(data.schemes)) {
        let addedCount = 0;
        const currentUrls = new Set(schemes.map(s => s.officialUrl?.toLowerCase()));
        const currentTitles = new Set(schemes.map(s => s.title?.toLowerCase()));

        const newItems: OnlineScheme[] = [];

        for (const os of data.schemes) {
          // Strict duplicate detection (Requirement #21)
          if (!currentUrls.has(os.officialUrl?.toLowerCase()) && !currentTitles.has(os.title?.toLowerCase())) {
            const schemeToAdd: OnlineScheme = {
              ...os,
              id: os.id || `SCHEME-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
              status: autoPublish ? 'published' : 'pending',
              createdAt: new Date().toISOString()
            };

            try {
              await setDoc(doc(db, 'schemes', schemeToAdd.id), schemeToAdd);
            } catch (err) {
              console.warn("Firestore scheme save fallback:", err);
            }

            newItems.push(schemeToAdd);
            addedCount++;
          }
        }

        if (addedCount > 0) {
          onUpdateSchemes([...newItems, ...schemes]);
          setSyncMessage(`✓ ${addedCount} नई आधिकारिक सरकारी योजनाएं जोड़ी गईं!`);
        } else {
          setSyncMessage('सभी आधिकारिक योजनाएं पहले से ही अद्यतन हैं (कोई डुप्लीकेट नहीं पाया गया)।');
        }
      }
    } catch (err: any) {
      console.error(err);
      setSyncMessage('आधिकारिक पोर्टल सिंक करने में समस्या आई।');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 4000);
    }
  };

  // Change scheme status (Approve, Reject, Expire)
  const handleUpdateStatus = async (schemeId: string, newStatus: SchemeStatus) => {
    try {
      await updateDoc(doc(db, 'schemes', schemeId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore update fallback:', err);
    }

    const updated = schemes.map(s => s.id === schemeId ? { ...s, status: newStatus } : s);
    onUpdateSchemes(updated);
  };

  // Delete scheme
  const handleDeleteScheme = async (schemeId: string) => {
    if (!window.confirm('क्या आप वाकई इस योजना को हटाना चाहते हैं?')) return;

    try {
      await deleteDoc(doc(db, 'schemes', schemeId));
    } catch (err) {
      console.warn('Firestore delete fallback:', err);
    }

    onUpdateSchemes(schemes.filter(s => s.id !== schemeId));
  };

  // Add new scheme manually
  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheme.title || !newScheme.officialUrl) {
      alert('कृपया शीर्षक एवं आधिकारिक URL अनिवार्य रूप से दर्ज करें।');
      return;
    }

    const docsArray = docsInput.split(',').map(d => d.trim()).filter(Boolean);
    const id = `SCHEME-${Date.now()}`;
    const schemeItem: OnlineScheme = {
      id,
      title: newScheme.title || '',
      description: newScheme.description || '',
      category: (newScheme.category as SchemeCategory) || 'Student & Education',
      department: newScheme.department || 'Government Department',
      state: newScheme.state || 'Bihar',
      startDate: newScheme.startDate || '',
      lastDate: newScheme.lastDate || '',
      eligibility: newScheme.eligibility || 'All eligible citizens',
      requiredDocs: docsArray,
      officialUrl: newScheme.officialUrl || '',
      sourceName: newScheme.sourceName || 'Official Source',
      sourceUrl: newScheme.sourceUrl || newScheme.officialUrl || '',
      detectedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'schemes', id), schemeItem);
    } catch (err) {
      console.warn('Firestore save fallback:', err);
    }

    onUpdateSchemes([schemeItem, ...schemes]);
    setShowAddModal(false);
    setNewScheme({
      title: '',
      description: '',
      category: 'Student & Education',
      department: '',
      state: 'Bihar',
      startDate: '',
      lastDate: '',
      eligibility: '',
      requiredDocs: [],
      officialUrl: '',
      sourceName: 'Official Portal',
      sourceUrl: '',
      status: 'pending'
    });
    setDocsInput('');
  };

  return (
    <div className="space-y-5">
      
      {/* Top Action Ribbon */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">
              सरकारी योजनाएं एवं सेवाएं अनुमोदन प्रणाली (Admin Approval System)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            सत्यापित आधिकारिक पोर्टलों से नई सूचनाएं एकत्र करें, समीक्षा करें और अनुमोदित करके प्रकाशित करें।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sync Button */}
          <button
            onClick={handleSyncOfficial}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>सिंक हो रहा है...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>सरकारी पोर्टल सिंक</span>
              </>
            )}
          </button>

          {/* Add Scheme Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नई योजना जोड़ें</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Admin Settings Strip (Requirement #23) */}
      <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
        <span className="font-bold text-slate-700">स्वचालन एवं अनुमोदन सेटिंग्स:</span>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCollection}
              onChange={(e) => setAutoCollection(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-700">Automatic Collection (ON)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={adminApprovalRequired}
              onChange={(e) => setAdminApprovalRequired(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-700">Admin Approval Required (ON)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-700">Trusted Source Auto-Publish (OFF)</span>
          </label>
        </div>
      </div>

      {/* Sub-Tabs: Pending Review, Published, Draft, Rejected, Expired */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveStatusTab('pending')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeStatusTab === 'pending'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>समीक्षा लंबित (Pending Review)</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-white">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStatusTab('published')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeStatusTab === 'published'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>प्रकाशित (Published)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {publishedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusTab('draft')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeStatusTab === 'draft'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>ड्राफ्ट (Draft)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {draftCount}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusTab('rejected')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeStatusTab === 'rejected'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>अस्वीकृत (Rejected)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {rejectedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusTab('expired')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeStatusTab === 'expired'
              ? 'bg-slate-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>समाप्त (Expired)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {expiredCount}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusTab('ALL')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeStatusTab === 'ALL'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>सभी ({schemes.length})</span>
        </button>
      </div>

      {/* Schemes List */}
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                    {scheme.category}
                  </span>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    scheme.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                    scheme.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    scheme.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {scheme.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {scheme.title}
                </h4>

                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{scheme.department}</span>
                  <span className="font-semibold text-blue-900">({scheme.state})</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {scheme.description}
                </p>

                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <div><strong>पात्रता:</strong> {scheme.eligibility}</div>
                  {scheme.lastDate && <div><strong>अंतिम तिथि:</strong> {scheme.lastDate}</div>}
                  <div><strong>स्रोत:</strong> {scheme.sourceName}</div>
                </div>
              </div>

              {/* Action Buttons: Approve, Reject, Expire, View Source, Delete */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <a
                  href={scheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>आधिकारिक पोर्टल</span>
                </a>

                <div className="flex items-center gap-1.5">
                  {scheme.status !== 'published' && (
                    <button
                      onClick={() => handleUpdateStatus(scheme.id, 'published')}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>प्रकाशित करें (Approve)</span>
                    </button>
                  )}

                  {scheme.status !== 'rejected' && scheme.status !== 'expired' && (
                    <button
                      onClick={() => handleUpdateStatus(scheme.id, 'rejected')}
                      className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>अस्वीकृत</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteScheme(scheme.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">इस श्रेणी में कोई योजना नहीं है</h4>
          <p className="text-xs text-slate-500">
            आप ऊपर "सरकारी पोर्टल सिंक" बटन दबाकर आधिकारिक योजनाओं को स्वतः आयात कर सकते हैं।
          </p>
        </div>
      )}

      {/* Add New Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                नई सरकारी योजना / सेवा जोड़ें
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  योजना / सूचना का शीर्षक <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newScheme.title}
                  onChange={(e) => setNewScheme({ ...newScheme, title: e.target.value })}
                  placeholder="उदा: बिहार पोस्ट मैट्रिक स्कॉलरशिप 2026"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">श्रेणी (Category)</label>
                  <select
                    value={newScheme.category}
                    onChange={(e) => setNewScheme({ ...newScheme, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {SCHEME_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">राज्य / केंद्र</label>
                  <input
                    type="text"
                    value={newScheme.state}
                    onChange={(e) => setNewScheme({ ...newScheme, state: e.target.value })}
                    placeholder="Bihar या Central"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">विभाग (Department)</label>
                <input
                  type="text"
                  value={newScheme.department}
                  onChange={(e) => setNewScheme({ ...newScheme, department: e.target.value })}
                  placeholder="उदा: शिक्षा विभाग, बिहार सरकार"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">विवरण (Description)</label>
                <textarea
                  rows={2}
                  value={newScheme.description}
                  onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })}
                  placeholder="योजना के लाभ और मुख्य बिंदु..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">प्रारंभ तिथि</label>
                  <input
                    type="date"
                    value={newScheme.startDate}
                    onChange={(e) => setNewScheme({ ...newScheme, startDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">अंतिम तिथि (Last Date)</label>
                  <input
                    type="date"
                    value={newScheme.lastDate}
                    onChange={(e) => setNewScheme({ ...newScheme, lastDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">पात्रता (Eligibility)</label>
                <input
                  type="text"
                  value={newScheme.eligibility}
                  onChange={(e) => setNewScheme({ ...newScheme, eligibility: e.target.value })}
                  placeholder="उदा: 10वीं पास, बिहार का मूल निवासी"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">आवश्यक दस्तावेज (कॉमा से अलग करें)</label>
                <input
                  type="text"
                  value={docsInput}
                  onChange={(e) => setDocsInput(e.target.value)}
                  placeholder="आधार कार्ड, जाति प्रमाण पत्र, 10वीं मार्कशीट..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  आधिकारिक वेबसाइट URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={newScheme.officialUrl}
                  onChange={(e) => setNewScheme({ ...newScheme, officialUrl: e.target.value })}
                  placeholder="https://pmsonline.bih.nic.in"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-700"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl"
                >
                  सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
