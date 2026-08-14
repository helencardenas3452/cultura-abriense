import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Sparkles, 
  Calendar, 
  Heart, 
  Droplets, 
  BookOpen, 
  Clock, 
  Download, 
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Share2,
  BookMarked,
  Feather,
  Edit3,
  Tag as TagIcon,
  Plus
} from 'lucide-react';
import { EmotionalFlaskEntry, PresenceEcho, PURO_EMOTIONS } from '../../types';
import ExportModal from './ExportModal';
import HistoricalMoodPieChart from './HistoricalMoodPieChart';
import MonthlyReportCard from './MonthlyReportCard';
import MonthlyMoodCalendar from './MonthlyMoodCalendar';
import WeeklyMoodHeatmap from './WeeklyMoodHeatmap';
import SereneBookReader from './SereneBookReader';
import TransformGratitudeModal from './TransformGratitudeModal';
import EditEntryTagsModal from './EditEntryTagsModal';
import TagBadge from '../ui/TagBadge';

interface SempiternoTimelineProps {
  flasks: EmotionalFlaskEntry[];
  echos: PresenceEcho[];
  onUpdateEcho?: (echo: PresenceEcho) => void;
  onUpdateFlask?: (flask: EmotionalFlaskEntry) => void;
}

export default function SempiternoTimeline({ 
  flasks, 
  echos,
  onUpdateEcho,
  onUpdateFlask
}: SempiternoTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<'todos' | 'frascos' | 'ecos'>('todos');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isReadingModeOpen, setIsReadingModeOpen] = useState(false);
  const [selectedGratitudeForDeepen, setSelectedGratitudeForDeepen] = useState<{
    echoId: string;
    text: string;
    existingReflection?: string;
  } | null>(null);

  // Edit Tag Modal State
  const [editingTarget, setEditingTarget] = useState<{
    type: 'flask' | 'echo';
    id: string;
    title: string;
    tags: string[];
  } | null>(null);

  // Calculate emotion distribution frequency
  const emotionStats: Record<string, { count: number; color: string; name: string }> = {};
  flasks.forEach(f => {
    f.emotions.forEach(e => {
      if (!emotionStats[e.emotionId]) {
        emotionStats[e.emotionId] = { count: 0, color: e.color, name: e.name };
      }
      emotionStats[e.emotionId].count += e.intensity;
    });
  });

  // Collect all unique tags and their frequency across both flasks and echos
  const tagStats = useMemo(() => {
    const counts: Record<string, number> = {};
    flasks.forEach(f => {
      (f.tags || []).forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    echos.forEach(e => {
      (e.tags || []).forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });

    return Object.entries(counts).map(([tag, count]) => ({
      tag,
      count
    })).sort((a, b) => b.count - a.count);
  }, [flasks, echos]);

  // Filtered flasks by search, active filter, and tag filter
  const filteredFlasks = useMemo(() => {
    return flasks.filter(f => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || (
        f.socraticQuestion.toLowerCase().includes(term) ||
        f.socraticReflection.toLowerCase().includes(term) ||
        f.emotions.some(e => e.name.toLowerCase().includes(term)) ||
        (f.tags && f.tags.some(t => t.toLowerCase().includes(term)))
      );

      const matchesTag = selectedTagFilter === 'todos' || (f.tags && f.tags.includes(selectedTagFilter));

      return matchesSearch && matchesTag;
    });
  }, [flasks, searchTerm, selectedTagFilter]);

  // Filtered echos by search, active filter, and tag filter
  const filteredEchos = useMemo(() => {
    return echos.filter(e => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || (
        e.title.toLowerCase().includes(term) ||
        e.detail.toLowerCase().includes(term) ||
        (e.items && e.items.some(i => i.toLowerCase().includes(term))) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(term)))
      );

      const matchesTag = selectedTagFilter === 'todos' || (e.tags && e.tags.includes(selectedTagFilter));

      return matchesSearch && matchesTag;
    });
  }, [echos, searchTerm, selectedTagFilter]);

  const handleSaveDeepReflection = (
    echoId: string, 
    gratitudeText: string, 
    deepReflection: string,
    socraticPrompt?: string
  ) => {
    const targetEcho = echos.find(e => e.id === echoId);
    if (targetEcho && onUpdateEcho) {
      const updatedEcho: PresenceEcho = {
        ...targetEcho,
        deepReflection,
        deepenedFromItem: gratitudeText,
        socraticPrompt
      };
      onUpdateEcho(updatedEcho);
    }
  };

  const handleSaveEditedTags = (newTags: string[]) => {
    if (!editingTarget) return;

    if (editingTarget.type === 'flask' && onUpdateFlask) {
      const target = flasks.find(f => f.id === editingTarget.id);
      if (target) {
        onUpdateFlask({
          ...target,
          tags: newTags
        });
      }
    } else if (editingTarget.type === 'echo' && onUpdateEcho) {
      const target = echos.find(e => e.id === editingTarget.id);
      if (target) {
        onUpdateEcho({
          ...target,
          tags: newTags
        });
      }
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9a8c98]/15 text-[10px] font-mono uppercase tracking-[0.2em] text-[#5c4f5a] font-semibold">
          <Compass className="w-3 h-3" />
          <span>🌙 Sempiterno — Tapiz Histórico</span>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-light text-[var(--text-puro)]">
          El Mapa de tu Sentir
        </h2>
        <p className="text-xs text-[var(--text-puro-muted)] max-w-lg mx-auto font-light leading-relaxed">
          Las huellas de tu introspección a lo largo del tiempo. Nada se pierde; cada emoción vertida es parte del tapiz de tu crecimiento.
        </p>
      </div>

      {/* Tapestry Stats Overview */}
      <div className="p-6 md:p-8 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/80 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-normal text-[var(--text-puro)]">
              Constelación de Estados del Ser
            </h3>
            <p className="text-xs text-[var(--text-puro-muted)] font-light">
              Frecuencia de emociones cultivadas y reconocidas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsReadingModeOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-neutral-800 hover:bg-white text-[var(--text-puro)] border border-neutral-200/80 dark:border-neutral-700 text-xs font-serif shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="Abrir el libro digital de lectura serena sin distracciones"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
              <span>Modo Lectura Serena</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary-puro)] hover:opacity-90 text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
              title="Exportar historial en formato texto legible o JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Historial</span>
            </button>
          </div>
        </div>

        {/* Emotion Distribution Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(emotionStats).length > 0 ? (
            Object.entries(emotionStats).map(([id, stat], idx) => (
              <motion.div 
                key={id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className="p-3.5 rounded-2xl bg-white/60 border border-neutral-200/50 flex flex-col justify-between shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-puro)]">{stat.name}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-xl text-[var(--text-puro)] font-normal">{stat.count}</span>
                  <span className="text-[10px] text-[var(--text-puro-muted)] font-mono">gotas</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-4 text-center text-xs text-[var(--text-puro-muted)] italic font-serif">
              Aún no has vertido emociones en el frasco de Etéreo.
            </div>
          )}
        </div>
      </div>

      {/* Monthly Mood & Registration Calendar */}
      <MonthlyMoodCalendar flasks={flasks} echos={echos} />

      {/* Weekly Mood Intensity Heatmap */}
      <WeeklyMoodHeatmap flasks={flasks} echos={echos} />

      {/* Historical Mood Distribution Pie Chart (Recharts) */}
      <HistoricalMoodPieChart flasks={flasks} />

      {/* Monthly Introspection & Activities Summary Report */}
      <MonthlyReportCard flasks={flasks} echos={echos} />

      {/* Primary Filtering and Search Controls */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Main type filter pills */}
          <div className="flex items-center gap-2">
            {(['todos', 'frascos', 'ecos'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs capitalize transition-all cursor-pointer ${
                  activeFilter === f
                    ? 'bg-[var(--primary-puro)] text-white shadow-2xs font-medium'
                    : 'bg-white/60 text-[var(--text-puro-muted)] hover:bg-white border border-neutral-200/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por emoción, nota o #etiqueta..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full bg-white/80 border border-neutral-200/70 text-xs text-[var(--text-puro)] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-puro)]/40 shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-neutral-600 font-mono"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* Contextual Tag Filter Bar */}
        {tagStats.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-puro-muted)] flex items-center gap-1.5 font-semibold">
                <TagIcon className="w-3 h-3 text-[var(--primary-puro)]" />
                <span>FILTRAR POR CONTEXTO (ETIQUETAS):</span>
              </span>
              {selectedTagFilter !== 'todos' && (
                <button
                  onClick={() => setSelectedTagFilter('todos')}
                  className="text-[10px] font-mono text-[var(--primary-puro)] hover:underline cursor-pointer"
                >
                  Restablecer filtro
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedTagFilter('todos')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                  selectedTagFilter === 'todos'
                    ? 'bg-[var(--primary-puro)] text-white border-[var(--primary-puro)] shadow-2xs'
                    : 'bg-white/80 dark:bg-neutral-800 text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] border-neutral-200/70 dark:border-neutral-700 hover:bg-white'
                }`}
              >
                Todas las etiquetas ({flasks.length + echos.length})
              </button>

              {tagStats.map(({ tag, count }) => {
                const isSelected = selectedTagFilter === tag;
                return (
                  <TagBadge
                    key={tag}
                    tag={`${tag} (${count})`}
                    isSelected={isSelected}
                    onClick={() => setSelectedTagFilter(isSelected ? 'todos' : tag)}
                    size="sm"
                    className="cursor-pointer"
                  />
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Timeline entries */}
      <div className="space-y-6">
        
        {/* Render Flasks */}
        {(activeFilter === 'todos' || activeFilter === 'frascos') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--primary-puro)] font-semibold block">
                FRASCOS SELLADOS ({filteredFlasks.length})
              </span>
              {selectedTagFilter !== 'todos' && (
                <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
                  Filtrado por: #{selectedTagFilter}
                </span>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {filteredFlasks.map((flask, idx) => (
                <motion.div
                  key={flask.id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96, y: -10 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 26,
                    delay: Math.min(idx * 0.04, 0.2),
                    opacity: { duration: 0.4 }
                  }}
                  className="p-6 md:p-7 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/80 space-y-4 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Top Bar: Date, Emotions & Tag trigger */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200/50">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-[var(--primary-puro)]" />
                      <span className="font-mono text-xs font-semibold text-[var(--text-puro)]">
                        {flask.timestamp || flask.date}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {flask.emotions.map((em, i) => (
                        <span
                          key={i}
                          style={{ backgroundColor: `${em.color}20`, color: em.color, borderColor: `${em.color}40` }}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-medium border"
                        >
                          {em.name} (x{em.intensity})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Socratic Reflection */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-puro-muted)]">
                      ESPEJO SOCRÁTICO
                    </div>
                    <h4 className="font-serif italic text-lg text-[var(--text-puro)]">
                      “{flask.socraticQuestion}”
                    </h4>
                    <p className="text-xs text-[var(--text-puro-muted)] leading-relaxed font-light pl-3 border-l-2 border-[var(--primary-puro)]/40">
                      {flask.socraticReflection}
                    </p>
                  </div>

                  {/* Bottom Tags Section & Edit Button */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/40">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {flask.tags && flask.tags.length > 0 ? (
                        flask.tags.map(t => (
                          <TagBadge
                            key={t}
                            tag={t}
                            size="xs"
                            isSelected={selectedTagFilter === t}
                            onClick={() => setSelectedTagFilter(selectedTagFilter === t ? 'todos' : t)}
                          />
                        ))
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic font-mono">Sin etiquetas</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingTarget({
                        type: 'flask',
                        id: flask.id,
                        title: `Frasco: ${flask.timestamp || flask.date}`,
                        tags: flask.tags || []
                      })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono text-[var(--text-puro-muted)] hover:text-[var(--primary-puro)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Editar etiquetas de este frasco"
                    >
                      <TagIcon className="w-2.5 h-2.5" />
                      <span>{flask.tags && flask.tags.length > 0 ? 'Editar tags' : '+ Etiquetar'}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredFlasks.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 text-center glass-puro rounded-2xl border border-neutral-200/50 text-xs text-[var(--text-puro-muted)] font-light font-serif"
              >
                No hay frascos sellados que coincidan con la búsqueda o la etiqueta seleccionada.
              </motion.div>
            )}
          </div>
        )}

        {/* Render Presence Echos */}
        {(activeFilter === 'todos' || activeFilter === 'ecos') && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9b6838] font-semibold block">
                ECOS DE PRESENCIA ({filteredEchos.length})
              </span>
              {selectedTagFilter !== 'todos' && (
                <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
                  Filtrado por: #{selectedTagFilter}
                </span>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {filteredEchos.map((echo, idx) => {
                const isGratitude = echo.type === 'gratitud' || echo.title.toLowerCase().includes('gratitud');

                return (
                  <motion.div
                    key={echo.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 26,
                      delay: Math.min(idx * 0.04, 0.2),
                      opacity: { duration: 0.35 }
                    }}
                    className={`p-5 rounded-2xl border transition-shadow duration-300 space-y-3.5 ${
                      isGratitude 
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/70 dark:border-amber-900/60 shadow-2xs hover:shadow-xs' 
                        : 'bg-white/70 dark:bg-neutral-900/70 border-neutral-200/60 dark:border-neutral-800 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          {isGratitude ? (
                            <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300">
                              <Heart className="w-3 h-3 fill-amber-500/40" />
                            </div>
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-[#9b6838]" />
                          )}
                          <h5 className="font-serif text-sm font-medium text-[var(--text-puro)]">
                            {echo.title}
                          </h5>
                          {isGratitude && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[9px] font-mono font-medium">
                              Cosecha Diaria
                            </span>
                          )}
                        </div>

                        {echo.items && echo.items.length > 0 ? (
                          <div className="space-y-2.5 pt-1.5">
                            <div className="grid grid-cols-1 gap-2">
                              {echo.items.map((item, i) => {
                                const isThisItemDeepened = echo.deepenedFromItem === item;

                                return (
                                  <div 
                                    key={i} 
                                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                                      isThisItemDeepened 
                                        ? 'bg-amber-100/60 dark:bg-amber-900/40 border-amber-300/80 dark:border-amber-700/80' 
                                        : 'bg-white/60 dark:bg-neutral-800/60 border-amber-100/60 dark:border-neutral-700/60 hover:border-amber-300/60'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5 text-xs text-[var(--text-puro)] font-light">
                                      <span className="w-5 h-5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        {i + 1}
                                      </span>
                                      <span className="italic leading-relaxed font-serif text-[13px] text-[var(--text-puro)]">
                                        “{item}”
                                      </span>
                                    </div>

                                    {/* Action to Transform to Deep Reflection */}
                                    <button
                                      onClick={() => setSelectedGratitudeForDeepen({
                                        echoId: echo.id,
                                        text: item,
                                        existingReflection: isThisItemDeepened ? echo.deepReflection : undefined
                                      })}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-serif transition-all shrink-0 cursor-pointer self-end sm:self-center shadow-2xs ${
                                        isThisItemDeepened
                                          ? 'bg-amber-700 text-white hover:bg-amber-800'
                                          : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 border border-amber-300/50'
                                      }`}
                                      title="Transformar esta gratitud en una reflexión profunda guiada por mayéutica"
                                    >
                                      {isThisItemDeepened ? (
                                        <>
                                          <Edit3 className="w-3 h-3" />
                                          <span>Editar Reflexión</span>
                                        </>
                                      ) : (
                                        <>
                                          <Feather className="w-3 h-3" />
                                          <span>Profundizar en Reflexión</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Display Deep Reflection if saved */}
                            {echo.deepReflection && (
                              <motion.div 
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-4 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-800 space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-300 font-semibold">
                                    <Feather className="w-3 h-3" />
                                    <span>Reflexión Profunda Sellada</span>
                                  </div>
                                  <button
                                    onClick={() => setSelectedGratitudeForDeepen({
                                      echoId: echo.id,
                                      text: echo.deepenedFromItem || echo.items![0],
                                      existingReflection: echo.deepReflection
                                    })}
                                    className="text-[10px] font-mono text-amber-800 dark:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" />
                                    <span>Modificar</span>
                                  </button>
                                </div>

                                {echo.socraticPrompt && (
                                  <p className="text-[11px] font-serif italic text-amber-900/80 dark:text-amber-200/80 border-l border-amber-400 pl-2">
                                    “{echo.socraticPrompt}”
                                  </p>
                                )}

                                <p className="text-xs font-serif text-[var(--text-puro)] leading-relaxed whitespace-pre-wrap pt-0.5">
                                  {echo.deepReflection}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-[var(--text-puro-muted)] font-light leading-relaxed">
                            {echo.detail}
                          </p>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {echo.date}
                      </span>
                    </div>

                    {/* Echo Card Tags & Edit Tag Button */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/40 dark:border-neutral-800/40">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {echo.tags && echo.tags.length > 0 ? (
                          echo.tags.map(t => (
                            <TagBadge
                              key={t}
                              tag={t}
                              size="xs"
                              isSelected={selectedTagFilter === t}
                              onClick={() => setSelectedTagFilter(selectedTagFilter === t ? 'todos' : t)}
                            />
                          ))
                        ) : (
                          <span className="text-[10px] text-neutral-400 italic font-mono">Sin etiquetas</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditingTarget({
                          type: 'echo',
                          id: echo.id,
                          title: echo.title,
                          tags: echo.tags || []
                        })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono text-[var(--text-puro-muted)] hover:text-[var(--primary-puro)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Editar etiquetas de este eco"
                      >
                        <TagIcon className="w-2.5 h-2.5" />
                        <span>{echo.tags && echo.tags.length > 0 ? 'Editar tags' : '+ Etiquetar'}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredEchos.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 text-center glass-puro rounded-2xl border border-neutral-200/50 text-xs text-[var(--text-puro-muted)] font-light font-serif"
              >
                No hay ecos que coincidan con la búsqueda o la etiqueta seleccionada.
              </motion.div>
            )}
          </div>
        )}

      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        flasks={flasks}
        echos={echos}
      />

      {/* Serene Book Reading Mode */}
      <AnimatePresence>
        {isReadingModeOpen && (
          <SereneBookReader
            flasks={flasks}
            echos={echos}
            onClose={() => setIsReadingModeOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Transform Gratitude to Deep Reflection Modal */}
      <AnimatePresence>
        {selectedGratitudeForDeepen && (
          <TransformGratitudeModal
            isOpen={Boolean(selectedGratitudeForDeepen)}
            onClose={() => setSelectedGratitudeForDeepen(null)}
            echoId={selectedGratitudeForDeepen.echoId}
            gratitudeText={selectedGratitudeForDeepen.text}
            existingReflection={selectedGratitudeForDeepen.existingReflection}
            onSaveDeepReflection={handleSaveDeepReflection}
          />
        )}
      </AnimatePresence>

      {/* Edit Entry Tags Modal */}
      <AnimatePresence>
        {editingTarget && (
          <EditEntryTagsModal
            isOpen={Boolean(editingTarget)}
            onClose={() => setEditingTarget(null)}
            entryType={editingTarget.type}
            entryTitle={editingTarget.title}
            currentTags={editingTarget.tags}
            onSaveTags={handleSaveEditedTags}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
