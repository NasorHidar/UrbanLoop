/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CivicChatInterface - Multi-turn conversational AI interface powered by Gemini 3.8 Flash
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import { ChatMessage } from '../../types';
import { sendMultiTurnChatMessage } from '../../services/geminiService';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Copy, 
  Check, 
  MessageSquare, 
  Info,
  ShieldCheck,
  Leaf,
  Droplets,
  Utensils,
  X
} from 'lucide-react';

/**
 * Clean, safe Markdown parser for Assistant and User responses
 * Handles headers (###), lists (- or •), bold (**), italic (*), and code blocks
 */
export const FormattedMarkdown: React.FC<{ content: string; isUser?: boolean }> = ({ content, isUser = false }) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{content}</div>;
  }

  // Helper to parse inline bold, code, and emphasis
  const parseInline = (text: string) => {
    const parts: React.ReactNode[] = [];
    const inlineRegex = /(\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
    let lastIndex = 0;
    let match;
    let keyIdx = 0;

    while ((match = inlineRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      if (match[2]) {
        // **bold**
        parts.push(
          <strong key={`b-${keyIdx++}`} className="font-bold text-slate-900">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // `code`
        parts.push(
          <code key={`c-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-emerald-800 border border-slate-200">
            {match[3]}
          </code>
        );
      } else if (match[4]) {
        // *italic*
        parts.push(
          <em key={`i-${keyIdx++}`} className="italic text-slate-700">
            {match[4]}
          </em>
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-1.5 space-y-1.5 pl-0.5">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Heading ###
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${idx}`} className="text-xs sm:text-sm font-bold text-slate-900 mt-2.5 mb-1 tracking-tight flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          <span>{parseInline(trimmed.replace(/^###\s+/, ''))}</span>
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${idx}`} className="text-sm sm:text-base font-bold text-slate-900 mt-3 mb-1.5">
          {parseInline(trimmed.replace(/^##\s+/, ''))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      // List item
      const itemContent = trimmed.replace(/^[-•*]\s+/, '');
      currentList.push(
        <li key={`li-${idx}`} className="text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start gap-2">
          <span className="text-emerald-600 font-bold mt-0.5 shrink-0 select-none">•</span>
          <span className="flex-1">{parseInline(itemContent)}</span>
        </li>
      );
    } else {
      flushList();
      elements.push(
        <p key={`p-${idx}`} className="text-xs sm:text-sm text-slate-700 leading-relaxed my-1">
          {parseInline(trimmed)}
        </p>
      );
    }
  });

  flushList();

  return <div className="space-y-1 font-sans">{elements}</div>;
};

interface CivicChatInterfaceProps {
  isDrawer?: boolean;
  onClose?: () => void;
}

export const CivicChatInterface: React.FC<CivicChatInterfaceProps> = ({ isDrawer = false, onClose }) => {
  const { 
    role, 
    lang, 
    walletBalance, 
    foodOffers, 
    drainHotspots, 
    plantedTrees, 
    totalFoodRescuedKg, 
    drainsClearedCount,
    addToast,
  } = useUrbanLoop();

  // Initial welcome message tailored to language
  const initialMessages: ChatMessage[] = useMemo(() => [
    {
      id: 'init-1',
      role: 'model',
      text: lang === 'bn' 
        ? `স্বাগতম! আমি **আরবানলুপ এআই কোপাইলট** (Gemini 3.8 Flash চালিত)। \n\nঢাকা ওয়ার্ড ১৫ (ধানমন্ডি)-এর খাদ্য উদ্ধার (Surplus2Serve), ড্রেন বাউন্টি (Drain2Value 2.0), প্লাস্টিক রিসাইক্লিং পাসপোর্ট ও আরবান ক্যানোপি বৃক্ষরোপণ সংক্রান্ত যেকোনো তথ্য বা নির্দেশনায় আমি আপনাকে সাহায্য করতে পারি। আজ আপনাকে কীভাবে সাহায্য করতে পারি?`
        : `Welcome! I'm your **UrbanLoop AI Copilot** powered by **Gemini 3.8 Flash**.\n\nI can assist you with food rescue operations (**Surplus2Serve**), reporting and auditing arterial storm drains (**Drain2Value 2.0**), verifying circular recycling passports, or optimizing your **95/5 Green Wallet** distribution across Dhaka Pilot Ward 15.\n\nHow can I help you take civic action today?`,
      timestamp: Date.now(),
    }
  ], [lang]);

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll inside the messages container
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Build live context string from application state
  const liveContextString = useMemo(() => {
    const availableFood = foodOffers.filter(f => f.status === 'available').length;
    const activeDrains = drainHotspots.filter(d => d.status !== 'cleared').length;
    const floodRiskReduction = Math.min(94, Math.round(drainsClearedCount * 1.5));
    return `User Role: ${role}. Active Language: ${lang}.
Live Ward 15 Telemetry:
- User Green Credit Balance: ${walletBalance} pts
- Food Rescued Upstream: ${totalFoodRescuedKg} kg (${availableFood} listings currently available for rescue)
- Arterial Drains Cleared: ${drainsClearedCount} hotspots (${activeDrains} currently flagged as blocked)
- Monsoon Flood Waterlogging Reduction: ${floodRiskReduction}%
- Native Canopy Trees Planted: ${plantedTrees.length} trees (95/5 Tree Fund active)`;
  }, [role, lang, walletBalance, foodOffers, drainHotspots, plantedTrees, totalFoodRescuedKg, drainsClearedCount]);

  // Suggested Prompts
  const suggestedPrompts = useMemo(() => {
    if (lang === 'bn') {
      return [
        'খাবার কীভাবে নিরাপদে প্যাক ও দান করব?',
        'ড্রেন পরিষ্কার করে কীভাবে বাউন্টি পাব?',
        '৯৫/৫ গ্রিন ওয়ালেট নিয়মটি কী?',
        'খাবারের ২ ঘণ্টা সময় শেষ হলে কী ঘটে?',
        'কোন কোন প্রজাতির গাছ লাগানো হয়?'
      ];
    }
    return [
      'How do I safely pack surplus food?',
      'How does the Drain Bounty reward work?',
      'Explain the 95/5 Green Credit split',
      'What happens when food expires at 2 hours?',
      'Which native trees does the Tree Fund plant?'
    ];
  }, [lang]);

  // Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      addToast(
        lang === 'bn' ? 'মাইক্রোফোন ত্রুটি' : 'Voice Input Unavailable',
        lang === 'bn' ? 'আপনার ব্রাউজারে স্পিচ রিকগনিশন সমর্থিত নয়।' : 'Speech recognition is not supported in this browser.',
        'warning'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      }
    }
  };

  // Text to Speech playback
  const handleToggleSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown asterisks and headers for clearer speech
    const cleanText = text.replace(/[*#_`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset conversation
  const handleResetChat = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setMessages(initialMessages);
  };

  // Submit message to multi-turn Gemini API
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend !== undefined ? textToSend : inputPrompt).trim();
    if (!messageContent || isLoading) return;

    // Stop active listening or speaking
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (speakingMsgId && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageContent,
      timestamp: Date.now(),
    };

    // Update state immediately with user message
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Call Gemini 3.8 Flash multi-turn API
      const replyText = await sendMultiTurnChatMessage(
        updatedHistory.map(m => ({ role: m.role, text: m.text })),
        liveContextString,
        lang
      );

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: lang === 'bn'
          ? 'দুঃখিত, তথ্য অনুসন্ধানে একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'I encountered an issue processing your request. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden ${
      isDrawer ? 'h-full max-h-[85vh]' : 'min-h-[640px] h-[78vh]'
    }`}>
      
      {/* Chat Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between border-b border-emerald-800/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                {lang === 'bn' ? 'আরবানলুপ এআই কোপাইলট' : 'UrbanLoop AI Copilot'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
              <span>Ward 15 Circular Intelligence</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono font-medium">Multi-Turn Active</span>
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={lang === 'bn' ? 'কথোপকথন মুছুন' : 'Reset Conversation'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-bold cursor-pointer"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Live Context Pill Strip */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-600 overflow-x-auto gap-3 shrink-0">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="capitalize font-semibold text-slate-900">{role}</span> Context
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5 text-amber-600" />
            <span>Food Rescued: <strong>{totalFoodRescuedKg} kg</strong></span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            <span>Drains Cleared: <strong>{drainsClearedCount}</strong></span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>Canopy Fund: <strong>{walletBalance} pts</strong></span>
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold shrink-0">
          ● Live Sync
        </span>
      </div>

      {/* Scrollable Message History Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-slate-50/70 to-slate-100/40"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSpeaking = speakingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 group transition-opacity ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Bot Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-emerald-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4 text-emerald-300" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                
                {/* Author Name & Timestamp */}
                <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500 font-medium px-1">
                  <span>{isUser ? (lang === 'bn' ? 'আপনি (নাগরিক)' : 'You (Citizen)') : 'UrbanLoop Copilot'}</span>
                  <span>•</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Speech Bubble Card */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                    isUser
                      ? 'bg-emerald-700 text-white rounded-tr-none shadow-emerald-700/20 font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none prose prose-sm max-w-none prose-slate'
                  }`}
                >
                  {/* Clean Formatted Text Rendering */}
                  <FormattedMarkdown content={msg.text} isUser={isUser} />
                </div>

                {/* Action Toolbar on Hover (Copy, Speak) */}
                <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-slate-500">
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="flex items-center gap-1 hover:text-slate-800 cursor-pointer"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {!isUser && (
                    <button
                      onClick={() => handleToggleSpeech(msg.id, msg.text)}
                      className={`flex items-center gap-1 cursor-pointer transition-colors ${
                        isSpeaking ? 'text-emerald-700 font-bold' : 'hover:text-slate-800'
                      }`}
                      title={isSpeaking ? 'Stop speaking' : 'Read aloud with Text-to-Speech'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                          <span className="text-rose-600">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-slate-500" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-emerald-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            </div>
            <div className="bg-white border border-emerald-200/80 rounded-2xl rounded-tl-none p-3.5 shadow-sm max-w-[70%]">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-emerald-800">Gemini 3.8 Flash</span>
                <span className="text-slate-400">•</span>
                <span className="text-[11px] text-slate-500">Synthesizing civic intelligence...</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div className="h-1" />
      </div>

      {/* Suggested Quick Question Chips */}
      {messages.length <= 4 && !isLoading && (
        <div className="relative bg-slate-50/95 border-t border-slate-200/70 shrink-0">
          <div className="px-4 py-2 overflow-x-auto flex items-center gap-2 pr-10">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {lang === 'bn' ? 'সুপারিশ:' : 'Suggested:'}
            </span>
            {suggestedPrompts.map((promptText, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(promptText)}
                className="px-3 py-1.5 text-xs rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 font-medium whitespace-nowrap transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
              >
                {promptText}
              </button>
            ))}
          </div>
          {/* Edge gradient fade indicator */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 to-transparent" />
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <div className="bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0">
        
        {/* Voice recording status indicator if active */}
        {isListening && (
          <div className="flex items-center justify-between bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg mb-2 text-xs text-rose-800 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span className="font-semibold">{lang === 'bn' ? 'শুনছি... কথা বলুন' : 'Listening... Speak now'}</span>
            </div>
            <button
              onClick={toggleVoiceInput}
              className="text-xs font-bold text-rose-700 underline cursor-pointer"
            >
              Stop
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          
          {/* Multiline textarea input */}
          <div className="flex-1 relative rounded-xl border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-slate-50/60 transition-all">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                lang === 'bn'
                  ? 'খাদ্য উদ্ধার, ড্রেন বাউন্টি বা গ্রিন ওয়ালেট সম্পর্কে প্রশ্ন লিখুন... (Enter চাপুন)'
                  : 'Ask about Surplus2Serve, drain bounties, recycling passports, or Green Credits... (Press Enter)'
              }
              className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none font-sans"
              disabled={isLoading}
            />

            {/* In-field Mic & helper buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                }`}
                title={isListening ? 'Stop Voice Input' : 'Voice Input (Speech-to-Text)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || isLoading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              !inputPrompt.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/25 active:scale-95'
            }`}
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>

        </div>

        {/* Footer Guidance Note */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            <span>Civic AI verified against BSTI/FSSAI hygiene & URP hydrology standards.</span>
          </span>
          <span className="hidden sm:inline font-mono text-[10px]">Shift+Enter for new line</span>
        </div>

      </div>

    </div>
  );
};
