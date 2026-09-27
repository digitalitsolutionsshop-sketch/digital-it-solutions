import React, { useState } from 'react';
import type { Service, Post, ServiceRequest, Transaction, ShopConfig, ApplicationStatus, PaymentMode, OnlineScheme } from '../../types';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Bell, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Printer, 
  MessageSquare, 
  ExternalLink, 
  ArrowUpRight, 
  IndianRupee, 
  TrendingUp, 
  Wallet, 
  LogOut, 
  X, 
  ShieldCheck,
  Download,
  Filter,
  Layers,
  Save,
  Check,
  HardDrive,
  Award
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { Logo } from '../Logo';
import { AdminDocumentsTab } from './AdminDocumentsTab';
import { AdminSchemesTab } from './AdminSchemesTab';
import { AdminR2ChecklistModal } from './AdminR2ChecklistModal';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  adminEmail: string;
  config: ShopConfig;
  onUpdateConfig: (newConfig: ShopConfig) => void;
  services: Service[];
  onUpdateServices: (services: Service[]) => void;
  posts: Post[];
  onUpdatePosts: (posts: Post[]) => void;
  requests: ServiceRequest[];
  onUpdateRequests: (requests: ServiceRequest[]) => void;
  transactions: Transaction[];
  onUpdateTransactions: (transactions: Transaction[]) => void;
  onViewReceipt: (req: ServiceRequest) => void;
  schemes?: OnlineScheme[];
  onUpdateSchemes?: (schemes: OnlineScheme[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onLogout,
  adminEmail,
  config,
  onUpdateConfig,
  services,
  onUpdateServices,
  posts,
  onUpdatePosts,
  requests,
  onUpdateRequests,
  transactions,
  onUpdateTransactions,
  onViewReceipt,
  schemes = [],
  onUpdateSchemes = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'transactions' | 'documents' | 'schemes' | 'posts' | 'services' | 'settings'>('overview');
  const [showR2Modal, setShowR2Modal] = useState<boolean>(false);

  // Filter and search states
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  
  const [txnSearch, setTxnSearch] = useState('');
  const [txnModeFilter, setTxnModeFilter] = useState<string>('all');

  // New Transaction Form Modal
  const [showAddTxnModal, setShowAddTxnModal] = useState(false);
  const [newTxn, setNewTxn] = useState({
    customerName: '',
    customerMobile: '',
    serviceName: services[0]?.name || 'CSC Service',
    amount: 50,
    govFee: 0,
    cyberCafeFee: 50,
    profit: 50,
    paymentMode: 'Cash' as PaymentMode,
    referenceId: '',
    notes: '',
  });

  // New / Edit Post Form Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    category: 'Sarkari Job' as Post['category'],
    content: '',
    lastDate: '',
    eligibility: '',
    applyFee: '',
    officialLink: '',
    isPinned: false,
  });

  // New / Edit Service Form Modal
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    hindiName: '',
    category: 'RTPS Bihar' as Service['category'],
    description: '',
    govFee: 0,
    serviceFee: 50,
    totalFee: 50,
    processingTime: '7-10 कार्य दिवस',
    requiredDocsStr: 'आधार कार्ड, फोटो, मोबाइल नंबर',
    isActive: true,
    popular: false,
  });

  // Request update state
  const [selectedReqForEdit, setSelectedReqForEdit] = useState<ServiceRequest | null>(null);
  const [updateStatus, setUpdateStatus] = useState<ApplicationStatus>('pending');
  const [updateRemarks, setUpdateRemarks] = useState('');
  const [updateAckNo, setUpdateAckNo] = useState('');

  // Shop Config Form state
  const [configForm, setConfigForm] = useState<ShopConfig>(config);
  const [configSaved, setConfigSaved] = useState(false);

  if (!isOpen) return null;

  // Real-time Calculations for Overview & Ledger
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date.includes(todayDateStr) || t.createdAt?.includes(todayDateStr));
  
  const todayRevenue = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const todayProfit = transactions.reduce((acc, curr) => acc + (curr.profit || curr.cyberCafeFee || 0), 0);
  
  const cashTotal = transactions.filter(t => t.paymentMode === 'Cash').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const upiTotal = transactions.filter(t => t.paymentMode === 'UPI').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
  const processingRequestsCount = requests.filter(r => r.status === 'processing').length;
  const completedRequestsCount = requests.filter(r => r.status === 'completed').length;
  const totalDocsCount = requests.reduce((acc, r) => acc + (r.uploadedDocs?.length || 0), 0);

  // Add Transaction Handler
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxn.customerName || !newTxn.amount) return;

    const random4 = Math.floor(1000 + Math.random() * 9000);
    const txnNum = `TXN-${new Date().getFullYear()}-${random4}`;

    const createdTxn: Transaction = {
      id: txnNum,
      transactionNumber: txnNum,
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      customerName: newTxn.customerName,
      customerMobile: newTxn.customerMobile,
      serviceName: newTxn.serviceName,
      amount: Number(newTxn.amount),
      govFee: Number(newTxn.govFee),
      cyberCafeFee: Number(newTxn.cyberCafeFee),
      profit: Number(newTxn.profit),
      paymentMode: newTxn.paymentMode,
      paymentStatus: 'success',
      referenceId: newTxn.referenceId,
      notes: newTxn.notes,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'transactions', txnNum), createdTxn);
    } catch (err) {
      console.warn("Firestore txn write fallback:", err);
    }

    onUpdateTransactions([createdTxn, ...transactions]);
    setShowAddTxnModal(false);
    setNewTxn({
      customerName: '',
      customerMobile: '',
      serviceName: services[0]?.name || 'CSC Service',
      amount: 50,
      govFee: 0,
      cyberCafeFee: 50,
      profit: 50,
      paymentMode: 'Cash',
      referenceId: '',
      notes: '',
    });
  };

  // Save Post Handler
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title.trim()) return;

    if (editingPostId) {
      // Edit
      const updatedList = posts.map(p => {
        if (p.id === editingPostId) {
          return {
            ...p,
            ...postForm,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      try {
        await updateDoc(doc(db, 'posts', editingPostId), {
          ...postForm,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore post update fallback:", err);
      }
      onUpdatePosts(updatedList);
    } else {
      // Create new
      const newId = `post-${Date.now()}`;
      const newPostObj: Post = {
        id: newId,
        ...postForm,
        author: config.proprietor,
        createdAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'posts', newId), newPostObj);
      } catch (err) {
        console.warn("Firestore post create fallback:", err);
      }
      onUpdatePosts([newPostObj, ...posts]);
    }

    setShowPostModal(false);
    setEditingPostId(null);
    setPostForm({
      title: '',
      category: 'Sarkari Job',
      content: '',
      lastDate: '',
      eligibility: '',
      applyFee: '',
      officialLink: '',
      isPinned: false,
    });
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('क्या आप सचमुच इस पोस्ट को हटाना चाहते हैं?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (err) {
      console.warn("Firestore delete post fallback:", err);
    }
    onUpdatePosts(posts.filter(p => p.id !== postId));
  };

  // Save Service Handler
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) return;

    const newId = `svc-${Date.now()}`;
    const docsArray = serviceForm.requiredDocsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newServiceObj: Service = {
      id: newId,
      name: serviceForm.name,
      hindiName: serviceForm.hindiName,
      category: serviceForm.category,
      description: serviceForm.description,
      govFee: Number(serviceForm.govFee),
      serviceFee: Number(serviceForm.serviceFee),
      totalFee: Number(serviceForm.govFee) + Number(serviceForm.serviceFee),
      processingTime: serviceForm.processingTime,
      requiredDocs: docsArray,
      isActive: serviceForm.isActive,
      popular: serviceForm.popular,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'services', newId), newServiceObj);
    } catch (err) {
      console.warn("Firestore service write fallback:", err);
    }

    onUpdateServices([newServiceObj, ...services]);
    setShowServiceModal(false);
  };

  // Update Request Status Handler
  const handleUpdateRequestStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForEdit) return;

    const updatedList = requests.map(r => {
      if (r.id === selectedReqForEdit.id) {
        return {
          ...r,
          status: updateStatus,
          adminRemarks: updateRemarks,
          acknowledgementNumber: updateAckNo,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    try {
      await updateDoc(doc(db, 'requests', selectedReqForEdit.id), {
        status: updateStatus,
        adminRemarks: updateRemarks,
        acknowledgementNumber: updateAckNo,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Firestore request update fallback:", err);
    }

    onUpdateRequests(updatedList);
    setSelectedReqForEdit(null);
  };

  // Save Shop Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'shopConfig', 'main'), configForm);
    } catch (err) {
      console.warn("Firestore config save fallback:", err);
    }
    onUpdateConfig(configForm);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesStatus = requestStatusFilter === 'all' || r.status === requestStatusFilter;
    const q = requestSearch.toLowerCase();
    const matchesSearch = !q ||
      r.customerName.toLowerCase().includes(q) ||
      r.mobile.includes(q) ||
      r.trackingToken.toLowerCase().includes(q) ||
      r.serviceName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesMode = txnModeFilter === 'all' || t.paymentMode === txnModeFilter;
    const q = txnSearch.toLowerCase();
    const matchesSearch = !q ||
      t.customerName.toLowerCase().includes(q) ||
      t.customerMobile.includes(q) ||
      t.serviceName.toLowerCase().includes(q) ||
      t.transactionNumber.toLowerCase().includes(q);
    return matchesMode && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-3xl max-w-6xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
        
        {/* Top Admin Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
              <Logo size="sm" variant="badge" showCscBadge={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black leading-tight">
                  दुकानदार एडमिन पोर्टल (Admin Portal)
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  लाइव एक्टिव
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {config.shopName} • संचालक: {config.proprietor} ({config.mobile})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowR2Modal(true)}
              className="px-3 py-1.5 rounded-xl bg-orange-600/30 hover:bg-orange-600/50 border border-orange-400/40 text-orange-200 text-xs font-bold flex items-center gap-1.5 transition"
              title="Cloudflare R2 Setup Checklist"
            >
              <HardDrive className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden md:inline">R2 स्टोरेज चेकलिस्ट</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">लॉगआउट</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'overview'
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>डैशबोर्ड अवलोकन</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'requests'
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ग्राहक आवेदन ({requests.length})</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-extrabold">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'documents'
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-4 h-4 text-blue-600" />
            <span>R2 दस्तावेज ({totalDocsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('schemes')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'schemes'
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>सरकारी योजनाएं ({schemes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'transactions'
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>खाता व लेन-देन ट्रैकर ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'posts'
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>सूचना पट्ट व पोस्ट ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'services'
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>सेवाएं व दर सूची ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition ${
              activeTab === 'settings'
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>दुकान सेटिंग्स</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* ===================== TAB 1: OVERVIEW DASHBOARD ===================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Cash Inflow */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-500">कुल लेन-देन राशि</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    ₹{todayRevenue.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    कैश: ₹{cashTotal} | UPI: ₹{upiTotal}
                  </p>
                </div>

                {/* Net Cafe Profit */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-emerald-700">साइबर कैफे मुनाफा (Profit)</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    ₹{todayProfit.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    100% सटीक दैनिक बचत गणना
                  </p>
                </div>

                {/* Pending Requests */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-amber-700">लंबित आवेदन (Pending)</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-700">
                    {pendingRequestsCount}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    कार्य प्रगति पर: {processingRequestsCount}
                  </p>
                </div>

                {/* Total Completed */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-blue-700">पूर्ण आवेदन (Delivered)</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-blue-900">
                    {completedRequestsCount}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    सक्रिय सेवाएं: {services.length}
                  </p>
                </div>

              </div>

              {/* Quick Actions Strip */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div>
                  <h3 className="font-bold text-sm">दुकान त्वरित कार्य (Quick Actions)</h3>
                  <p className="text-xs text-blue-200">ऑफलाइन या ऑनलाइन लेन-देन व सूचनाएं दर्ज करें</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddTxnModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>नया लेन-देन लिखें (Add Entry)</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingPostId(null);
                      setShowPostModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>नयी सरकारी पोस्ट लिखें</span>
                  </button>
                </div>
              </div>

              {/* Recent Pending Requests Queue */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">
                    हाल में प्राप्त ऑनलाइन आवेदन (Recent Requests)
                  </h3>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs text-blue-700 font-bold hover:underline"
                  >
                    सभी देखें ({requests.length}) →
                  </button>
                </div>

                {requests.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">अभी तक कोई ऑनलाइन आवेदन नहीं आया है।</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {requests.slice(0, 4).map(req => (
                      <div key={req.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-900">{req.trackingToken}</span>
                            <span className="font-bold text-slate-900">{req.customerName}</span>
                            <span className="text-slate-500">({req.mobile})</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{req.serviceName} • ₹{req.amount}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            req.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            req.status === 'documents_needed' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {req.status}
                          </span>

                          <button
                            onClick={() => {
                              setSelectedReqForEdit(req);
                              setUpdateStatus(req.status);
                              setUpdateRemarks(req.adminRemarks || '');
                              setUpdateAckNo(req.acknowledgementNumber || '');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px]"
                          >
                            स्थिति बदलें
                          </button>

                          <button
                            onClick={() => onViewReceipt(req)}
                            className="p-1 text-blue-700 hover:bg-blue-50 rounded"
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ===================== TAB 2: REQUESTS MANAGER ===================== */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              
              {/* Search & Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    placeholder="नाम, मोबाइल, टोकन या सेवा से खोजें..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {['all', 'pending', 'processing', 'documents_needed', 'completed', 'rejected'].map(st => (
                    <button
                      key={st}
                      onClick={() => setRequestStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
                        requestStatusFilter === st
                          ? 'bg-blue-900 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'all' ? 'सभी' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requests Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <tr>
                      <th className="p-3">टोकन / दिनांक</th>
                      <th className="p-3">आवेदक / मोबाइल</th>
                      <th className="p-3">सेवा</th>
                      <th className="p-3 text-right">शुल्क</th>
                      <th className="p-3 text-center">स्थिति</th>
                      <th className="p-3">सरकारी संदर्भ सं.</th>
                      <th className="p-3 text-right">कार्य</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          कोई आवेदन नहीं मिला
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3">
                            <span className="font-mono font-bold text-blue-900 block">{req.trackingToken}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(req.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </td>
                          <td className="p-3">
                            <strong className="text-slate-900 block">{req.customerName}</strong>
                            <span className="text-slate-500">{req.mobile}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800 block">{req.serviceName}</span>
                            <span className="text-[10px] text-slate-500">{req.serviceCategory}</span>
                          </td>
                          <td className="p-3 text-right font-black text-slate-900">
                            ₹{req.amount}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              req.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              req.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              req.status === 'documents_needed' ? 'bg-amber-100 text-amber-900' :
                              req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {req.acknowledgementNumber ? (
                              <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {req.acknowledgementNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedReqForEdit(req);
                                setUpdateStatus(req.status);
                                setUpdateRemarks(req.adminRemarks || '');
                                setUpdateAckNo(req.acknowledgementNumber || '');
                              }}
                              className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100"
                            >
                              अपडेट करें
                            </button>

                            <button
                              onClick={() => onViewReceipt(req)}
                              className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                              title="Print Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <a
                              href={`https://wa.me/91${req.mobile}?text=${encodeURIComponent(`नमस्ते ${req.customerName} जी, डिजिटल आईटी सॉल्यूशंस (सीएससी पैगम्बरपुर) से आपके टोकन ${req.trackingToken} (${req.serviceName}) की स्थिति: ${req.status}। टिप्पणी: ${req.adminRemarks || 'विवरण देखें'}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg inline-block"
                              title="Send WhatsApp Update"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ===================== TAB: CLOUDFLARE R2 PRIVATE DOCUMENTS ===================== */}
          {activeTab === 'documents' && (
            <AdminDocumentsTab
              requests={requests}
              onUpdateRequests={onUpdateRequests}
            />
          )}

          {/* ===================== TAB: ONLINE SCHEMES & SERVICES APPROVAL ===================== */}
          {activeTab === 'schemes' && (
            <AdminSchemesTab
              schemes={schemes}
              onUpdateSchemes={onUpdateSchemes}
            />
          )}

          {/* ===================== TAB 3: REAL-TIME TRANSACTIONS & KHATA ===================== */}
          {activeTab === 'transactions' && (
            <div className="space-y-5">
              
              {/* Top Summary & Add button */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">कुल हिसाब (Total Collection)</span>
                    <span className="text-xl font-black text-slate-900">₹{todayRevenue}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] font-bold uppercase text-emerald-600 block">शुद्ध मुनाफा (Net Profit)</span>
                    <span className="text-xl font-black text-emerald-700">₹{todayProfit}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4 text-xs text-slate-600">
                    <p>नकद (Cash): <strong>₹{cashTotal}</strong></p>
                    <p>यूपीआई (UPI): <strong>₹{upiTotal}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>खाता लेजर प्रिंट करें</span>
                  </button>

                  <button
                    onClick={() => setShowAddTxnModal(true)}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>नया लेन-देन लिखें</span>
                  </button>
                </div>
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={txnSearch}
                    onChange={(e) => setTxnSearch(e.target.value)}
                    placeholder="ग्राहक नाम, मोबाइल, सेवा या TXN ID खोजें..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {['all', 'Cash', 'UPI', 'AEPS'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setTxnModeFilter(mode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        txnModeFilter === mode
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mode === 'all' ? 'सभी माध्यम' : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <tr>
                      <th className="p-3">TXN सं. / समय</th>
                      <th className="p-3">ग्राहक का नाम व मोबाइल</th>
                      <th className="p-3">सेवा का नाम</th>
                      <th className="p-3 text-center">माध्यम (Mode)</th>
                      <th className="p-3 text-right">कुल शुल्क</th>
                      <th className="p-3 text-right">सरकारी शुल्क</th>
                      <th className="p-3 text-right text-emerald-800">कैफे मुनाफा</th>
                      <th className="p-3">संदर्भ / यूटीआर</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400">
                          कोई लेन-देन रिकॉर्ड नहीं मिला
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {t.transactionNumber}
                            <span className="text-[10px] text-slate-400 block font-sans font-normal">{t.date}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{t.customerName}</span>
                            <span className="text-slate-500 text-[11px]">{t.customerMobile || '-'}</span>
                          </td>
                          <td className="p-3 font-medium text-slate-800">
                            {t.serviceName}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.paymentMode === 'UPI' ? 'bg-sky-100 text-sky-800' :
                              t.paymentMode === 'Cash' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {t.paymentMode}
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-slate-900">
                            ₹{t.amount}
                          </td>
                          <td className="p-3 text-right text-slate-500 font-semibold">
                            ₹{t.govFee || 0}
                          </td>
                          <td className="p-3 text-right text-emerald-700 font-extrabold">
                            +₹{t.profit || t.cyberCafeFee}
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {t.referenceId || t.notes || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ===================== TAB 4: POSTS & NOTICES MANAGER ===================== */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">सूचना पट्ट प्रबंधन (Posts & Notices)</h3>
                  <p className="text-xs text-slate-500">सरकारी नौकरी, एडमिट कार्ड, और बिहार आरटीपीएस सूचनाएं</p>
                </div>

                <button
                  onClick={() => {
                    setEditingPostId(null);
                    setShowPostModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>नयी पोस्ट जोड़ें</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map(post => (
                  <div key={post.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {post.category}
                        </span>
                        {post.isPinned && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                            ★ Pinned
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{post.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{post.content}</p>

                      <div className="text-[11px] text-slate-500 flex justify-between pt-1">
                        <span>अंतिम तिथि: <strong>{post.lastDate || 'लागू नहीं'}</strong></span>
                        <span>शुल्क: {post.applyFee || 'विवरण देखें'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString('hi-IN')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingPostId(post.id);
                            setPostForm({
                              title: post.title,
                              category: post.category,
                              content: post.content,
                              lastDate: post.lastDate || '',
                              eligibility: post.eligibility || '',
                              applyFee: post.applyFee || '',
                              officialLink: post.officialLink || '',
                              isPinned: post.isPinned || false,
                            });
                            setShowPostModal(true);
                          }}
                          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 5: SERVICES MANAGER ===================== */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">साइबर कैफे सेवाएं एवं दर सूची</h3>
                  <p className="text-xs text-slate-500">सरकारी एवं साइबर कैफे शुल्क प्रबंधित करें</p>
                </div>

                <button
                  onClick={() => setShowServiceModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>नयी सेवा जोड़ें</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <tr>
                      <th className="p-3">सेवा का नाम</th>
                      <th className="p-3">श्रेणी</th>
                      <th className="p-3 text-right">सरकारी शुल्क</th>
                      <th className="p-3 text-right">कैफे चार्ज</th>
                      <th className="p-3 text-right">कुल शुल्क</th>
                      <th className="p-3">समय</th>
                      <th className="p-3 text-center">स्थिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map(svc => (
                      <tr key={svc.id || svc.name} className="hover:bg-slate-50">
                        <td className="p-3">
                          <strong className="text-slate-900 block">{svc.name}</strong>
                          <span className="text-[11px] text-blue-700">{svc.hindiName}</span>
                        </td>
                        <td className="p-3 text-slate-600">{svc.category}</td>
                        <td className="p-3 text-right text-slate-500">₹{svc.govFee}</td>
                        <td className="p-3 text-right text-slate-700 font-semibold">₹{svc.serviceFee}</td>
                        <td className="p-3 text-right text-slate-950 font-black">₹{svc.totalFee}</td>
                        <td className="p-3 text-slate-600 text-[11px]">{svc.processingTime}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            svc.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {svc.isActive ? 'सक्रिय' : 'बंद'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== TAB 6: SHOP SETTINGS ===================== */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">दुकान प्रोफाइल एवं सेटिंग्स</h3>
                  <p className="text-xs text-slate-500">नाम, पता, संपर्क नंबर और नोटिस टिकर</p>
                </div>
                {configSaved && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Check className="w-3.5 h-3.5" />
                    सेटिंग्स सहेजी गईं!
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">दुकान का नाम (Shop Name):</label>
                  <input
                    type="text"
                    value={configForm.shopName}
                    onChange={(e) => setConfigForm({ ...configForm, shopName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">संचालक का नाम (Proprietor):</label>
                    <input
                      type="text"
                      value={configForm.proprietor}
                      onChange={(e) => setConfigForm({ ...configForm, proprietor: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">मोबाइल नंबर (Primary Mobile):</label>
                    <input
                      type="text"
                      value={configForm.mobile}
                      onChange={(e) => setConfigForm({ ...configForm, mobile: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">दुकान का पूरा पता (Full Address):</label>
                  <input
                    type="text"
                    value={configForm.fullAddressString}
                    onChange={(e) => setConfigForm({ ...configForm, fullAddressString: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">UPI पेमेंट आईडी (UPI ID):</label>
                    <input
                      type="text"
                      value={configForm.upiId}
                      onChange={(e) => setConfigForm({ ...configForm, upiId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">दुकान खुलने का समय (Opening Hours):</label>
                    <input
                      type="text"
                      value={configForm.openingHours}
                      onChange={(e) => setConfigForm({ ...configForm, openingHours: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">होम पेज पर चलने वाली ताज़ा सूचना (Emergency Ticker Notice):</label>
                  <textarea
                    rows={2}
                    value={configForm.emergencyNotice}
                    onChange={(e) => setConfigForm({ ...configForm, emergencyNotice: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>दुकान विवरण अपडेट करें</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* ===================== MODAL: UPDATE REQUEST STATUS ===================== */}
      {selectedReqForEdit && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                आवेदन स्थिति अपडेट करें ({selectedReqForEdit.trackingToken})
              </h4>
              <button onClick={() => setSelectedReqForEdit(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateRequestStatus} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">आवेदक:</label>
                <p className="font-semibold text-slate-900">{selectedReqForEdit.customerName} ({selectedReqForEdit.mobile})</p>
                <p className="text-slate-500">{selectedReqForEdit.serviceName}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">कार्य स्थिति (Status):</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as ApplicationStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="pending">समीक्षा हेतु लंबित (Pending)</option>
                  <option value="processing">प्रक्रियाधीन (Processing at Portal)</option>
                  <option value="documents_needed">दस्तावेज चाहिए (Documents Needed)</option>
                  <option value="completed">पूर्ण / तैयार (Completed / Download Ready)</option>
                  <option value="rejected">अस्वीकृत (Rejected)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">सरकारी आवेदन / पावती सं. (Acknowledgement / Ref No):</label>
                <input
                  type="text"
                  value={updateAckNo}
                  onChange={(e) => setUpdateAckNo(e.target.value)}
                  placeholder="उदा: BRCCO/2026/192837"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ग्राहक हेतु संदेश / रिमार्क्स:</label>
                <textarea
                  rows={2}
                  value={updateRemarks}
                  onChange={(e) => setUpdateRemarks(e.target.value)}
                  placeholder="उदा: आपका फॉर्म सफलतापूर्वक भर दिया गया है। मूल पावती तैयार है।"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-900 text-white font-bold rounded-xl shadow-xs"
                >
                  सेव करें
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReqForEdit(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  रद्द
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD TRANSACTION ===================== */}
      {showAddTxnModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                नया लेन-देन दर्ज करें (Add Real-Time Transaction)
              </h4>
              <button onClick={() => setShowAddTxnModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ग्राहक का नाम *</label>
                <input
                  type="text"
                  required
                  value={newTxn.customerName}
                  onChange={(e) => setNewTxn({ ...newTxn, customerName: e.target.value })}
                  placeholder="उदा: विकास कुमार"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">मोबाइल नंबर</label>
                  <input
                    type="tel"
                    value={newTxn.customerMobile}
                    onChange={(e) => setNewTxn({ ...newTxn, customerMobile: e.target.value })}
                    placeholder="10 अंक"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">भुगतान माध्यम</label>
                  <select
                    value={newTxn.paymentMode}
                    onChange={(e) => setNewTxn({ ...newTxn, paymentMode: e.target.value as PaymentMode })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="Cash">Cash (नकद)</option>
                    <option value="UPI">UPI (QR / PhonePe)</option>
                    <option value="AEPS">AEPS (आधार एटीएम)</option>
                    <option value="Card">Card / ATM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">सेवा का नाम</label>
                <select
                  value={newTxn.serviceName}
                  onChange={(e) => {
                    const svc = services.find(s => s.name === e.target.value);
                    setNewTxn({
                      ...newTxn,
                      serviceName: e.target.value,
                      amount: svc?.totalFee || 50,
                      govFee: svc?.govFee || 0,
                      cyberCafeFee: svc?.serviceFee || 50,
                      profit: svc?.serviceFee || 50,
                    });
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {services.map(s => (
                    <option key={s.id || s.name} value={s.name}>{s.name} - ₹{s.totalFee}</option>
                  ))}
                  <option value="General Cyber Cafe Work">अन्य साइबर कैफे कार्य (Print/Typing)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">कुल राशि (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newTxn.amount}
                    onChange={(e) => {
                      const total = Number(e.target.value) || 0;
                      const profit = total - newTxn.govFee;
                      setNewTxn({ ...newTxn, amount: total, cyberCafeFee: profit, profit });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">सरकारी फीस (₹)</label>
                  <input
                    type="number"
                    value={newTxn.govFee}
                    onChange={(e) => {
                      const gov = Number(e.target.value) || 0;
                      const profit = newTxn.amount - gov;
                      setNewTxn({ ...newTxn, govFee: gov, profit });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-700 mb-1">कैफे बचत / लाभ (₹)</label>
                  <input
                    type="number"
                    value={newTxn.profit}
                    onChange={(e) => setNewTxn({ ...newTxn, profit: Number(e.target.value) || 0 })}
                    className="w-full p-2 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">यूटीआर / संदर्भ संख्या / टिप्पणी</label>
                <input
                  type="text"
                  value={newTxn.referenceId}
                  onChange={(e) => setNewTxn({ ...newTxn, referenceId: e.target.value })}
                  placeholder="उदा: UPI Ref No. या पर्ची नोट"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 text-white font-bold rounded-xl shadow-xs"
                >
                  लेन-देन दर्ज करें (Save)
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTxnModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  रद्द
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD / EDIT POST ===================== */}
      {showPostModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                {editingPostId ? 'पोस्ट संपादित करें' : 'नयी सरकारी सूचना / पोस्ट प्रकाशित करें'}
              </h4>
              <button onClick={() => setShowPostModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">शीर्षक (Post Title) *</label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="उदा: बिहार एसएससी इंटर स्तरीय बहाली ऑनलाइन फॉर्म"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">श्रेणी (Category)</label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value as Post['category'] })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="Sarkari Job">Sarkari Job (सरकारी नौकरी)</option>
                    <option value="Admit Card">Admit Card (एडमिट कार्ड)</option>
                    <option value="Result">Result (रिजल्ट)</option>
                    <option value="Bihar RTPS">Bihar RTPS (बिहार योजना)</option>
                    <option value="Admission / Scholarship">Admission / Scholarship (नामांकन/छात्रवृत्ति)</option>
                    <option value="CSC Update">CSC Update (सीएससी सूचना)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">अंतिम तिथि (Last Date)</label>
                  <input
                    type="text"
                    value={postForm.lastDate}
                    onChange={(e) => setPostForm({ ...postForm, lastDate: e.target.value })}
                    placeholder="उदा: 25 अक्टूबर 2026"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">विवरण / निर्देश (Content) *</label>
                <textarea
                  rows={3}
                  required
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="पदों की संख्या, महत्वपूर्ण निर्देश आदि..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">शैक्षणिक योग्यता</label>
                  <input
                    type="text"
                    value={postForm.eligibility}
                    onChange={(e) => setPostForm({ ...postForm, eligibility: e.target.value })}
                    placeholder="उदा: 10वीं / 12वीं / स्नातक"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">आवेदन शुल्क</label>
                  <input
                    type="text"
                    value={postForm.applyFee}
                    onChange={(e) => setPostForm({ ...postForm, applyFee: e.target.value })}
                    placeholder="उदा: Gen: ₹540, SC/ST: ₹135"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">आधिकारिक वेबसाइट लिंक</label>
                <input
                  type="url"
                  value={postForm.officialLink}
                  onChange={(e) => setPostForm({ ...postForm, officialLink: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={postForm.isPinned}
                  onChange={(e) => setPostForm({ ...postForm, isPinned: e.target.checked })}
                  className="rounded text-orange-600"
                />
                <span className="font-bold text-slate-800">होम पेज पर सबसे ऊपर पिन करें (Pin to Top)</span>
              </label>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 text-white font-bold rounded-xl shadow-xs"
                >
                  प्रकाशित करें (Publish)
                </button>
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  रद्द
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD SERVICE ===================== */}
      {showServiceModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                नयी सेवा सूची में जोड़ें
              </h4>
              <button onClick={() => setShowServiceModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">सेवा का अंग्रेजी नाम *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="उदा: Character Certificate Apply"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">सेवा का हिंदी नाम *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.hindiName}
                  onChange={(e) => setServiceForm({ ...serviceForm, hindiName: e.target.value })}
                  placeholder="उदा: चरित्र प्रमाण पत्र (आचरण प्रमाण पत्र)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">श्रेणी</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value as Service['category'] })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="RTPS Bihar">RTPS Bihar</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Aadhar Services">Aadhar Services</option>
                    <option value="Sarkari Jobs & Results">Sarkari Jobs & Results</option>
                    <option value="Student & Admission">Student & Admission</option>
                    <option value="Banking & AEPS">Banking & AEPS</option>
                    <option value="Electricity & Utilities">Electricity & Utilities</option>
                    <option value="Printing & Documentation">Printing & Documentation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">समय</label>
                  <input
                    type="text"
                    value={serviceForm.processingTime}
                    onChange={(e) => setServiceForm({ ...serviceForm, processingTime: e.target.value })}
                    placeholder="उदा: 10-14 कार्य दिवस"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">सरकारी शुल्क (₹)</label>
                  <input
                    type="number"
                    value={serviceForm.govFee}
                    onChange={(e) => setServiceForm({ ...serviceForm, govFee: Number(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">साइबर कैफे शुल्क (₹) *</label>
                  <input
                    type="number"
                    required
                    value={serviceForm.serviceFee}
                    onChange={(e) => setServiceForm({ ...serviceForm, serviceFee: Number(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ज़रूरी दस्तावेज (कॉमा लगाकर लिखें):</label>
                <input
                  type="text"
                  value={serviceForm.requiredDocsStr}
                  onChange={(e) => setServiceForm({ ...serviceForm, requiredDocsStr: e.target.value })}
                  placeholder="आधार कार्ड, पासपोर्ट फोटो, मोबाइल नंबर"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">संक्षिप्त विवरण</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="इस सेवा के बारे में संक्षिप्त जानकारी..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-900 text-white font-bold rounded-xl shadow-xs"
                >
                  सेवा जोड़ें
                </button>
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  रद्द
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cloudflare R2 Checklist Modal */}
      <AdminR2ChecklistModal
        isOpen={showR2Modal}
        onClose={() => setShowR2Modal(false)}
      />

    </div>
  );
};


