import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  Calendar, 
  Copy, 
  Check, 
  Droplets, 
  Flame, 
  Award,
  ChevronDown,
  ChevronUp,
  Compass,
  Activity,
  Heart
} from 'lucide-react';
import { EmotionalFlaskEntry, PresenceEcho, PURO_EMOTIONS } from '../../types';

interface MonthlyReportCardProps {
  flasks: EmotionalFlaskEntry[];
  echos: PresenceEcho[];
}

export default function MonthlyReportCard({ flasks, echos }: MonthlyReportCardProps) {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0); // 0 = current month, -1 = last month, etc.
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Compute Target Month & Year
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + selectedMonthOffset);
    return d;
  }, [selectedMonthOffset]);

  const monthName = useMemo(() => {
    return targetDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }, [targetDate]);

  // Metrics computation for the selected month
  const monthlyMetrics = useMemo(() => {
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    // Filter flasks from this month
    const monthFlasks = flasks.filter(f => {
      if (!f.date) return true;
      const d = new Date(f.date);
      return !isNaN(d.getTime()) 
        ? d.getFullYear() === targetYear && d.getMonth() === targetMonth 
        : true;
    });

    // Filter echos from this month
    const monthEchos = echos.filter(e => {
      if (!e.date) return true;
      const d = new Date(e.date);
      return !isNaN(d.getTime())
        ? d.getFullYear() === targetYear && d.getMonth() === targetMonth
        : true;
    });

    // Mood frequency and intensities
    const emotionSummary: Record<string, { name: string; count: number; totalIntensity: number; color: string }> = {};
    let totalDrops = 0;
    let totalIntensitySum = 0;
    let totalEmotionEntries = 0;

    monthFlasks.forEach(flask => {
      flask.emotions.forEach(em => {
        const id = em.emotionId || em.name.toLowerCase();
        if (!emotionSummary[id]) {
          emotionSummary[id] = {
            name: em.name,
            count: 0,
            totalIntensity: 0,
            color: em.color || '#84a59d'
          };
        }
        emotionSummary[id].count += 1;
        emotionSummary[id].totalIntensity += (em.intensity || 1);
        totalDrops += (em.intensity || 1);
        totalIntensitySum += (em.intensity || 1);
        totalEmotionEntries += 1;
      });
    });

    // Average mood intensity across all registered emotion drops
    const averageIntensity = totalEmotionEntries > 0
      ? Number((totalIntensitySum / totalEmotionEntries).toFixed(1))
      : 0;

    // Sort emotions by count
    const sortedEmotions = Object.values(emotionSummary).sort((a, b) => b.totalIntensity - a.totalIntensity);
    const dominantMood = sortedEmotions.length > 0 ? sortedEmotions[0] : null;

    // Key activities breakdown (rituals by title)
    const ritualsBreakdown: Record<string, number> = {};
    monthEchos.forEach(e => {
      ritualsBreakdown[e.title] = (ritualsBreakdown[e.title] || 0) + 1;
    });

    // Unique active days in the month
    const activeDaysSet = new Set<string>();
    monthFlasks.forEach(f => {
      if (f.date) activeDaysSet.add(f.date.split('T')[0]);
    });
    monthEchos.forEach(e => {
      if (e.date) activeDaysSet.add(e.date.split('T')[0]);
    });

    return {
      monthFlasks,
      monthEchos,
      totalDrops,
      averageIntensity,
      dominantMood,
      sortedEmotions,
      ritualsBreakdown,
      activeDaysCount: activeDaysSet.size
    };
  }, [flasks, echos, targetDate]);

  // Narrative Textual Summary Generation
  const textualReport = useMemo(() => {
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const { 
      monthFlasks, 
      monthEchos, 
      totalDrops, 
      averageIntensity, 
      dominantMood, 
      sortedEmotions, 
      ritualsBreakdown, 
      activeDaysCount 
    } = monthlyMetrics;

    let text = `====================================================\n`;
    text += `🌿 REPORTE MENSUAL DE INTROSPECCIÓN — PURO\n`;
    text += `Período: ${capitalizedMonth}\n`;
    text += `====================================================\n\n`;

    text += `1. BALANCE GENERAL DE PRESENCIA\n`;
    text += `• Días con momentos de calma registrados: ${activeDaysCount} días\n`;
    text += `• Frascos emocionales sellados: ${monthFlasks.length}\n`;
    text += `• Rituales y ecos de presencia realizados: ${monthEchos.length}\n`;
    text += `• Volumen total de sentires cultivados: ${totalDrops} gotas\n\n`;

    text += `2. PROMEDIO Y FRECUENCIA DE ESTADOS DE ÁNIMO\n`;
    text += `• Intensidad emocional promedio: ${averageIntensity} / 5.0\n`;
    if (dominantMood) {
      text += `• Estado predominante del mes: ${dominantMood.name.toUpperCase()} (${dominantMood.count} ocasiones, ${dominantMood.totalIntensity} gotas acumuladas)\n`;
    }

    if (sortedEmotions.length > 0) {
      text += `\nDesglose de emociones reconocidas:\n`;
      sortedEmotions.forEach(e => {
        const avg = (e.totalIntensity / e.count).toFixed(1);
        text += `  - ${e.name}: ${e.count} veces | Intensidad media: ${avg}/5 | Total: ${e.totalIntensity} gotas\n`;
      });
    } else {
      text += `(No se registraron frascos durante este período)\n`;
    }
    text += `\n`;

    text += `3. RECUENTO DE RITUALES Y ACTIVIDADES CLAVE\n`;
    const ritualEntries = Object.entries(ritualsBreakdown);
    if (ritualEntries.length > 0) {
      ritualEntries.forEach(([title, count]) => {
        text += `  • ${title}: ${count} ${count === 1 ? 'sesión completada' : 'sesiones completadas'}\n`;
      });
    } else {
      text += `(No se completaron rituales guiados en este mes)\n`;
    }
    text += `\n`;

    text += `4. SÍNTESIS SOCRÁTICA & MENSAJE DE CIERRE\n`;
    if (monthFlasks.length > 0) {
      const sampleQuestion = monthFlasks[0].socraticQuestion;
      text += `Pregunta guía del mes:\n  "${sampleQuestion}"\n\n`;
    }
    text += `“Cuidar de tu mundo interior no es llegar a un destino perfecto, sino aprender a regresar a ti con compasión y calma.”\n`;
    text += `====================================================\n`;

    return text;
  }, [monthlyMetrics, monthName]);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(textualReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const { 
    monthFlasks, 
    monthEchos, 
    averageIntensity, 
    dominantMood, 
    sortedEmotions, 
    ritualsBreakdown, 
    activeDaysCount,
    totalDrops
  } = monthlyMetrics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-8 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/80 space-y-6 relative overflow-hidden"
    >
      {/* Decorative Accent Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-puro)]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary-puro)]/15 text-[10px] font-mono uppercase tracking-wider text-[var(--primary-puro)] font-semibold mb-1">
            <Award className="w-3 h-3" />
            <span>Balance & Síntesis Mensual</span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl font-normal text-[var(--text-puro)] capitalize">
            Reporte de {monthName}
          </h3>
          <p className="text-xs text-[var(--text-puro-muted)] font-light">
            Recuento de actividades, intensidad emocional y síntesis introspectiva del mes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Selector Buttons */}
          <div className="flex items-center rounded-full bg-white/70 dark:bg-neutral-800/70 border border-neutral-200/60 p-1 text-xs shadow-2xs">
            <button
              onClick={() => setSelectedMonthOffset(prev => prev - 1)}
              className="px-2.5 py-1 rounded-full text-[11px] text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] hover:bg-white transition-all cursor-pointer"
              title="Mes anterior"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setSelectedMonthOffset(0)}
              disabled={selectedMonthOffset === 0}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedMonthOffset === 0 
                  ? 'bg-[var(--primary-puro)] text-white shadow-2xs' 
                  : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] cursor-pointer'
              }`}
            >
              Este Mes
            </button>
            <button
              onClick={() => setSelectedMonthOffset(prev => Math.min(0, prev + 1))}
              disabled={selectedMonthOffset >= 0}
              className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                selectedMonthOffset >= 0 
                  ? 'opacity-30 cursor-not-allowed text-neutral-400' 
                  : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] hover:bg-white cursor-pointer'
              }`}
              title="Mes siguiente"
            >
              Siguiente →
            </button>
          </div>

          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-xs font-mono text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] border border-neutral-200/60 shadow-2xs transition-all cursor-pointer shrink-0"
            title="Copiar reporte textual completo"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Reporte</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Highlights Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        
        {/* Metric 1: Average Intensity */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-neutral-800/60 border border-neutral-200/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--text-puro-muted)]">
            <span>Intensidad Media</span>
            <Activity className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-2xl text-[var(--text-puro)] font-normal">
              {averageIntensity > 0 ? averageIntensity : '—'}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">/ 5.0</span>
          </div>
          <p className="text-[10px] text-[var(--text-puro-muted)] font-light truncate">
            {averageIntensity > 3.5 ? 'Mes de alta vivencia' : averageIntensity > 0 ? 'Mes sereno y templado' : 'Sin registros'}
          </p>
        </div>

        {/* Metric 2: Dominant Emotion */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-neutral-800/60 border border-neutral-200/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--text-puro-muted)]">
            <span>Sentir Predominante</span>
            <Heart className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="flex items-center gap-2">
            {dominantMood ? (
              <>
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: dominantMood.color }} 
                />
                <span className="font-serif text-lg text-[var(--text-puro)] font-normal truncate">
                  {dominantMood.name}
                </span>
              </>
            ) : (
              <span className="font-serif text-lg text-[var(--text-puro-muted)] font-light">—</span>
            )}
          </div>
          <p className="text-[10px] text-[var(--text-puro-muted)] font-mono truncate">
            {dominantMood ? `${dominantMood.totalIntensity} gotas (${dominantMood.count} frascos)` : 'Sin registrar'}
          </p>
        </div>

        {/* Metric 3: Frascos & Drops */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-neutral-800/60 border border-neutral-200/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--text-puro-muted)]">
            <span>Frascos Sellados</span>
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-2xl text-[var(--text-puro)] font-normal">
              {monthFlasks.length}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">frascos</span>
          </div>
          <p className="text-[10px] text-[var(--text-puro-muted)] font-mono truncate">
            {totalDrops} gotas en total
          </p>
        </div>

        {/* Metric 4: Rituals & Presence */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-neutral-800/60 border border-neutral-200/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--text-puro-muted)]">
            <span>Rituales de Calma</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-2xl text-[var(--text-puro)] font-normal">
              {monthEchos.length}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">ecos</span>
          </div>
          <p className="text-[10px] text-[var(--text-puro-muted)] font-mono truncate">
            {activeDaysCount} días con pausa
          </p>
        </div>

      </div>

      {/* Collapsible Textual Synthesis Box */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-serif text-[var(--text-puro)] hover:text-[var(--primary-puro)] font-medium cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
            <span>Ver Manifiesto Textual del Reporte</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
            Generado automáticamente
          </span>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/70 dark:border-neutral-800 font-mono text-[11px] leading-relaxed text-[var(--text-puro)] whitespace-pre-wrap selection:bg-[var(--primary-puro)]/20 shadow-inner max-h-60 overflow-y-auto">
                {textualReport}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Key Activities of the Month Pills */}
      {Object.keys(ritualsBreakdown).length > 0 && (
        <div className="pt-2 border-t border-neutral-200/50 dark:border-neutral-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-puro-muted)] mr-1">
            Actividades clave del mes:
          </span>
          {Object.entries(ritualsBreakdown).map(([title, count]) => (
            <span
              key={title}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-neutral-800 text-[11px] font-medium text-[var(--text-puro)] border border-neutral-200/60 shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-[var(--primary-puro)]" />
              <span>{title}</span>
              <span className="font-mono text-[10px] text-[var(--text-puro-muted)]">({count})</span>
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
