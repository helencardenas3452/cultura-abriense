import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Feather, 
  Sparkles, 
  Send, 
  Compass, 
  BookOpen, 
  MessageCircle, 
  Bot, 
  User, 
  Play,
  RotateCcw
} from 'lucide-react';
import { Ritual, SieMessage, EmotionalFlaskEntry } from '../../types';
import CatalogoRituales from './CatalogoRituales';
import RitualPlayer from './RitualPlayer';
import AdaptiveBreathingCard from './AdaptiveBreathingCard';

interface SieGuidesProps {
  rituales: Ritual[];
  onSaveEcho: (title: string, detail: string, tags?: string[]) => void;
  flasks?: EmotionalFlaskEntry[];
  onNavigateToEtereo?: () => void;
}

const INITIAL_SIE_MESSAGES: SieMessage[] = [
  {
    id: 'msg-1',
    sender: 'sie',
    text: 'Bienvenido a este espacio de escucha serena. Soy Sie, tu acompañante de introspección. ¿Qué pesa, brilla o inquieta hoy en tu interior?',
    timestamp: 'Ahora'
  }
];

export default function SieGuides({ 
  rituales, 
  onSaveEcho,
  flasks = [],
  onNavigateToEtereo
}: SieGuidesProps) {
  const [activeSubTab, setActiveSubTab] = useState<'catalogo' | 'conversacion'>('catalogo');
  const [activeRitual, setActiveRitual] = useState<Ritual | null>(null);
  
  // Chat state
  const [messages, setMessages] = useState<SieMessage[]>(INITIAL_SIE_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMsg: SieMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/sie/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          const sieReply: SieMessage = {
            id: `sie-${Date.now()}`,
            sender: 'sie',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedRitualId: data.suggestedRitualId
          };
          setMessages(prev => [...prev, sieReply]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Using offline Sie guide response:", err);
    }

    // Heuristic response fallback
    let reply = "Escucho la profundidad de tus palabras. A veces el solo acto de nombrarlo empieza a desenredar el nudo interior. ¿Qué necesitarías darte permiso de sentir en este instante?";
    let suggestedRitualId: string | undefined = undefined;

    const lower = userText.toLowerCase();
    if (lower.includes('ansiedad') || lower.includes('estres') || lower.includes('abrumad') || lower.includes('miedo')) {
      reply = "La mente cuando se acelera busca certezas que no siempre están a mano. Permíteme invitarte a anclar el cuerpo primero. El aire fresco y el contacto con la tierra son el primer bálsamo.";
      suggestedRitualId = 'arraigo-5min';
    } else if (lower.includes('triste') || lower.includes('llorar') || lower.includes('duele') || lower.includes('rabia') || lower.includes('enojo')) {
      reply = "Toda emoción que arde o duele tiene derecho a existir sin ser censurada. ¿Te gustaría volcar tus pensamientos en una escritura sin filtros para liberarlos?";
      suggestedRitualId = 'desahogo-escrito';
    } else if (lower.includes('dormir') || lower.includes('insomnio') || lower.includes('noche') || lower.includes('cansad')) {
      reply = "Tu cuerpo ha sostenido muchas horas de actividad y pensamiento. La noche es el santuario para entregar las cargas que no puedes resolver ahora.";
      suggestedRitualId = 'cierre-nocturno';
    } else if (lower.includes('gracias') || lower.includes('paz') || lower.includes('bien') || lower.includes('calma')) {
      reply = "Qué regalo tan luminoso es saborear la paz cuando llega. Respira hondo y guarda esta calidez en tu pecho como un faro para los días nublados.";
      suggestedRitualId = 'respiracion-cuadrada';
    }

    const sieReply: SieMessage = {
      id: `sie-${Date.now()}`,
      sender: 'sie',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedRitualId
    };

    setMessages(prev => [...prev, sieReply]);
    setIsTyping(false);
  };

  const handleRitualCompleted = (ritualTitle: string, tags?: string[]) => {
    onSaveEcho(
      `Ritual Completado: ${ritualTitle}`,
      'Completaste una sesión guiada de calma y respiración consciente.',
      tags
    );
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--secondary-puro)]/15 text-[10px] font-mono uppercase tracking-[0.2em] text-[#9b6838] font-semibold">
          <Feather className="w-3 h-3" />
          <span>🌬️ Sie — Guías Vivas & Rituales</span>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-light text-[var(--text-puro)]">
          El Acompañamiento del Alma
        </h2>
        <p className="text-xs text-[var(--text-puro-muted)] max-w-lg mx-auto font-light leading-relaxed">
          Encuentra orientación para tus momentos de zozobra o silencio. Explora rituales de respiración y desahogo, o conversa con Sie en un diálogo socrático no invasivo.
        </p>
      </div>

      {/* 🌬️ 60-Second Adaptive Breathing Generator Based on Latest Flask */}
      <AdaptiveBreathingCard
        flasks={flasks}
        onSaveEcho={onSaveEcho}
        onNavigateToEtereo={onNavigateToEtereo}
      />

      {/* Toggle Subtabs: Catálogo vs Conversación */}
      <div className="flex justify-center">
        <div className="p-1 rounded-full glass-puro border border-white/60 inline-flex shadow-2xs">
          <button
            onClick={() => setActiveSubTab('catalogo')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeSubTab === 'catalogo'
                ? 'bg-[var(--primary-puro)] text-white shadow-xs'
                : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Biblioteca de Rituales</span>
          </button>

          <button
            onClick={() => setActiveSubTab('conversacion')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeSubTab === 'conversacion'
                ? 'bg-[var(--primary-puro)] text-white shadow-xs'
                : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Conversar con Sie (IA)</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Catálogo de Rituales */}
      {activeSubTab === 'catalogo' && (
        <CatalogoRituales 
          rituales={rituales}
          onSelect={(ritual) => setActiveRitual(ritual)}
        />
      )}

      {/* Subtab 2: Conversación Socrática con Sie */}
      {activeSubTab === 'conversacion' && (
        <div className="max-w-3xl mx-auto rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/80 overflow-hidden flex flex-col h-[520px]">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-neutral-200/50 bg-white/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--secondary-puro)]/20 text-[#9b6838] flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif text-base text-[var(--text-puro)] font-medium">Sie</h4>
                <p className="text-[10px] text-[var(--text-puro-muted)] font-mono">Guía de Introspección Serena</p>
              </div>
            </div>

            <button
              onClick={() => setMessages(INITIAL_SIE_MESSAGES)}
              className="p-1.5 rounded-full hover:bg-white/80 text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] transition-colors"
              title="Reiniciar diálogo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-4 rounded-2xl text-xs md:text-sm font-light leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[var(--primary-puro)] text-white rounded-br-none'
                      : 'bg-white/80 text-[var(--text-puro)] border border-neutral-200/60 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Contextual Suggested Ritual Card */}
                  {msg.suggestedRitualId && (
                    <div className="mt-3 pt-3 border-t border-neutral-200/60">
                      {(() => {
                        const sug = rituales.find(r => r.id === msg.suggestedRitualId);
                        if (!sug) return null;
                        return (
                          <button
                            onClick={() => setActiveRitual(sug)}
                            className="w-full p-2.5 rounded-xl bg-[var(--bg-puro)] border border-[var(--primary-puro)]/30 hover:border-[var(--primary-puro)] text-left flex items-center justify-between group cursor-pointer transition-all"
                          >
                            <div>
                              <span className="text-[9px] font-mono text-[var(--primary-puro)] uppercase font-semibold">
                                Ritual Sugerido • {sug.duracionEstimada}
                              </span>
                              <h5 className="font-serif text-xs font-medium text-[var(--text-puro)]">
                                {sug.titulo}
                              </h5>
                            </div>
                            <Play size={12} className="text-[var(--primary-puro)] group-hover:translate-x-1 transition-transform" />
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-[var(--text-puro-muted)] mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white/60 border border-neutral-200/40 w-24">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-puro)] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-puro)] animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-puro)] animate-bounce delay-200" />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-neutral-200/50 bg-white/60 flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe lo que sientes o lo que buscas..."
              className="flex-1 px-4 py-2.5 rounded-full bg-white/90 border border-neutral-200/70 focus:outline-none focus:ring-2 focus:ring-[var(--primary-puro)]/30 text-xs text-[var(--text-puro)] placeholder:text-[var(--text-puro-muted)] shadow-2xs"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-full bg-[var(--primary-puro)] hover:bg-[var(--primary-puro-hover)] text-white disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Active Ritual Player Modal */}
      {activeRitual && (
        <RitualPlayer
          ritual={activeRitual}
          onClose={() => setActiveRitual(null)}
          onComplete={handleRitualCompleted}
        />
      )}

    </div>
  );
}
