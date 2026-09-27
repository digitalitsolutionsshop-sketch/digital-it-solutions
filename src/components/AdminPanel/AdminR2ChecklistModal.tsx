import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  HardDrive, 
  Key, 
  ExternalLink, 
  RefreshCw, 
  Clock, 
  AlertCircle,
  FileCode,
  CheckCircle2
} from 'lucide-react';
import type { R2ConnectionStatus } from '../../types';

interface AdminR2ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminR2ChecklistModal: React.FC<AdminR2ChecklistModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<R2ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/r2/status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.warn('Failed to fetch R2 status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const CORS_CONFIG_JSON = `[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Disposition"],
    "MaxAgeSeconds": 3600
  }
]`;

  const LIFECYCLE_RULE_JSON = `{
  "Rules": [
    {
      "ID": "delete-after-6-months",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "applications/"
      },
      "Expiration": {
        "Days": 180
      }
    }
  ]
}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Cloudflare R2 प्राइवेट स्टोरेज सेटअप चेकलिस्ट
                </h2>
                {status?.isConfigured ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    कनेक्टेड
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    क्रेडेंशियल्स प्रतीक्षारत (लोकल सैंडबॉक्स सक्रिय)
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200">
                ग्राहक दस्तावेजों की 100% डेटा प्राइवेसी एवं 6-माह लाइफसाइकिल नियम (Requirement #11, #37)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition"
              title="रीफ्रेश स्थिति"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Status Alert Banner */}
          {status?.isConfigured ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Cloudflare R2 बकेट सफलतापूर्वक कनेक्टेड है!</span>
              </div>
              <p className="text-xs text-emerald-800">
                बकेट: <strong>{status.bucketName}</strong> • एंडपॉइंट: <span className="font-mono">{status.endpoint}</span>
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>लाइव Cloudflare R2 क्रेडेंशियल्स की आवश्यकता</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                वर्तमान में सिस्टम सुरक्षित <strong>लोकल स्टोरेज सैंडबॉक्स (.r2_private_storage)</strong> में पूरी कार्यक्षमता के साथ चल रहा है। नीचे दिए गए चेकलिस्ट के अनुसार क्लाउडफ्लेयर क्रेडेंशियल्स AI Studio सीक्रेट्स में जोड़ते ही यह स्वतः लाइव R2 बकेट से जुड़ जाएगा।
              </p>
            </div>
          )}

          {/* 1. Cloudflare Dashboard Steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">1</span>
              Cloudflare Dashboard में R2 बकेट बनाएं
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <p>
                1. <strong>Cloudflare Dashboard</strong> (<a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-semibold">dash.cloudflare.com</a>) में लॉगिन करें।
              </p>
              <p>
                2. बायीं नेविगेशन में <strong>R2 Object Storage</strong> पर क्लिक करें।
              </p>
              <p>
                3. <strong>"Create bucket"</strong> बटन दबाएं और बकेट का नाम दर्ज करें:
              </p>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-300 font-mono text-xs">
                <span className="flex-1 font-bold text-blue-900">cybercafe-private-documents</span>
                <button
                  onClick={() => copyToClipboard('cybercafe-private-documents', 'bucket')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[11px] font-bold"
                >
                  {copiedKey === 'bucket' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-slate-500 text-[11px]">
                * लोकेशन: <strong>Automatic (APAC / India)</strong> चुनें और <strong>"Create bucket"</strong> पर क्लिक करें।
              </p>
            </div>
          </div>

          {/* 2. R2 API Token / Credentials */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">2</span>
              R2 API टोकन (Access Key & Secret Key) प्राप्त करें
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <p>
                1. R2 ओवरव्यू पेज पर दायीं ओर <strong>"Manage R2 API Tokens"</strong> पर क्लिक करें।
              </p>
              <p>
                2. <strong>"Create API token"</strong> चुनें।
              </p>
              <p>
                3. Permissions: <strong>Object Read & Write</strong> (या Admin Read & Write) चुनें।
              </p>
              <p>
                4. बकेट: <strong>cybercafe-private-documents</strong> चुनें और <strong>"Create API Token"</strong> पर क्लिक करें।
              </p>
              <p>
                5. आपको <strong>Access Key ID</strong>, <strong>Secret Access Key</strong> और <strong>Endpoint</strong> प्राप्त होंगे।
              </p>
            </div>
          </div>

          {/* 3. Environment Variables */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">3</span>
              AI Studio / Server Environment Variables में जोड़ें
            </h3>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl space-y-2 font-mono text-[11px] overflow-x-auto">
              <div>CLOUDFLARE_ACCOUNT_ID="your_account_id"</div>
              <div>R2_ACCESS_KEY_ID="your_r2_access_key_id"</div>
              <div>R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"</div>
              <div>R2_BUCKET_NAME="cybercafe-private-documents"</div>
              <div>R2_ENDPOINT="https://&lt;ACCOUNT_ID&gt;.r2.cloudflarestorage.com"</div>
            </div>
          </div>

          {/* 4. 6-Month Automatic Deletion Lifecycle Rule (Requirement #10 & #11) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">4</span>
              R2 6-Month Automatic Document Deletion Lifecycle Policy
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <p>
                क्लाउडफ्लेयर R2 बकेट सेटिंग्स (<span className="font-semibold">Settings → Object Lifecycle Rules</span>) में नियम जोड़ें:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                <div><strong>Rule Name:</strong> delete-after-6-months</div>
                <div><strong>Prefix Filter:</strong> applications/</div>
                <div><strong>Action:</strong> Delete object</div>
                <div><strong>Expiration Days:</strong> 180 Days (6 Months)</div>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
                  {LIFECYCLE_RULE_JSON}
                </pre>
                <button
                  onClick={() => copyToClipboard(LIFECYCLE_RULE_JSON, 'lifecycle')}
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[10px] flex items-center gap-1"
                >
                  {copiedKey === 'lifecycle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>कॉपी करें</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 text-[11px] border border-blue-200 flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  <strong>सुरक्षा आश्वासन:</strong> 180 दिनों बाद केवल क्लाउडफ्लेयर R2 से मूल बाइनरी फाइल हटाई जाती है। ग्राहक का आवेदन, नाम, पिता का नाम, मोबाइल नंबर, ट्रैकिंग टोकन और लेन-देन खाता हमेशा के लिए सुरक्षित रहता है।
                </span>
              </div>
            </div>
          </div>

          {/* 5. CORS Configuration */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">5</span>
              R2 CORS Policy (बकेट सेटिंग्स में पेस्ट करें)
            </h3>

            <div className="relative">
              <pre className="bg-slate-900 text-blue-300 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
                {CORS_CONFIG_JSON}
              </pre>
              <button
                onClick={() => copyToClipboard(CORS_CONFIG_JSON, 'cors')}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[10px] flex items-center gap-1"
              >
                {copiedKey === 'cors' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>कॉपी करें</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            डिजिटल आईटी सॉल्यूशंस • S3-संगत क्लाउडफ्लेयर स्टोरेज
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            समझ गया (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
