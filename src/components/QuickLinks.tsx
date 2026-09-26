import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ExternalLink, Globe } from 'lucide-react';

interface QuickLinkItem {
  title: string;
  hindiTitle: string;
  url: string;
  category: string;
  description: string;
}

export const QuickLinks: React.FC = () => {
  const { t, language } = useLanguage();
  const links: QuickLinkItem[] = [
    {
      title: "RTPS Bihar (ServicePlus)",
      hindiTitle: "सर्विस प्लस बिहार - जाति, आय, निवास",
      url: "https://serviceonline.bihar.gov.in",
      category: "RTPS Bihar",
      description: "बिहार सरकार सामान्य प्रशासन विभाग के आधिकारिक प्रमाण पत्र पोर्टल।"
    },
    {
      title: "UIDAI MyAadhaar Portal",
      hindiTitle: "माय आधार पोर्टल - डाउनलोड व पीवीसी",
      url: "https://myaadhaar.uidai.gov.in",
      category: "Aadhar",
      description: "आधार कार्ड डाउनलोड, पीवीसी कार्ड आर्डर और बायोमेट्रिक लॉक/अनलॉक।"
    },
    {
      title: "NSDL PAN Online Services",
      hindiTitle: "एनएसडीएल पैन पोर्टल - नया पैन व सुधार",
      url: "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
      category: "PAN",
      description: "आयकर विभाग भारत सरकार हेतु पैन कार्ड ऑनलाइन आवेदन व रीप्रिंट।"
    },
    {
      title: "Sarkari Result Official",
      hindiTitle: "सरकारी रिजल्ट - जॉब, एडमिट कार्ड व आंसर की",
      url: "https://www.sarkariresult.com",
      category: "Jobs",
      description: "भारत भर की सभी सरकारी भर्तियों के ऑनलाइन फॉर्म और परीक्षा परिणाम।"
    },
    {
      title: "Bihar Post Matric Scholarship (PMS)",
      hindiTitle: "बिहार पोस्ट मैट्रिक छात्रवृत्ति पोर्टल",
      url: "http://pmsonline.bih.nic.in",
      category: "Scholarship",
      description: "11वीं, 12वीं, आईटीआई, ग्रेजुएशन विद्यार्थियों हेतु आधिकारिक स्कॉलरशिप।"
    },
    {
      title: "LNMU Darbhanga University",
      hindiTitle: "ललित नारायण मिथिला विश्वविद्यालय, दरभंगा",
      url: "https://lnmu.ac.in",
      category: "Education",
      description: "दरभंगा विश्वविद्यालय एडमिशन, परीक्षा फॉर्म, रजिस्ट्रेशन व परिणाम।"
    },
    {
      title: "NBPDCL North Bihar Electricity",
      hindiTitle: "नॉर्थ बिहार पावर डिस्ट्रीब्यूशन (बिजली बिल)",
      url: "https://www.nbpdcl.co.in",
      category: "Electricity",
      description: "उपभोक्ता संख्या (CA No.) द्वारा बिजली बिल जांच व तुरंत भुगतान।"
    },
    {
      title: "NVSP / ECI Voter Services",
      hindiTitle: "मतदाता सेवा पोर्टल (वोटर कार्ड)",
      url: "https://voters.eci.gov.in",
      category: "Voter",
      description: "नया वोटर कार्ड आवेदन (Form 6) एवं डिजिटल ई-एपिक डाउनलोड।"
    },
    {
      title: "Parivahan Sewa (Sarthi)",
      hindiTitle: "परिवहन सेवा - ड्राइविंग लाइसेंस व वाहन",
      url: "https://parivahan.gov.in",
      category: "Transport",
      description: "लर्निंग व परमानेंट ड्राइविंग लाइसेंस, आरसी ट्रांसफर व फिटनेस चालान।"
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.portalsBadge}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.portalsTitle}
        </h2>
        <p className="text-sm text-slate-600">
          {t.portalsDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {link.category}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 -translate-y-0.5 transition" />
              </div>

              <h3 className="font-bold text-slate-900 group-hover:text-blue-900 transition leading-snug">
                {link.title}
              </h3>
              <p className="text-xs font-medium text-emerald-700">
                {link.hindiTitle}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {link.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700 group-hover:text-blue-900">
              <span>{t.openWebsite}</span>
              <span>→</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
