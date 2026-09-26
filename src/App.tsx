/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import type { Service, Post, ServiceRequest, Transaction, ShopConfig, ApplicationStatus } from './types';
import { 
  db, 
  auth, 
  testConnection, 
  seedInitialDataIfNeeded, 
  DEFAULT_SHOP_CONFIG, 
  INITIAL_SERVICES, 
  INITIAL_POSTS, 
  INITIAL_TRANSACTIONS,
  ADMIN_EMAIL,
  handleFirestoreError,
  OperationType
} from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceCatalog } from './components/ServiceCatalog';
import { SarkariPosts } from './components/SarkariPosts';
import { QuickLinks } from './components/QuickLinks';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { ToastContainer } from './components/ToastContainer';
import { ApplicationModal } from './components/ApplicationModal';
import { TrackApplicationModal } from './components/TrackApplicationModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { AdminLogin } from './components/AdminPanel/AdminLogin';
import { AdminDashboard } from './components/AdminPanel/AdminDashboard';
import { Footer } from './components/Footer';
import { useLanguage } from './context/LanguageContext';
import { useToast } from './context/ToastContext';

import { 
  Phone, 
  MessageSquare, 
  Send, 
  Search, 
  QrCode, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function App() {
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const isInitialRequestsLoadRef = useRef<boolean>(true);
  const prevRequestsMapRef = useRef<Map<string, ServiceRequest>>(new Map());

  // Master Datasets with fallbacks
  const [config, setConfig] = useState<ShopConfig>(DEFAULT_SHOP_CONFIG);
  const [services, setServices] = useState<Service[]>(
    INITIAL_SERVICES.map((s, idx) => ({ ...s, id: `svc-${idx + 1}` }))
  );
  const [posts, setPosts] = useState<Post[]>(
    INITIAL_POSTS.map((p, idx) => ({ ...p, id: `post-${idx + 1}` }))
  );
  const [transactions, setTransactions] = useState<Transaction[]>(
    INITIAL_TRANSACTIONS.map((t, idx) => ({ ...t, id: t.transactionNumber }))
  );
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  // Navigation & Modals State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  
  const [showTrackModal, setShowTrackModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showAdminDashboardModal, setShowAdminDashboardModal] = useState<boolean>(false);
  
  const [activeReceiptRequest, setActiveReceiptRequest] = useState<ServiceRequest | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>('');

  // 1. Initial Boot: Validate Firestore connection & seed data
  useEffect(() => {
    testConnection();
    seedInitialDataIfNeeded();
  }, []);

  // 2. Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminEmail(user.email || ADMIN_EMAIL);
        setIsAdminLoggedIn(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Real-time Firestore Listeners
  useEffect(() => {
    // Services listener
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      if (!snap.empty) {
        const loaded: Service[] = snap.docs.map(d => ({ ...(d.data() as Service), id: d.id }));
        setServices(loaded);
      }
    }, (err) => {
      console.warn("Firestore services snapshot fallback to local:", err.message);
    });

    // Posts listener
    const unsubPosts = onSnapshot(collection(db, 'posts'), (snap) => {
      if (!snap.empty) {
        const loaded: Post[] = snap.docs.map(d => ({ ...(d.data() as Post), id: d.id }));
        setPosts(loaded);
      }
    }, (err) => {
      console.warn("Firestore posts snapshot fallback to local:", err.message);
    });

    // Shop Config listener
    const unsubConfig = onSnapshot(doc(db, 'shopConfig', 'main'), (snap) => {
      if (snap.exists()) {
        setConfig(snap.data() as ShopConfig);
      }
    }, (err) => {
      console.warn("Firestore shopConfig snapshot fallback:", err.message);
    });

    // Requests listener
    const unsubRequests = onSnapshot(collection(db, 'requests'), (snap) => {
      if (!snap.empty) {
        const loaded: ServiceRequest[] = snap.docs.map(d => ({ ...(d.data() as ServiceRequest), id: d.id }));
        setRequests(loaded);
      }
    }, (err) => {
      console.warn("Firestore requests snapshot fallback:", err.message);
    });

    // Transactions listener
    const unsubTxns = onSnapshot(collection(db, 'transactions'), (snap) => {
      if (!snap.empty) {
        const loaded: Transaction[] = snap.docs.map(d => ({ ...(d.data() as Transaction), id: d.id }));
        setTransactions(loaded);
      }
    }, (err) => {
      console.warn("Firestore transactions snapshot fallback:", err.message);
    });

    return () => {
      unsubServices();
      unsubPosts();
      unsubConfig();
      unsubRequests();
      unsubTxns();
    };
  }, []);

  // Handlers
  const handleSelectServiceToApply = (svc: Service) => {
    setPreselectedService(svc);
    setShowApplyModal(true);
  };

  const handleApplyForPost = (post: Post) => {
    const matchedService = services.find(s => s.name.toLowerCase().includes('job') || s.category === 'Sarkari Jobs & Results');
    setPreselectedService(matchedService || null);
    setShowApplyModal(true);
  };

  const handleViewReceipt = (req: ServiceRequest) => {
    setActiveReceiptRequest(req);
    setShowReceiptModal(true);
  };

  const handleAdminLoginSuccess = (email: string) => {
    setAdminEmail(email);
    setIsAdminLoggedIn(true);
    setShowAdminDashboardModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log(e);
    }
    setIsAdminLoggedIn(false);
    setAdminEmail('');
    setShowAdminDashboardModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Sticky Navigation Bar */}
      <Navbar
        config={config}
        onOpenTrack={() => setShowTrackModal(true)}
        onOpenApply={() => {
          setPreselectedService(null);
          setShowApplyModal(true);
        }}
        onOpenPayment={() => setShowPaymentModal(true)}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setShowAdminDashboardModal(true);
          } else {
            setShowAdminLoginModal(true);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Sections based on activeTab */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              config={config}
              services={services}
              onSelectService={handleSelectServiceToApply}
              onOpenApply={() => {
                setPreselectedService(null);
                setShowApplyModal(true);
              }}
              onOpenTrack={() => setShowTrackModal(true)}
              onOpenPayment={() => setShowPaymentModal(true)}
              onExploreServices={() => {
                const el = document.getElementById('services-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Pinned / Latest Sarkari Notices Preview */}
            <div className="bg-white border-y border-slate-200">
              <SarkariPosts
                posts={posts}
                onApplyForPost={handleApplyForPost}
                shopMobile={config.mobile}
              />
            </div>

            {/* Services Catalog */}
            <div id="services-section">
              <ServiceCatalog
                services={services}
                onSelectService={handleSelectServiceToApply}
                shopMobile={config.mobile}
              />
            </div>

            {/* Customer Testimonials & Reviews Section */}
            <div id="testimonials-section" className="bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200">
              <Testimonials shopMobile={config.mobile} />
            </div>

            {/* Common Cyber Cafe FAQs & Requirements Guide */}
            <FAQ
              shopMobile={config.mobile}
              onOpenApply={() => {
                setPreselectedService(null);
                setShowApplyModal(true);
              }}
              onOpenTrack={() => setShowTrackModal(true)}
            />

            {/* Quick Government Portal Links */}
            <div className="bg-slate-100 border-t border-slate-200">
              <QuickLinks />
            </div>
          </>
        )}

        {activeTab === 'faq' && (
          <div className="py-6">
            <FAQ
              shopMobile={config.mobile}
              onOpenApply={() => {
                setPreselectedService(null);
                setShowApplyModal(true);
              }}
              onOpenTrack={() => setShowTrackModal(true)}
            />
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="py-6">
            <Testimonials shopMobile={config.mobile} />
          </div>
        )}

        {activeTab === 'services' && (
          <div className="py-6">
            <ServiceCatalog
              services={services}
              onSelectService={handleSelectServiceToApply}
              shopMobile={config.mobile}
            />
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="py-6">
            <SarkariPosts
              posts={posts}
              onApplyForPost={handleApplyForPost}
              shopMobile={config.mobile}
            />
          </div>
        )}

        {activeTab === 'links' && (
          <div className="py-6">
            <QuickLinks />
          </div>
        )}
      </main>

      {/* Floating Quick Action Sticky Bar for Mobile Users */}
      <aside aria-label="Quick mobile actions" className="sm:hidden fixed bottom-3 inset-x-3 z-40 bg-slate-950/95 backdrop-blur-md text-white p-2 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-between gap-1">
        <a
          href={`tel:${config.mobile}`}
          className="flex-1 py-2 px-1 text-center rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold flex flex-col items-center gap-0.5"
        >
          <Phone className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.mobileCall}</span>
        </a>

        <a
          href={`https://wa.me/91${config.mobile}?text=${encodeURIComponent(
            language === 'hi' 
              ? 'नमस्ते आकाश जी, मुझे साइबर कैफे सेवा के बारे में पूछना है।' 
              : 'Hello Akash ji, I want to inquire about cyber cafe services.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-1 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[11px] font-bold flex flex-col items-center gap-0.5"
        >
          <MessageSquare className="w-3.5 h-3.5 fill-white text-emerald-900" />
          <span>{t.mobileWhatsapp}</span>
        </a>

        <button
          onClick={() => {
            setPreselectedService(null);
            setShowApplyModal(true);
          }}
          className="flex-1 py-2 px-1 text-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-[11px] font-bold flex flex-col items-center gap-0.5 shadow-md shadow-orange-500/30"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{t.mobileForm}</span>
        </button>

        <button
          onClick={() => setShowTrackModal(true)}
          className="flex-1 py-2 px-1 text-center rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold flex flex-col items-center gap-0.5"
        >
          <Search className="w-3.5 h-3.5 text-sky-400" />
          <span>{t.mobileStatus}</span>
        </button>
      </aside>

      {/* Comprehensive Footer */}
      <Footer
        config={config}
        onOpenApply={() => {
          setPreselectedService(null);
          setShowApplyModal(true);
        }}
        onOpenTrack={() => setShowTrackModal(true)}
        onOpenPayment={() => setShowPaymentModal(true)}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setShowAdminDashboardModal(true);
          } else {
            setShowAdminLoginModal(true);
          }
        }}
      />

      {/* Online Application Modal */}
      <ApplicationModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        services={services}
        preselectedService={preselectedService}
        shopMobile={config.mobile}
        onViewReceipt={(req) => {
          setShowApplyModal(false);
          setActiveReceiptRequest(req);
          setShowReceiptModal(true);
        }}
      />

      {/* Track Application Status Modal */}
      <TrackApplicationModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        shopMobile={config.mobile}
        allLocalRequests={requests}
        onViewReceipt={(req) => {
          setShowTrackModal(false);
          setActiveReceiptRequest(req);
          setShowReceiptModal(true);
        }}
      />

      {/* Dynamic UPI Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        config={config}
      />

      {/* Printable Receipt Modal */}
      <ReceiptPrintModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        request={activeReceiptRequest}
        config={config}
      />

      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Panel Dashboard */}
      <AdminDashboard
        isOpen={showAdminDashboardModal}
        onClose={() => setShowAdminDashboardModal(false)}
        onLogout={handleLogout}
        adminEmail={adminEmail}
        config={config}
        onUpdateConfig={setConfig}
        services={services}
        onUpdateServices={setServices}
        posts={posts}
        onUpdatePosts={setPosts}
        requests={requests}
        onUpdateRequests={setRequests}
        transactions={transactions}
        onUpdateTransactions={setTransactions}
        onViewReceipt={handleViewReceipt}
      />

    </div>
  );
}
