import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  HeartPulse, 
  AlertTriangle, 
  ShieldAlert, 
  Check, 
  Plus, 
  Trash2, 
  Info, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Stethoscope, 
  Smile, 
  Clock, 
  X, 
  Eye,
  Feather
} from 'lucide-react';
import { 
  DailySymptomEntry, 
  PhysicalSymptomItem, 
  COMMON_PHYSICAL_SYMPTOMS 
} from '../../types';

interface SymptomTrackerCardProps {
  symptomEntries: DailySymptomEntry[];
  onSaveSymptomEntry: (entry: DailySymptomEntry) => void;
  onDeleteSymptomEntry?: (id: string) => void;
  onQuickRitual?: (ritualId: string) => void;
}

export interface PersistentSymptomAlert {
  symptomId: string;
  name: string;
  category: PhysicalSymptomItem['category'];
  consecutiveDays: number;
  latestSeverity: 'leve' | 'moderado' | 'intenso';
  firstDate: string;
  latestDate: string;
}

// Helper to calculate consecutive day streaks for each symptom
export function computePersistentSymptoms(entries: DailySymptomEntry[]): PersistentSymptomAlert[] {
  if (!entries || entries.length === 0) return [];

  // Sort entries by date ascending (YYYY-MM-DD)
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // Map each unique symptom to the dates it was recorded
  const symptomDateMap: Record<string, { name: string; category: PhysicalSymptomItem['category']; dates: { dateStr: string; severity: 'leve' | 'moderado' | 'intenso' }[] }> = {};

  sorted.forEach(entry => {
    entry.symptoms.forEach(s => {
      const key = s.name.toLowerCase().trim();
      if (!symptomDateMap[key]) {
        symptomDateMap[key] = {
          name: s.name,
          category: s.category,
          dates: []
        };
      }
      symptomDateMap[key].dates.push({
        dateStr: entry.date,
        severity: s.severity
      });
    });
  });

  const alerts: PersistentSymptomAlert[] = [];

  // Helper to parse date string into UTC timestamp in days
  const parseDateInDays = (dStr: string) => {
    const parts = dStr.split('-').map(Number);
    if (parts.length === 3) {
      return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  Object.entries(symptomDateMap).forEach(([key, data]) => {
    if (data.dates.length < 3) return;

    // Check for any sequence of consecutive days
    let currentStreak = 1;
    let maxStreak = 1;
    let streakStartDate = data.dates[0].dateStr;
    let streakEndDate = data.dates[0].dateStr;
    let latestSev = data.dates[data.dates.length - 1].severity;

    for (let i = 1; i < data.dates.length; i++) {
      const prevDays = parseDateInDays(data.dates[i - 1].dateStr);
      const currDays = parseDateInDays(data.dates[i].dateStr);

      if (currDays - prevDays === 1) {
        currentStreak++;
        if (currentStreak >= maxStreak) {
          maxStreak = currentStreak;
          streakEndDate = data.dates[i].dateStr;
        }
      } else if (currDays === prevDays) {
        // Same day duplicate, ignore
      } else {
        // Reset streak
        currentStreak = 1;
        streakStartDate = data.dates[i].dateStr;
      }
    }

    // If symptom persisted for 3 or more consecutive days
    if (maxStreak >= 3) {
      alerts.push({
        symptomId: key,
        name: data.name,
        category: data.category,
        consecutiveDays: maxStreak,
        latestSeverity: latestSev,
        firstDate: streakStartDate,
        latestDate: streakEndDate
      });
    }
  });

  return alerts;
}

export default function SymptomTrackerCard({
  symptomEntries,
  onSaveSymptomEntry,
  onDeleteSymptomEntry,
  onQuickRitual
}: SymptomTrackerCardProps) {
  // Current local date in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const todayFormatted = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  // Check if today already has an entry
  const todayExistingEntry = useMemo(() => {
    return symptomEntries.find(e => e.date === todayStr);
  }, [symptomEntries, todayStr]);

  // Form State
  const [selectedSymptoms, setSelectedSymptoms] = useState<PhysicalSymptomItem[]>(() => {
    if (todayExistingEntry) {
      return [...todayExistingEntry.symptoms];
    }
    return [];
  });
  const [energyLevel, setEnergyLevel] = useState<number>(todayExistingEntry?.energyLevel || 3);
  const [generalNotes, setGeneralNotes] = useState<string>(todayExistingEntry?.notes || '');
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Compute persistent alerts
  const persistentAlerts = useMemo(() => {
    return computePersistentSymptoms(symptomEntries);
  }, [symptomEntries]);

  // Toggle predefined symptom
  const handleToggleSymptom = (preset: typeof COMMON_PHYSICAL_SYMPTOMS[0]) => {
    const exists = selectedSymptoms.find(s => s.id === preset.id || s.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) {
      setSelectedSymptoms(prev => prev.filter(s => s.id !== preset.id && s.name.toLowerCase() !== preset.name.toLowerCase()));
    } else {
      const newItem: PhysicalSymptomItem = {
        id: preset.id,
        name: preset.name,
        category: preset.category,
        severity: 'moderado',
        notes: ''
      };
      setSelectedSymptoms(prev => [...prev, newItem]);
    }
  };

  // Change severity of a selected symptom
  const handleChangeSeverity = (symptomId: string, severity: 'leve' | 'moderado' | 'intenso') => {
    setSelectedSymptoms(prev => prev.map(s => s.id === symptomId ? { ...s, severity } : s));
  };

  // Change individual note of a symptom
  const handleChangeSymptomNote = (symptomId: string, notes: string) => {
    setSelectedSymptoms(prev => prev.map(s => s.id === symptomId ? { ...s, notes } : s));
  };

  // Add custom symptom
  const handleAddCustomSymptom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSymptomInput.trim();
    if (!trimmed) return;

    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    const customId = `custom-${Date.now()}`;

    if (!selectedSymptoms.some(s => s.name.toLowerCase() === formatted.toLowerCase())) {
      setSelectedSymptoms(prev => [
        ...prev,
        {
          id: customId,
          name: formatted,
          category: 'otro',
          severity: 'moderado',
          notes: ''
        }
      ]);
    }
    setCustomSymptomInput('');
    setShowCustomInput(false);
  };

  // Submit Daily Log
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();

    const newEntry: DailySymptomEntry = {
      id: todayExistingEntry?.id || `symptom-entry-${Date.now()}`,
      date: todayStr,
      timestamp: todayFormatted,
      symptoms: selectedSymptoms,
      energyLevel,
      notes: generalNotes.trim() || undefined
    };

    onSaveSymptomEntry(newEntry);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
    }, 3500);
  };

  // Reset today's form
  const handleClearTodayForm = () => {
    setSelectedSymptoms([]);
    setEnergyLevel(3);
    setGeneralNotes('');
  };

  // Severity color & label helper
  const getSeverityBadge = (severity: 'leve' | 'moderado' | 'intenso') => {
    switch (severity) {
      case 'leve':
        return {
          label: 'Leve (1)',
          colorClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
        };
      case 'moderado':
        return {
          label: 'Moderado (2)',
          colorClass: 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800'
        };
      case 'intenso':
        return {
          label: 'Intenso (3)',
          colorClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
        };
    }
  };

  return (
    <section className="space-y-6">
      
      {/* Main Container Card */}
      <div className="p-6 md:p-8 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/80 space-y-6">
        
        {/* Header with Title & Date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-700 dark:text-rose-300 font-semibold">
                  SALUD & ESCUCHA SOMÁTICA
                </span>
                <h3 className="font-serif text-2xl font-normal text-[var(--text-puro)]">
                  Seguimiento de Síntomas Físicos
                </h3>
              </div>
            </div>
            <p className="text-xs text-[var(--text-puro-muted)] max-w-xl font-light leading-relaxed">
              Registra las sensaciones corporales y molestias físicas del día a día para reconocer cómo dialogan tu mente y tu cuerpo.
            </p>
          </div>

          {/* Date & Today's Status Badge */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-neutral-800 border border-neutral-200/70 text-xs font-mono text-[var(--text-puro)] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
              <span>{todayFormatted}</span>
            </div>

            {todayExistingEntry && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono border border-emerald-300 dark:border-emerald-800 shadow-2xs">
                <Check className="w-3 h-3" />
                <span>Registrado Hoy</span>
              </span>
            )}
          </div>
        </div>

        {/* 🚨 PERSISTENT SYMPTOMS ALERT (When symptom >= 3 consecutive days) */}
        <AnimatePresence>
          {persistentAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="p-5 md:p-6 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/90 dark:border-amber-700/80 shadow-md space-y-4 relative overflow-hidden"
            >
              {/* Background ambient glow */}
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-amber-400/10 dark:bg-amber-400/5 blur-2xl pointer-events-none" />

              {/* Alert Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5 border border-amber-400/40">
                  <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-300 animate-pulse" />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                      ALERTA DE PERSISTENCIA SOMÁTICA (+3 DÍAS CONSECUTIVOS)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-semibold">
                      {persistentAlerts.length} síntoma{persistentAlerts.length > 1 ? 's' : ''} persistente{persistentAlerts.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <p className="text-xs text-amber-950/80 dark:text-amber-200/90 font-serif leading-relaxed">
                    Hemos detectado síntomas físicos que se han presentado de forma continua en tus registros diarios. Tu cuerpo se comunica contigo a través de la constancia.
                  </p>
                </div>
              </div>

              {/* Persistent Symptoms List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {persistentAlerts.map(alert => {
                  const sevInfo = getSeverityBadge(alert.latestSeverity);

                  return (
                    <div 
                      key={alert.symptomId}
                      className="p-3.5 rounded-xl bg-white/80 dark:bg-neutral-900/70 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[var(--text-puro)]">
                            {alert.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-mono font-bold border border-rose-300 dark:border-rose-800">
                            {alert.consecutiveDays} días seguidos
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-puro-muted)] font-light mt-1">
                          Categoría: <span className="capitalize">{alert.category}</span> • Severidad reciente: <span className="font-medium">{sevInfo.label}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-[10px] font-mono text-[var(--text-puro-muted)]">
                        <span>Desde: {alert.firstDate}</span>
                        <span>Hasta: {alert.latestDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Somatic & Medical Guidance Actions */}
              <div className="pt-2 border-t border-amber-200/70 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] text-amber-900 dark:text-amber-300 font-light">
                  <Stethoscope className="w-3.5 h-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
                  <span>
                    Si la molestia genera dolor agudo o afecta tu vida diaria, consulta con tu médico o especialista de confianza.
                  </span>
                </div>

                {onQuickRitual && (
                  <button
                    type="button"
                    onClick={() => onQuickRitual('arraigo-5min')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-medium transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
                    title="Realizar una sesión de 5 minutos de respiración y escaneo corporal"
                  >
                    <Feather className="w-3 h-3" />
                    <span>Pausa de Arraigo (5 min)</span>
                  </button>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* 📝 Daily Logging Form */}
        <form onSubmit={handleSaveEntry} className="space-y-6">
          
          {/* Step 1: Select Symptoms Chips */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-semibold text-[var(--text-puro)] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
                <span>1. ¿Qué sensaciones físicas o síntomas experimentas hoy?</span>
              </label>
              <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
                {selectedSymptoms.length} síntoma{selectedSymptoms.length !== 1 ? 's' : ''} seleccionado{selectedSymptoms.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Predefined common symptoms grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {COMMON_PHYSICAL_SYMPTOMS.map(preset => {
                const isSelected = selectedSymptoms.some(s => s.id === preset.id || s.name.toLowerCase() === preset.name.toLowerCase());

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleToggleSymptom(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 shadow-2xs ${
                      isSelected
                        ? 'bg-[var(--primary-puro)]/15 border-[var(--primary-puro)] text-[var(--text-puro)] shadow-xs scale-101'
                        : 'bg-white/80 dark:bg-neutral-800/80 hover:bg-white text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] border-neutral-200/70 dark:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${isSelected ? 'text-[var(--primary-puro)] font-semibold' : ''}`}>
                        {preset.name}
                      </span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                        isSelected 
                          ? 'bg-[var(--primary-puro)] text-white border-[var(--primary-puro)]' 
                          : 'border-neutral-300 dark:border-neutral-600 text-transparent'
                      }`}>
                        ✓
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-puro-muted)] font-light line-clamp-1">
                      {preset.defaultDesc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Symptom Adder */}
            <div className="pt-1">
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--primary-puro)] hover:underline font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir síntoma o molestia personalizada...</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 max-w-md pt-1">
                  <input
                    type="text"
                    value={customSymptomInput}
                    onChange={(e) => setCustomSymptomInput(e.target.value)}
                    placeholder="Ej. Mareo leve, rigidez lumbar, zumbido..."
                    className="flex-1 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-xs text-[var(--text-puro)] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-puro)]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSymptom}
                    disabled={!customSymptomInput.trim()}
                    className="px-3.5 py-1.5 rounded-full bg-[var(--primary-puro)] text-white text-xs font-medium hover:bg-[var(--primary-puro-hover)] disabled:opacity-40 cursor-pointer"
                  >
                    Añadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Step 2: Configure Severity & Specific Notes for Selected Symptoms */}
          {selectedSymptoms.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 pt-3 border-t border-neutral-200/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-puro)]">
                  2. Ajusta la intensidad de los síntomas seleccionados:
                </span>
                <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
                  1 = Leve • 2 = Moderado • 3 = Intenso
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedSymptoms.map((symptom) => {
                  return (
                    <div 
                      key={symptom.id}
                      className="p-3.5 rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[var(--text-puro)]">
                          {symptom.name}
                        </span>

                        {/* Severity Selector Buttons */}
                        <div className="flex items-center gap-1.5">
                          {(['leve', 'moderado', 'intenso'] as const).map(sev => {
                            const isCurrent = symptom.severity === sev;
                            const sevConfig = getSeverityBadge(sev);

                            return (
                              <button
                                key={sev}
                                type="button"
                                onClick={() => handleChangeSeverity(symptom.id, sev)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all cursor-pointer border ${
                                  isCurrent
                                    ? `${sevConfig.colorClass} font-bold shadow-2xs scale-102`
                                    : 'bg-white/60 dark:bg-neutral-800 text-[var(--text-puro-muted)] border-neutral-200 dark:border-neutral-700 hover:bg-white'
                                }`}
                              >
                                {sev === 'leve' && 'Leve (1)'}
                                {sev === 'moderado' && 'Moderado (2)'}
                                {sev === 'intenso' && 'Intenso (3)'}
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => setSelectedSymptoms(prev => prev.filter(s => s.id !== symptom.id))}
                            className="p-1 rounded-full hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                            title="Quitar este síntoma"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Optional Context Note for this symptom */}
                      <input
                        type="text"
                        value={symptom.notes || ''}
                        onChange={(e) => handleChangeSymptomNote(symptom.id, e.target.value)}
                        placeholder="Nota o contexto (ej. tras 4 horas frente al computador o al despertar)..."
                        className="w-full px-3 py-1 text-[11px] rounded-lg bg-neutral-50/80 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-[var(--text-puro)] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-puro)]"
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 3: Overall Vitality & Somatic Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-200/50">
            
            {/* General Energy Slider / Selector */}
            <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-puro)] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Nivel de Vitalidad Corporal</span>
                </span>
                <span className="font-mono text-[10px] text-[var(--text-puro-muted)]">
                  {energyLevel}/5
                </span>
              </div>

              <div className="flex items-center justify-between gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergyLevel(lvl)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer border ${
                      energyLevel === lvl
                        ? 'bg-amber-500 text-white border-amber-500 shadow-2xs scale-102'
                        : 'bg-white/80 dark:bg-neutral-800 text-[var(--text-puro-muted)] border-neutral-200 dark:border-neutral-700 hover:bg-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[var(--text-puro-muted)] px-0.5">
                <span>1: Agotado</span>
                <span>3: Equilibrado</span>
                <span>5: Plena vitalidad</span>
              </div>
            </div>

            {/* General Notes */}
            <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 space-y-1.5">
              <span className="text-xs font-semibold text-[var(--text-puro)] block">
                Reflexión Somática General
              </span>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="¿Qué postura, descanso o hábito físico acompañó a tu cuerpo hoy?"
                rows={2}
                className="w-full p-2 text-xs rounded-lg bg-white/80 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700 text-[var(--text-puro)] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-puro)] resize-none"
              />
            </div>

          </div>

          {/* Action Buttons & Feedback */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] hover:bg-white/80 border border-neutral-200/60 transition-all cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>Ver Historial ({symptomEntries.length} días)</span>
              </button>

              {selectedSymptoms.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearTodayForm}
                  className="text-[11px] font-mono text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Limpiar formulario
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[var(--primary-puro)] hover:bg-[var(--primary-puro-hover)] text-white text-xs font-medium tracking-wide transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{todayExistingEntry ? 'Actualizar Registro Somático' : 'Guardar Registro de Hoy'}</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          <AnimatePresence>
            {isSavedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Tu registro somático diario ha sido guardado con éxito en tu refugio!</span>
              </motion.div>
            )}
          </AnimatePresence>

        </form>

      </div>

      {/* 📜 History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-[28px] shadow-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 md:p-7 space-y-5 z-10"
            >
              <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800 pb-3">
                <div>
                  <h4 className="font-serif text-xl font-normal text-[var(--text-puro)]">
                    Historial de Escucha Somática
                  </h4>
                  <p className="text-xs text-[var(--text-puro-muted)]">
                    {symptomEntries.length} días de registro acumulados
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Entries list */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {symptomEntries.length > 0 ? (
                  [...symptomEntries].sort((a, b) => b.date.localeCompare(a.date)).map(entry => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
                          <span className="font-mono text-xs font-semibold text-[var(--text-puro)]">
                            {entry.timestamp || entry.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {entry.energyLevel && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300">
                              Vitalidad: {entry.energyLevel}/5
                            </span>
                          )}

                          {onDeleteSymptomEntry && (
                            <button
                              type="button"
                              onClick={() => onDeleteSymptomEntry(entry.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Eliminar este registro"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Symptoms badges in history */}
                      <div className="flex flex-wrap gap-1.5">
                        {entry.symptoms.map((s, idx) => {
                          const sev = getSeverityBadge(s.severity);
                          return (
                            <span
                              key={idx}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${sev.colorClass}`}
                            >
                              {s.name} ({s.severity})
                            </span>
                          );
                        })}
                      </div>

                      {entry.notes && (
                        <p className="text-xs text-[var(--text-puro-muted)] italic font-serif pl-2 border-l border-neutral-300">
                          “{entry.notes}”
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-[var(--text-puro-muted)] italic">
                    Aún no hay registros de síntomas físicos.
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="px-5 py-2 rounded-full bg-[var(--primary-puro)] text-white text-xs font-medium cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
