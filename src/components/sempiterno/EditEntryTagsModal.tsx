import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, X, Check, Sparkles } from 'lucide-react';
import TagSelector from '../ui/TagSelector';

interface EditEntryTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryType: 'flask' | 'echo';
  entryTitle: string;
  currentTags: string[];
  onSaveTags: (tags: string[]) => void;
}

export default function EditEntryTagsModal({
  isOpen,
  onClose,
  entryType,
  entryTitle,
  currentTags = [],
  onSaveTags
}: EditEntryTagsModalProps) {
  const [tags, setTags] = useState<string[]>(currentTags);

  useEffect(() => {
    if (isOpen) {
      setTags(currentTags || []);
    }
  }, [isOpen, currentTags]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveTags(tags);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-[28px] shadow-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 md:p-7 space-y-6 overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200/60 dark:border-neutral-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--primary-puro)] font-semibold">
              <Tag className="w-3.5 h-3.5" />
              <span>Editar Etiquetas de Contexto</span>
            </div>
            <h3 className="font-serif text-lg text-[var(--text-puro)] font-medium line-clamp-1">
              {entryTitle}
            </h3>
            <p className="text-xs text-[var(--text-puro-muted)] font-light">
              {entryType === 'flask' ? 'Frasco Emocional' : 'Eco de Presencia'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tag Selector Body */}
        <TagSelector
          selectedTags={tags}
          onChange={setTags}
          label="Categorías y Contextos"
          description="Selecciona o añade etiquetas como Trabajo, Familia, Creatividad, etc."
          allowCustom={true}
          maxTags={8}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs text-[var(--text-puro-muted)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--primary-puro)] hover:bg-[var(--primary-puro-hover)] text-white text-xs font-medium tracking-wide transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Guardar Etiquetas</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
