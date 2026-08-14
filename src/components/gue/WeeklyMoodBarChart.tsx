import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  CartesianGrid
} from 'recharts';
import { Sparkles, Calendar, TrendingUp } from 'lucide-react';
import { EmotionalFlaskEntry, PURO_EMOTIONS } from '../../types';

interface WeeklyMoodBarChartProps {
  flasks: EmotionalFlaskEntry[];
  onNavigateToEtereo?: () => void;
}

interface EmotionChartData {
  id: string;
  name: string;
  count: number;
  color: string;
  totalIntensity: number;
  avgIntensity: number;
}

export default function WeeklyMoodBarChart({ flasks, onNavigateToEtereo }: WeeklyMoodBarChartProps) {
  // Calculate frequencies and intensity of emotions registered in the last 7 days
  const { chartData, totalEmotionsCount, dominantEmotion, flasksThisWeekCount } = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Filter flasks from the last 7 days or use all if dates are recent
    const recentFlasks = flasks.filter(flask => {
      if (!flask.date) return true;
      const flaskDate = new Date(flask.date);
      // If valid date, check if within 7 days, else include it
      return !isNaN(flaskDate.getTime()) ? flaskDate >= sevenDaysAgo : true;
    });

    const counts: Record<string, { count: number; totalIntensity: number; color: string; name: string }> = {};

    // Initialize all PURO emotions so the chart shows a balanced baseline
    PURO_EMOTIONS.forEach(em => {
      counts[em.id] = {
        count: 0,
        totalIntensity: 0,
        color: em.color,
        name: em.name
      };
    });

    let totalCount = 0;

    recentFlasks.forEach(flask => {
      flask.emotions.forEach(em => {
        const id = em.emotionId || em.name.toLowerCase();
        if (!counts[id]) {
          counts[id] = {
            count: 0,
            totalIntensity: 0,
            color: em.color || '#84a59d',
            name: em.name
          };
        }
        counts[id].count += 1;
        counts[id].totalIntensity += (em.intensity || 1);
        totalCount += 1;
      });
    });

    // Format data for Recharts
    const data: EmotionChartData[] = Object.keys(counts).map(id => {
      const item = counts[id];
      return {
        id,
        name: item.name,
        count: item.count,
        color: item.color,
        totalIntensity: item.totalIntensity,
        avgIntensity: item.count > 0 ? Number((item.totalIntensity / item.count).toFixed(1)) : 0
      };
    });

    // Sort by count descending so most frequent is first, or keep standard order
    data.sort((a, b) => b.count - a.count);

    const dominant = data.length > 0 && data[0].count > 0 ? data[0] : null;

    return {
      chartData: data,
      totalEmotionsCount: totalCount,
      dominantEmotion: dominant,
      flasksThisWeekCount: recentFlasks.length
    };
  }, [flasks]);

  // Custom Serene Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: EmotionChartData = payload[0].payload;
      return (
        <div className="p-3 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-700/70 shadow-lg text-xs space-y-1 z-50">
          <div className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: data.color }} 
            />
            <span className="font-serif font-semibold text-sm text-[var(--text-puro)]">
              {data.name}
            </span>
          </div>
          <p className="text-[var(--text-puro-muted)] font-light">
            Frecuencia: <strong className="text-[var(--text-puro)] font-mono">{data.count}</strong> {data.count === 1 ? 'registro' : 'registros'}
          </p>
          {data.count > 0 && (
            <p className="text-[var(--text-puro-muted)] font-light">
              Intensidad promedio: <strong className="text-[var(--text-puro)] font-mono">{data.avgIntensity} / 5</strong>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 md:p-8 rounded-[var(--radius-puro)] glass-puro shadow-puro border border-white/60 dark:border-neutral-800/80 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary-puro)]/15 text-[10px] font-mono uppercase tracking-wider text-[var(--primary-puro)] font-semibold mb-1">
            <Calendar className="w-3 h-3" />
            <span>Balance de la Última Semana</span>
          </div>
          <h3 className="font-serif text-2xl font-normal text-[var(--text-puro)]">
            Frecuencia del Sentir en los Frascos
          </h3>
          <p className="text-xs text-[var(--text-puro-muted)] font-light">
            Distribución de las emociones reconocidas y vertidas durante los últimos 7 días.
          </p>
        </div>

        {dominantEmotion && (
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/70 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60 text-xs shrink-0 shadow-2xs">
            <div 
              className="w-3 h-3 rounded-full shadow-xs"
              style={{ backgroundColor: dominantEmotion.color }}
            />
            <div>
              <span className="text-[10px] text-[var(--text-puro-muted)] uppercase tracking-wider block font-mono">
                Emoción Predominante
              </span>
              <span className="font-serif font-medium text-[var(--text-puro)] text-sm">
                {dominantEmotion.name} ({dominantEmotion.count} {dominantEmotion.count === 1 ? 'vez' : 'veces'})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bar Chart Container */}
      <div className="w-full h-64 md:h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 12, left: -20, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(150, 150, 150, 0.15)" 
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'var(--text-puro-muted)', fontSize: 11, fontFamily: 'serif' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(150, 150, 150, 0.2)' }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis 
              allowDecimals={false}
              tick={{ fill: 'var(--text-puro-muted)', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(132, 165, 157, 0.08)' }} />
            <Bar 
              dataKey="count" 
              radius={[8, 8, 2, 2]} 
              maxBarSize={42}
              animationDuration={900}
            >
              {chartData.map((entry) => (
                <Cell 
                  key={`cell-${entry.id}`} 
                  fill={entry.count > 0 ? entry.color : '#e5e5e5'} 
                  opacity={entry.count > 0 ? 0.9 : 0.4}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Footer */}
      <div className="pt-3 border-t border-neutral-200/50 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-puro-muted)]">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px]">
            Total de frascos analizados: <strong className="text-[var(--text-puro)]">{flasksThisWeekCount}</strong>
          </span>
          <span className="text-neutral-300">•</span>
          <span className="font-mono text-[11px]">
            Emociones sembradas: <strong className="text-[var(--text-puro)]">{totalEmotionsCount}</strong>
          </span>
        </div>

        {onNavigateToEtereo && (
          <button
            onClick={onNavigateToEtereo}
            className="flex items-center gap-1.5 text-xs text-[var(--primary-puro)] hover:underline font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sellar nuevo frasco en Etéreo →</span>
          </button>
        )}
      </div>
    </motion.section>
  );
}
