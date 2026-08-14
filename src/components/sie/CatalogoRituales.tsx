import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Bookmark, Play, Sparkles, Filter } from 'lucide-react';
import { Ritual } from '../../types';

interface CatalogoRitualesProps {
  rituales: Ritual[];
  onSelect: (r: Ritual) => void;
  onToggleFavorite?: (id: string) => void;
}

export default function CatalogoRituales({ 
  rituales, 
  onSelect,
  onToggleFavorite 
}: CatalogoRitualesProps) {
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'calma' | 'desahogo' | 'descanso'>('todos');

  const filteredRituales = rituales.filter(r => {
    if (selectedCategory === 'todos') return true;
    return r.categoria === selectedCategory;
  });

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <span className="text-[10px] font-mono text-[var(--text-puro-muted)] uppercase tracking-wider mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filtro:
        </span>
        {(['todos', 'calma', 'desahogo', 'descanso'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1 rounded-full text-xs capitalize transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[var(--primary-puro)] text-white shadow-2xs font-medium'
                : 'bg-white/60 hover:bg-white text-[var(--text-puro-muted)] border border-neutral-200/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Ritual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {filteredRituales.map((ritual, i) => (
          <motion.div
            key={ritual.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="p-6 rounded-[var(--radius-puro)] glass-puro border border-white/60 flex flex-col justify-between group cursor-pointer shadow-puro hover:shadow-lg transition-all relative overflow-hidden"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-1.5 text-[var(--primary-puro)] text-[10px] font-mono uppercase tracking-widest font-semibold bg-[var(--primary-puro)]/10 px-2.5 py-0.5 rounded-full">
                  <Clock size={11} />
                  {ritual.duracionEstimada}
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleFavorite) onToggleFavorite(ritual.id);
                  }}
                  className="opacity-40 hover:opacity-100 transition-opacity p-1 text-[var(--secondary-puro)]"
                  title="Guardar como favorito"
                >
                  <Bookmark size={16} fill={ritual.isFavorite ? "currentColor" : "none"} />
                </button>
              </div>

              <h4 className="font-serif text-2xl font-light italic mb-2 text-[var(--text-puro)] group-hover:text-[var(--primary-puro)] transition-colors">
                {ritual.titulo}
              </h4>
              
              <p className="text-xs text-[var(--text-puro-muted)] leading-relaxed mb-6 font-light">
                {ritual.intencion}
              </p>
            </div>
            
            <div className="pt-4 border-t border-neutral-200/50 flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
                {ritual.pasos.length} pasos guiados
              </span>
              
              <button 
                onClick={() => onSelect(ritual)}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--primary-puro)] group-hover:gap-3 transition-all cursor-pointer"
              >
                <Play size={11} fill="currentColor" />
                Iniciar Ritual
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
