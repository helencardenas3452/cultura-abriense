import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  HeartHandshake, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  Activity,
  Layers,
  Feather
} from 'lucide-react';
import { EmotionalFlaskEntry } from '../../types';

interface AdaptiveBreathingCardProps {
  flasks: EmotionalFlaskEntry[];
  onSaveEcho: (title: string, detail: string, tags?: string[]) => void;
  onNavigateToEtereo?: () => void;
}

export type StressLevelCategory = 'alto' | 'moderado' | 'bajo';

export interface AdaptiveBreathProfile {
  category: StressLevelCategory;
  stressScore: number; // 0 to 100
  title: string;
  subtitle: string;
  patternName: string;
  inhale: number; // seconds
  hold: number;   // seconds
  exhale: number; // seconds
  rest: number;   // seconds
  cycleSeconds: number;
  totalCycles: number; // total cycles to reach ~60s
  rationale: string;
  colorHex: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
}

// Stress weights by emotion
const EMOTION_STRESS_WEIGHTS: Record<string, number> = {
  ansiedad: 1.0,
  ira: 0.95,
  pesadez: 0.75,
  melancolia: 0.5,
  asombro: 0.2,
  esperanza: 0.15,
  calma: 0.05,
  gratitud: 0.0
};

// Play a subtle gentle bell chime using Web Audio API
function playGentleBell(frequency = 528) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Primary pure tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Soft organic harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 1.5, ctx.currentTime);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.exponentialRampToValueAtTime(0.04, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 1.8);
    osc2.stop(now + 1.4);
  } catch {
    // Ignore audio context errors if blocked by browser policy
  }
}

export function computeAdaptiveBreathing(latestFlask: EmotionalFlaskEntry | null): AdaptiveBreathProfile {
  if (!latestFlask || !latestFlask.emotions || latestFlask.emotions.length === 0) {
    // Default balanced profile when no flask is available
    return {
      category: 'moderado',
      stressScore: 50,
      title: 'Respiración de Equilibrio Consciente',
      subtitle: 'Calibración general para renovar el ritmo interior',
      patternName: 'Cuadrada 4-4-4-3 (Box Breathing)',
      inhale: 4,
      hold: 4,
      exhale: 4,
      rest: 3,
      cycleSeconds: 15,
      totalCycles: 4, // 4 * 15s = 60s
      rationale: 'Restaura la claridad mental y disminuye la tensión con ciclos simétricos de presencia.',
      colorHex: '#d4a373',
      accentBg: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-800 dark:text-amber-300'
    };
  }

  // Calculate weighted stress
  let totalWeighted = 0;
  let totalIntensity = 0;

  latestFlask.emotions.forEach(em => {
    const key = (em.emotionId || em.name.toLowerCase()).trim();
    const weight = EMOTION_STRESS_WEIGHTS[key] ?? 0.5;
    const intensity = em.intensity || 3;
    totalWeighted += weight * (intensity / 5);
    totalIntensity += 1;
  });

  const rawScore = totalIntensity > 0 ? (totalWeighted / totalIntensity) * 100 : 50;
  const stressScore = Math.round(Math.min(100, Math.max(5, rawScore)));

  if (stressScore >= 60) {
    // High Stress / Anxiety / Overwhelm -> 4-2-6 Vagal Decompression
    // 4s Inhale, 2s Hold, 6s Exhale (12s per cycle * 5 cycles = 60 seconds)
    return {
      category: 'alto',
      stressScore,
      title: 'Respiración 4-2-6 de Descompresión Vagual',
      subtitle: 'Alivio rápido de agitación, sobrecarga o ansiedad',
      patternName: '4s Inhala • 2s Sostén • 6s Exhala (x5 ciclos = 60s)',
      inhale: 4,
      hold: 2,
      exhale: 6,
      rest: 0,
      cycleSeconds: 12,
      totalCycles: 5, // 5 * 12s = 60s
      rationale: 'Exhalar el 150% del tiempo de inhalación activa el nervio vago y desacelera la frecuencia cardíaca de forma inmediata.',
      colorHex: '#e07a5f',
      accentBg: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      textColor: 'text-rose-800 dark:text-rose-300'
    };
  } else if (stressScore >= 35) {
    // Moderate Stress / Melancholy / Heaviness -> 4-4-4-3 Box Breathing
    // 4s Inhale, 4s Hold, 4s Exhale, 3s Rest (15s per cycle * 4 cycles = 60 seconds)
    return {
      category: 'moderado',
      stressScore,
      title: 'Respiración Cuadrada 4-4-4-3 de Anclaje',
      subtitle: 'Regulación del sistema nervioso y retorno al centro',
      patternName: '4s Inhala • 4s Sostén • 4s Exhala • 3s Reposo (x4 ciclos = 60s)',
      inhale: 4,
      hold: 4,
      exhale: 4,
      rest: 3,
      cycleSeconds: 15,
      totalCycles: 4, // 4 * 15s = 60s
      rationale: 'Los 4 tiempos simétricos equilibran el tono simpático y parasimpático, disipando la fatiga y la dispersión.',
      colorHex: '#d4a373',
      accentBg: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-800 dark:text-amber-300'
    };
  } else {
    // Low Stress / Calm / Gratitude / Light -> 5-0-5 Coherent Breathing
    // 5s Inhale, 0s Hold, 5s Exhale (10s per cycle * 6 cycles = 60 seconds)
    return {
      category: 'bajo',
      stressScore,
      title: 'Respiración Coherente 5-5 de Resonancia',
      subtitle: 'Nutrición de la quietud, presencia y gratitud',
      patternName: '5s Inhala • 5s Exhala continuo (x6 ciclos = 60s)',
      inhale: 5,
      hold: 0,
      exhale: 5,
      rest: 0,
      cycleSeconds: 10,
      totalCycles: 6, // 6 * 10s = 60s
      rationale: 'La frecuencia resonante de 6 respiraciones por minuto optimiza la variabilidad cardíaca y expande la serenidad.',
      colorHex: '#84a59d',
      accentBg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-800 dark:text-emerald-300'
    };
  }
}

