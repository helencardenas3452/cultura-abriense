import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Feather, 
  X, 
  Check, 
  Wand2, 
  Lightbulb,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface TransformGratitudeModalProps {
  isOpen: boolean;
  onClose: () => void;
  echoId: string;
  gratitudeText: string;
  existingReflection?: string;
  onSaveDeepReflection: (
    echoId: string, 
    gratitudeText: string, 
    deepReflection: string,
    socraticPrompt?: string
  ) => void;
}

export default function TransformGratitudeModal({
  isOpen,
  onClose,
  echoId,
  gratitudeText,
  existingReflection = '',
  onSaveDeepReflection
}: TransformGratitudeModalProps) {
  const [reflection, setReflection] = useState(existingReflection);
  const [socraticQuestion, setSocraticQuestion] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReflection(existingReflection);
      setIsSaved(false);
      fetchSocraticPrompt(gratitudeText);
    }
  }, [isOpen, gratitudeText, existingReflection]);

  const fetchSocraticPrompt = async (text: string) => {
    if (!text) return;
    setIsLoadingQuestion(true);
    try {
      const response = await fetch('/api/socratic-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotions: [{ name: 'Gratitud', intensity: 5 }],
          note: `Esta es mi gratitud: "${text}". Ayúdame a profundizar en qué significado humano, paz o verdad más profunda despierta esto en mi vida.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.question) {
          setSocraticQuestion(data.question);
          setIsLoadingQuestion(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch socratic prompt:", e);
    }

    setSocraticQuestion(`¿De qué manera este agradecimiento te recuerda lo que verdaderamente sostiene tu paz interior?`);
    setIsLoadingQuestion(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;

    onSaveDeepReflection(
      echoId,
      gratitudeText,
      reflection.trim(),
      socraticQuestion
    );
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-xl glass-puro bg-white/95 dark:bg-neutral-900/95 rounded-[var(--radius-puro)] p-6 md:p-8 shadow-2xl border border-white/80 dark:border-neutral-800 relative space-y-6 my-8"
      >
        {/* Warm ambient aura */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 dark:text-amber-300 font-semibold block">
                MAYÉUTICA & GRATITUD
              </span>
              <h3 className="font-serif text-xl font-normal text-[var(--text-puro)]">
                Transformar en Reflexión Profunda
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Gratitude Card */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 space-y-1.5 relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            <Heart className="w-3 h-3 fill-amber-500/30" />
            <span>Gratitud Original</span>
          </div>
          <p className="font-serif italic text-sm md:text-base text-[var(--text-puro)] leading-relaxed">
            “{gratitudeText}”
          </p>
        </div>

        {/* Socratic Catalyst */}
        <div className="p-4 rounded-2xl bg-[var(--bg-puro)]/80 border border-neutral-200/50 space-y-1.5 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--primary-puro)] font-semibold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>PREGUNTA SOCRÁTICA GUÍA</span>
            </span>
            <button
              type="button"
              onClick={() => fetchSocraticPrompt(gratitudeText)}
              disabled={isLoadingQuestion}
              className="text-[10px] font-mono text-[var(--primary-puro)] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3" />
              <span>Nueva perspectiva</span>
            </button>
          </div>

          <p className="font-serif italic text-xs md:text-sm text-[var(--text-puro)] leading-relaxed">
            {isLoadingQuestion ? (
              <span className="text-[var(--text-puro-muted)] not-italic font-sans text-xs flex items-center gap-2 animate-pulse">
                <Wand2 className="w-3.5 h-3.5 animate-spin text-[var(--primary-puro)]" />
                Sintonizando pregunta mayéutica con Gemini...
              </span>
            ) : (
              `“${socraticQuestion}”`
            )}
          </p>
        </div>

        {/* Reflection Form */}
        <form onSubmit={handleSave} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[var(--text-puro-muted)]">
              <label className="font-medium flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
                <span>Tu reflexión expandida:</span>
              </label>
              <span className="text-[10px] font-mono">
                {reflection.length} caracteres
              </span>
            </div>

            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="¿Qué recuerdos, emociones o aprendizajes despierta esta gratitud? Escribe sin prisa ni filtros..."
              rows={5}
              className="w-full p-4 rounded-2xl bg-white/90 dark:bg-neutral-800/90 border border-neutral-200/70 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-xs md:text-sm font-light text-[var(--text-puro)] leading-relaxed resize-none shadow-2xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] font-serif italic text-[var(--text-puro-muted)] text-center sm:text-left">
              Esta reflexión enriquecerá la memoria en tu tapiz de Sempiterno.
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!reflection.trim() || isSaved}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium transition-all shadow-sm ${
                  reflection.trim() && !isSaved
                    ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer hover:shadow-md'
                    : isSaved 
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Reflexión Sellada!</span>
                  </>
                ) : (
                  <>
                    <Feather className="w-3.5 h-3.5" />
                    <span>Guardar Reflexión Profunda</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
