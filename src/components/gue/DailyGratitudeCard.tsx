import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Check, 
  Send, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw,
  SunMedium,
  BookMarked
} from 'lucide-react';
import { PresenceEcho } from '../../types';

interface DailyGratitudeCardProps {
  onSaveGratitude: (items: [string, string, string]) => void;
  onNavigateToSempiterno?: () => void;
}

const GRATITUDE_INSPIRATIONS = [
  "El aroma o calor de una bebida por la mañana.",
  "La capacidad de mi cuerpo para respirar y sostenerme.",
  "Una palabra amable de un ser querido o desconocido.",
  "La oportunidad de recomenzar en este instante.",
  "Un rayo de sol entrando por la ventana.",
  "Un error que hoy me regaló un aprendizaje.",
  "Tener un espacio seguro donde puedo ser yo mismo.",
  "El silencio reconfortante al final del día."
];

export default function DailyGratitudeCard({
  onSaveGratitude,
  onNavigateToSempiterno
}: DailyGratitudeCardProps) {
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [lastSavedItems, setLastSavedItems] = useState<[string, string, string] | null>(null);

  const isFormValid = gratitude1.trim().length > 0 && 
                      gratitude2.trim().length > 0 && 
                      gratitude3.trim().length > 0;

  const handleFillInspirations = () => {
    const shuffled = [...GRATITUDE_INSPIRATIONS].sort(() => 0.5 - Math.random());
    setGratitude1(shuffled[0]);
    setGratitude2(shuffled[1]);
    setGratitude3(shuffled[2]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const items: [string, string, string] = [
      gratitude1.trim(),
      gratitude2.trim(),
      gratitude3.trim()
    ];

    onSaveGratitude(items);
    setLastSavedItems(items);
    setIsSaved(true);
  };

  const handleReset = () => {
    setGratitude1('');
    setGratitude2('');
    setGratitude3('');
    setIsSaved(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="p-6 md:p-8 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/80 dark:border-neutral-800 relative overflow-hidden space-y-6"
    >
      {/* Warm Golden Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300 font-semibold mb-1">
            <Heart className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-amber-600/30" />
            <span>Cosecha Diaria</span>
          </div>
          <h3 className="font-serif text-2xl font-normal text-[var(--text-puro)]">
            3 Cosas por las que Estar Agradecido Hoy
          </h3>
          <p className="text-xs text-[var(--text-puro-muted)] font-light">
            Nombrar la gratitud entrena la mirada para descubrir belleza y anclaje en lo cotidiano.
          </p>
        </div>

        {!isSaved && (
          <button
            type="button"
            onClick={handleFillInspirations}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white dark:bg-neutral-800/70 dark:hover:bg-neutral-800 text-xs font-serif text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] border border-neutral-200/60 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
            title="Inspirar con ejemplos sencillos"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Inspirar ejemplos</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isSaved ? (
          <motion.form
            key="gratitude-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSave}
            className="space-y-4 relative z-10"
          >
            {/* Input 1 */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-puro-muted)] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center">1</span>
                <span>Un detalle simple o momento de calma:</span>
              </label>
              <input
                type="text"
                value={gratitude1}
                onChange={(e) => setGratitude1(e.target.value)}
                placeholder="Ej. El silencio suave de esta mañana mientras tomaba agua..."
                className="w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/70 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-xs md:text-sm font-light text-[var(--text-puro)] shadow-2xs transition-all"
              />
            </div>

            {/* Input 2 */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-puro-muted)] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center">2</span>
                <span>Un gesto, vínculo o ser vivo que aprecias:</span>
              </label>
              <input
                type="text"
                value={gratitude2}
                onChange={(e) => setGratitude2(e.target.value)}
                placeholder="Ej. Un mensaje inesperado que me dio serenidad..."
                className="w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/70 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-xs md:text-sm font-light text-[var(--text-puro)] shadow-2xs transition-all"
              />
            </div>

            {/* Input 3 */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-puro-muted)] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center">3</span>
                <span>Una fortaleza, virtud o cuidado propio:</span>
              </label>
              <input
                type="text"
                value={gratitude3}
                onChange={(e) => setGratitude3(e.target.value)}
                placeholder="Ej. Haberme dado el permiso de hacer una pausa consciente hoy..."
                className="w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/70 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-xs md:text-sm font-light text-[var(--text-puro)] shadow-2xs transition-all"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-[var(--text-puro-muted)] font-serif italic text-center sm:text-left">
                Se guardará como una entrada sagrada en tu tapiz de Sempiterno.
              </span>

              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium transition-all shadow-sm ${
                  isFormValid 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer hover:shadow-md' 
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Sellar Gratitud en Sempiterno</span>
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="gratitude-success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 space-y-4 relative z-10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/50 dark:border-amber-900/40">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-serif font-medium">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Tu Cosecha de Gratitud ha sido Sellada</span>
              </div>
              <span className="text-[10px] font-mono text-amber-700/80 dark:text-amber-400">
                Guardado en Sempiterno
              </span>
            </div>

            {lastSavedItems && (
              <ul className="space-y-2 text-xs font-light text-[var(--text-puro)]">
                {lastSavedItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold text-sm leading-none">•</span>
                    <span className="italic leading-relaxed">“{item}”</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-mono text-[11px] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Registrar otra gratitud</span>
              </button>

              {onNavigateToSempiterno && (
                <button
                  type="button"
                  onClick={onNavigateToSempiterno}
                  className="inline-flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <span>Ver en Sempiterno</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
