import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Heart, 
  Droplets, 
  Feather, 
  Compass, 
  Maximize2, 
  Minimize2,
  Type,
  Sun,
  Moon,
  Coffee,
  Bookmark,
  Calendar
} from 'lucide-react';
import { EmotionalFlaskEntry, PresenceEcho } from '../../types';

interface SereneBookReaderProps {
  flasks: EmotionalFlaskEntry[];
  echos: PresenceEcho[];
  onClose: () => void;
}

type ReaderTheme = 'parchment' | 'pure' | 'night';
type FontSize = 'base' | 'lg' | 'xl';

interface JournalEntry {
  id: string;
  date: string;
  type: 'flask' | 'gratitude' | 'echo';
  title: string;
  socraticQuestion?: string;
  reflection?: string;
  emotions?: { name: string; color: string; intensity: number }[];
  items?: string[];
  detail?: string;
  deepReflection?: string;
  deepenedFromItem?: string;
  socraticPrompt?: string;
  tags?: string[];
  timestamp: number;
}

export default function SereneBookReader({ flasks, echos, onClose }: SereneBookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [theme, setTheme] = useState<ReaderTheme>('parchment');
  const [fontSize, setFontSize] = useState<FontSize>('lg');
  const [viewMode, setViewMode] = useState<'book' | 'continuous'>('book');

  // Combine and sort all entries chronologically (oldest to newest for book flow, or toggleable)
  const bookEntries: JournalEntry[] = useMemo(() => {
    const entries: JournalEntry[] = [];

    // Parse Flasks
    flasks.forEach(f => {
      let ts = Date.now();
      if (f.date) {
        const parsed = new Date(f.date).getTime();
        if (!isNaN(parsed)) ts = parsed;
      }
      entries.push({
        id: f.id,
        date: f.date || 'Sin fecha',
        type: 'flask',
        title: 'Frasco de Introspección',
        socraticQuestion: f.socraticQuestion,
        reflection: f.socraticReflection,
        emotions: f.emotions,
        tags: f.tags,
        timestamp: ts
      });
    });

    // Parse Echoes & Gratitudes
    echos.forEach(e => {
      let ts = Date.now();
      if (e.date && e.date !== 'Hoy' && e.date !== 'Ayer') {
        const parsed = new Date(e.date).getTime();
        if (!isNaN(parsed)) ts = parsed;
      }
      const isGratitude = e.type === 'gratitud' || e.title.toLowerCase().includes('gratitud');
      entries.push({
        id: e.id,
        date: e.date,
        type: isGratitude ? 'gratitude' : 'echo',
        title: e.title,
        detail: e.detail,
        items: e.items,
        deepReflection: e.deepReflection,
        deepenedFromItem: e.deepenedFromItem,
        socraticPrompt: e.socraticPrompt,
        tags: e.tags,
        timestamp: ts
      });
    });

    // Sort by timestamp or natural order
    entries.sort((a, b) => b.timestamp - a.timestamp);
    return entries;
  }, [flasks, echos]);

  // Keyboard navigation for page flip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage(prev => Math.min(prev + 1, bookEntries.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookEntries.length, onClose]);

  // Styling maps based on theme
  const themeStyles = {
    parchment: {
      bg: 'bg-[#fbf7f0] text-[#332b26]',
      card: 'bg-[#f4ede1]/60 border-[#e3d7c5]',
      accent: 'text-[#8c5e35]',
      subtle: 'text-[#7a6d63]',
      divider: 'border-[#dfd3c0]'
    },
    pure: {
      bg: 'bg-[#ffffff] text-[#1c2421]',
      card: 'bg-[#f8f9fa] border-neutral-200',
      accent: 'text-[#84a59d]',
      subtle: 'text-[#6c757d]',
      divider: 'border-neutral-200'
    },
    night: {
      bg: 'bg-[#121619] text-[#e8ebe4]',
      card: 'bg-[#1b2226] border-[#2c363d]',
      accent: 'text-[#a4c2b9]',
      subtle: 'text-[#8a9994]',
      divider: 'border-[#263138]'
    }
  }[theme];

  const fontSizeClass = {
    base: 'text-base leading-relaxed',
    lg: 'text-lg md:text-xl leading-loose',
    xl: 'text-xl md:text-2xl leading-loose'
  }[fontSize];

  const currentEntry = bookEntries[currentPage];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed inset-0 z-50 overflow-y-auto ${themeStyles.bg} transition-colors duration-500 flex flex-col justify-between`}
    >
      {/* Top Floating Serene Controls Bar */}
      <header className="sticky top-0 z-20 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b transition-colors border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <BookOpen className={`w-4 h-4 ${themeStyles.accent}`} />
          <span className="font-serif italic text-sm md:text-base font-normal tracking-wide">
            Libro de Presencia & Memorias
          </span>
          {bookEntries.length > 0 && viewMode === 'book' && (
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${themeStyles.subtle} bg-black/5 dark:bg-white/5`}>
              Página {currentPage + 1} de {bookEntries.length}
            </span>
          )}
        </div>

        {/* Reader Customization Toolbar */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center rounded-full bg-black/5 dark:bg-white/5 p-1 text-xs">
            <button
              onClick={() => setViewMode('book')}
              className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                viewMode === 'book' ? 'bg-white dark:bg-neutral-800 shadow-2xs font-medium' : themeStyles.subtle
              }`}
            >
              Página por Página
            </button>
            <button
              onClick={() => setViewMode('continuous')}
              className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                viewMode === 'continuous' ? 'bg-white dark:bg-neutral-800 shadow-2xs font-medium' : themeStyles.subtle
              }`}
            >
              Continuo
            </button>
          </div>

          {/* Font Size Adjuster */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-full p-1 text-xs">
            <button
              onClick={() => setFontSize('base')}
              className={`w-6 h-6 rounded-full flex items-center justify-center font-serif text-xs transition-all cursor-pointer ${
                fontSize === 'base' ? 'bg-white dark:bg-neutral-800 shadow-2xs font-bold' : themeStyles.subtle
              }`}
              title="Tipografía Estándar"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`w-6 h-6 rounded-full flex items-center justify-center font-serif text-sm transition-all cursor-pointer ${
                fontSize === 'lg' ? 'bg-white dark:bg-neutral-800 shadow-2xs font-bold' : themeStyles.subtle
              }`}
              title="Tipografía Grande"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`w-6 h-6 rounded-full flex items-center justify-center font-serif text-base transition-all cursor-pointer ${
                fontSize === 'xl' ? 'bg-white dark:bg-neutral-800 shadow-2xs font-bold' : themeStyles.subtle
              }`}
              title="Tipografía Extra Grande"
            >
              A++
            </button>
          </div>

          {/* Theme Palette Chooser */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-full p-1">
            <button
              onClick={() => setTheme('parchment')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                theme === 'parchment' ? 'ring-2 ring-[#8c5e35]' : 'opacity-60'
              }`}
              style={{ backgroundColor: '#fbf7f0' }}
              title="Papel Cálido"
            >
              <Coffee className="w-3 h-3 text-[#594939]" />
            </button>
            <button
              onClick={() => setTheme('pure')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                theme === 'pure' ? 'ring-2 ring-[#84a59d]' : 'opacity-60'
              }`}
              style={{ backgroundColor: '#ffffff' }}
              title="Nieve Pura"
            >
              <Sun className="w-3 h-3 text-neutral-800" />
            </button>
            <button
              onClick={() => setTheme('night')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                theme === 'night' ? 'ring-2 ring-[#a4c2b9]' : 'opacity-60'
              }`}
              style={{ backgroundColor: '#121619' }}
              title="Noche Serena"
            >
              <Moon className="w-3 h-3 text-neutral-200" />
            </button>
          </div>

          {/* Exit Reading Mode Button */}
          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-serif transition-all cursor-pointer ${themeStyles.subtle} hover:${themeStyles.bg}`}
            title="Salir del Modo Lectura (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Libro</span>
          </button>
        </div>
      </header>

      {/* Main Reading Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-10 md:py-16">
        {bookEntries.length === 0 ? (
          <div className="text-center space-y-4 max-w-md mx-auto my-auto">
            <Feather className={`w-12 h-12 mx-auto ${themeStyles.accent} opacity-60`} />
            <h3 className="font-serif text-2xl font-normal">Aún no hay páginas escritas</h3>
            <p className={`text-sm font-light ${themeStyles.subtle}`}>
              Vierte tus primeros frascos en Etéreo o completa rituales en Güe para llenar este libro con tu sabiduría personal.
            </p>
          </div>
        ) : viewMode === 'book' ? (
          
          /* Page-by-page Book Layout */
          <div className="w-full max-w-2xl mx-auto space-y-8 my-auto">
            <AnimatePresence mode="wait">
              {currentEntry && (
                <motion.article
                  key={currentEntry.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  {/* Chapter Header */}
                  <div className="text-center space-y-2 border-b pb-6 border-black/10 dark:border-white/10">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-[11px] font-mono tracking-widest uppercase ${themeStyles.accent}`}>
                        {currentEntry.date}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl font-light">
                      {currentEntry.title}
                    </h2>
                    {currentEntry.tags && currentEntry.tags.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                        {currentEntry.tags.map((t, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-mono opacity-80 border border-current/20 bg-current/5"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Flask Emotional Elements */}
                  {currentEntry.type === 'flask' && (
                    <div className="space-y-6">
                      {currentEntry.emotions && currentEntry.emotions.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          {currentEntry.emotions.map((em, i) => (
                            <span 
                              key={i}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif bg-black/5 dark:bg-white/5 border border-black/5"
                            >
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: em.color }} />
                              <span>{em.name}</span>
                              <span className={`text-[10px] font-mono ${themeStyles.subtle}`}>({em.intensity} gotas)</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Socratic Question */}
                      {currentEntry.socraticQuestion && (
                        <blockquote className="p-6 md:p-8 rounded-2xl bg-black/5 dark:bg-white/5 border-l-2 border-current text-center my-6">
                          <p className={`font-serif italic ${fontSizeClass}`}>
                            “{currentEntry.socraticQuestion}”
                          </p>
                        </blockquote>
                      )}

                      {/* User's Inner Reflection */}
                      {currentEntry.reflection ? (
                        <div className="space-y-3">
                          <span className={`text-xs font-mono uppercase tracking-widest ${themeStyles.subtle} block text-center`}>
                            Palabras del Alma
                          </span>
                          <p className={`font-serif ${fontSizeClass} whitespace-pre-wrap text-justify md:text-left`}>
                            {currentEntry.reflection}
                          </p>
                        </div>
                      ) : (
                        <p className={`text-center font-serif italic text-sm ${themeStyles.subtle}`}>
                          (Frasco guardado en contemplación silenciosa)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Daily Gratitude Harvest */}
                  {currentEntry.type === 'gratitude' && (
                    <div className="space-y-6 py-4">
                      <div className="text-center">
                        <Heart className={`w-8 h-8 mx-auto mb-2 ${themeStyles.accent} fill-current/20`} />
                        <span className={`text-xs font-mono uppercase tracking-widest ${themeStyles.subtle}`}>
                          Cosecha Sagrada de Gratitud
                        </span>
                      </div>

                      {currentEntry.items && currentEntry.items.length > 0 ? (
                        <div className="space-y-6 max-w-xl mx-auto">
                          <ol className="space-y-4">
                            {currentEntry.items.map((item, idx) => (
                              <li 
                                key={idx} 
                                className="p-4 md:p-5 rounded-2xl bg-black/5 dark:bg-white/5 flex items-start gap-4"
                              >
                                <span className={`w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 font-mono text-sm font-bold flex items-center justify-center shrink-0 ${themeStyles.accent}`}>
                                  {idx + 1}
                                </span>
                                <p className={`font-serif ${fontSizeClass} italic leading-relaxed pt-0.5`}>
                                  “{item}”
                                </p>
                              </li>
                            ))}
                          </ol>

                          {/* Deep Reflection in Book Mode */}
                          {currentEntry.deepReflection && (
                            <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10 space-y-3">
                              <div className="flex items-center gap-2">
                                <Feather className={`w-4 h-4 ${themeStyles.accent}`} />
                                <span className={`text-xs font-mono uppercase tracking-widest ${themeStyles.accent}`}>
                                  Reflexión Profunda
                                </span>
                              </div>
                              {currentEntry.socraticPrompt && (
                                <p className={`font-serif italic text-sm ${themeStyles.subtle}`}>
                                  “{currentEntry.socraticPrompt}”
                                </p>
                              )}
                              <p className={`font-serif ${fontSizeClass} whitespace-pre-wrap`}>
                                {currentEntry.deepReflection}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className={`font-serif ${fontSizeClass} text-center italic`}>
                          {currentEntry.detail}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Standard Presence Echo */}
                  {currentEntry.type === 'echo' && (
                    <div className="space-y-6 py-6 text-center">
                      <Sparkles className={`w-8 h-8 mx-auto ${themeStyles.accent}`} />
                      <p className={`font-serif ${fontSizeClass} leading-relaxed max-w-lg mx-auto`}>
                        {currentEntry.detail}
                      </p>
                    </div>
                  )}

                  {/* End of chapter divider */}
                  <div className="flex items-center justify-center pt-8 text-xs font-serif opacity-40">
                    <span className="tracking-widest">❖ ❖ ❖</span>
                  </div>
                </motion.article>
              )}
            </AnimatePresence>
          </div>
        ) : (
          
          /* Continuous Scroll Reading Layout */
          <div className="w-full max-w-2xl mx-auto space-y-16 py-8">
            {bookEntries.map((entry, idx) => (
              <article 
                key={entry.id}
                className="space-y-6 pb-12 border-b border-black/10 dark:border-white/10 last:border-none"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`${themeStyles.accent} uppercase tracking-widest`}>
                    Capítulo {idx + 1}
                  </span>
                  <span className={themeStyles.subtle}>{entry.date}</span>
                </div>

                <h3 className="font-serif text-2xl font-light">
                  {entry.title}
                </h3>

                {entry.socraticQuestion && (
                  <blockquote className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border-l-2 border-current font-serif italic text-lg leading-relaxed">
                    “{entry.socraticQuestion}”
                  </blockquote>
                )}

                {entry.reflection && (
                  <p className={`font-serif ${fontSizeClass} whitespace-pre-wrap`}>
                    {entry.reflection}
                  </p>
                )}

                {entry.items && entry.items.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <ul className="space-y-3">
                      {entry.items.map((it, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className={`text-sm font-bold ${themeStyles.accent}`}>•</span>
                          <span className={`font-serif italic ${fontSizeClass}`}>“{it}”</span>
                        </li>
                      ))}
                    </ul>

                    {entry.deepReflection && (
                      <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10 space-y-2 mt-4">
                        <div className="flex items-center gap-2">
                          <Feather className={`w-3.5 h-3.5 ${themeStyles.accent}`} />
                          <span className={`text-xs font-mono uppercase tracking-widest ${themeStyles.accent}`}>
                            Reflexión Profunda
                          </span>
                        </div>
                        {entry.socraticPrompt && (
                          <p className={`font-serif italic text-xs ${themeStyles.subtle}`}>
                            “{entry.socraticPrompt}”
                          </p>
                        )}
                        <p className={`font-serif ${fontSizeClass} whitespace-pre-wrap`}>
                          {entry.deepReflection}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {entry.detail && !entry.items && (
                  <p className={`font-serif ${fontSizeClass} ${themeStyles.subtle}`}>
                    {entry.detail}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Floating Navigation for Book View */}
      {viewMode === 'book' && bookEntries.length > 0 && (
        <footer className="sticky bottom-0 z-20 backdrop-blur-md px-6 py-4 flex items-center justify-between border-t border-black/5 dark:border-white/5 max-w-2xl mx-auto w-full">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-serif text-xs md:text-sm transition-all cursor-pointer ${
              currentPage === 0 
                ? 'opacity-20 cursor-not-allowed' 
                : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 hover:shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Página Anterior</span>
          </button>

          <span className={`text-xs font-mono ${themeStyles.subtle}`}>
            {currentPage + 1} / {bookEntries.length}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(bookEntries.length - 1, prev + 1))}
            disabled={currentPage >= bookEntries.length - 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-serif text-xs md:text-sm transition-all cursor-pointer ${
              currentPage >= bookEntries.length - 1
                ? 'opacity-20 cursor-not-allowed' 
                : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 hover:shadow-2xs'
            }`}
          >
            <span>Página Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      )}
    </motion.div>
  );
}
