import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Sector 
} from 'recharts';
import { PieChart as PieIcon, Sparkles, Droplets } from 'lucide-react';
import { EmotionalFlaskEntry } from '../../types';

interface HistoricalMoodPieChartProps {
  flasks: EmotionalFlaskEntry[];
}

interface EmotionPieData {
  name: string;
  id: string;
  value: number; // total intensity or count
  color: string;
  percentage: number;
  occurrences: number;
}

export default function HistoricalMoodPieChart({ flasks }: HistoricalMoodPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { pieData, totalDrops, totalFlasksCount } = useMemo(() => {
    const stats: Record<string, { name: string; color: string; value: number; occurrences: number }> = {};
    let total = 0;

    flasks.forEach(flask => {
      flask.emotions.forEach(em => {
        const id = em.emotionId || em.name.toLowerCase();
        if (!stats[id]) {
          stats[id] = {
            name: em.name,
            color: em.color || '#84a59d',
            value: 0,
            occurrences: 0
          };
        }
        const intensity = em.intensity || 1;
        stats[id].value += intensity;
        stats[id].occurrences += 1;
        total += intensity;
      });
    });

    const data: EmotionPieData[] = Object.keys(stats).map(id => {
      const item = stats[id];
      const percentage = total > 0 ? Number(((item.value / total) * 100).toFixed(1)) : 0;
      return {
        id,
        name: item.name,
        value: item.value,
        color: item.color,
        percentage,
        occurrences: item.occurrences
      };
    });

    // Sort descending by percentage
    data.sort((a, b) => b.value - a.value);

    return {
      pieData: data,
      totalDrops: total,
      totalFlasksCount: flasks.length
    };
  }, [flasks]);

  // Custom Active Shape for Interactive Donut
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.12))' }}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 9}
          outerRadius={outerRadius + 11}
          fill={fill}
          opacity={0.6}
        />
      </g>
    );
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: EmotionPieData = payload[0].payload;
      return (
        <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-700/70 shadow-xl text-xs space-y-1 z-50 min-w-[140px]">
          <div className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
              style={{ backgroundColor: data.color }} 
            />
            <span className="font-serif font-semibold text-sm text-[var(--text-puro)]">
              {data.name}
            </span>
          </div>
          <div className="pt-1 text-[var(--text-puro-muted)] space-y-0.5 font-light">
            <p>
              Proporción: <strong className="text-[var(--text-puro)] font-mono font-medium">{data.percentage}%</strong>
            </p>
            <p>
              Volumen: <strong className="text-[var(--text-puro)] font-mono font-medium">{data.value} gotas</strong>
            </p>
            <p className="text-[10px]">
              En {data.occurrences} {data.occurrences === 1 ? 'frasco' : 'frascos'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (pieData.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-8 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/80 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary-puro)]/15 text-[10px] font-mono uppercase tracking-wider text-[var(--primary-puro)] font-semibold mb-1">
            <PieIcon className="w-3 h-3" />
            <span>Distribución Porcentual Histórica</span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl font-normal text-[var(--text-puro)]">
            Mosaico de Estados de Ánimo
          </h3>
          <p className="text-xs text-[var(--text-puro-muted)] font-light">
            Representación proporcional de todas las emociones registradas a lo largo de tu camino.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-puro-muted)] bg-white/60 dark:bg-neutral-800/60 px-3 py-1.5 rounded-2xl border border-neutral-200/50 self-start sm:self-auto">
          <Droplets className="w-3.5 h-3.5 text-[var(--primary-puro)]" />
          <span>{totalDrops} gotas en {totalFlasksCount} frascos</span>
        </div>
      </div>

      {/* Chart & Legend Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Donut Chart Container */}
        <div className="md:col-span-5 h-64 sm:h-72 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                animationDuration={1000}
                animationBegin={100}
              >
                {pieData.map((entry) => (
                  <Cell 
                    key={`pie-cell-${entry.id}`} 
                    fill={entry.color} 
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth={1.5}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Insight / Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeIndex !== null && pieData[activeIndex] ? (
              <>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-puro-muted)]">
                  {pieData[activeIndex].name}
                </span>
                <span className="font-serif text-2xl font-semibold text-[var(--text-puro)] leading-tight">
                  {pieData[activeIndex].percentage}%
                </span>
                <span className="text-[9px] font-mono text-[var(--text-puro-muted)]">
                  {pieData[activeIndex].value} gotas
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-puro-muted)]">
                  TOTAL
                </span>
                <span className="font-serif text-2xl font-light text-[var(--text-puro)] leading-tight">
                  100%
                </span>
                <span className="text-[9px] font-mono text-[var(--text-puro-muted)]">
                  {pieData.length} emociones
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend & Breakdown List */}
        <div className="md:col-span-7 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pieData.map((item, idx) => {
              const isHovered = activeIndex === idx;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
                    isHovered 
                      ? 'bg-white dark:bg-neutral-800 border-[var(--primary-puro)]/60 scale-[1.02] shadow-sm' 
                      : 'bg-white/50 dark:bg-neutral-800/40 border-neutral-200/50 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <div className="truncate">
                      <span className="font-serif text-xs font-medium text-[var(--text-puro)] block truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-puro-muted)]">
                        {item.value} {item.value === 1 ? 'gota' : 'gotas'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="font-serif text-sm font-semibold text-[var(--text-puro)]">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-[var(--text-puro-muted)] italic font-serif pt-2 text-right">
            Pasa el cursor o presiona sobre cada segmento para destacar su peso en tu tapiz emocional.
          </p>
        </div>

      </div>
    </motion.div>
  );
}
