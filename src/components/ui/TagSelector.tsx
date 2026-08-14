import React, { useState } from 'react';
import { Tag, Plus, Check } from 'lucide-react';
import { DEFAULT_CONTEXT_TAGS } from '../../types';
import TagBadge from './TagBadge';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  availableTags?: string[];
  label?: string;
  description?: string;
  allowCustom?: boolean;
  maxTags?: number;
  compact?: boolean;
  className?: string;
}

export default function TagSelector({
  selectedTags = [],
  onChange,
  availableTags = DEFAULT_CONTEXT_TAGS,
  label = 'Contexto o Entorno (Etiquetas)',
  description = 'Categoriza tu estado para reconocer patrones en tu vida cotidiana.',
  allowCustom = true,
  maxTags = 6,
  compact = false,
  className = ''
}: TagSelectorProps) {
  const [customInput, setCustomInput] = useState('');
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  // Combine default tags with any already selected custom tags
  const allSuggestedTags = Array.from(new Set([...availableTags, ...selectedTags]));

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length >= maxTags) return;
      onChange([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    // Capitalize first letter cleanly
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    if (!selectedTags.includes(formatted)) {
      if (selectedTags.length < maxTags) {
        onChange([...selectedTags, formatted]);
      }
    }
    setCustomInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[var(--text-puro)] flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-[var(--primary-puro)]" />
            {label}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
            {selectedTags.length}/{maxTags}
          </span>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 py-1">
            {selectedTags.map(tag => (
              <TagBadge
                key={tag}
                tag={tag}
                size="xs"
                onRemove={() => handleToggleTag(tag)}
              />
            ))}
          </div>
        )}

        {/* Quick Suggested Pills */}
        <div className="flex flex-wrap gap-1 items-center">
          {allSuggestedTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`px-2 py-0.5 rounded-full text-[10px] transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[var(--primary-puro)] text-white border-[var(--primary-puro)] font-medium shadow-2xs'
                    : 'bg-white/70 dark:bg-neutral-800/70 hover:bg-white text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] border-neutral-200/60 dark:border-neutral-700'
                }`}
              >
                {isSelected && '✓ '}#{tag}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-3.5 shadow-2xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-puro)]">
            <Tag className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
            <span>{label}</span>
          </div>
          {description && (
            <p className="text-[11px] text-[var(--text-puro-muted)] font-light mt-0.5">
              {description}
            </p>
          )}
        </div>
        <span className="text-[10px] font-mono text-[var(--text-puro-muted)] tracking-wider">
          {selectedTags.length} de {maxTags} max
        </span>
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-700/50">
          {selectedTags.map(tag => (
            <TagBadge
              key={tag}
              tag={tag}
              size="sm"
              onRemove={() => handleToggleTag(tag)}
            />
          ))}
        </div>
      )}

      {/* Suggested Quick Tags Grid */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-puro-muted)] block">
          ETIQUETAS SUGERIDAS:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {allSuggestedTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[var(--primary-puro)] text-white border-[var(--primary-puro)] shadow-xs scale-102'
                    : 'bg-white/80 dark:bg-neutral-800 hover:bg-white text-[var(--text-puro-muted)] hover:text-[var(--text-puro)] border-neutral-200/80 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                {isSelected ? <Check className="w-3 h-3" /> : <span className="opacity-60 text-[10px]">#</span>}
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Tag Input */}
      {allowCustom && (
        <div className="pt-1">
          <form onSubmit={handleAddCustomTag} className="flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">#</span>
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Crear etiqueta personalizada..."
                maxLength={25}
                className="w-full pl-7 pr-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-xs text-[var(--text-puro)] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-puro)]/30 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              disabled={!customInput.trim() || selectedTags.length >= maxTags}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[var(--primary-puro)] hover:bg-[var(--primary-puro-hover)] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-medium transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
