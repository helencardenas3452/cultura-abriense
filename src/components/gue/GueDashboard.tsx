import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Feather, 
  Wind, 
  Sparkles, 
  Compass, 
  Moon, 
  Sun, 
  Clock, 
  ChevronRight, 
  Heart,
  BookOpen,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import PuroIllustration from '../ui/PuroIllustration';
import { EmotionalFlaskEntry, Ritual, DailySymptomEntry } from '../../types';
import WeeklyMoodBarChart from './WeeklyMoodBarChart';
import EnergyTrendCard from './EnergyTrendCard';
import DailyGratitudeCard from './DailyGratitudeCard';
import SymptomTrackerCard from './SymptomTrackerCard';

interface GueDashboardProps {
  recentFlasks: EmotionalFlaskEntry[];
  onNavigateTab: (tab: 'etereo' | 'sie' | 'sempiterno') => void;
  onQuickRitual: (ritualId: string) => void;
  onSaveGratitude?: (items: [string, string, string]) => void;
  symptomEntries?: DailySymptomEntry[];
  onSaveSymptomEntry?: (entry: DailySymptomEntry) => void;
  onDeleteSymptomEntry?: (id: string) => void;
}

export default function GueDashboard({ 
  recentFlasks, 
  onNavigateTab,
  onQuickRitual,
  onSaveGratitude,
  symptomEntries = [],
  onSaveSymptomEntry,
  onDeleteSymptomEntry
}: GueDashboardProps) {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhala' | 'Sostén' | 'Exhala'>('Inhala');

  // Time greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Buenos días de quietud', icon: Sun, moment: 'Amanecer' };
    if (hour < 19) return { text: 'Tarde de presencia', icon: Sun, moment: 'Luz del día' };
    return { text: 'Noche de recogimiento', icon: Moon, moment: 'Crepúsculo' };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const latestFlask = recentFlasks[0];

  const handleStartQuickBreath = () => {
    setBreathingActive(true);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count % 3 === 1) setBreathPhase('Inhala');
      else if (count % 3 === 2) setBreathPhase('Sostén');
      else setBreathPhase('Exhala');

      if (count > 9) {
        clearInterval(interval);
        setBreathingActive(false);
      }
    }, 3000);
  };

  return (
    <div className="space-y-12 pb-20 max-w-5xl mx-auto">
      
      {/* Hero Welcome Sanctuary */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-6 md:py-10 relative"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-[var(--primary-puro)]/20 text-[11px] uppercase tracking-[0.2em] text-[var(--primary-puro)] mb-6 font-medium">
          <GreetingIcon className="w-3.5 h-3.5" />
          <span>Güe — El Refugio de Calma</span>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-[var(--text-puro)] tracking-tight mb-4 leading-tight">
          {greeting.text}.
        </h1>
        
        <p className="font-serif italic text-lg md:text-xl text-[var(--text-puro-muted)] max-w-xl mx-auto leading-relaxed">
          “No hay prisa en el alma. Cada emoción que sientes es un huésped que trae un mensaje digno de ser escuchado.”
        </p>

        <div className="my-6">
          <PuroIllustration type="leaf" className="w-20 h-20 text-[var(--primary-puro)]" />
        </div>
      </motion.section>

      {/* Mini Breathing Sanctuary Interactor */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-6 md:p-8 rounded-[var(--radius-puro)] glass-puro shadow-puro relative overflow-hidden border border-white/60"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--primary-puro)] font-semibold">
              Pausa de Consciencia
            </span>
            <h3 className="font-serif text-2xl font-normal text-[var(--text-puro)]">
              Respira con el ritmo del refugio
            </h3>
            <p className="text-xs text-[var(--text-puro-muted)] max-w-md leading-relaxed">
              Tres respiraciones conscientes reducen el cortisol y devuelven tu atención al presente.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <motion.div 
                className="absolute inset-0 rounded-full bg-[var(--primary-puro)]/15"
                animate={breathingActive ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="w-12 h-12 rounded-full bg-[var(--primary-puro)] flex items-center justify-center text-white shadow-sm"
                animate={breathingActive ? { scale: [0.9, 1.1, 0.9] } : { scale: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Wind className="w-5 h-5" />
              </motion.div>
            </div>

            {breathingActive ? (
              <div className="text-center md:text-left">
                <span className="font-serif text-xl italic text-[var(--primary-puro)] block">{breathPhase}...</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-puro-muted)]">Sigue el pulso</span>
              </div>
            ) : (
              <button
                onClick={handleStartQuickBreath}
                className="px-5 py-2.5 rounded-full bg-[var(--primary-puro)] hover:bg-[var(--primary-puro-hover)] text-white text-xs font-medium tracking-wide transition-all shadow-sm cursor-pointer hover:shadow-md active:scale-95"
              >
                Comenzar Pausa
              </button>
            )}
          </div>
        </div>
      </motion.section>

      {/* The 3 Pillars Architecture */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-light text-[var(--text-puro)]">
            Los Tres Pilares del Refugio
          </h2>
          <span className="text-[11px] font-mono text-[var(--text-puro-muted)] uppercase tracking-wider">
            Arquitectura Puro
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: Etéreo */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => onNavigateTab('etereo')}
            className="p-7 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/60 flex flex-col justify-between cursor-pointer group hover:border-[var(--primary-puro)]/40 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#84a59d]/20 text-[#4c6a62] flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#4c6a62] font-semibold">PILAR I</span>
                <span className="text-xs text-neutral-300">•</span>
                <span className="text-xs text-[var(--text-puro-muted)]">Canvas 2D</span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-[var(--text-puro)] mb-2 group-hover:text-[var(--primary-puro)] transition-colors">
                Etéreo
              </h3>
              <p className="text-xs text-[var(--text-puro-muted)] leading-relaxed font-light">
                Vierte tus emociones en el frasco interactivo. Deja que el <strong>Espejo Socrático</strong> formule preguntas reveladoras sobre tu sentir.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-200/50 flex items-center justify-between text-xs font-medium text-[var(--primary-puro)]">
              <span>Depositar Emoción</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </motion.div>

          {/* Pillar 2: Sie */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => onNavigateTab('sie')}
            className="p-7 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/60 flex flex-col justify-between cursor-pointer group hover:border-[var(--secondary-puro)]/40 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#d4a373]/20 text-[#9b6838] flex items-center justify-center mb-5">
                <Feather className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9b6838] font-semibold">PILAR II</span>
                <span className="text-xs text-neutral-300">•</span>
                <span className="text-xs text-[var(--text-puro-muted)]">Guías Vivas</span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-[var(--text-puro)] mb-2 group-hover:text-[var(--secondary-puro)] transition-colors">
                Sie
              </h3>
              <p className="text-xs text-[var(--text-puro-muted)] leading-relaxed font-light">
                Conversa con la IA de introspección y explora el catálogo de rituales paso a paso (arraigo, desahogo y calma profunda).
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-200/50 flex items-center justify-between text-xs font-medium text-[#9b6838]">
              <span>Explorar Rituales</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </motion.div>

          {/* Pillar 3: Sempiterno */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => onNavigateTab('sempiterno')}
            className="p-7 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/60 flex flex-col justify-between cursor-pointer group hover:border-[#9a8c98]/40 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#9a8c98]/20 text-[#5c4f5a] flex items-center justify-center mb-5">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#5c4f5a] font-semibold">PILAR III</span>
                <span className="text-xs text-neutral-300">•</span>
                <span className="text-xs text-[var(--text-puro-muted)]">Tapiz Histórico</span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-[var(--text-puro)] mb-2 group-hover:text-[#5c4f5a] transition-colors">
                Sempiterno
              </h3>
              <p className="text-xs text-[var(--text-puro-muted)] leading-relaxed font-light">
                El mapa de tus emociones en el tiempo. Revisa tus reflexiones pasadas, frascos sellados y ecos de presencia personal.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-200/50 flex items-center justify-between text-xs font-medium text-[#5c4f5a]">
              <span>Ver Mapa del Ser</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </motion.div>

        </div>
      </section>

      {/* Daily 3 Gratitudes Sanctuary Card */}
      {onSaveGratitude && (
        <DailyGratitudeCard 
          onSaveGratitude={onSaveGratitude}
          onNavigateToSempiterno={() => onNavigateTab('sempiterno')}
        />
      )}

      {/* Somatic & Physical Symptom Tracker with 3+ Day Persistence Alert */}
      {onSaveSymptomEntry && (
        <SymptomTrackerCard
          symptomEntries={symptomEntries}
          onSaveSymptomEntry={onSaveSymptomEntry}
          onDeleteSymptomEntry={onDeleteSymptomEntry}
          onQuickRitual={onQuickRitual}
        />
      )}

      {/* 3-Day Energy & Mood Pulse Trend */}
      <EnergyTrendCard 
        flasks={recentFlasks}
        onNavigateToEtereo={() => onNavigateTab('etereo')}
        onNavigateToSie={() => onNavigateTab('sie')}
      />

      {/* Weekly Mood Frequency Visualizer (Recharts) */}
      <WeeklyMoodBarChart 
        flasks={recentFlasks} 
        onNavigateToEtereo={() => onNavigateTab('etereo')}
      />

      {/* Latest Emotional Reflection Highlight */}
      {latestFlask && (
        <section className="p-7 rounded-[var(--radius-puro)] bg-gradient-to-br from-white/80 to-white/40 border border-white/80 shadow-puro">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--primary-puro)] font-bold">
                  Último Frasco Sellado
                </span>
                <span className="text-xs text-neutral-400 font-mono">{latestFlask.timestamp}</span>
              </div>
              <h4 className="font-serif text-xl italic text-[var(--text-puro)]">
                "{latestFlask.socraticQuestion}"
              </h4>
              <p className="text-xs text-[var(--text-puro-muted)] leading-relaxed font-light max-w-2xl">
                {latestFlask.socraticReflection}
              </p>
            </div>

            <div className="flex flex-wrap md:flex-col justify-end items-end gap-2 shrink-0">
              <div className="flex gap-1.5">
                {latestFlask.emotions.map((em, idx) => (
                  <span 
                    key={idx}
                    style={{ backgroundColor: `${em.color}25`, color: em.color, borderColor: `${em.color}40` }}
                    className="px-3 py-1 rounded-full text-[11px] font-medium border"
                  >
                    {em.name}
                  </span>
                ))}
              </div>
              <button 
                onClick={() => onNavigateTab('sempiterno')}
                className="text-[11px] text-[var(--primary-puro)] underline hover:no-underline font-medium mt-1 cursor-pointer"
              >
                Ver en Sempiterno →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Rituals Quick Recommendations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-light text-[var(--text-puro)]">
              Rituales de Calma Recomendados
            </h3>
            <p className="text-xs text-[var(--text-puro-muted)]">Prácticas guiadas para devolver el centro a tu mente.</p>
          </div>
          <button 
            onClick={() => onNavigateTab('sie')}
            className="text-xs text-[var(--primary-puro)] font-medium underline underline-offset-4 cursor-pointer"
          >
            Ver Catálogo Completo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => onQuickRitual('arraigo-5min')}
            className="p-5 rounded-2xl glass-puro border border-white/60 hover:border-[var(--primary-puro)]/40 transition-all cursor-pointer flex items-center justify-between group shadow-sm hover:shadow-md"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[var(--primary-puro)] tracking-wider">5 MIN • ARRAIGO</span>
              <h4 className="font-serif text-lg text-[var(--text-puro)] group-hover:text-[var(--primary-puro)] transition-colors">
                5 Minutos de Arraigo
              </h4>
              <p className="text-xs text-[var(--text-puro-muted)] line-clamp-1 font-light">
                Anclar la mente al cuerpo mediante los sentidos.
              </p>
            </div>
            <span className="p-2.5 rounded-full bg-white text-[var(--primary-puro)] shadow-xs group-hover:scale-105 transition-transform">
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          <div 
            onClick={() => onQuickRitual('desahogo-escrito')}
            className="p-5 rounded-2xl glass-puro border border-white/60 hover:border-[var(--secondary-puro)]/40 transition-all cursor-pointer flex items-center justify-between group shadow-sm hover:shadow-md"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#9b6838] tracking-wider">7 MIN • DESAHOGO</span>
              <h4 className="font-serif text-lg text-[var(--text-puro)] group-hover:text-[var(--secondary-puro)] transition-colors">
                Escritura de Desahogo
              </h4>
              <p className="text-xs text-[var(--text-puro-muted)] line-clamp-1 font-light">
                Vaciar la mente sin filtro ni puntuación obligatoria.
              </p>
            </div>
            <span className="p-2.5 rounded-full bg-white text-[#9b6838] shadow-xs group-hover:scale-105 transition-transform">
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
