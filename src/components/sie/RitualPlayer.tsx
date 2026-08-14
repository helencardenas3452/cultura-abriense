import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Wind, 
  Feather, 
  Sparkles, 
  CheckCircle2, 
  Clock,
  RotateCcw
} from 'lucide-react';
import { Ritual, RitualStep } from '../../types';
import TagSelector from '../ui/TagSelector';

interface RitualPlayerProps {
  ritual: Ritual;
  onClose: () => void;
  onComplete: (ritualTitle: string, tags?: string[]) => void;
}

export default function RitualPlayer({ ritual, onClose, onComplete }: RitualPlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(ritual.pasos[0].durationSeconds || 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [writtenNotes, setWrittenNotes] = useState('');
  const [breathPhase, setBreathPhase] = useState<'Inhala' | 'Retén' | 'Exhala' | 'Reposa'>('Inhala');
  const [isFinished, setIsFinished] = useState(false);
  
  // Initial context tags based on ritual intention/category
  const [tags, setTags] = useState<string[]>(() => {
    switch (ritual.categoria) {
      case 'descanso':
        return ['Descanso', 'Salud'];
      case 'calma':
        return ['Personal', 'Salud'];
      case 'claridad':
        return ['Trabajo', 'Creatividad'];
      case 'desahogo':
        return ['Personal', 'Relaciones'];
      default:
        return ['Personal'];
    }
  });

  const step: RitualStep = ritual.pasos[currentStepIndex];

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isFinished) return;
    if (secondsRemaining <= 0) {
      if (currentStepIndex < ritual.pasos.length - 1) {
        handleNextStep();
      } else {
        setIsFinished(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, isTimerRunning, currentStepIndex, isFinished]);

  // Breathing loop animation for breath steps
  useEffect(() => {
    if (step.type !== 'breath') return;
    const inhaleTime = (step.inhale || 4) * 1000;
    const holdTime = (step.hold || 4) * 1000;
    const exhaleTime = (step.exhale || 4) * 1000;
    const totalCycle = inhaleTime + holdTime + exhaleTime;

    let timeout1: any;
    let timeout2: any;
    let cycleInterval: any;

    const runCycle = () => {
      setBreathPhase('Inhala');
      timeout1 = setTimeout(() => {
        setBreathPhase('Retén');
        timeout2 = setTimeout(() => {
          setBreathPhase('Exhala');
        }, holdTime);
      }, inhaleTime);
    };

    runCycle();
    cycleInterval = setInterval(runCycle, totalCycle);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearInterval(cycleInterval);
    };
  }, [currentStepIndex, step.type]);

  const handleNextStep = () => {
    if (currentStepIndex < ritual.pasos.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setSecondsRemaining(ritual.pasos[nextIdx].durationSeconds || 60);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinishAndSave = () => {
    onComplete(ritual.titulo, tags.length > 0 ? tags : ['Personal']);
    onClose();
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setSecondsRemaining(ritual.pasos[prevIdx].durationSeconds || 60);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f7f5f0]/95 backdrop-blur-xl flex flex-col justify-between p-6 md:p-12 overflow-y-auto">
      
      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--primary-puro)] font-semibold bg-[var(--primary-puro)]/10 px-3 py-1 rounded-full">
            Ritual Activo
          </span>
          <h3 className="font-serif text-lg text-[var(--text-puro)] hidden sm:block italic">
            {ritual.titulo}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-neutral-200/50 text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Sanctuary */}
      <div className="max-w-2xl w-full mx-auto my-auto py-8 text-center space-y-8">
        
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-[11px] font-mono text-[var(--text-puro-muted)] uppercase tracking-widest">
                Paso {currentStepIndex + 1} de {ritual.pasos.length} • {step.title}
              </div>

              <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-puro)] font-light leading-snug">
                {step.description}
              </h2>

              {/* Special interactive modules per step type */}
              {step.type === 'breath' && (
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-[var(--primary-puro)]/20"
                      animate={{
                        scale: breathPhase === 'Inhala' ? 1.4 : breathPhase === 'Retén' ? 1.4 : 1,
                        opacity: breathPhase === 'Inhala' ? 0.8 : breathPhase === 'Retén' ? 0.9 : 0.4
                      }}
                      transition={{ duration: breathPhase === 'Inhala' ? 4 : 4, ease: "easeInOut" }}
                    />
                    <motion.div 
                      className="w-28 h-28 rounded-full bg-[var(--primary-puro)] text-white flex flex-col items-center justify-center shadow-lg"
                      animate={{
                        scale: breathPhase === 'Inhala' ? 1.15 : breathPhase === 'Retén' ? 1.15 : 0.95
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                    >
                      <Wind className="w-6 h-6 mb-1" />
                      <span className="font-serif text-lg italic">{breathPhase}</span>
                    </motion.div>
                  </div>
                </div>
              )}

              {step.type === 'writing' && (
                <div className="py-4 max-w-lg mx-auto">
                  <textarea
                    value={writtenNotes}
                    onChange={(e) => setWrittenNotes(e.target.value)}
                    placeholder="Escribe aquí tu flujo libre... no te detengas a corregir nada."
                    rows={5}
                    className="w-full p-5 rounded-2xl glass-puro border border-neutral-300/70 focus:outline-none focus:ring-2 focus:ring-[var(--primary-puro)]/30 text-sm font-light text-[var(--text-puro)] leading-relaxed resize-none shadow-sm"
                  />
                </div>
              )}

              {/* Timer Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-neutral-200/60 shadow-2xs text-xs font-mono text-[var(--text-puro-muted)]">
                <Clock className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
                <span>{formatTime(secondsRemaining)} restantes</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-6"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--primary-puro)]/15 text-[var(--primary-puro)] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-4xl text-[var(--text-puro)] font-light">
                Ritual Concluido
              </h2>
              <p className="font-serif italic text-base md:text-lg text-[var(--text-puro-muted)] max-w-md mx-auto leading-relaxed">
                Has cultivado un instante de presencia consciente. Tu esfuerzo y tu calma han quedado grabados como un eco en Sempiterno.
              </p>

              {/* Context Tag selector for the ritual echo */}
              <div className="max-w-md mx-auto text-left">
                <TagSelector
                  selectedTags={tags}
                  onChange={setTags}
                  label="Contexto del Ritual (Etiquetas)"
                  description="Etiqueta este momento para filtrar tus rituales en Sempiterno."
                />
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleFinishAndSave}
                  className="px-8 py-3 rounded-full bg-[var(--primary-puro)] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[var(--primary-puro-hover)] transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                >
                  Guardar y Grabar en Sempiterno
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Bottom Step Controls */}
      {!isFinished && (
        <div className="max-w-xl w-full mx-auto flex items-center justify-between pt-6 border-t border-neutral-200/50">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-[var(--text-puro-muted)] hover:bg-neutral-200/40 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Paso Anterior</span>
          </button>

          <div className="flex gap-1.5">
            {ritual.pasos.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStepIndex 
                    ? 'w-6 bg-[var(--primary-puro)]' 
                    : i < currentStepIndex 
                    ? 'w-2 bg-[var(--primary-puro)]/40' 
                    : 'w-2 bg-neutral-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[var(--primary-puro)] text-white hover:bg-[var(--primary-puro-hover)] transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <span>{currentStepIndex === ritual.pasos.length - 1 ? 'Finalizar' : 'Siguiente'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
