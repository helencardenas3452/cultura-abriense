import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  Info, 
  Layers,
  ChevronRight,
  Droplets,
  Heart
} from 'lucide-react';
import { EmotionalFlaskEntry, PresenceEcho } from '../../types';

interface WeeklyMoodHeatmapProps {
  flasks: EmotionalFlaskEntry[];
  echos: PresenceEcho[];
  viewDate?: Date;
}

interface WeekData {
  weekNumber: number;
  label: string;
  startDateStr: string;
  endDateStr: string;
  totalIntensity: number;
  activityCount: number;
  flaskCount: number;
  gratitudeCount: number;
  dominantEmotion?: {
    name: string;
    color: string;
  };
  dayIntensities: {
    dayName: string;
    dayNum: number;
    dateKey: string;
    intensity: number;
    color?: string;
    hasEntries: boolean;
  }[];
  topEmotions: { name: string; color: string; count: number }[];
}

export default function WeeklyMoodHeatmap({ flasks, echos, viewDate }: WeeklyMoodHeatmapProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter'>('month');

  // Helper to parse dates
  const parseDate = (dateStr?: string, timestampStr?: string): Date | null => {
    if (!dateStr && !timestampStr) return null;
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    if (dateStr) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    const text = (dateStr || '').toLowerCase();
    const currentYear = (viewDate || new Date(2026, 7, 1)).getFullYear();
    const monthsMap: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
      ago: 7, ene: 0, feb: 1, mar: 2, abr: 3, jun: 5, jul: 6, sep: 8, oct: 9, nov: 10, dic: 11
    };
    for (const [mName, mIdx] of Object.entries(monthsMap)) {
      if (text.includes(mName)) {
        const dayMatch = text.match(/\b(\d{1,2})\b/);
        if (dayMatch) {
          return new Date(currentYear, mIdx, parseInt(dayMatch[1]));
        }
      }
    }
    return null;
  };

  // Compute weekly aggregations
  const weeksData = useMemo<WeekData[]>(() => {
    const referenceDate = viewDate || new Date(2026, 7, 1);
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    const weeks: WeekData[] = [];

    if (timeRange === 'month') {
      // Divide the current month into 4-5 weeks
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const monthName = referenceDate.toLocaleDateString('es-ES', { month: 'short' });

      const weekRanges = [
        { start: 1, end: 7, label: `Semana 1 (1 - 7 ${monthName})` },
        { start: 8, end: 14, label: `Semana 2 (8 - 14 ${monthName})` },
        { start: 15, end: 21, label: `Semana 3 (15 - 21 ${monthName})` },
        { start: 22, end: 28, label: `Semana 4 (22 - 28 ${monthName})` },
        ...(lastDayOfMonth > 28 ? [{ start: 29, end: lastDayOfMonth, label: `Semana 5 (29 - ${lastDayOfMonth} ${monthName})` }] : [])
      ];

      weekRanges.forEach((range, idx) => {
        let totalIntensity = 0;
        let flaskCount = 0;
        let gratitudeCount = 0;
        const emotionMap: Record<string, { name: string; color: string; count: number }> = {};

        const dayIntensities: WeekData['dayIntensities'] = [];
        const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        for (let d = range.start; d <= range.end; d++) {
          const dayDate = new Date(year, month, d);
          const dayOfWeekIdx = (dayDate.getDay() + 6) % 7; // Monday = 0
          let dayIntensity = 0;
          let dominantColor: string | undefined;

          // Find flasks for this day
          flasks.forEach(f => {
            const fDate = parseDate(f.date, f.timestamp);
            if (fDate && fDate.getFullYear() === year && fDate.getMonth() === month && fDate.getDate() === d) {
              flaskCount++;
              f.emotions.forEach(em => {
                dayIntensity += em.intensity;
                totalIntensity += em.intensity;
                dominantColor = em.color;
                if (!emotionMap[em.name]) {
                  emotionMap[em.name] = { name: em.name, color: em.color, count: 0 };
                }
                emotionMap[em.name].count += em.intensity;
              });
            }
          });

          // Find echos / gratitudes
          echos.forEach(e => {
            const eDate = parseDate(e.date);
            if (eDate && eDate.getFullYear() === year && eDate.getMonth() === month && eDate.getDate() === d) {
              const isGratitude = e.type === 'gratitud' || e.title.toLowerCase().includes('gratitud');
              if (isGratitude) {
                gratitudeCount++;
                const gratPoints = (e.items?.length || 1) * 3;
                dayIntensity += gratPoints;
                totalIntensity += gratPoints;
                dominantColor = '#f6bd60';
                if (!emotionMap['Gratitud']) {
                  emotionMap['Gratitud'] = { name: 'Gratitud', color: '#f6bd60', count: 0 };
                }
                emotionMap['Gratitud'].count += gratPoints;
              } else {
                dayIntensity += 2;
                totalIntensity += 2;
              }
            }
          });

          dayIntensities.push({
            dayName: dayNames[dayOfWeekIdx] || `Día ${d}`,
            dayNum: d,
            dateKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            intensity: dayIntensity,
            color: dominantColor,
            hasEntries: dayIntensity > 0
          });
        }

        const sortedEmotions = Object.values(emotionMap).sort((a, b) => b.count - a.count);

        weeks.push({
          weekNumber: idx + 1,
          label: range.label,
          startDateStr: `${range.start} ${monthName}`,
          endDateStr: `${range.end} ${monthName}`,
          totalIntensity,
          activityCount: flaskCount + gratitudeCount,
          flaskCount,
          gratitudeCount,
          dominantEmotion: sortedEmotions[0],
          dayIntensities,
          topEmotions: sortedEmotions.slice(0, 3)
        });
      });

    } else {
      // Quarter mode: Last 8 weeks rolling
      for (let w = 7; w >= 0; w--) {
        const weekEnd = new Date(year, month, 15 - (w * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);

        let totalIntensity = 0;
        let flaskCount = 0;
        let gratitudeCount = 0;
        const emotionMap: Record<string, { name: string; color: string; count: number }> = {};
        const dayIntensities: WeekData['dayIntensities'] = [];

        for (let i = 0; i < 7; i++) {
          const currentDay = new Date(weekStart);
          currentDay.setDate(weekStart.getDate() + i);
          let dayIntensity = 0;
          let dominantColor: string | undefined;

          flasks.forEach(f => {
            const fDate = parseDate(f.date, f.timestamp);
            if (fDate && fDate.toDateString() === currentDay.toDateString()) {
              flaskCount++;
              f.emotions.forEach(em => {
                dayIntensity += em.intensity;
                totalIntensity += em.intensity;
                dominantColor = em.color;
                if (!emotionMap[em.name]) {
                  emotionMap[em.name] = { name: em.name, color: em.color, count: 0 };
                }
                emotionMap[em.name].count += em.intensity;
              });
            }
          });

          echos.forEach(e => {
            const eDate = parseDate(e.date);
            if (eDate && eDate.toDateString() === currentDay.toDateString()) {
              if (e.type === 'gratitud' || e.title.toLowerCase().includes('gratitud')) {
                gratitudeCount++;
                const pts = 6;
                dayIntensity += pts;
                totalIntensity += pts;
                dominantColor = '#f6bd60';
              }
            }
          });

          dayIntensities.push({
            dayName: currentDay.toLocaleDateString('es-ES', { weekday: 'short' }),
            dayNum: currentDay.getDate(),
            dateKey: currentDay.toISOString().split('T')[0],
            intensity: dayIntensity,
            color: dominantColor,
            hasEntries: dayIntensity > 0
          });
        }

        const sortedEmotions = Object.values(emotionMap).sort((a, b) => b.count - a.count);
        const startLabel = weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        const endLabel = weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

        weeks.push({
          weekNumber: 8 - w,
          label: `Semana (${startLabel} - ${endLabel})`,
          startDateStr: startLabel,
          endDateStr: endLabel,
          totalIntensity,
          activityCount: flaskCount + gratitudeCount,
          flaskCount,
          gratitudeCount,
          dominantEmotion: sortedEmotions[0],
          dayIntensities,
          topEmotions: sortedEmotions.slice(0, 3)
        });
      }
    }

    return weeks;
  }, [flasks, echos, viewDate, timeRange]);

  // Max intensity among weeks for relative bar scaling
  const maxWeeklyIntensity = Math.max(...weeksData.map(w => w.totalIntensity), 1);

  // Helper for heatmap cell color based on intensity tier
  const getIntensityTier = (intensity: number) => {
    if (intensity === 0) return {
      bg: 'bg-neutral-100 dark:bg-neutral-800/50',
      border: 'border-neutral-200/40 dark:border-neutral-700/40',
      label: 'Sin registros'
    };
    if (intensity < 6) return {
      bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200',
      border: 'border-emerald-300 dark:border-emerald-800',
      label: 'Intensidad Leve'
    };
    if (intensity < 14) return {
      bg: 'bg-teal-200/80 dark:bg-teal-900/60 text-teal-950 dark:text-teal-100',
      border: 'border-teal-400 dark:border-teal-700',
      label: 'Intensidad Moderada'
    };
    if (intensity < 24) return {
      bg: 'bg-amber-200 dark:bg-amber-900/70 text-amber-950 dark:text-amber-100',
      border: 'border-amber-400 dark:border-amber-700',
      label: 'Intensidad Profunda'
    };
    return {
      bg: 'bg-amber-400 dark:bg-amber-600 text-neutral-950 font-bold',
      border: 'border-amber-500 dark:border-amber-400 shadow-xs',
      label: 'Intensidad Trascendente'
    };
  };

  const activeWeekData = selectedWeek !== null ? weeksData.find(w => w.weekNumber === selectedWeek) : null;

  return (
    <div className="p-6 md:p-8 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/80 dark:border-neutral-800 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/50 dark:border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-serif text-xl font-normal text-[var(--text-puro)]">
              Mapa de Calor de Intensidad Semanal
            </h3>
          </div>
          <p className="text-xs text-[var(--text-puro-muted)] font-light">
            Monitorea los ritmos y picos emocionales acumulados por semana para descubrir patrones a largo plazo.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center rounded-full bg-white/80 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 p-1 text-xs shadow-2xs">
          <button
            onClick={() => { setTimeRange('month'); setSelectedWeek(null); }}
            className={`px-3 py-1 rounded-full font-serif transition-all cursor-pointer ${
              timeRange === 'month' 
                ? 'bg-[var(--primary-puro)] text-white shadow-2xs font-medium' 
                : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)]'
            }`}
          >
            Semanas del Mes
          </button>
          <button
            onClick={() => { setTimeRange('quarter'); setSelectedWeek(null); }}
            className={`px-3 py-1 rounded-full font-serif transition-all cursor-pointer ${
              timeRange === 'quarter' 
                ? 'bg-[var(--primary-puro)] text-white shadow-2xs font-medium' 
                : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)]'
            }`}
          >
            Últimas 8 Semanas
          </button>
        </div>
      </div>

      {/* Heatmap Matrix & Weekly Intensity Bars */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {weeksData.map((week) => {
            const tier = getIntensityTier(week.totalIntensity);
            const isSelected = selectedWeek === week.weekNumber;
            const percentage = Math.round((week.totalIntensity / maxWeeklyIntensity) * 100);

            return (
              <motion.div
                key={week.weekNumber}
                onClick={() => setSelectedWeek(isSelected ? null : week.weekNumber)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden space-y-3 ${
                  isSelected
                    ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-white/70 dark:bg-neutral-800/70 hover:bg-white dark:hover:bg-neutral-800 border-neutral-200/70 dark:border-neutral-700/70 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Micro Background Level indicator */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/20"
                  style={{ width: `${percentage}%` }}
                />

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-puro-muted)] block">
                      {week.startDateStr} - {week.endDateStr}
                    </span>
                    <h4 className="font-serif text-sm font-medium text-[var(--text-puro)]">
                      Semana {week.weekNumber}
                    </h4>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${tier.bg} ${tier.border}`}>
                    {week.totalIntensity} pts
                  </span>
                </div>

                {/* Day-by-Day Mini Heatmap Row */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-[var(--text-puro-muted)]">
                    <span>L</span>
                    <span>M</span>
                    <span>M</span>
                    <span>J</span>
                    <span>V</span>
                    <span>S</span>
                    <span>D</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {week.dayIntensities.map((day, idx) => {
                      const dayTier = getIntensityTier(day.intensity);
                      return (
                        <div
                          key={idx}
                          className={`h-5 rounded-md border flex items-center justify-center transition-all ${dayTier.bg} ${dayTier.border}`}
                          title={`${day.dayName} (${day.dayNum}): ${day.intensity} pts de intensidad`}
                        >
                          {day.hasEntries && (
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dominant Emotion Pill */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-700/50 text-xs">
                  {week.dominantEmotion ? (
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: week.dominantEmotion.color }} 
                      />
                      <span className="font-serif text-[11px] text-[var(--text-puro)] truncate max-w-[110px]">
                        {week.dominantEmotion.name}
                      </span>
                    </div>
                  ) : (
                    <span className="font-serif italic text-[11px] text-[var(--text-puro-muted)]">
                      En calma
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-[var(--text-puro-muted)] flex items-center gap-1">
                    <span>{week.activityCount} reg.</span>
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Week Deep Dive Inspection Sheet */}
      <AnimatePresence>
        {activeWeekData && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 md:p-6 rounded-2xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-amber-800/60">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                  <h4 className="font-serif text-base font-normal text-[var(--text-puro)]">
                    Desglose de Patrón: {activeWeekData.label}
                  </h4>
                </div>
                <span className="text-xs font-mono text-amber-800 dark:text-amber-300">
                  {activeWeekData.totalIntensity} puntos acumulados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/50 dark:border-neutral-700 space-y-1">
                  <span className="text-[10px] font-mono text-[var(--text-puro-muted)] uppercase block">
                    Frascos Vertidos
                  </span>
                  <div className="flex items-center gap-1.5 font-serif text-base font-medium text-[var(--text-puro)]">
                    <Droplets className="w-4 h-4 text-[var(--primary-puro)]" />
                    <span>{activeWeekData.flaskCount} frascos</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/50 dark:border-neutral-700 space-y-1">
                  <span className="text-[10px] font-mono text-[var(--text-puro-muted)] uppercase block">
                    Cosechas de Gratitud
                  </span>
                  <div className="flex items-center gap-1.5 font-serif text-base font-medium text-[var(--text-puro)]">
                    <Heart className="w-4 h-4 text-amber-500 fill-amber-500/30" />
                    <span>{activeWeekData.gratitudeCount} cosechas</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/50 dark:border-neutral-700 space-y-1">
                  <span className="text-[10px] font-mono text-[var(--text-puro-muted)] uppercase block">
                    Emoción Predominante
                  </span>
                  <div className="flex items-center gap-1.5 font-serif text-base font-medium text-[var(--text-puro)] truncate">
                    {activeWeekData.dominantEmotion ? (
                      <>
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: activeWeekData.dominantEmotion.color }} />
                        <span className="truncate">{activeWeekData.dominantEmotion.name}</span>
                      </>
                    ) : (
                      <span className="text-[var(--text-puro-muted)] italic font-normal text-sm">Sin registros</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Emotions presence ranking */}
              {activeWeekData.topEmotions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-[var(--text-puro-muted)] uppercase tracking-wider block">
                    Distribución de Sentires en esta Semana:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeWeekData.topEmotions.map((em, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif bg-white/90 dark:bg-neutral-800 border border-neutral-200/60"
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: em.color }} />
                        <span>{em.name}</span>
                        <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">({em.count} pts)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heatmap Intensity Scale Legend */}
      <div className="pt-2 border-t border-neutral-200/50 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[var(--text-puro-muted)] uppercase tracking-widest">
            Escala de Intensidad:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-serif text-[var(--text-puro-muted)]">Leve</span>
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300" title="Leve (1-5)" />
              <span className="w-3.5 h-3.5 rounded bg-teal-200/80 dark:bg-teal-900/60 border border-teal-400" title="Moderada (6-13)" />
              <span className="w-3.5 h-3.5 rounded bg-amber-200 dark:bg-amber-900/70 border border-amber-400" title="Profunda (14-23)" />
              <span className="w-3.5 h-3.5 rounded bg-amber-400 dark:bg-amber-600 border border-amber-500 shadow-2xs" title="Trascendente (24+)" />
            </div>
            <span className="text-[10px] font-serif text-[var(--text-puro-muted)]">Trascendente</span>
          </div>
        </div>

        <span className="text-[10px] font-serif italic text-[var(--text-puro-muted)]">
          Haz clic en una semana para desplegar su análisis de resonancia
        </span>
      </div>

    </div>
  );
}