export default function AdaptiveBreathingCard({
  flasks,
  onSaveEcho,
  onNavigateToEtereo
}: AdaptiveBreathingCardProps) {
  const latestFlask = useMemo(() => {
    return flasks && flasks.length > 0 ? flasks[0] : null;
  }, [flasks]);

  const profile = useMemo(() => {
    return computeAdaptiveBreathing(latestFlask);
  }, [latestFlask]);

  // Session Player States
  const [isPlayingSession, setIsPlayingSession] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeftTotal, setSecondsLeftTotal] = useState(60);
  const [currentCycleIndex, setCurrentCycleIndex] = useState(1);
  const [breathPhase, setBreathPhase] = useState<'Inhala' | 'Sostén' | 'Exhala' | 'Reposa'>('Inhala');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(profile.inhale);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and launch 60s adaptive session
  const handleStartSession = () => {
    setIsPlayingSession(true);
    setIsPaused(false);
    setSecondsLeftTotal(60);
    setCurrentCycleIndex(1);
    setBreathPhase('Inhala');
    setPhaseSecondsLeft(profile.inhale);
    setIsCompleted(false);

    if (soundEnabled) {
      playGentleBell(528);
    }
  };

  const handleStopSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlayingSession(false);
    setIsPaused(false);
    setSecondsLeftTotal(60);
    setIsCompleted(false);
  };

  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleStartSession();
  };

  // Main 60-second Timer Loop
  useEffect(() => {
    if (!isPlayingSession || isPaused || isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeftTotal(prev => {
        if (prev <= 1) {
          // Finished 60 seconds!
          if (timerRef.current) clearInterval(timerRef.current);
          setIsCompleted(true);
          if (soundEnabled) {
            playGentleBell(432);
          }

          // Record Echo in Sempiterno
          onSaveEcho(
            `Respiración Adaptativa (60s): ${profile.title}`,
            `Completaste 60 segundos de respiración calibrada a tu estado emocional (${profile.patternName}) para transformar un nivel de estrés de ${profile.stressScore}%.`,
            ['Respiración', 'Salud', 'Personal']
          );

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlayingSession, isPaused, isCompleted, profile, soundEnabled, onSaveEcho]);

  // Phase transition loop within each cycle
  useEffect(() => {
    if (!isPlayingSession || isPaused || isCompleted) return;

    // Calculate current position in the 60s timeline
    const elapsed = 60 - secondsLeftTotal;
    const cycleSec = profile.cycleSeconds;
    const currentCycle = Math.min(profile.totalCycles, Math.floor(elapsed / cycleSec) + 1);
    const secInCurrentCycle = elapsed % cycleSec;

    setCurrentCycleIndex(currentCycle);

    // Determine current phase based on seconds in current cycle
    const { inhale, hold, exhale, rest } = profile;

    if (secInCurrentCycle < inhale) {
      setBreathPhase('Inhala');
      setPhaseSecondsLeft(inhale - secInCurrentCycle);
    } else if (secInCurrentCycle < inhale + hold) {
      setBreathPhase('Sostén');
      setPhaseSecondsLeft((inhale + hold) - secInCurrentCycle);
    } else if (secInCurrentCycle < inhale + hold + exhale) {
      setBreathPhase('Exhala');
      setPhaseSecondsLeft((inhale + hold + exhale) - secInCurrentCycle);
    } else {
      setBreathPhase('Reposa');
      setPhaseSecondsLeft((inhale + hold + exhale + rest) - secInCurrentCycle);
    }

  }, [secondsLeftTotal, isPlayingSession, isPaused, isCompleted, profile]);

  // Play bell cue on phase shift if sound is enabled
  const prevPhaseRef = useRef(breathPhase);
  useEffect(() => {
    if (!isPlayingSession || isPaused || isCompleted) return;
    if (prevPhaseRef.current !== breathPhase && soundEnabled) {
      if (breathPhase === 'Inhala') playGentleBell(528);
      else if (breathPhase === 'Sostén') playGentleBell(432);
      else if (breathPhase === 'Exhala') playGentleBell(396);
    }
    prevPhaseRef.current = breathPhase;
  }, [breathPhase, isPlayingSession, isPaused, isCompleted, soundEnabled]);

  // Get animation scale for the breathing orb
  const getOrbScale = () => {
    if (isCompleted) return 1;
    switch (breathPhase) {
      case 'Inhala':
        return 1.45;
      case 'Sostén':
        return 1.45;
      case 'Exhala':
        return 0.85;
      case 'Reposa':
        return 0.85;
      default:
        return 1;
    }
  };

  const getPhaseDuration = () => {
    switch (breathPhase) {
      case 'Inhala':
        return profile.inhale;
      case 'Sostén':
        return profile.hold || 1;
      case 'Exhala':
        return profile.exhale;
      case 'Reposa':
        return profile.rest || 1;
      default:
        return 4;
    }
  };

  return (
    <>
      {/* 🌿 Main Overview Card in Sie */}
      <div className="p-6 md:p-7 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/80 space-y-6 relative overflow-hidden">
        
        {/* Subtle ambient gradient overlay */}
        <div 
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: profile.colorHex }}
        />

        {/* Header with Stress Badge & Origin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-2xs shrink-0"
              style={{ backgroundColor: profile.colorHex }}
            >
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--primary-puro)] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                RESPIRACIÓN ADAPTATIVA • 60 SEGUNDOS
              </span>
              <h3 className="font-serif text-xl md:text-2xl font-light text-[var(--text-puro)]">
                {profile.title}
              </h3>
            </div>
          </div>

          {/* Stress Level Pill */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className={`px-3 py-1 rounded-full border text-xs font-mono font-semibold flex items-center gap-1.5 shadow-2xs ${profile.accentBg} ${profile.borderColor} ${profile.textColor}`}>
              <Activity className="w-3.5 h-3.5" />
              <span>Nivel de Estrés: {profile.stressScore}% ({profile.category === 'alto' ? 'Elevado' : profile.category === 'moderado' ? 'Moderado' : 'Sereno'})</span>
            </div>
          </div>
        </div>

        {/* Emotional Context from Latest Flask */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-3 shadow-2xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[var(--text-puro)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
              <span>Basado en tu último frasco emocional:</span>
            </span>

            {latestFlask ? (
              <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
                Registrado el {latestFlask.date || 'recientemente'}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-neutral-400">
                Calibración predeterminada
              </span>
            )}
          </div>

          {latestFlask && latestFlask.emotions && latestFlask.emotions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {latestFlask.emotions.map((em, idx) => (
                <div 
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-[11px] font-medium text-[var(--text-puro)] flex items-center gap-1.5 shadow-2xs"
                >
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: em.color || profile.colorHex }}
                  />
                  <span>{em.name}</span>
                  <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
                    ({em.intensity}/5)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-[var(--text-puro-muted)]">
              <span>Aún no has sellado un frasco en Etéreo. Usamos una cadencia armónica de 4 tiempos.</span>
              {onNavigateToEtereo && (
                <button
                  type="button"
                  onClick={onNavigateToEtereo}
                  className="text-xs text-[var(--primary-puro)] hover:underline font-medium cursor-pointer"
                >
                  Crear Frasco en Etéreo →
                </button>
              )}
            </div>
          )}

          {/* Rationale & Cadence summary */}
          <div className="pt-2 border-t border-neutral-200/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <p className="text-[var(--text-puro-muted)] font-light leading-relaxed max-w-2xl">
              <strong className="text-[var(--text-puro)] font-medium">Por qué funciona: </strong>
              {profile.rationale}
            </p>

            <div className="shrink-0 font-mono text-[11px] px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[var(--text-puro)] font-medium">
              {profile.patternName}
            </div>
          </div>

        </div>

        {/* Quick Launch Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-[var(--text-puro-muted)]">
            <Feather className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
            <span>Duración exacta: 60 segundos (1 minuto para reiniciar la mente).</span>
          </div>

          <button
            type="button"
            onClick={handleStartSession}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white text-xs font-medium tracking-wide transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
            style={{ backgroundColor: profile.colorHex }}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Iniciar Sesión Adaptativa (60s)</span>
          </button>
        </div>

      </div>

      {/* 🧘 Full-Screen / Modal 60-Second Breathing Experience */}
      <AnimatePresence>
        {isPlayingSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={handleStopSession}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-[32px] shadow-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 md:p-8 flex flex-col items-center justify-between min-h-[520px] z-10 overflow-hidden text-center"
            >
              {/* Background ambient pulse */}
              <div 
                className="absolute inset-0 opacity-10 blur-3xl pointer-events-none transition-colors duration-1000"
                style={{ backgroundColor: profile.colorHex }}
              />

              {/* Modal Top Bar */}
              <div className="w-full flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-800 pb-3 z-10">
                <div className="text-left">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--primary-puro)] font-semibold">
                    RESPIRACIÓN PERSONALIZADA (60S)
                  </span>
                  <h4 className="font-serif text-base text-[var(--text-puro)] font-normal">
                    {profile.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-[var(--text-puro)] transition-colors cursor-pointer"
                    title={soundEnabled ? 'Silenciar campanadas' : 'Activar sonido'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-[var(--primary-puro)]" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleStopSession}
                    className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    title="Cerrar sesión"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!isCompleted ? (
                /* Active 60s Breathing Stage */
                <div className="my-auto py-6 flex flex-col items-center justify-center space-y-6 z-10 w-full">
                  
                  {/* Central Pulsing Orb / Flower */}
                  <div className="relative w-64 h-64 flex items-center justify-center">
                    
                    {/* Concentric expanding ripples */}
                    <motion.div
                      animate={{
                        scale: getOrbScale(),
                        opacity: breathPhase === 'Inhala' ? 0.35 : breathPhase === 'Sostén' ? 0.45 : 0.15
                      }}
                      transition={{
                        duration: getPhaseDuration(),
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 rounded-full blur-xl"
                      style={{ backgroundColor: profile.colorHex }}
                    />

                    {/* Outer guide ring */}
                    <motion.div
                      animate={{
                        scale: getOrbScale(),
                        borderColor: profile.colorHex
                      }}
                      transition={{
                        duration: getPhaseDuration(),
                        ease: "easeInOut"
                      }}
                      className="absolute w-52 h-52 rounded-full border border-dashed opacity-40"
                    />

                    {/* Core breathing sphere */}
                    <motion.div
                      animate={{
                        scale: getOrbScale(),
                        boxShadow: `0 0 40px ${profile.colorHex}55`
                      }}
                      transition={{
                        duration: getPhaseDuration(),
                        ease: "easeInOut"
                      }}
                      className="w-40 h-40 rounded-full flex flex-col items-center justify-center text-white shadow-xl relative overflow-hidden"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${profile.colorHex}, #2b2d42)`
                      }}
                    >
                      <Wind className="w-6 h-6 mb-1 opacity-80 animate-pulse" />
                      
                      <span className="font-serif text-xl font-medium tracking-wide">
                        {breathPhase}
                      </span>
                      
                      <span className="font-mono text-xs opacity-90 font-light">
                        {phaseSecondsLeft}s
                      </span>
                    </motion.div>
                  </div>

                  {/* Somatic Guidance Text */}
                  <div className="space-y-1 max-w-sm">
                    <p className="text-xs text-[var(--text-puro-muted)] font-serif italic">
                      {breathPhase === 'Inhala' && 'Llena tu abdomen y pecho suavemente sin forzar...'}
                      {breathPhase === 'Sostén' && 'Conserva el aire en calma, sintiendo tu centro...'}
                      {breathPhase === 'Exhala' && 'Suelta el aire despacio como una brisa tibia...'}
                      {breathPhase === 'Reposa' && 'Descansa en el vacío y la quietud...'}
                    </p>

                    <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-[var(--text-puro-muted)] pt-1">
                      <span>Ciclo {currentCycleIndex} de {profile.totalCycles}</span>
                      <span>•</span>
                      <span className="font-bold text-[var(--text-puro)]">
                        0:{secondsLeftTotal < 10 ? `0${secondsLeftTotal}` : secondsLeftTotal} restantes
                      </span>
                    </div>
                  </div>

                </div>
              ) : (
                /* Completed State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="my-auto py-8 flex flex-col items-center justify-center space-y-4 z-10"
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg mb-2"
                    style={{ backgroundColor: profile.colorHex }}
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--primary-puro)] font-semibold">
                    SESIÓN COMPLETADA CON ÉXITO
                  </span>

                  <h3 className="font-serif text-2xl text-[var(--text-puro)] font-normal">
                    Tu ritmo interior se ha renovado
                  </h3>

                  <p className="text-xs text-[var(--text-puro-muted)] max-w-md font-light leading-relaxed">
                    Has completado 60 segundos de respiración consciente calibrada para tu estado de estrés. Tu presencia ha quedado registrada en tu memoria de <em>Sempiterno</em>.
                  </p>

                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-[11px] font-mono text-[var(--text-puro-muted)] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Cadencia ejecutada: {profile.patternName}</span>
                  </div>
                </motion.div>
              )}

              {/* Bottom Controls */}
              <div className="w-full pt-4 border-t border-neutral-200/50 dark:border-neutral-800 flex items-center justify-between z-10">
                {!isCompleted ? (
                  <>
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reiniciar 60s</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTogglePause}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-[var(--text-puro)] shadow-xs hover:bg-neutral-50 transition-all cursor-pointer"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStopSession}
                      className="text-xs font-mono text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                    >
                      Salir
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="px-5 py-2 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-[var(--text-puro)] hover:bg-neutral-50 transition-all cursor-pointer"
                    >
                      Repetir 60s
                    </button>

                    <button
                      type="button"
                      onClick={handleStopSession}
                      className="px-6 py-2 rounded-full text-white text-xs font-medium tracking-wide shadow-xs hover:shadow-md cursor-pointer"
                      style={{ backgroundColor: profile.colorHex }}
                    >
                      Listo, volver a Sie
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
