import React, { useState } from 'react';
import { DayInfo } from '../types/tracker';
import { useTheme } from '../context/ThemeContext';
import { BarChart3, TrendingUp } from 'lucide-react';

interface DailyProgressBarChartProps {
  days: DayInfo[];
  dailyPercentages: { [dayNumber: number]: number }; // 0 to 100
  dayOfWeekAverages: { [dayOfWeek: string]: { avg: number; count: number; completedCount: number; totalPossible: number } };
}

export const DailyProgressBarChart: React.FC<DailyProgressBarChartProps> = ({
  days,
  dailyPercentages,
  dayOfWeekAverages,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [viewMode, setViewMode] = useState<'weekday' | 'timeline'>('weekday');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Overall average across the month
  const totalDaysWithData = Object.keys(dailyPercentages).length;
  const overallAvg = totalDaysWithData > 0
    ? Math.round(Object.values(dailyPercentages).reduce((acc, curr) => acc + curr, 0) / days.length)
    : 0;

  return (
    <div className={`border rounded-xl p-5 shadow-xl flex flex-col justify-between h-full relative overflow-hidden transition-colors duration-200 ${
      isDark 
        ? 'bg-[#121214] border-neutral-800/80 text-neutral-100' 
        : 'bg-white border-slate-200 shadow-slate-200/50 text-slate-900'
    }`}>
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${
              isDark 
                ? 'bg-neutral-900 border-neutral-800 text-neutral-300' 
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-[10px] font-mono tracking-widest uppercase font-semibold block ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}>
                DAILY METRICS
              </span>
              <h2 className="text-sm font-bold tracking-tight uppercase">
                Daily Completion Progress
              </h2>
            </div>
          </div>

          {/* Toggle between Grouped by Day of Week vs Full Month Days */}
          <div className={`flex items-center border rounded-lg p-0.5 text-[11px] font-medium transition-colors ${
            isDark 
              ? 'bg-neutral-900/90 border-neutral-800' 
              : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setViewMode('weekday')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'weekday'
                  ? isDark
                    ? 'bg-neutral-800 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-900 shadow-xs font-semibold'
                  : isDark
                  ? 'text-neutral-400 hover:text-neutral-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Weekday
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? isDark
                    ? 'bg-neutral-800 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-900 shadow-xs font-semibold'
                  : isDark
                  ? 'text-neutral-400 hover:text-neutral-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Days ({days.length})
            </button>
          </div>
        </div>

        <div className={`flex items-baseline justify-between text-xs mb-3 ${
          isDark ? 'text-neutral-400' : 'text-slate-500'
        }`}>
          <span>Completion rate grouped by days of the week</span>
          <span className="font-mono text-emerald-500 text-xs font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Avg {overallAvg}%
          </span>
        </div>
      </div>

      {/* Chart Visualization Area */}
      <div className="flex-1 flex flex-col justify-end pt-2 pb-1 min-h-[140px]">
        {viewMode === 'weekday' ? (
          /* Grouped by Days of the Week: Su, Mo, Tu, We, Th, Fr, Sa */
          <div className="grid grid-cols-7 gap-2.5 h-[135px] items-end px-1">
            {daysOfWeek.map((dow, idx) => {
              const data = dayOfWeekAverages[dow] || { avg: 0, count: 0 };
              const percent = Math.round(data.avg);
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={dow}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Floating tooltip */}
                  {isHovered && (
                    <div className={`absolute -top-10 left-1/2 -translate-x-1/2 text-[11px] font-mono py-1 px-2 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none border ${
                      isDark 
                        ? 'bg-neutral-900 border-neutral-700 text-white' 
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}>
                      <span className="font-bold">{dow}</span>: {percent}% avg ({data.count} days)
                    </div>
                  )}

                  {/* Percentage value above bar */}
                  <span className={`text-[10px] font-mono font-medium mb-1.5 transition-colors ${
                    isHovered 
                      ? isDark ? 'text-white font-bold' : 'text-slate-900 font-bold'
                      : isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}>
                    {percent}%
                  </span>

                  {/* Bar track */}
                  <div className={`w-full max-w-[34px] rounded-t-md h-[88px] flex items-end p-0.5 relative overflow-hidden transition-colors border ${
                    isDark 
                      ? 'bg-neutral-900 border-neutral-800 group-hover:border-neutral-600' 
                      : 'bg-slate-100 border-slate-200 group-hover:border-slate-400'
                  }`}>
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between opacity-15 pointer-events-none">
                      <div className={`border-b w-full ${isDark ? 'border-neutral-600' : 'border-slate-400'}`} />
                      <div className={`border-b w-full ${isDark ? 'border-neutral-600' : 'border-slate-400'}`} />
                      <div className={`border-b w-full ${isDark ? 'border-neutral-600' : 'border-slate-400'}`} />
                    </div>

                    {/* Bar fill */}
                    <div
                      style={{ height: `${Math.max(percent, 4)}%` }}
                      className={`w-full rounded-t-xs transition-all duration-300 ${
                        percent >= 80
                          ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : percent >= 50
                          ? isDark ? 'bg-gradient-to-t from-neutral-200 to-white' : 'bg-gradient-to-t from-slate-400 to-slate-700'
                          : percent > 0
                          ? isDark ? 'bg-gradient-to-t from-neutral-600 to-neutral-400' : 'bg-gradient-to-t from-slate-300 to-slate-400'
                          : isDark ? 'bg-neutral-800' : 'bg-slate-200'
                      }`}
                    />
                  </div>

                  {/* Day label */}
                  <div className={`mt-2 text-[11px] font-mono font-bold tracking-wider uppercase transition-colors ${
                    dow === 'Su' || dow === 'Sa' 
                      ? isDark ? 'text-neutral-400' : 'text-slate-500'
                      : isDark ? 'text-neutral-200' : 'text-slate-800'
                  }`}>
                    {dow}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Timeline view of all days in current month */
          <div className="h-[135px] flex items-end gap-1 overflow-x-auto pb-1 px-1">
            {days.map((day) => {
              const percent = dailyPercentages[day.dayNumber] || 0;
              const isHovered = hoveredIndex === day.dayNumber;

              return (
                <div
                  key={day.dayNumber}
                  className="flex-1 min-w-[12px] flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredIndex(day.dayNumber)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {isHovered && (
                    <div className={`absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-mono py-0.5 px-2 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none border ${
                      isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-slate-900 border-slate-700 text-white'
                    }`}>
                      Day {day.dayNumber} ({day.dayOfWeek}): {percent}%
                    </div>
                  )}

                  <div className={`w-full rounded-t-[2px] h-[95px] flex items-end p-[1px] relative border ${
                    isDark ? 'bg-neutral-900 border-neutral-800/80' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div
                      style={{ height: `${Math.max(percent, 3)}%` }}
                      className={`w-full rounded-t-[1px] transition-all duration-300 ${
                        day.isToday
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : percent >= 75
                          ? isDark ? 'bg-white' : 'bg-slate-800'
                          : percent >= 40
                          ? isDark ? 'bg-neutral-400' : 'bg-slate-500'
                          : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                  <span className={`text-[9px] font-mono mt-1 ${
                    day.isToday 
                      ? 'text-emerald-500 font-bold' 
                      : isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}>
                    {day.dayNumber}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Benchmark Legend */}
      <div className={`flex items-center justify-between pt-2 border-t text-[10px] font-mono ${
        isDark ? 'border-neutral-800/80 text-neutral-400' : 'border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" />
            <span>High (&ge;80%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-xs inline-block ${isDark ? 'bg-white' : 'bg-slate-700'}`} />
            <span>Medium (&ge;50%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-xs inline-block ${isDark ? 'bg-neutral-600' : 'bg-slate-400'}`} />
            <span>Low (&lt;50%)</span>
          </span>
        </div>
        <span>{isDark ? 'Dark Theme' : 'Bright Theme'}</span>
      </div>
    </div>
  );
};
