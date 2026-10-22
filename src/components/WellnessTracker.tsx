import React, { useState } from 'react';
import { DayInfo, MonthWellnessRecord, MoodType } from '../types/tracker';
import { useTheme } from '../context/ThemeContext';
import { Heart, Moon, Smile, Sparkles } from 'lucide-react';

interface WellnessTrackerProps {
  days: DayInfo[];
  wellness: MonthWellnessRecord;
  onUpdateDayWellness: (dayNumber: number, mood: MoodType, sleepHours: number | null) => void;
}

const MOOD_CONFIG: Record<
  MoodType,
  { label: string; icon: string; score: number }
> = {
  great: { label: 'Great', icon: '😄', score: 5 },
  energized: { label: 'Energized', icon: '⚡', score: 5 },
  good: { label: 'Good', icon: '🙂', score: 4 },
  neutral: { label: 'Neutral', icon: '😐', score: 3 },
  low: { label: 'Low', icon: '😔', score: 2 },
  '': { label: 'Unset', icon: '—', score: 0 },
};

const MOOD_CYCLE: MoodType[] = ['great', 'energized', 'good', 'neutral', 'low', ''];

export const WellnessTracker: React.FC<WellnessTrackerProps> = ({
  days,
  wellness,
  onUpdateDayWellness,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [editingSleepDay, setEditingSleepDay] = useState<number | null>(null);
  const [tempSleepVal, setTempSleepVal] = useState<string>('');

  // Calculate wellness aggregates
  const sleepValues = days
    .map((d) => wellness[d.dayNumber]?.sleepHours)
    .filter((val): val is number => typeof val === 'number' && val > 0);

  const avgSleep = sleepValues.length > 0
    ? (sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length).toFixed(1)
    : '0.0';

  const moodCounts = days.reduce<Record<string, number>>((acc, d) => {
    const m = wellness[d.dayNumber]?.mood;
    if (m) {
      acc[m] = (acc[m] || 0) + 1;
    }
    return acc;
  }, {});

  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodType | undefined;

  const handleCycleMood = (dayNumber: number) => {
    const current = wellness[dayNumber]?.mood || '';
    const currentIndex = MOOD_CYCLE.indexOf(current);
    const nextMood = MOOD_CYCLE[(currentIndex + 1) % MOOD_CYCLE.length];
    const sleep = wellness[dayNumber]?.sleepHours ?? null;
    onUpdateDayWellness(dayNumber, nextMood, sleep);
  };

  const handleSaveSleep = (dayNumber: number) => {
    const num = parseFloat(tempSleepVal);
    const mood = wellness[dayNumber]?.mood || '';
    onUpdateDayWellness(dayNumber, mood, isNaN(num) ? null : Math.min(24, Math.max(0, num)));
    setEditingSleepDay(null);
  };

  return (
    <div className={`border rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200 ${
      isDark 
        ? 'bg-[#121214] border-neutral-800/80' 
        : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      {/* Header */}
      <div className={`px-5 py-3 border-b flex items-center justify-between ${
        isDark ? 'border-neutral-800 bg-[#151518]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-6 h-6 rounded border flex items-center justify-center text-rose-500 ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-300'
          }`}>
            <Heart className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className={`text-[10px] font-mono tracking-widest uppercase font-semibold block leading-tight ${
              isDark ? 'text-neutral-400' : 'text-slate-500'
            }`}>
              HOLISTIC HEALTH
            </span>
            <h2 className={`text-xs font-bold tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Overall Wellness Tracker
            </h2>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Avg Sleep:</span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{avgSleep} hrs</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-amber-500" />
            <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Top Mood:</span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {topMood ? `${MOOD_CONFIG[topMood].icon} ${MOOD_CONFIG[topMood].label}` : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Wellness Grid - matching the spreadsheet columns */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse text-left text-xs select-none">
          <thead>
            <tr className={`border-b text-[10px] font-mono ${
              isDark ? 'bg-[#0e0e11] border-neutral-800 text-neutral-400' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              <th className={`sticky left-0 z-20 border-r p-2.5 min-w-[240px] max-w-[260px] shadow-[2px_0_5px_rgba(0,0,0,0.1)] ${
                isDark ? 'bg-[#0e0e11] border-neutral-800' : 'bg-slate-100 border-slate-200'
              }`}>
                WELLNESS METRIC
              </th>
              {days.map((day) => (
                <th
                  key={`wel-h-${day.dayNumber}`}
                  className={`border-r py-1 px-1 text-center min-w-[32px] max-w-[34px] ${
                    isDark ? 'border-neutral-800/80' : 'border-slate-200'
                  } ${
                    day.isToday ? 'text-emerald-500 bg-emerald-500/10 font-bold' : isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}
                >
                  <span className="block text-[9px]">{day.dayOfWeek}</span>
                  <span className="font-bold">{day.dayNumber}</span>
                </th>
              ))}
              <th colSpan={5} className={`py-1 px-3 text-center min-w-[340px] ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}>
                MONTHLY HEALTH INSIGHTS
              </th>
            </tr>
          </thead>

          <tbody className={`divide-y ${isDark ? 'divide-neutral-800/80' : 'divide-slate-200'}`}>
            {/* ROW 1: MOOD TRACKER */}
            <tr className={`transition-colors ${isDark ? 'hover:bg-neutral-900/40' : 'hover:bg-slate-50'}`}>
              <td className={`sticky left-0 z-20 border-r p-2.5 shadow-[2px_0_5px_rgba(0,0,0,0.1)] ${
                isDark ? 'bg-[#121214] border-neutral-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded border flex items-center justify-center text-amber-500 ${
                    isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <Smile className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className={`font-semibold text-xs block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Daily Mood
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                      Click day cell to cycle mood
                    </span>
                  </div>
                </div>
              </td>

              {days.map((day) => {
                const dayMood = wellness[day.dayNumber]?.mood || '';
                const moodConfig = MOOD_CONFIG[dayMood];

                return (
                  <td
                    key={`mood-${day.dayNumber}`}
                    className={`border-r p-0 text-center ${
                      isDark ? 'border-neutral-800/80' : 'border-slate-200'
                    } ${day.isToday ? (isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50') : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleCycleMood(day.dayNumber)}
                      title={`Day ${day.dayNumber}: ${moodConfig.label} (Click to change)`}
                      className={`w-full h-9 flex items-center justify-center transition-colors cursor-pointer text-sm ${
                        isDark ? 'hover:bg-neutral-800/60' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span className="transform active:scale-75 transition-transform">
                        {moodConfig.icon}
                      </span>
                    </button>
                  </td>
                );
              })}

              {/* Mood Summary on Right */}
              <td colSpan={5} className={`p-2.5 text-xs ${isDark ? 'bg-neutral-900/30' : 'bg-slate-50/60'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-mono ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Distribution:</span>
                  <div className="flex items-center gap-2 text-xs">
                    {(['great', 'energized', 'good', 'neutral', 'low'] as MoodType[]).map((m) => (
                      <span
                        key={m}
                        className={`px-2 py-0.5 rounded border text-[11px] font-mono flex items-center gap-1 ${
                          isDark 
                            ? 'bg-neutral-900 border-neutral-800 text-neutral-300' 
                            : 'bg-white border-slate-300 text-slate-700 shadow-2xs'
                        }`}
                      >
                        <span>{MOOD_CONFIG[m].icon}</span>
                        <span>{moodCounts[m] || 0}d</span>
                      </span>
                    ))}
                  </div>
                </div>
              </td>
            </tr>

            {/* ROW 2: HOURS OF SLEEP */}
            <tr className={`transition-colors ${isDark ? 'hover:bg-neutral-900/40' : 'hover:bg-slate-50'}`}>
              <td className={`sticky left-0 z-20 border-r p-2.5 shadow-[2px_0_5px_rgba(0,0,0,0.1)] ${
                isDark ? 'bg-[#121214] border-neutral-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded border flex items-center justify-center text-indigo-500 ${
                    isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className={`font-semibold text-xs block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Hours of Sleep
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                      Target: 7.0 &ndash; 8.5 hrs
                    </span>
                  </div>
                </div>
              </td>

              {days.map((day) => {
                const sleep = wellness[day.dayNumber]?.sleepHours;
                const isEditing = editingSleepDay === day.dayNumber;

                return (
                  <td
                    key={`sleep-${day.dayNumber}`}
                    className={`border-r p-0 text-center relative ${
                      isDark ? 'border-neutral-800/80' : 'border-slate-200'
                    } ${day.isToday ? (isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50') : ''}`}
                  >
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        autoFocus
                        value={tempSleepVal}
                        onChange={(e) => setTempSleepVal(e.target.value)}
                        onBlur={() => handleSaveSleep(day.dayNumber)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveSleep(day.dayNumber);
                          if (e.key === 'Escape') setEditingSleepDay(null);
                        }}
                        className={`w-full h-9 font-mono text-xs text-center border-2 border-indigo-500 focus:outline-none p-0 ${
                          isDark ? 'bg-neutral-950 text-white' : 'bg-white text-slate-900'
                        }`}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSleepDay(day.dayNumber);
                          setTempSleepVal(sleep != null ? String(sleep) : '7.5');
                        }}
                        title={`Day ${day.dayNumber}: ${sleep != null ? `${sleep} hrs` : 'Unset'} (Click to edit)`}
                        className={`w-full h-9 flex items-center justify-center font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                          sleep != null
                            ? sleep >= 7
                              ? isDark ? 'text-indigo-300 hover:bg-indigo-950/30' : 'text-indigo-600 hover:bg-indigo-50'
                              : isDark ? 'text-amber-400 hover:bg-amber-950/30' : 'text-amber-600 hover:bg-amber-50'
                            : isDark ? 'text-neutral-600 hover:bg-neutral-800/50' : 'text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {sleep != null ? `${sleep}h` : '—'}
                      </button>
                    )}
                  </td>
                );
              })}

              {/* Sleep Summary on Right */}
              <td colSpan={5} className={`p-2.5 text-xs font-mono ${isDark ? 'bg-neutral-900/30' : 'bg-slate-50/60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Monthly Average:</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{avgSleep} hrs / night</span>
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {parseFloat(avgSleep) >= 7.5 ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Optimal Recovery
                      </span>
                    ) : (
                      <span className="text-amber-500 font-semibold">
                        Needs Rest Focus (&lt;7.5h)
                      </span>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
