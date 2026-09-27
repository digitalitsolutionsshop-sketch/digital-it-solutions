import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw, 
  Loader2, 
  MessageSquare, 
  ShieldCheck,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import type { AISettings } from '../types';

interface AIChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopMobile: string;
  onOpenApply: () => void;
  onOpenTrack: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIChatbotModal: React.FC<AIChatbotModalProps> = ({
  isOpen,
  onClose,
  shopMobile,
  onOpenApply,
  onOpenTrack
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'नमस्ते! मैं डिजिटल आईटी सॉल्यूशंस साइबर कैफे का एआई सहायक हूँ। आप मुझसे RTPS बिहार प्रमाण पत्र, पैन कार्ड, सरकारी नौकरी फॉर्म, छात्रवृत्ति, आवश्यक दस्तावेज या आवेदन प्रक्रिया के बारे में कुछ भी पूछ सकते हैं।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition (Speech-to-Text) initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Default Hindi speech recognition

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!voiceSupported) {
      alert('आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया टाइप करके संदेश भेजें।');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Microphone start error:', e);
      }
    }
  };

  // Text-to-Speech
  const speakText = (text: string, messageId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          language: 'hi',
          conversationHistory: messages.slice(-4).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }))
        })
      });

      const data = await response.json();
      const aiReplyText = data.reply || data.error || 'उत्तर प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'सर्वर से संपर्क करने में असमर्थ। आप सीधे आकाश जी को 8340622912 पर कॉल या व्हाट्सएप कर सकते हैं।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: 'बातचीत रीसेट कर दी गई है। आप कोई भी नया प्रश्न पूछ सकते हैं।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const QUICK_QUESTIONS = [
    'जाति/आय/निवास के लिए क्या दस्तावेज चाहिए?',
    'नया पैन कार्ड कैसे बनेगा और कितना खर्च आएगा?',
    'आवेदन कैसे करें और ट्रैकिंग कैसे होगी?',
    'दुकान का पता और खुलने का समय क्या है?'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:right-6 sm:bottom-6 z-50 flex items-end sm:items-center justify-center p-0 sm:p-0">
      
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs sm:hidden"
        onClick={onClose}
      />

      {/* Main Chat Container */}
      <div className="relative z-10 w-full sm:w-[420px] h-[85vh] sm:h-[580px] max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-orange-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">डिजिटल एआई सहायक</h3>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                डिजिटल आईटी सॉल्यूशंस • 24x7 ऑनलाइन सहायता
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition"
              title="चैट साफ करें"
            >
              <RotateCcw className="w-4 h-4" />
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

        {/* Action quick links bar */}
        <div className="bg-blue-50/80 border-b border-blue-100 px-3 py-1.5 flex items-center justify-between text-[11px]">
          <span className="text-blue-900 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            सत्यापित सीएससी ज्ञान
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenApply();
              }}
              className="text-blue-700 hover:text-blue-900 font-bold underline"
            >
              ऑनलाइन फॉर्म भरें
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => {
                onClose();
                onOpenTrack();
              }}
              className="text-blue-700 hover:text-blue-900 font-bold underline"
            >
              स्थिति देखें
            </button>
          </div>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs shadow-md'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                
                <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>

                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className={`p-1 rounded-md transition ${
                        speakingMessageId === msg.id 
                          ? 'bg-orange-100 text-orange-600 font-bold' 
                          : 'hover:bg-slate-100 text-slate-500'
                      }`}
                      title={speakingMessageId === msg.id ? "आवाज बंद करें" : "आवाज में सुनें"}
                    >
                      {speakingMessageId === msg.id ? (
                        <span className="flex items-center gap-1 text-[10px]">
                          <VolumeX className="w-3 h-3 animate-pulse text-orange-600" />
                          <span>रोकें</span>
                        </span>
                      ) : (
                        <Volume2 className="w-3 h-3 text-blue-600" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>एआई जानकारी खोज रहा है...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions Chips */}
        <div className="p-2 bg-slate-100/80 border-t border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium transition shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Recording active notice */}
        {isRecording && (
          <div className="bg-amber-500 text-slate-950 px-3 py-1.5 text-xs font-bold flex items-center justify-between shrink-0 animate-pulse">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
              आपकी आवाज सुनी जा रही है (हिंदी/English)... बोलें
            </span>
            <button
              onClick={toggleRecording}
              className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-semibold"
            >
              बंद करें
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Button (Requirement #17: Voice Chatbot) */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2.5 rounded-2xl transition flex items-center justify-center shrink-0 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-bounce' 
                  : 'bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700'
              }`}
              title={isRecording ? "रिकॉर्डिंग रोकें" : "बोलकर पूछें (Voice Input)"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? "सुन रहा हूँ..." : "यहाँ अपना प्रश्न लिखें..."}
              className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-bold transition flex items-center justify-center shrink-0 shadow-md shadow-blue-700/20"
              title="भेजें"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Powered by Gemini 3.8 Flash • Digital IT Solutions</span>
            <a
              href={`tel:${shopMobile}`}
              className="text-blue-600 font-semibold flex items-center gap-1 hover:underline"
            >
              <PhoneCall className="w-3 h-3" />
              हेल्पलाइन: {shopMobile}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
