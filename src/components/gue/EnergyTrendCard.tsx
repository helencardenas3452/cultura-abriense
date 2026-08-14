import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  Sparkles, 
  Heart, 
  Calendar,
  Compass,
  ArrowRight
} from 'lucide-react';
import { EmotionalFlaskEntry } from '../../types';

interface EnergyTrendCardProps {
  flasks: EmotionalFlaskEntry[];
  onNavigateToEtereo?: () => void;
  onNavigateToSie?: () => void;
}

// Valence mapping for calculating emotional mood / energy score (1 to 5 scale)
const EMOTION_VALENCE_MAP: Record<string, number> = {
  gratitud: 5.0,
  calma: 4.6,
  asombro: 4.3,
  esperanza: 4.1,
  melancolia: 3.1,
  pesadez: 2.3,
  ansiedad: 1.8,
  ira: 1.5
};

export default function EnergyTrendCard({ 
  flasks, 
  onNavigateToEtereo, 
  onNavigateToSie 
}: EnergyTrendCardProps) {

  // Calculate mood / energy score for each flask
  const calculateFlaskScore = (flask: EmotionalFlaskEntry): number => {
    if (!flask.emotions || flask.emotions.length === 0) return 3.0;
    let totalWeightedScore = 0;
    let totalIntensity = 0;

    flask.emotions.forEach(em => {
      const id = (em.emotionId || em.name.toLowerCase()).trim();
      const valence = EMOTION_VALENCE_MAP[id] ?? 3.0;
      const intensity = em.intensity || 1;
      totalWeightedScore += valence * intensity;
      totalIntensity += intensity;
    });

    return totalIntensity > 0 ? totalWeightedScore / totalIntensity : 3.0;
  };

  const trendData = useMemo(() => {
    if (!flasks || flasks.length === 0) {
      return {
        recentAvg: 0,
        prevAvg: 0,
        diff: 0,
        recentCount: 0,
        prevCount: 0,
        emoji: '🌿',
        title: 'Comenzando el Camino',
        description: 'Registra tus primeros frascos emocionales para activar el cálculo de tendencia de energía.',
        colorClass: 'text-[var(--primary-puro)]',
        bgGlow: 'bg-[var(--primary-puro)]/10',
        borderColor: 'border-[var(--primary-puro)]/30',
        trendType: 'neutral' as const
      };
    }

    const now = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(now.getDate() - 3);

    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(now.getDate() - 6);

    const parseFlaskDate = (dStr: string) => {
      if (!dStr) return new Date();
      const parsed = new Date(dStr);
      return !isNaN(parsed.getTime()) ? parsed : new Date();
    };

    // Filter into two 3-day time windows
    const recentFlasks = flasks.filter(f => {
      const d = parseFlaskDate(f.date);
      return d >= threeDaysAgo;
    });

    const prevFlasks = flasks.filter(f => {
      const d = parseFlaskDate(f.date);
      return d < threeDaysAgo && d >= sixDaysAgo;
    });

    let recentAvg = 0;
    let prevAvg = 0;
    let recentCount = recentFlasks.length;
    let prevCount = prevFlasks.length;

    if (recentFlasks.length > 0) {
      const sum = recentFlasks.reduce((acc, f) => acc + calculateFlaskScore(f), 0);
      recentAvg = Number((sum / recentFlasks.length).toFixed(1));
    }

    if (prevFlasks.length > 0) {
      const sum = prevFlasks.reduce((acc, f) => acc + calculateFlaskScore(f), 0);
      prevAvg = Number((sum / prevFlasks.length).toFixed(1));
    } else if (flasks.length > recentFlasks.length) {
      // If no flasks in exactly [3-6 days ago], use older flasks as the baseline comparison
      const olderFlasks = flasks.filter(f => !recentFlasks.includes(f));
      if (olderFlasks.length > 0) {
        const sum = olderFlasks.reduce((acc, f) => acc + calculateFlaskScore(f), 0);
        prevAvg = Number((sum / olderFlasks.length).toFixed(1));
        prevCount = olderFlasks.length;
      }
    } else if (recentFlasks.length >= 2) {
      // If all flasks are within 3 days, split into newest half vs older half
      const midpoint = Math.ceil(recentFlasks.length / 2);
      const half1 = recentFlasks.slice(0, midpoint);
      const half2 = recentFlasks.slice(midpoint);
      
      const sum1 = half1.reduce((acc, f) => acc + calculateFlaskScore(f), 0);
      const sum2 = half2.reduce((acc, f) => acc + calculateFlaskScore(f), 0);
      recentAvg = Number((sum1 / half1.length).toFixed(1));
      prevAvg = Number((sum2 / half2.length).toFixed(1));
      recentCount = half1.length;
      prevCount = half2.length;
    } else {
      // Single recent flask baseline
      prevAvg = recentAvg;
      prevCount = 1;
    }

    const diff = Number((recentAvg - prevAvg).toFixed(1));

    // Determine Emoji & Trend Insight
    let emoji = '✨';
    let title = 'Energía en Expansión';
    let description = 'Tu pulso anímico refleja mayor ligereza, gratitud y claridad respecto a días anteriores.';
    let colorClass = 'text-amber-600 dark:text-amber-400';
    let bgGlow = 'bg-amber-500/10';
    let borderColor = 'border-amber-500/30';
    let trendType: 'up' | 'down' | 'stable' | 'neutral' = 'up';

    if (diff >= 0.3 || (recentAvg >= 4.3 && diff >= 0)) {
      emoji = '☀️';
      title = 'Energía Radiante & Apertura';
      description = 'Tus registros de los últimos 3 días muestran una clara elevación hacia la serenidad y la gratitud.';
      colorClass = 'text-amber-600 dark:text-amber-400';
      bgGlow = 'bg-amber-500/15';
      borderColor = 'border-amber-400/40';
      trendType = 'up';
    } else if (diff >= 0.1) {
      emoji = '🌱';
      title = 'Serenidad en Crecimiento';
      description = 'Se percibe una suave tendencia al alza en tu bienestar emocional y estabilidad interna.';
      colorClass = 'text-emerald-700 dark:text-emerald-400';
      bgGlow = 'bg-emerald-500/15';
      borderColor = 'border-emerald-400/40';
      trendType = 'up';
    } else if (diff >= -0.2) {
      emoji = '🍃';
      title = 'Equilibrio Sereno & Constante';
      description = 'Tu energía anímica se mantiene en un balance templado y armónico, sosteniendo un ritmo consciente.';
      colorClass = 'text-[var(--primary-puro)]';
      bgGlow = 'bg-[var(--primary-puro)]/15';
      borderColor = 'border-[var(--primary-puro)]/30';
      trendType = 'stable';
    } else if (diff >= -0.6) {
      emoji = '🌙';
      title = 'Pausa & Recogimiento';
      description = 'Tus emociones reflejan una energía más introspectiva y necesidad de reposo. Abrázate con compasión.';
      colorClass = 'text-purple-700 dark:text-purple-400';
      bgGlow = 'bg-purple-500/15';
      borderColor = 'border-purple-400/40';
      trendType = 'down';
    } else {
      emoji = '🕯️';
      title = 'Tiempo de Cobijo & Desahogo';
      description = 'Has albergado sentires intensos o demandantes. Es un momento propicio para soltar sin exigirte.';
      colorClass = 'text-rose-700 dark:text-rose-400';
      bgGlow = 'bg-rose-500/15';
      borderColor = 'border-rose-400/40';
      trendType = 'down';
    }

    return {
      recentAvg,
      prevAvg,
      diff,
      recentCount,
      prevCount,
      emoji,
      title,
      description,
      colorClass,
      bgGlow,
      borderColor,
      trendType
    };
  }, [flasks]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="p-6 md:p-8 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/80 dark:border-neutral-800 relative overflow-hidden space-y-6"
    >
      {/* Soft Ambient Background Glow */}
      <div className={`absolute top-0 right-0 w-72 h-72 ${trendData.bgGlow} rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 transition-colors duration-700`} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary-puro)]/15 text-[10px] font-mono uppercase tracking-wider text-[var(--primary-puro)] font-semibold mb-1">
            <Zap className="w-3 h-3" />
            <span>Pulso de Energía Emocional</span>
          </div>
          <h3 className="font-serif text-2xl font-normal text-[var(--text-puro)]">
            Tendencia de los Últimos 3 Días
          </h3>
          <p className="text-xs text-[var(--text-puro-muted)] font-light">
            Comparativa del estado anímico reciente frente a los 3 días anteriores.
          </p>
        </div>

        {/* Trend Indicator Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {trendData.trendType === 'up' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>+{trendData.diff > 0 ? trendData.diff : 0.0} pts (Alza)</span>
            </span>
          )}
          {trendData.trendType === 'stable' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-mono font-medium shadow-2xs">
              <Minus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{trendData.diff >= 0 ? `+${trendData.diff}` : trendData.diff} pts (Estable)</span>
            </span>
          )}
          {trendData.trendType === 'down' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-mono font-medium shadow-2xs">
              <TrendingDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{trendData.diff} pts (Recogimiento)</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Content: Emoji + Comparative Scale Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left / Center Feature: Energy Emoji Visualizer */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 shadow-2xs space-y-2">
          
          <motion.div 
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-md border bg-white dark:bg-neutral-800 select-none cursor-default"
            style={{ borderColor: 'rgba(132, 165, 157, 0.3)' }}
          >
            {trendData.emoji}
          </motion.div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-puro-muted)] block">
              ESTADO VITAL
            </span>
            <h4 className="font-serif text-lg font-medium text-[var(--text-puro)]">
              {trendData.title}
            </h4>
          </div>
        </div>

        {/* Right: Comparative Breakdown & Socratic Wisdom */}
        <div className="md:col-span-8 space-y-4">
          
          {/* Comparative Metrics Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Period 1: Últimos 3 Días */}
            <div className="p-4 rounded-2xl bg-white/75 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[var(--text-puro-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[var(--primary-puro)]" />
                  Últimos 3 Días
                </span>
                <span className="font-bold text-[var(--text-puro)]">
                  {trendData.recentAvg > 0 ? `${trendData.recentAvg} / 5.0` : '—'}
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 rounded-full bg-neutral-200/60 dark:bg-neutral-700 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(trendData.recentAvg / 5) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-[var(--primary-puro)]"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[var(--text-puro-muted)] font-mono">
                <span>{trendData.recentCount} {trendData.recentCount === 1 ? 'frasco registrado' : 'frascos registrados'}</span>
                <span>Promedio actual</span>
              </div>
            </div>

            {/* Period 2: 3 Días Anteriores */}
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-700/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[var(--text-puro-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-neutral-400" />
                  3 Días Anteriores
                </span>
                <span className="font-medium text-[var(--text-puro-muted)]">
                  {trendData.prevAvg > 0 ? `${trendData.prevAvg} / 5.0` : '—'}
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 rounded-full bg-neutral-200/50 dark:bg-neutral-700/60 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(trendData.prevAvg / 5) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                  className="h-full rounded-full bg-neutral-400 dark:bg-neutral-500"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[var(--text-puro-muted)] font-mono">
                <span>{trendData.prevCount} {trendData.prevCount === 1 ? 'frasco base' : 'frascos base'}</span>
                <span>Período previo</span>
              </div>
            </div>

          </div>

          {/* Socratic Guidance & Meaning */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/60 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[var(--primary-puro)] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-serif">Comprensión del Momento Presente</span>
            </div>
            <p className="text-[var(--text-puro-muted)] font-light leading-relaxed">
              {trendData.description}
            </p>
          </div>

        </div>

      </div>

      {/* Footer Navigation */}
      <div className="pt-3 border-t border-neutral-200/50 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-[11px] text-[var(--text-puro-muted)] font-serif italic">
          “La energía fluye y refluye como las mareas; honrar cada ciclo es la clave de la serenidad.”
        </span>

        <div className="flex items-center gap-3">
          {onNavigateToEtereo && (
            <button
              onClick={onNavigateToEtereo}
              className="text-xs text-[var(--primary-puro)] hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
            >
              <span>Verter Frasco Hoy</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

    </motion.section>
  );
}
