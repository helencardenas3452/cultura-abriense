import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Plus, 
  Minus, 
  RotateCcw, 
  Check, 
  HelpCircle, 
  Feather, 
  Lock, 
  Heart,
  Droplets,
  Wand2,
  Compass,
  Lightbulb,
  MessageSquareQuote,
  RefreshCw
} from 'lucide-react';
import { 
  Emotion, 
  PURO_EMOTIONS, 
  EmotionalFlaskEntry, 
  SOCRATIC_QUESTIONS_BANK,
  DEFAULT_CONTEXT_TAGS
} from '../../types';
import PuroIllustration from '../ui/PuroIllustration';
import TagSelector from '../ui/TagSelector';

interface EtereoCanvasProps {
  onSaveFlask: (flask: EmotionalFlaskEntry) => void;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  name: string;
  intensity: number;
}

export default function EtereoCanvas({ onSaveFlask }: EtereoCanvasProps) {
  // Current selected emotions in the flask
  const [selectedEmotions, setSelectedEmotions] = useState<{ emotion: Emotion; intensity: number }[]>([
    { emotion: PURO_EMOTIONS[0], intensity: 3 }, // Calma
    { emotion: PURO_EMOTIONS[1], intensity: 2 }  // Gratitud
  ]);

  // Socratic Mirror State
  const [socraticQuestion, setSocraticQuestion] = useState('');
  const [socraticReflection, setSocraticReflection] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Personal']);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isNoteAnalyzed, setIsNoteAnalyzed] = useState(false);
  const [isSealedSuccess, setIsSealedSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Generate Socratic Question tailored to the emotional cocktail and optional user note
  const generateSocraticQuestion = async (customNote?: string) => {
    setIsGeneratingQuestion(true);
    const noteToSend = typeof customNote === 'string' ? customNote : socraticReflection;

    try {
      const response = await fetch('/api/socratic-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotions: selectedEmotions.map(e => ({
            name: e.emotion.name,
            intensity: e.intensity
          })),
          note: noteToSend
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.question) {
          setSocraticQuestion(data.question);
          setIsNoteAnalyzed(Boolean(data.analyzedNote));
          setIsGeneratingQuestion(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Using offline socratic bank:", err);
    }

    // Heuristic fallback bank
    if (noteToSend && noteToSend.trim().length > 0) {
      const snippet = noteToSend.trim().slice(0, 30);
      setSocraticQuestion(`Al releer "${snippet}...", ¿qué anhelo silencioso o límite consciente pide ser acogido con amor hoy?`);
      setIsNoteAnalyzed(true);
    } else if (selectedEmotions.length === 0) {
      setSocraticQuestion("Observa el vacío del frasco. ¿Qué silencio o pausa necesita tu mente hoy?");
      setIsNoteAnalyzed(false);
    } else {
      const names = selectedEmotions.map(e => e.emotion.name);
      if (names.includes('Ira') && names.includes('Melancolía')) {
        setSocraticQuestion("Hay fuego y nostalgia en tu frasco. ¿Qué límite no expresado o qué pérdida del pasado busca reconocimiento hoy?");
      } else if (names.includes('Ansiedad')) {
        setSocraticQuestion("La inquietud anticipatoria pide suelo. ¿Qué certeza pequeña y tangible tienes en este preciso instante?");
      } else if (names.includes('Gratitud') && names.includes('Calma')) {
        setSocraticQuestion("Tu alma reposa en luz. ¿Cómo puedes guardar esta sensación como un refugio interior para días difíciles?");
      } else if (names.includes('Pesadez')) {
        setSocraticQuestion("El cuerpo habla a través del peso. ¿A qué exigencia o expectativa puedes darle permiso de descansar?");
      } else {
        const randomQ = SOCRATIC_QUESTIONS_BANK[Math.floor(Math.random() * SOCRATIC_QUESTIONS_BANK.length)];
        setSocraticQuestion(randomQ);
      }
      setIsNoteAnalyzed(false);
    }
    setIsGeneratingQuestion(false);
  };

  // Dedicated function to analyze user note with Gemini
  const handleAnalyzeNoteWithGemini = () => {
    if (!socraticReflection.trim()) return;
    generateSocraticQuestion(socraticReflection);
  };

  // Generate initial question on mount
  useEffect(() => {
    generateSocraticQuestion();
  }, []);

  // Update canvas physics particles whenever selected emotions change
  useEffect(() => {
    const newParticles: Particle[] = [];
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 340;
    const height = canvas ? canvas.height : 420;

    selectedEmotions.forEach(item => {
      // Create count based on intensity
      const count = item.intensity * 2;
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: `${item.emotion.id}-${i}-${Math.random()}`,
          x: width / 2 + (Math.random() * 80 - 40),
          y: height - 60 - Math.random() * 120,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          radius: 12 + Math.random() * 10,
          color: item.emotion.color,
          glowColor: item.emotion.glowColor,
          name: item.emotion.name,
          intensity: item.intensity
        });
      }
    });

    particlesRef.current = newParticles;
  }, [selectedEmotions]);

  // Particle Physics Animation Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Flask Boundary Dimensions
      const leftBound = 40;
      const rightBound = canvas.width - 40;
      const topBound = 80;
      const bottomBound = canvas.height - 40;

      // Draw Serene Liquid background glow inside jar
      const grad = ctx.createLinearGradient(0, topBound, 0, bottomBound);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(1, 'rgba(115, 138, 124, 0.12)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(leftBound, topBound, rightBound - leftBound, bottomBound - topBound, [20, 20, 40, 40]);
      ctx.fill();

      // Update & Draw Particles
      particlesRef.current.forEach((p, idx) => {
        // Subtle organic float / gravity
        p.vy += 0.02; // soft gravity
        p.vx += Math.sin(Date.now() * 0.002 + idx) * 0.03; // gentle fluid current

        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Wall collisions within jar bounds
        if (p.x - p.radius < leftBound + 5) {
          p.x = leftBound + 5 + p.radius;
          p.vx = -p.vx * 0.7;
        } else if (p.x + p.radius > rightBound - 5) {
          p.x = rightBound - 5 - p.radius;
          p.vx = -p.vx * 0.7;
        }

        if (p.y - p.radius < topBound + 10) {
          p.y = topBound + 10 + p.radius;
          p.vy = -p.vy * 0.7;
        } else if (p.y + p.radius > bottomBound - 10) {
          p.y = bottomBound - 10 - p.radius;
          p.vy = -p.vy * 0.5;
        }

        // Particle collisions with other particles
        for (let j = idx + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = p.radius + p2.radius;

          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            p.x -= nx * overlap;
            p.y -= ny * overlap;
            p2.x += nx * overlap;
            p2.y += ny * overlap;

            const kx = p.vx - p2.vx;
            const ky = p.vy - p2.vy;
            const pVal = 2 * (nx * kx + ny * ky) / 2;

            p.vx -= pVal * nx * 0.6;
            p.vy -= pVal * ny * 0.6;
            p2.vx += pVal * nx * 0.6;
            p2.vy += pVal * ny * 0.6;
          }
        }

        // Draw Particle with soft aura
        ctx.save();
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 12;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleAddOrIncrementEmotion = (emotion: Emotion) => {
    setSelectedEmotions(prev => {
      const existing = prev.find(item => item.emotion.id === emotion.id);
      if (existing) {
        if (existing.intensity >= 5) return prev;
        return prev.map(item => 
          item.emotion.id === emotion.id 
            ? { ...item, intensity: item.intensity + 1 }
            : item
        );
      } else {
        return [...prev, { emotion, intensity: 1 }];
      }
    });
  };

  const handleDecrementEmotion = (emotionId: string) => {
    setSelectedEmotions(prev => {
      const existing = prev.find(item => item.emotion.id === emotionId);
      if (!existing) return prev;
      if (existing.intensity <= 1) {
        return prev.filter(item => item.emotion.id !== emotionId);
      }
      return prev.map(item => 
        item.emotion.id === emotionId 
          ? { ...item, intensity: item.intensity - 1 }
          : item
      );
    });
  };

  const handleResetFlask = () => {
    setSelectedEmotions([]);
    setSocraticReflection('');
    setSelectedTags(['Personal']);
    generateSocraticQuestion();
  };

  const handleSealFlask = () => {
    if (selectedEmotions.length === 0) {
      alert("Por favor vierte al menos una emoción en el frasco antes de sellarlo.");
      return;
    }

    const totalIntensity = selectedEmotions.reduce((acc, curr) => acc + curr.intensity, 0);
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = `${now.getDate()} de ${now.toLocaleString('es-ES', { month: 'long' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newEntry: EmotionalFlaskEntry = {
      id: `flask-${Date.now()}`,
      date: formattedDate,
      timestamp: formattedTime,
      emotions: selectedEmotions.map(item => ({
        emotionId: item.emotion.id,
        name: item.emotion.name,
        color: item.emotion.color,
        intensity: item.intensity
      })),
      socraticQuestion: socraticQuestion || "¿Qué mensaje trae tu sentir hoy?",
      socraticReflection: socraticReflection.trim() || "Presencia consciente guardada en silencio.",
      intensityTotal: totalIntensity,
      tags: selectedTags.length > 0 ? selectedTags : ['Personal']
    };

    onSaveFlask(newEntry);
    setIsSealedSuccess(true);

    setTimeout(() => {
      setIsSealedSuccess(false);
      handleResetFlask();
    }, 2500);
  };

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      
      {/* Header banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-puro)]/10 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--primary-puro)] font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>☁️ Etéreo — Registro Emocional</span>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-light text-[var(--text-puro)]">
          El Frasco del Sentir
        </h2>
        <p className="text-xs text-[var(--text-puro-muted)] max-w-lg mx-auto font-light leading-relaxed">
          Vierte tus emociones en el frasco. Cada gota tiene su propio color, peso y levedad. 
          Al terminar, el <strong>Espejo Socrático</strong> formulará una pregunta para tu alma.
        </p>
      </div>

      {/* Main Grid: Left is Interactive 2D Glass Jar Canvas, Right is Emotion Palette & Socratic Mirror */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Glass Jar Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-[32px] glass-puro shadow-puro border border-white/80 p-4 flex flex-col justify-between overflow-hidden">
            
            {/* Jar Cap and Ring Detail */}
            <div className="w-24 h-4 bg-[#d8deda] rounded-full mx-auto shadow-xs border border-white/80 z-10 flex items-center justify-center">
              <div className="w-12 h-1 bg-white/60 rounded-full" />
            </div>

            {/* Canvas Surface */}
            <canvas 
              ref={canvasRef} 
              width={340} 
              height={420} 
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Jar Overlay Status Text */}
            <div className="z-10 text-center pb-2">
              <span className="text-[10px] font-mono tracking-widest text-[var(--text-puro-muted)] uppercase">
                {selectedEmotions.length === 0 ? "Frasco Vacío — Selecciona tus emociones" : `${selectedEmotions.length} esencias en resonancia`}
              </span>
            </div>

            {/* Quick Actions overlay */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={handleResetFlask}
                className="p-2 rounded-full bg-white/80 hover:bg-white text-neutral-500 hover:text-neutral-800 transition-colors shadow-xs"
                title="Vaciar frasco"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Selected Pills under Jar */}
          <div className="w-full max-w-[340px] mt-4 flex flex-wrap gap-1.5 justify-center">
            {selectedEmotions.map((item) => (
              <div 
                key={item.emotion.id}
                style={{ backgroundColor: `${item.emotion.color}20`, borderColor: `${item.emotion.color}40`, color: item.emotion.color }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border shadow-2xs"
              >
                <span>{item.emotion.name}</span>
                <span className="text-[10px] opacity-70 font-mono">x{item.intensity}</span>
                <button 
                  onClick={() => handleDecrementEmotion(item.emotion.id)}
                  className="hover:opacity-100 opacity-60 ml-0.5"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Palette & Socratic Mirror */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Emotion Palette */}
          <div className="p-6 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[var(--primary-puro)]" />
                <h3 className="font-serif text-lg font-normal text-[var(--text-puro)]">
                  Vierte tus Emociones
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
                Toca para añadir gotas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PURO_EMOTIONS.map(emotion => {
                const isSelected = selectedEmotions.some(e => e.emotion.id === emotion.id);
                return (
                  <motion.button
                    key={emotion.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddOrIncrementEmotion(emotion)}
                    style={{ 
                      borderColor: isSelected ? emotion.color : 'rgba(255,255,255,0.7)',
                      backgroundColor: isSelected ? `${emotion.color}15` : 'rgba(255,255,255,0.6)'
                    }}
                    className="p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div 
                        className="w-3 h-3 rounded-full shadow-xs" 
                        style={{ backgroundColor: emotion.color }} 
                      />
                      <Plus className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-puro)]">
                      {emotion.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-puro-muted)] line-clamp-1 mt-0.5 font-light">
                      {emotion.description}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Socratic Mirror Section */}
          <div className="p-6 md:p-8 rounded-[var(--radius-puro)] bg-gradient-to-br from-white/90 to-white/60 glass-puro shadow-puro border border-white/80 space-y-5 relative">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--primary-puro)]/15 text-[var(--primary-puro)] flex items-center justify-center">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-serif text-xl font-normal text-[var(--text-puro)]">
                  Espejo Socrático
                </h3>
              </div>
              
              <button
                onClick={() => generateSocraticQuestion()}
                disabled={isGeneratingQuestion}
                className="text-[11px] text-[var(--primary-puro)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                title="Generar nueva pregunta general"
              >
                <Sparkles className="w-3 h-3" />
                <span>Nueva Pregunta</span>
              </button>
            </div>

            {/* Generated Question Box */}
            <div className="p-4 rounded-2xl bg-[var(--bg-puro)]/80 border border-neutral-200/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--primary-puro)] font-semibold">
                  PREGUNTA DE INTROSPECCIÓN
                </span>
                {isNoteAnalyzed && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[9px] font-mono text-emerald-800 dark:text-emerald-300 font-medium">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Sintonizada con tu nota</span>
                  </span>
                )}
              </div>
              <p className="font-serif italic text-base md:text-lg text-[var(--text-puro)] leading-relaxed">
                {isGeneratingQuestion ? (
                  <span className="inline-flex items-center gap-2 text-[var(--text-puro-muted)] not-italic font-sans text-sm animate-pulse">
                    <Wand2 className="w-4 h-4 animate-spin text-[var(--primary-puro)]" />
                    {socraticReflection.trim() 
                      ? "Analizando tus palabras con Gemini y sintonizando tu pregunta..." 
                      : "Sintonizando la vibración del frasco..."}
                  </span>
                ) : (
                  `“${socraticQuestion}”`
                )}
              </p>
            </div>

            {/* Reflection Text Area & Gemini Deepen Trigger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--text-puro-muted)] flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
                  <span>Tu desahogo o reflexión (opcional pero sanador):</span>
                </label>
                {socraticReflection.trim().length > 0 && (
                  <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
                    {socraticReflection.trim().length} caracteres
                  </span>
                )}
              </div>

              <textarea
                value={socraticReflection}
                onChange={(e) => setSocraticReflection(e.target.value)}
                placeholder="Escribe libremente lo que sientes, piensas o necesitas soltar... Luego puedes profundizar con el Espejo Socrático."
                rows={4}
                className="w-full p-4 rounded-2xl bg-white/80 border border-neutral-200/70 focus:outline-none focus:ring-2 focus:ring-[var(--primary-puro)]/30 text-xs md:text-sm font-light text-[var(--text-puro)] leading-relaxed resize-none shadow-2xs"
              />

              {/* Action to analyze note with Gemini */}
              {socraticReflection.trim().length > 5 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-end pt-1"
                >
                  <button
                    type="button"
                    onClick={handleAnalyzeNoteWithGemini}
                    disabled={isGeneratingQuestion}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-[11px] font-medium text-[var(--primary-puro)] border border-[var(--primary-puro)]/30 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Profundizar con mi nota (Gemini)</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Contextual Tags Selector */}
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              label="Contexto Emocional (Etiquetas)"
              description="Asigna contextos como Trabajo, Familia o Creatividad para filtrar en Sempiterno."
            />

            {/* Seal Button and Status */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[10px] text-[var(--text-puro-muted)] font-mono">
                <Lock className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
                <span>Privacidad E2EE Local</span>
              </div>

              <button
                onClick={handleSealFlask}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-[var(--primary-puro)] hover:bg-[var(--primary-puro-hover)] text-white text-xs font-medium tracking-wide transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSealedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Frasco Sellado en Sempiterno!</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5" />
                    <span>Sellar Frasco en Sempiterno</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
