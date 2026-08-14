import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Droplets, 
  Heart, 
  Sparkles, 
  Feather, 
  Info,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';
import { EmotionalFlaskEntry, PresenceEcho, PURO_EMOTIONS } from '../../types';

interface MonthlyMoodCalendarProps {
  flasks: EmotionalFlaskEntry[];
  echos: PresenceEcho[];
  onSelectFlask?: (flask: EmotionalFlaskEntry) => void;
}

interface DayData {
  dateKey: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  flasks: EmotionalFlaskEntry[];
  echos: PresenceEcho[];
  dominantEmotion?: {
    name: string;
    color: string;
    intensity: number;
  };
  emotionDots: { name: string; color: string; intensity: number }[];
  hasGratitude: boolean;
  hasRitual: boolean;
}

export default function MonthlyMoodCalendar({ flasks, echos, onSelectFlask }: MonthlyMoodCalendarProps) {
  // Current viewed month and year (defaults to August 2026 or current year/month)
  const [viewDate, setViewDate] = useState(() => {
    // Check if we have entries to center around, or default to current / Aug 2026
    return new Date(2026, 7, 1); // August 2026 (0-indexed month: 7 = August)
  });

  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // Helper to parse dates from various formats (YYYY-MM-DD, ISO, or textual '13 de Agosto')
  const parseDateToKey = (dateStr?: string, timestampStr?: string): string | null => {
    if (!dateStr && !timestampStr) return null;

    // Direct YYYY-MM-DD regex check
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Check if ISO or standard date
    if (dateStr) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }

    // Handle Spanish textual format: "13 de Agosto", "12 de Agosto, 2026", "Hoy", "Ayer"
    const text = (dateStr || '').toLowerCase();
    const currentYear = viewDate.getFullYear();

    if (text.includes('hoy')) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    const monthsMap: Record<string, string> = {
      enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
      julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
      ago: '08', ene: '01', feb: '02', mar: '03', abr: '04', jun: '06', jul: '07', sep: '09', oct: '10', nov: '11', dic: '12'
    };

    for (const [mName, mNum] of Object.entries(monthsMap)) {
      if (text.includes(mName)) {
        const dayMatch = text.match(/\b(\d{1,2})\b/);
        if (dayMatch) {
          const d = dayMatch[1].padStart(2, '0');
          return `${currentYear}-${mNum}-${d}`;
        }
      }
    }

    return null;
  };

  // Group flasks & echoes by date key (YYYY-MM-DD)
  const entriesByDate = useMemo(() => {
    const map: Record<string, { flasks: EmotionalFlaskEntry[]; echos: PresenceEcho[] }> = {};

    flasks.forEach(f => {
      const key = parseDateToKey(f.date, f.timestamp);
      if (key) {
        if (!map[key]) map[key] = { flasks: [], echos: [] };
        map[key].flasks.push(f);
      }
    });

    echos.forEach(e => {
      const key = parseDateToKey(e.date);
      if (key) {
        if (!map[key]) map[key] = { flasks: [], echos: [] };
        map[key].echos.push(e);
      }
    });

    return map;
  }, [flasks, echos, viewDate]);

  // Generate calendar grid for current viewDate
  const calendarDays = useMemo<DayData[]>(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth(); // 0-11

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const totalDays = lastDayOfMonth.getDate();
    // Monday as first day of week: 0 = Sun -> 6, 1 = Mon -> 0
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: DayData[] = [];
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      
      const dayEntries = entriesByDate[dateKey] || { flasks: [], echos: [] };
      days.push({
        dateKey,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        flasks: dayEntries.flasks,
        echos: dayEntries.echos,
        emotionDots: [],
        hasGratitude: false,
        hasRitual: false
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayEntries = entriesByDate[dateKey] || { flasks: [], echos: [] };

      // Compute emotion summary and dominant emotion for this day
      const emotionTally: Record<string, { name: string; color: string; intensity: number }> = {};
      let hasGratitude = false;
      let hasRitual = false;

      dayEntries.flasks.forEach(flask => {
        flask.emotions.forEach(em => {
          if (!emotionTally[em.emotionId]) {
            emotionTally[em.emotionId] = { name: em.name, color: em.color, intensity: 0 };
          }
          emotionTally[em.emotionId].intensity += em.intensity;
        });
      });

      dayEntries.echos.forEach(echo => {
        if (echo.type === 'gratitud' || echo.title.toLowerCase().includes('gratitud')) {
          hasGratitude = true;
          if (!emotionTally['gratitud']) {
            emotionTally['gratitud'] = { name: 'Gratitud', color: '#f6bd60', intensity: 4 };
          } else {
            emotionTally['gratitud'].intensity += 3;
          }
        } else if (echo.type === 'ritual' || echo.type === 'respiracion') {
          hasRitual = true;
        }
      });

      const sortedEmotions = Object.values(emotionTally).sort((a, b) => b.intensity - a.intensity);
      const dominantEmotion = sortedEmotions.length > 0 ? sortedEmotions[0] : undefined;
      const emotionDots = sortedEmotions.slice(0, 3); // top 3 emotions felt on that day

      days.push({
        dateKey,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
        flasks: dayEntries.flasks,
        echos: dayEntries.echos,
        dominantEmotion,
        emotionDots,
        hasGratitude,
        hasRitual
      });
    }

    // Next month padding to complete 35 or 42 grid slots
    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEntries = entriesByDate[dateKey] || { flasks: [], echos: [] };

      days.push({
        dateKey,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        flasks: dayEntries.flasks,
        echos: dayEntries.echos,
        emotionDots: [],
        hasGratitude: false,
        hasRitual: false
      });
    }

    return days;
  }, [viewDate, entriesByDate]);

  // Selected Day Details
  const selectedDayData = useMemo(() => {
    if (!selectedDayKey) return null;
    return calendarDays.find(d => d.dateKey === selectedDayKey) || null;
  }, [selectedDayKey, calendarDays]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setViewDate(new Date(2026, 7, 1)); // Default Aug 2026 or new Date()
  };

  const monthFormatted = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthFormatted.charAt(0).toUpperCase() + monthFormatted.slice(1);

  // Count active days in the current month
  const activeDaysCount = calendarDays.filter(d => d.isCurrentMonth && (d.flasks.length > 0 || d.echos.length > 0)).length;

  return (
    <div className="p-6 md:p-8 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/80 dark:border-neutral-800 space-y-6">
      
      {/* Calendar Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/50 dark:border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--primary-puro)]/15 flex items-center justify-center text-[var(--primary-puro)]">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-serif text-xl font-normal text-[var(--text-puro)]">
              Calendario Lunar de Estados de Ánimo
            </h3>
          </div>
          <p className="text-xs text-[var(--text-puro-muted)] font-light">
            Visualiza el fluir de tus emociones cultivadas día a día con puntos de color.
          </p>
        </div>

        {/* Month Navigation & Stats Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 text-xs font-mono text-[var(--text-puro)] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeDaysCount} días registrados</span>
          </div>

          <div className="flex items-center gap-1 bg-white/80 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 rounded-full p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleCurrentMonth}
              className="px-3 py-0.5 text-xs font-serif font-medium text-[var(--text-puro)] hover:text-[var(--primary-puro)] transition-colors cursor-pointer"
              title="Ir al mes de referencia"
            >
              {capitalizedMonth}
            </button>

            <button
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-mono uppercase tracking-wider text-[var(--text-puro-muted)] py-1">
        <span>Lun</span>
        <span>Mar</span>
        <span>Mié</span>
        <span>Jue</span>
        <span>Vie</span>
        <span>Sáb</span>
        <span>Dom</span>
      </div>

      {/* Calendar Grid Days */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {calendarDays.map((day) => {
          const isSelected = selectedDayKey === day.dateKey;
          const hasEntries = day.flasks.length > 0 || day.echos.length > 0;

          return (
            <motion.button
              key={day.dateKey}
              onClick={() => setSelectedDayKey(isSelected ? null : day.dateKey)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`min-h-[64px] md:min-h-[76px] p-2 rounded-2xl flex flex-col justify-between items-center transition-all relative text-left cursor-pointer border ${
                !day.isCurrentMonth
                  ? 'opacity-30 bg-transparent border-transparent'
                  : isSelected
                    ? 'bg-amber-100/80 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 shadow-md ring-2 ring-amber-400/30'
                    : hasEntries
                      ? 'bg-white/80 dark:bg-neutral-800/80 hover:bg-white border-neutral-200/80 dark:border-neutral-700 shadow-2xs hover:shadow-xs'
                      : 'bg-white/30 dark:bg-neutral-900/30 hover:bg-white/50 border-neutral-100 dark:border-neutral-800/40'
              }`}
            >
              {/* Day Number Header */}
              <div className="w-full flex items-center justify-between">
                <span className={`text-xs font-mono font-medium ${
                  day.isToday 
                    ? 'w-5 h-5 rounded-full bg-[var(--primary-puro)] text-white flex items-center justify-center -ml-0.5' 
                    : isSelected
                      ? 'text-amber-900 dark:text-amber-200 font-bold'
                      : day.isCurrentMonth
                        ? 'text-[var(--text-puro)]'
                        : 'text-neutral-400'
                }`}>
                  {day.dayNumber}
                </span>

                {/* Micro Icon for special entries */}
                <div className="flex items-center gap-0.5">
                  {day.hasGratitude && (
                    <Heart className="w-2.5 h-2.5 text-amber-500 fill-amber-500/40" />
                  )}
                  {day.flasks.length > 0 && (
                    <Droplets className="w-2.5 h-2.5 text-[var(--primary-puro)]" />
                  )}
                </div>
              </div>

              {/* Mood Colored Dots */}
              <div className="w-full flex items-center justify-center gap-1 my-1">
                {day.emotionDots.length > 0 ? (
                  day.emotionDots.map((em, idx) => (
                    <span
                      key={idx}
                      className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-transform hover:scale-125 shadow-2xs"
                      style={{ 
                        backgroundColor: em.color,
                        boxShadow: `0 0 6px ${em.color}50`
                      }}
                      title={`${em.name} (${em.intensity} gotas)`}
                    />
                  ))
                ) : hasEntries ? (
                  <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-neutral-200/50 dark:bg-neutral-800" />
                )}
              </div>

              {/* Subtle Label on larger screens */}
              <div className="w-full text-center truncate">
                {day.dominantEmotion ? (
                  <span className="text-[9px] font-serif italic text-[var(--text-puro-muted)] hidden md:inline-block truncate max-w-full">
                    {day.dominantEmotion.name}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-transparent select-none">•</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Day Expanded Detail Sheet / Inspection Box */}
      <AnimatePresence>
        {selectedDayData && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 md:p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 space-y-4 shadow-sm">
              
              {/* Header of Selected Date */}
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-amber-200/60 dark:border-amber-900/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-300 font-semibold">
                      Día {selectedDayData.dayNumber} — {capitalizedMonth}
                    </span>
                    {selectedDayData.isToday && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-medium">
                        Hoy
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif text-lg font-normal text-[var(--text-puro)]">
                    {selectedDayData.dominantEmotion 
                      ? `Estado Predominante: ${selectedDayData.dominantEmotion.name}`
                      : selectedDayData.flasks.length > 0 || selectedDayData.echos.length > 0
                        ? 'Memoria del Día'
                        : 'Día de Silencio & Descanso'}
                  </h4>
                </div>

                <button
                  onClick={() => setSelectedDayKey(null)}
                  className="p-1 rounded-full hover:bg-amber-200/50 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
                  title="Cerrar detalle del día"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Day Contents */}
              {selectedDayData.flasks.length === 0 && selectedDayData.echos.length === 0 ? (
                <p className="text-xs font-serif italic text-[var(--text-puro-muted)] py-2">
                  No se registraron frascos ni rituales en este día. Una jornada de reposo en tu recorrido.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Flasks list on this date */}
                  {selectedDayData.flasks.map((f) => (
                    <div key={f.id} className="p-4 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
                          <span className="font-mono text-xs font-semibold text-[var(--text-puro)]">
                            Frasco Vertido
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {f.emotions.map((em, i) => (
                            <span 
                              key={i}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-serif bg-black/5 dark:bg-white/5"
                            >
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: em.color }} />
                              <span>{em.name}</span>
                              <span className="text-[9px] font-mono text-[var(--text-puro-muted)]">({em.intensity})</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {f.socraticQuestion && (
                        <p className="font-serif italic text-xs text-[var(--primary-puro)] border-l-2 border-[var(--primary-puro)] pl-2.5 py-0.5">
                          “{f.socraticQuestion}”
                        </p>
                      )}

                      {f.socraticReflection && (
                        <p className="text-xs text-[var(--text-puro)] font-light leading-relaxed pl-1">
                          {f.socraticReflection}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Echoes & Gratitudes on this date */}
                  {selectedDayData.echos.map((echo) => {
                    const isGratitude = echo.type === 'gratitud' || echo.title.toLowerCase().includes('gratitud');

                    return (
                      <div key={echo.id} className={`p-4 rounded-xl border space-y-2 ${
                        isGratitude 
                          ? 'bg-amber-100/70 dark:bg-amber-900/50 border-amber-300/80 dark:border-amber-700/80' 
                          : 'bg-white/80 dark:bg-neutral-800/80 border-neutral-200/60 dark:border-neutral-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          {isGratitude ? (
                            <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-500/30" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-[#9b6838]" />
                          )}
                          <span className="font-serif text-xs font-medium text-[var(--text-puro)]">
                            {echo.title}
                          </span>
                        </div>

                        {echo.items && echo.items.length > 0 ? (
                          <div className="space-y-1 pl-2 pt-1">
                            {echo.items.map((it, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs font-serif italic text-[var(--text-puro)]">
                                <span className="font-mono text-[10px] text-amber-700 font-bold not-italic">{idx + 1}.</span>
                                <span>“{it}”</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--text-puro-muted)] font-light pl-1">
                            {echo.detail}
                          </p>
                        )}

                        {echo.deepReflection && (
                          <div className="p-3 rounded-lg bg-amber-200/50 dark:bg-amber-950/60 text-xs font-serif space-y-1 mt-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-800 dark:text-amber-300 font-bold">
                              <Feather className="w-3 h-3" />
                              <span>Reflexión Profunda</span>
                            </div>
                            <p className="text-[var(--text-puro)] leading-relaxed italic">
                              {echo.deepReflection}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Dot Color Palette Legend */}
      <div className="pt-2 border-t border-neutral-200/50 dark:border-neutral-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-puro-muted)] font-semibold flex items-center gap-1.5">
            <Compass className="w-3 h-3" />
            <span>Guía de Colores Anímicos</span>
          </span>
          <span className="text-[10px] font-serif italic text-[var(--text-puro-muted)]">
            Toca cualquier día para inspeccionar el diario
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {PURO_EMOTIONS.map(em => (
            <div 
              key={em.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 dark:bg-neutral-800/60 border border-neutral-200/50 text-[11px] font-serif text-[var(--text-puro)] shadow-2xs"
            >
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: em.color, boxShadow: `0 0 4px ${em.color}60` }} 
              />
              <span>{em.name}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
