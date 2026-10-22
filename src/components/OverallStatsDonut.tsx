import React from 'react';
import { Target, CheckCircle, Clock, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface OverallStatsDonutProps {
  goal: number; // total possible habit instances in the month
  completed: number; // checked count
  left: number; // remaining
  percentage: number; // 0 to 100
  totalHabitsCount: number;
  daysCount: number;
}

export const OverallStatsDonut: React.FC<OverallStatsDonutProps> = ({
  goal,
  completed,
  left,
  percentage,
  totalHabitsCount,
  daysCount,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // SVG Donut metrics
  const size = 130;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`border rounded-xl p-5 shadow-xl flex flex-col justify-between h-full relative overflow-hidden transition-colors duration-200 ${
      isDark 
        ? 'bg-[#121214] border-neutral-800/80 text-neutral-100' 
        : 'bg-white border-slate-200 shadow-slate-200/50 text-slate-900'
    }`}>
      {/* Background glow effect */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
        isDark ? 'bg-neutral-700/10' : 'bg-emerald-500/10'
      }`} />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${
            isDark 
              ? 'bg-neutral-900 border-neutral-800 text-neutral-300' 
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className={`text-[10px] font-mono tracking-widest uppercase font-semibold block ${
              isDark ? 'text-neutral-400' : 'text-slate-500'
            }`}>
              MONTH PERFORMANCE
            </span>
            <h2 className="text-sm font-bold tracking-tight uppercase">
              Overall Statistics
            </h2>
          </div>
        </div>
        <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
          isDark 
            ? 'bg-neutral-900 border-neutral-800 text-neutral-400' 
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          {totalHabitsCount} habits &times; {daysCount}d
        </span>
      </div>

      {/* Middle Content: KPI Boxes + Circular Donut Chart */}
      <div className="grid grid-cols-12 gap-3 items-center my-auto py-1">
        {/* KPI Boxes (7 columns) */}
        <div className="col-span-7 flex flex-col gap-2">
          {/* Goal KPI */}
          <div className={`border rounded-lg p-2.5 flex items-center justify-between transition-colors ${
            isDark ? 'bg-[#0e0e11] border-neutral-800/90' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded border flex items-center justify-center ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-slate-300 text-slate-500'
              }`}>
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                isDark ? 'text-neutral-300' : 'text-slate-700'
              }`}>
                Goal
              </span>
            </div>
            <div className="text-right">
              <span className={`text-base font-extrabold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {goal.toLocaleString()}
              </span>
              <span className={`text-[10px] block font-mono ${isDark ? 'text-neutral-400' : 'text-slate-400'}`}>
                instances
              </span>
            </div>
          </div>

          {/* Completed KPI */}
          <div className={`border rounded-lg p-2.5 flex items-center justify-between transition-colors ${
            isDark ? 'bg-[#0e0e11] border-neutral-800/90' : 'bg-emerald-50/70 border-emerald-200/80'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded border flex items-center justify-center ${
                isDark ? 'bg-emerald-950/60 border-emerald-900/60 text-emerald-400' : 'bg-white border-emerald-300 text-emerald-600'
              }`}>
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                isDark ? 'text-emerald-300' : 'text-emerald-800'
              }`}>
                Completed
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold font-mono text-emerald-500">
                {completed.toLocaleString()}
              </span>
              <span className={`text-[10px] block font-mono ${isDark ? 'text-emerald-400/80' : 'text-emerald-600/80'}`}>
                checked
              </span>
            </div>
          </div>

          {/* Left KPI */}
          <div className={`border rounded-lg p-2.5 flex items-center justify-between transition-colors ${
            isDark ? 'bg-[#0e0e11] border-neutral-800/90' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded border flex items-center justify-center ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-slate-300 text-slate-500'
              }`}>
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                isDark ? 'text-neutral-400' : 'text-slate-600'
              }`}>
                Left
              </span>
            </div>
            <div className="text-right">
              <span className={`text-base font-extrabold font-mono ${isDark ? 'text-neutral-300' : 'text-slate-800'}`}>
                {Math.max(0, left).toLocaleString()}
              </span>
              <span className={`text-[10px] block font-mono ${isDark ? 'text-neutral-400' : 'text-slate-400'}`}>
                remaining
              </span>
            </div>
          </div>
        </div>

        {/* Circular Donut Chart (5 columns) */}
        <div className="col-span-5 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background Ring Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className={isDark ? 'stroke-neutral-800/80' : 'stroke-slate-200'}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className={`transition-all duration-700 ease-out ${
                  percentage >= 80
                    ? 'text-emerald-500'
                    : percentage >= 50
                    ? isDark ? 'text-white' : 'text-slate-800'
                    : isDark ? 'text-neutral-400' : 'text-slate-400'
                }`}
              />
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className={`text-2xl font-black font-mono tracking-tighter leading-none ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {percentage}%
              </span>
              <span className={`text-[10px] uppercase font-mono tracking-wider mt-1 ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}>
                Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className={`flex items-center justify-between pt-2 border-t text-[10px] font-mono ${
        isDark ? 'border-neutral-800/80 text-neutral-400' : 'border-slate-200 text-slate-500'
      }`}>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Consistency Target: 80%</span>
        </span>
        <span className={isDark ? 'text-neutral-300' : 'text-slate-700 font-medium'}>
          {percentage >= 80 ? '⚡ Elite Pace' : percentage >= 50 ? '📈 On Track' : '🌱 Building Momentum'}
        </span>
      </div>
    </div>
  );
};
