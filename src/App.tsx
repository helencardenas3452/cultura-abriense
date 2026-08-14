import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Feather, 
  Compass, 
  Wind, 
  Sun, 
  Moon, 
  ShieldCheck,
  Menu,
  X,
  Heart,
  Droplets,
  BookOpen
} from 'lucide-react';
import { 
  EmotionalFlaskEntry, 
  PresenceEcho, 
  Ritual, 
  SEED_FLASKS, 
  PURO_RITUALS,
  DailySymptomEntry,
  SEED_SYMPTOM_ENTRIES
} from './types';
import GueDashboard from './components/gue/GueDashboard';
import EtereoCanvas from './components/etereo/EtereoCanvas';
import SieGuides from './components/sie/SieGuides';
import SempiternoTimeline from './components/sempiterno/SempiternoTimeline';
import AmbientAudio from './components/ui/AmbientAudio';
import PuroIllustration from './components/ui/PuroIllustration';

export default function App() {
  // Navigation tabs: 'gue' | 'etereo' | 'sie' | 'sempiterno'
  const [activeTab, setActiveTab] = useState<'gue' | 'etereo' | 'sie' | 'sempiterno'>('gue');
  const [isNightMode, setIsNightMode] = useState(false);
  const [showSanctuaryInfo, setShowSanctuaryInfo] = useState(false);

  // Persistent States in LocalStorage
  const [flasks, setFlasks] = useState<EmotionalFlaskEntry[]>(() => {
    const saved = localStorage.getItem('puro_flasks');
    return saved ? JSON.parse(saved) : SEED_FLASKS;
  });

  const [echos, setEchos] = useState<PresenceEcho[]>(() => {
    const saved = localStorage.getItem('puro_echos');
    return saved ? JSON.parse(saved) : [
      {
        id: 'echo-1',
        date: '13 de Agosto',
        type: 'frasco',
        title: 'Presencia Sembrada',
        detail: 'Sellaste un frasco de Calma y Gratitud con el Espejo Socrático.',
        tags: ['Personal', 'Creatividad']
      },
      {
        id: 'echo-2',
        date: '12 de Agosto',
        type: 'ritual',
        title: '5 Minutos de Arraigo',
        detail: 'Completaste una sesión de coherencia y respiración consciente.',
        tags: ['Salud', 'Descanso']
      }
    ];
  });

  const [symptomEntries, setSymptomEntries] = useState<DailySymptomEntry[]>(() => {
    const saved = localStorage.getItem('puro_symptom_entries');
    return saved ? JSON.parse(saved) : SEED_SYMPTOM_ENTRIES;
  });

  const [rituales] = useState<Ritual[]>(PURO_RITUALS);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('puro_flasks', JSON.stringify(flasks));
  }, [flasks]);

  useEffect(() => {
    localStorage.setItem('puro_echos', JSON.stringify(echos));
  }, [echos]);

  useEffect(() => {
    localStorage.setItem('puro_symptom_entries', JSON.stringify(symptomEntries));
  }, [symptomEntries]);

  // Handlers
  const handleSaveFlask = (newFlask: EmotionalFlaskEntry) => {
    setFlasks(prev => [newFlask, ...prev]);
    // Also record presence echo
    const newEcho: PresenceEcho = {
      id: `echo-${Date.now()}`,
      date: 'Hoy',
      type: 'frasco',
      title: 'Frasco Emocional Sellado',
      detail: `Reconociste ${newFlask.emotions.map(e => e.name).join(', ')}.`,
      tags: newFlask.tags || ['Personal']
    };
    setEchos(prev => [newEcho, ...prev]);
  };

  const handleSaveEcho = (title: string, detail: string, tags?: string[]) => {
    const newEcho: PresenceEcho = {
      id: `echo-${Date.now()}`,
      date: 'Hoy',
      type: 'ritual',
      title,
      detail,
      tags: tags || ['Personal']
    };
    setEchos(prev => [newEcho, ...prev]);
  };

  const handleSaveGratitude = (items: [string, string, string]) => {
    const newEcho: PresenceEcho = {
      id: `echo-gratitud-${Date.now()}`,
      date: 'Hoy',
      type: 'gratitud',
      title: 'Cosecha de 3 Gratitudes',
      detail: `1. ${items[0]} — 2. ${items[1]} — 3. ${items[2]}`,
      items,
      tags: ['Personal', 'Gratitud']
    };
    setEchos(prev => [newEcho, ...prev]);
  };

  const handleUpdateEcho = (updatedEcho: PresenceEcho) => {
    setEchos(prev => prev.map(e => e.id === updatedEcho.id ? updatedEcho : e));
  };

  const handleUpdateFlask = (updatedFlask: EmotionalFlaskEntry) => {
    setFlasks(prev => prev.map(f => f.id === updatedFlask.id ? updatedFlask : f));
  };

  const handleSaveSymptomEntry = (entry: DailySymptomEntry) => {
    setSymptomEntries(prev => {
      const existingIndex = prev.findIndex(e => e.date === entry.date);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = entry;
        return next;
      }
      return [entry, ...prev];
    });

    // Also record a gentle presence echo for listening to one's body
    if (entry.symptoms.length > 0) {
      const newEcho: PresenceEcho = {
        id: `echo-sintoma-${Date.now()}`,
        date: entry.timestamp || 'Hoy',
        type: 'respiracion',
        title: 'Escucha Somática Diaria',
        detail: `Registraste ${entry.symptoms.length} sensación/es: ${entry.symptoms.map(s => s.name).join(', ')}.`,
        tags: ['Salud', 'Personal']
      };
      setEchos(prev => [newEcho, ...prev]);
    }
  };

  const handleDeleteSymptomEntry = (id: string) => {
    setSymptomEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleQuickRitualFromGue = (ritualId: string) => {
    setActiveTab('sie');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ${isNightMode ? 'bg-ambient-night text-neutral-100' : 'bg-ambient-grain text-[#2b302c]'}`}>
      
      {/* Top Serene Header Bar */}
      <header className="sticky top-0 z-40 px-4 md:px-8 py-3.5 backdrop-blur-md bg-white/40 border-b border-white/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSanctuaryInfo(true)}
            className="p-1.5 rounded-full hover:bg-white/60 text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] transition-colors cursor-pointer"
            title="Acerca de PURO"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div 
            onClick={() => setActiveTab('gue')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="font-serif text-2xl tracking-wider font-light text-[var(--text-puro)] group-hover:text-[var(--primary-puro)] transition-colors">
              PURO
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--primary-puro)] opacity-80 font-medium hidden sm:inline-block">
              • Refugio Emocional
            </span>
          </div>
        </div>

        {/* Right Tools: Ambient Sound & Night Toggle */}
        <div className="flex items-center gap-2.5">
          <AmbientAudio />

          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className="p-2 rounded-full bg-white/60 hover:bg-white text-[var(--text-puro-muted)] border border-neutral-200/50 shadow-2xs transition-all cursor-pointer"
            title={isNightMode ? "Cambiar a modo día cálido" : "Cambiar a modo noche serena"}
          >
            {isNightMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>
        </div>
      </header>

      {/* Sanctuary Manifesto Slideout */}
      <AnimatePresence>
        {showSanctuaryInfo && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/30 backdrop-blur-xs" 
              onClick={() => setShowSanctuaryInfo(false)} 
            />
            <motion.div 
              initial={{ x: -320 }} 
              animate={{ x: 0 }} 
              exit={{ x: -320 }} 
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-80 max-w-[85vw] p-8 glass-puro border-r border-white/80 h-full flex flex-col justify-between z-10 overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-200/60">
                  <span className="font-mono text-[11px] font-bold tracking-widest text-[var(--primary-puro)] uppercase">
                    FILOSOFÍA PURO
                  </span>
                  <button onClick={() => setShowSanctuaryInfo(false)} className="p-1 hover:bg-white/80 rounded-full text-neutral-400 hover:text-neutral-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-light leading-relaxed text-[var(--text-puro-muted)]">
                  <p>
                    <strong>PURO</strong> es un refugio digital concebido bajo los principios de la <em>Tecnología Serena (Calm Technology)</em>.
                  </p>
                  <p>
                    Aquí no hay notificaciones invasivas, métricas de juicio ni algoritmos de enganche. Todo está diseñado para acompañar tu introspección y devolverte la paz.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-neutral-200/60">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--primary-puro)] font-semibold">
                    PILIARES DEL REFUGIO
                  </span>
                  <ul className="text-xs space-y-2 font-light">
                    <li>🌿 <strong>Güe:</strong> Refugio y bienvenida serena.</li>
                    <li>☁️ <strong>Etéreo:</strong> Frasco interactivo y Espejo Socrático.</li>
                    <li>🌬️ <strong>Sie:</strong> Guías vivas y rituales de calma.</li>
                    <li>🌙 <strong>Sempiterno:</strong> Tapiz histórico y ecos del ser.</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--primary-puro)] bg-[var(--primary-puro)]/10 p-3 rounded-2xl">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Cifrado E2EE local y privacidad absoluta.</span>
                </div>
              </div>

              <div className="pt-8 text-center text-[10px] font-mono text-neutral-400">
                “La calma es el suelo donde florece el alma.”
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'gue' && (
            <motion.div
              key="gue"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <GueDashboard 
                recentFlasks={flasks}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onQuickRitual={handleQuickRitualFromGue}
                onSaveGratitude={handleSaveGratitude}
                symptomEntries={symptomEntries}
                onSaveSymptomEntry={handleSaveSymptomEntry}
                onDeleteSymptomEntry={handleDeleteSymptomEntry}
              />
            </motion.div>
          )}

          {activeTab === 'etereo' && (
            <motion.div
              key="etereo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <EtereoCanvas onSaveFlask={handleSaveFlask} />
            </motion.div>
          )}

          {activeTab === 'sie' && (
            <motion.div
              key="sie"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <SieGuides 
                rituales={rituales}
                onSaveEcho={handleSaveEcho}
                flasks={flasks}
                onNavigateToEtereo={() => setActiveTab('etereo')}
              />
            </motion.div>
          )}

          {activeTab === 'sempiterno' && (
            <motion.div
              key="sempiterno"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <SempiternoTimeline 
                flasks={flasks}
                echos={echos}
                onUpdateEcho={handleUpdateEcho}
                onUpdateFlask={handleUpdateFlask}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Serene Bottom Navigation Bar */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg p-2 rounded-full glass-puro shadow-puro border border-white/80 flex items-center justify-around">
        
        {/* Nav 1: Güe */}
        <button
          onClick={() => setActiveTab('gue')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
            activeTab === 'gue'
              ? 'bg-[var(--primary-puro)] text-white shadow-xs font-medium'
              : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)]'
          }`}
        >
          <span className="text-sm">🌿</span>
          <span className="tracking-wide">Güe</span>
        </button>

        {/* Nav 2: Etéreo */}
        <button
          onClick={() => setActiveTab('etereo')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
            activeTab === 'etereo'
              ? 'bg-[var(--primary-puro)] text-white shadow-xs font-medium'
              : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)]'
          }`}
        >
          <span className="text-sm">☁️</span>
          <span className="tracking-wide">Etéreo</span>
        </button>

        {/* Nav 3: Sie */}
        <button
          onClick={() => setActiveTab('sie')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
            activeTab === 'sie'
              ? 'bg-[var(--primary-puro)] text-white shadow-xs font-medium'
              : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)]'
          }`}
        >
          <span className="text-sm">🌬️</span>
          <span className="tracking-wide">Sie</span>
        </button>

        {/* Nav 4: Sempiterno */}
        <button
          onClick={() => setActiveTab('sempiterno')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
            activeTab === 'sempiterno'
              ? 'bg-[var(--primary-puro)] text-white shadow-xs font-medium'
              : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)]'
          }`}
        >
          <span className="text-sm">🌙</span>
          <span className="tracking-wide">Sempiterno</span>
        </button>

      </nav>

    </div>
  );
}
