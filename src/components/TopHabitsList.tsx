import React from 'react';
import { HabitAnalytics } from '../types/tracker';
import { useTheme } from '../context/ThemeContext';
import { Trophy, Flame, Sparkles, Clock } from 'lucide-react';
import { getHabitTimeRange } from '../utils/timeWindow';

interface TopHabitsListProps {
  analytics: HabitAnalytics[];
}

export const TopHabitsList: React.FC<TopHabitsListProps> = ({ analytics }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Sort habits by consistency percentage descending, then by actual completed count, then by streak
  const sortedHabits = [...analytics]
    .sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      if (b.actual !== a.actual) {
        return b.actual - a.actual;
      }
      return b.currentStreak - a.currentStreak;
    })
    .slice(0, 10);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-5 h-5 rounded flex items-center justify-center bg-amber-400 text-neutral-950 font-black text-[11px] shadow-[0_0_8px_rgba(251,191,36,0.4)]">
            1
          </span>
        );
      case 2:
        return (
          <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-300 text-slate-900 font-black text-[11px] shadow-xs">
            2
          </span>
        );
      case 3:
        return (
          <span className="w-5 h-5 rounded flex items-center justify-center bg-amber-700/80 text-amber-100 font-black text-[11px]">
            3
          </span>
        );
      default:
        return (
          <span className={`w-5 h-5 rounded flex items-center justify-center border font-mono text-[10px] font-bold ${
            isDark 
              ? 'bg-neutral-900 border-neutral-800 text-neutral-400' 
              : 'bg-slate-100 border-slate-300 text-slate-600'
          }`}>
            {rank}
          </span>
        );
    }
  };

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
                ? 'bg-neutral-900 border-neutral-800 text-amber-400' 
                : 'bg-amber-50 border-amber-200 text-amber-600'
            }`}>
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-[10px] font-mono tracking-widest uppercase font-semibold block ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}>
                LEADERBOARD
              </span>
              <h2 className="text-sm font-bold tracking-tight uppercase">
                Top 10 Most Consistent Habits
              </h2>
            </div>
          </div>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
            isDark 
              ? 'bg-neutral-900 border-neutral-800 text-emerald-400' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <Sparkles className="w-3 h-3" />
            Ranked by %
          </span>
        </div>
        <p className={`text-xs mb-3 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
          Habits with the highest execution frequency and active streaks this month.
        </p>
      </div>

      {/* List */}
      <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
        {sortedHabits.map((item, index) => {
          const rank = index + 1;

          return (
            <div
              key={item.habitId}
              className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                rank === 1
                  ? isDark
                    ? 'bg-neutral-900/90 border-neutral-700/80 hover:border-neutral-500'
                    : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                  : isDark
                  ? 'bg-[#0f0f12] border-neutral-800/80 hover:border-neutral-700'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Left: Rank & Habit Title */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="shrink-0">{getRankBadge(rank)}</div>
                <span 
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white/20" 
                  style={{ backgroundColor: item.habit.color || '#10b981' }} 
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.habit.name}
                    </span>
                    {item.currentStreak > 2 && (
                      <span className={`shrink-0 flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        isDark 
                          ? 'text-amber-400 bg-amber-950/40 border-amber-800/50' 
                          : 'text-amber-700 bg-amber-100 border-amber-200'
                      }`}>
                        <Flame className="w-3 h-3" />
                        {item.currentStreak}d
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] font-mono mt-0.5 flex-wrap ${
                    isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}>
                    <span>{item.actual} of {item.goal} days</span>
                    {getHabitTimeRange(item.habit) && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <Clock className="w-2.5 h-2.5" />
                          {getHabitTimeRange(item.habit)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Progress bar & percentage */}
              <div className="flex items-center gap-3 shrink-0">
                <div className={`w-16 rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full rounded-full ${
                      item.percentage >= 80
                        ? 'bg-emerald-500'
                        : item.percentage >= 50
                        ? isDark ? 'bg-white' : 'bg-slate-800'
                        : isDark ? 'bg-neutral-500' : 'bg-slate-400'
                    }`}
                  />
                </div>
                <div className="w-10 text-right">
                  <span
                    className={`font-mono font-extrabold text-xs ${
                      item.percentage >= 80
                        ? 'text-emerald-500'
                        : item.percentage >= 50
                        ? isDark ? 'text-white' : 'text-slate-900'
                        : isDark ? 'text-neutral-400' : 'text-slate-500'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {sortedHabits.length === 0 && (
          <div className={`text-center py-6 font-mono text-xs ${isDark ? 'text-neutral-400' : 'text-slate-400'}`}>
            No habits logged yet.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-3 border-t text-[10px] font-mono mt-3 ${
        isDark ? 'border-neutral-800/80 text-neutral-400' : 'border-slate-200 text-slate-500'
      }`}>
        <span>Consistency Target: 80%</span>
        <span className={isDark ? 'text-neutral-300' : 'text-slate-700 font-medium'}>
          {sortedHabits.filter((h) => h.percentage >= 80).length} habits in elite tier
        </span>
      </div>
    </div>
  );
};
