import React from 'react';
import { Tag as TagIcon, X } from 'lucide-react';

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const getTagColorClass = (tag: string, isSelected: boolean = false) => {
  const normalized = tag.toLowerCase().trim();

  if (isSelected) {
    return 'bg-[var(--primary-puro)] text-white border-[var(--primary-puro)] shadow-xs';
  }

  if (normalized.includes('trabajo') || normalized.includes('laboral') || normalized.includes('estudio')) {
    return 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60';
  }
  if (normalized.includes('familia') || normalized.includes('hogar') || normalized.includes('pareja')) {
    return 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60';
  }
  if (normalized.includes('creatividad') || normalized.includes('arte') || normalized.includes('proyecto')) {
    return 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60';
  }
  if (normalized.includes('relaciones') || normalized.includes('amigos') || normalized.includes('social')) {
    return 'bg-purple-50/80 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60';
  }
  if (normalized.includes('salud') || normalized.includes('cuerpo') || normalized.includes('bienestar')) {
    return 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60';
  }
  if (normalized.includes('descanso') || normalized.includes('sueño') || normalized.includes('noche') || normalized.includes('paz')) {
    return 'bg-sky-50/80 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60';
  }
  if (normalized.includes('espiritualidad') || normalized.includes('alma') || normalized.includes('meditacion')) {
    return 'bg-violet-50/80 dark:bg-violet-950/40 text-violet-800 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/60';
  }
  if (normalized.includes('personal') || normalized.includes('intimo')) {
    return 'bg-teal-50/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/60';
  }

  // Default neutral earthy badge
  return 'bg-stone-100/90 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 border-stone-200/80 dark:border-neutral-700';
};

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  onRemove,
  onClick,
  isSelected = false,
  size = 'sm',
  showIcon = true,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'text-[9px] px-2 py-0.5 gap-1',
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5'
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5'
  };

  const colorClass = getTagColorClass(tag, isSelected);

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium border font-sans tracking-wide transition-all select-none ${sizeClasses[size]} ${colorClass} ${
        onClick ? 'cursor-pointer hover:opacity-90 active:scale-95' : ''
      } ${className}`}
    >
      {showIcon && <TagIcon className={`${iconSizes[size]} opacity-70 shrink-0`} />}
      <span>{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
          title={`Eliminar etiqueta ${tag}`}
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </span>
  );
};

export default TagBadge;
