import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, ChevronDown, RefreshCw, Calendar, Trash2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AIChatbotProps {
  onNavigate: (tab: string, arg?: string) => void;
}

export default function AIChatbot({ onNavigate }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Greetings! I am **HealBot**, your dedicated AI Clinical Navigating Assistant. I can help you find specialist doctors, learn about clinics (like Cardiology or Pediatrics), guide you on how to schedule an outpatient pass, or explain how to track and cancel existing bookings."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages or loading state changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      text: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Map history correctly to what API expects
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory
        })
      });

      if (!res.ok) {
        throw new Error('Our neural gateway is temporarily occupied. Please try again.');
      }

      const data = await res.json();
      const botMessage: Message = {
        id: Math.random().toString(),
        role: 'model',
        text: data.text || 'I received your inquiry, but could not formulate a clear response.'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: Math.random().toString(),
        role: 'model',
        text: `⚠️ **Clinical Gateway Error:** ${err.message || 'Trouble reaching the assistant. Please check if your Gemini API Key is configured in Settings > Secrets.'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (query: string) => {
    handleSendMessage(query);
  };

  const parseTextFormatting = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Handle empty or blank lines
      if (!line.trim()) return <div key={idx} className="h-2" />;

      let content = line;
      // Check for bullet points
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      if (isBullet) {
        // Strip out the bullet character
        content = line.replace(/^[\s*-]+/, '').trim();
      }

      // Simple markdown bold parsing (**word**)
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const parsedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-extrabold text-brand-charcoal dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-[11px] leading-relaxed my-1 pl-1 text-brand-charcoal/90">
            {parsedLine}
          </li>
        );
      }

      return (
        <p key={idx} className="text-[11px] leading-relaxed my-1 text-brand-charcoal/90">
          {parsedLine}
        </p>
      );
    });
  };

  // Detect context inside robot replies and offer navigating badge deep-links
  const renderNavigatingBadges = (msgText: string) => {
    const textLower = msgText.toLowerCase();
    const badges = [];

    if (textLower.includes('book') || textLower.includes('schedule') || textLower.includes('reserve')) {
      badges.push(
        <button
          key="nav-book"
          onClick={() => onNavigate('book')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-olive text-[10px] text-white font-bold hover:bg-opacity-90 transform hover:-translate-y-0.5 transition-all shadow-sm cursor-pointer"
        >
          <Calendar className="w-3 h-3" />
          Book Appointment Tab
        </button>
      );
    }

    if (textLower.includes('cancel') || textLower.includes('reschedule') || textLower.includes('track') || textLower.includes('bookings') || textLower.includes('passes')) {
      badges.push(
        <button
          key="nav-passes"
          onClick={() => onNavigate('mybookings')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-charcoal text-[10px] text-white font-bold hover:bg-opacity-90 transform hover:-translate-y-0.5 transition-all shadow-sm cursor-pointer"
        >
          <Trash2 className="w-3 h-3 text-brand-clay" />
          My Outpatient Passes
        </button>
      );
    }

    if (textLower.includes('doctor') || textLower.includes('physician') || textLower.includes('ross') || textLower.includes('tanaka') || textLower.includes('jenkins') || textLower.includes('miller') || textLower.includes('fayed')) {
      badges.push(
        <button
          key="nav-docs"
          onClick={() => onNavigate('doctors')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-brand-olivelight hover:bg-brand-stone text-[10px] text-brand-charcoal font-bold transform hover:-translate-y-0.5 transition-all shadow-sm cursor-pointer"
        >
          <Bot className="w-3 h-3 text-brand-olive" />
          Find Doctors Directory
        </button>
      );
    }

    if (badges.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-brand-stone/60">
        {badges}
      </div>
    );
  };

  const PROMPT_SUGGESTIONS = [
    { label: "📅 How can I make a booking?", query: "How do I book an outpatient appointment? Please explain step-by-step." },
    { label: "❌ How to cancel/reschedule?", query: "Where do I go to cancel or reschedule my active bookings? Show me directions." },
    { label: "🏥 Pediatrics services & doctors", query: "Which doctors are available in the Pediatrics department?" },
    { label: "❤️ Cardiology clinic info", query: "Tell me about Dr. Evelyn Ross and the Cardiology department services." }
  ];

  return (
    <div id="ai-chatbot" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Dynamic Pop-up Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 25 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-80 sm:w-[350px] h-[500px] bg-white border border-brand-olivelight rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 mr-0"
          >
            {/* Header / Brand panel */}
            <div className="bg-brand-charcoal text-white p-4 flex items-center justify-between border-b border-brand-olivelight/20 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-brand-olive rounded-xl text-white">
                  <Bot className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-serif font-bold text-white tracking-wide">HealBot</h3>
                    <span className="inline-flex px-1.5 py-0.5 rounded bg-brand-olive/20 text-brand-olivelight text-[8px] uppercase tracking-wider font-mono">Clinical AI</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-brand-olivelight font-semibold">Online & Validated</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-brand-olivelight hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Clinical Dialog Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-brand-stone/40 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs ${
                      msg.role === 'user'
                        ? 'bg-brand-olive text-white rounded-br-none'
                        : 'bg-white border border-brand-olivelight/40 text-brand-charcoal rounded-bl-none'
                    }`}
                  >
                    {/* Parse text layout with our responsive markdown bullet formatter */}
                    <div className="space-y-1">
                      {parseTextFormatting(msg.text)}
                    </div>

                    {/* Check and list instant navigating buttons */}
                    {msg.role === 'model' && renderNavigatingBadges(msg.text)}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white border border-brand-olivelight/40 rounded-2xl rounded-bl-none px-3.5 py-3 text-xs flex items-center gap-2 text-brand-clay shadow-sm">
                    <span className="flex items-center gap-1 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-olive animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-olive animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-olive animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span className="text-[10px] font-mono tracking-wide font-medium">Querying specialist knowledge...</span>
                  </div>
                </div>
              )}

              {/* Element to hook automatic scrolling target */}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions Drawer */}
            <div className="px-4 py-2 bg-brand-stone/20 border-t border-brand-stone shrink-0">
              <p className="text-[9px] uppercase font-bold text-brand-clay tracking-wider mb-1.5 font-mono">Frequently Inquired</p>
              <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                {PROMPT_SUGGESTIONS.map((s, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(s.query)}
                    className="w-full text-left px-2.5 py-1 rounded bg-white hover:bg-brand-stone border border-brand-stone text-[9px] font-bold text-brand-charcoal transition-all cursor-pointer truncate"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input clinical dialog box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 bg-white border-t border-brand-olivelight/30 flex gap-2 shrink-0 items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Inquire about doctors, departments..."
                className="flex-1 bg-brand-stone/60 placeholder-brand-clay/70 border-0 focus:ring-1 focus:ring-brand-olive rounded-xl px-3.5 py-2 text-xs font-medium text-brand-charcoal outline-none focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  input.trim() && !loading
                    ? 'bg-brand-olive hover:bg-opacity-90 text-white shadow-md'
                    : 'bg-brand-stone text-brand-clay cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Floating Action Trigger Button with welcoming tooltip notification */}
      <div className="relative group flex items-center justify-end">
        {/* Help Bubble Tooltip message shown on idle when closed */}
        {!isOpen && (
          <div className="absolute right-16 bg-brand-charcoal text-white text-[10px] px-3 py-1.5 rounded-xl shadow-lg border border-brand-olivelight/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 mr-1.5">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-brand-olivelight shrink-0 animate-pulse" /> Inquire with AI Patient Care
            </span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`h-12 w-12 rounded-full flex items-center justify-center shadow-2xl scale-100 transition-all cursor-pointer relative z-50 ${
            isOpen
              ? 'bg-brand-charcoal text-white'
              : 'bg-brand-olive hover:bg-opacity-95 text-white'
          }`}
        >
          {isOpen ? (
            <ChevronDown className="w-5 h-5 animate-fade-in" />
          ) : (
            <div className="relative">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-clay border-2 border-brand-sand animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-clay border-2 border-brand-sand" />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
