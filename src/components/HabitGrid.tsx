import React from 'react';
import { Habit, DayInfo, WeekGroup, MonthHabitRecord, HabitAnalytics } from '../types/tracker';
import { useTheme } from '../context/ThemeContext';
import { Check, Plus, Edit2, Trash2, ListFilter, Clock } from 'lucide-react';
import { getHabitTimeRange, formatDeviceClock12h } from '../utils/timeWindow';

interface HabitGridProps {
  habits: Habit[];
  days: DayInfo[];
  weekGroups: WeekGroup[];
  records: MonthHabitRecord;
  analytics: HabitAnalytics[];
  currentTime: Date;
  year: number;
  month: number;
  onToggleDay: (habitId: string, dayNumber: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onOpenManageModal: () => void;
}

export const HabitGrid: React.FC<HabitGridProps> = ({
  habits,
  days,
  weekGroups,
  records,
  analytics,
  currentTime,
  onToggleDay,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteHabit,
  onOpenManageModal,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Map analytics by habitId for rapid lookup
  const analyticsMap = React.useMemo(() => {
    const map = new Map<string, HabitAnalytics>();
    analytics.forEach((a) => map.set(a.habitId, a));
    return map;
  }, [analytics]);

  return (
    <div
      className={`border rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#121214] border-neutral-800/80' : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}
    >
      {/* Grid Subheader / Action Bar */}
      <div
        className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'border-neutral-800 bg-[#151518]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-xs font-mono font-bold tracking-wider uppercase ${
              isDark ? 'text-neutral-300' : 'text-slate-800'
            }`}
          >
            SPREADSHEET TRACKING GRID
          </span>
          <span className={isDark ? 'text-neutral-600' : 'text-slate-300'}>|</span>
          <span className={`text-xs font-mono ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Click any day box to toggle completion
          </span>
          <span className={isDark ? 'text-neutral-600' : 'text-slate-300'}>|</span>
          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
            isDark ? 'bg-neutral-900 border-neutral-700/80 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Clock: {formatDeviceClock12h(currentTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenManageModal}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border font-semibold text-xs tracking-tight transition-all active:scale-[0.98] cursor-pointer ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700/80 text-neutral-200'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-2xs'
            }`}
          >
            <ListFilter className={`w-3.5 h-3.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`} />
            <span>Manage ({habits.length})</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-bold text-xs tracking-tight transition-all active:scale-[0.98] shadow-sm cursor-pointer ${
              isDark
                ? 'bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add New Habit</span>
          </button>
        </div>
      </div>

      {/* Main Table Container with horizontal and vertical scroll */}
      <div className="overflow-x-auto relative scrollbar-thin">
        <table className="w-full border-collapse text-left text-xs select-none">
          <thead>
            {/* ROW 1: WEEKS GROUPING & TOP SECTION HEADERS */}
            <tr
              className={`border-b text-[11px] font-mono uppercase tracking-wider ${
                isDark ? 'bg-[#18181c] border-neutral-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              {/* Sticky Header for Habit Names */}
              <th
                rowSpan={3}
                className={`sticky left-0 z-30 border-r border-b px-4 py-2.5 min-w-[240px] max-w-[280px] shadow-[2px_0_5px_rgba(0,0,0,0.1)] ${
                  isDark ? 'bg-[#161619] border-neutral-800 text-neutral-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-extrabold text-sm tracking-normal ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      MY HABITS
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-200 text-slate-700 font-bold'
                      }`}
                    >
                      {habits.length}
                    </span>
                  </div>
                </div>
                <div className={`text-[10px] font-mono normal-case tracking-normal ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}>
                  Color Tag &bull; Time Schedule (From – To)
                </div>
              </th>

              {/* Week Headers spanning their day counts */}
              {weekGroups.map((week) => (
                <th
                  key={week.weekNumber}
                  colSpan={week.colSpan}
                  className={`border-r border-b py-1.5 px-1 text-center font-bold ${
                    isDark
                      ? 'border-neutral-800 text-white bg-neutral-900/80'
                      : 'border-slate-200 text-slate-800 bg-slate-200/60'
                  }`}
                >
                  {week.weekLabel}
                </th>
              ))}

              {/* Analysis Header spanning Goal, Actual, Left, Progress, % */}
              <th
                colSpan={5}
                className={`py-1.5 px-3 text-center font-bold tracking-wider ${
                  isDark ? 'bg-neutral-900/90 text-white' : 'bg-slate-200/80 text-slate-800'
                }`}
              >
                PERFORMANCE ANALYTICS
              </th>
            </tr>

            {/* ROW 2: DAYS OF WEEK (Su, Mo, Tu, ...) & ANALYTICS TITLES */}
            <tr
              className={`border-b text-[10px] font-mono text-center ${
                isDark ? 'bg-[#141417] border-neutral-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {days.map((day) => (
                <th
                  key={`dow-${day.dayNumber}`}
                  className={`border-r py-1 px-1 min-w-[32px] w-[32px] ${
                    isDark ? 'border-neutral-800/80' : 'border-slate-200'
                  } ${
                    day.isToday
                      ? 'text-emerald-400 font-extrabold bg-emerald-500/10'
                      : day.isWeekend
                      ? isDark ? 'text-neutral-500 bg-neutral-900/40' : 'text-slate-400 bg-slate-100/40'
                      : isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}
                >
                  {day.dayOfWeek}
                </th>
              ))}

              {/* Analysis Columns */}
              <th className={`border-r py-1 px-2 font-bold w-12 text-center ${
                isDark ? 'border-neutral-800/80 text-neutral-300' : 'border-slate-200 text-slate-700'
              }`}>
                GOAL
              </th>
              <th className={`border-r py-1 px-2 font-bold w-12 text-center text-emerald-400 ${
                isDark ? 'border-neutral-800/80' : 'border-slate-200'
              }`}>
                ACTUAL
              </th>
              <th className={`border-r py-1 px-2 font-bold w-12 text-center ${
                isDark ? 'border-neutral-800/80 text-neutral-300' : 'border-slate-200 text-slate-700'
              }`}>
                LEFT
              </th>
              <th className={`border-r py-1 px-3 font-bold w-36 text-center ${
                isDark ? 'border-neutral-800/80 text-neutral-300' : 'border-slate-200 text-slate-700'
              }`}>
                PROGRESS
              </th>
              <th className={`py-1 px-2.5 font-bold w-14 text-right ${
                isDark ? 'text-neutral-300' : 'text-slate-700'
              }`}>
                %
              </th>
            </tr>

            {/* ROW 3: DAY NUMBERS (1, 2, 3... 31) */}
            <tr
              className={`border-b text-[11px] font-mono text-center ${
                isDark ? 'bg-[#121214] border-neutral-800' : 'bg-white border-slate-200'
              }`}
            >
              {days.map((day) => (
                <th
                  key={`num-${day.dayNumber}`}
                  className={`border-r py-1 px-1 font-bold ${
                    isDark ? 'border-neutral-800/80' : 'border-slate-200'
                  } ${
                    day.isToday
                      ? 'text-emerald-400 bg-emerald-500/20'
                      : isDark ? 'text-neutral-300' : 'text-slate-700'
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded ${
                      day.isToday
                        ? 'bg-emerald-500 text-black font-black shadow-xs ring-1 ring-emerald-300'
                        : ''
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                </th>
              ))}

              {/* Analysis Subtitles (days units) */}
              <th className={`border-r py-1 px-1 text-center text-[10px] font-mono ${
                isDark ? 'border-neutral-800/80 text-neutral-400' : 'border-slate-200 text-slate-400'
              }`}>
                days
              </th>
              <th className={`border-r py-1 px-1 text-center text-[10px] text-emerald-500 font-mono ${
                isDark ? 'border-neutral-800/80' : 'border-slate-200'
              }`}>
                days
              </th>
              <th className={`border-r py-1 px-1 text-center text-[10px] font-mono ${
                isDark ? 'border-neutral-800/80 text-neutral-400' : 'border-slate-200 text-slate-400'
              }`}>
                days
              </th>
              <th className={`border-r py-1 px-3 text-left text-[10px] font-mono ${
                isDark ? 'border-neutral-800/80 text-neutral-400' : 'border-slate-200 text-slate-400'
              }`}>
                0% &rarr; 100%
              </th>
              <th className={`py-1 px-2.5 text-right text-[10px] font-mono ${
                isDark ? 'text-neutral-400' : 'text-slate-400'
              }`}>
                rate
              </th>
            </tr>
          </thead>

          {/* TABLE BODY: HABIT ROWS */}
          <tbody className={`divide-y font-sans ${isDark ? 'divide-neutral-800/80' : 'divide-slate-200'}`}>
            {habits.map((habit) => {
              const habitLog = records[habit.id] || {};
              const habitStats = analyticsMap.get(habit.id) || {
                goal: days.length,
                actual: 0,
                left: days.length,
                percentage: 0,
                currentStreak: 0,
                longestStreak: 0,
              };

              const timeRange = getHabitTimeRange(habit);

              return (
                <tr
                  key={habit.id}
                  className={`transition-colors group ${
                    isDark ? 'hover:bg-neutral-900/60' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Left Column: Habit Color, Name, Time Range & Actions (Sticky) */}
                  <td
                    className={`sticky left-0 z-20 border-r p-2.5 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.1)] ${
                      isDark
                        ? 'bg-[#121214] group-hover:bg-[#18181c] border-neutral-800'
                        : 'bg-white group-hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      {/* Color Tag Badge */}
                      <button
                        type="button"
                        onClick={() => onOpenEditModal(habit)}
                        title="Click to edit task"
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: habit.color || '#10b981' }}
                      >
                        <span className="w-2 h-2 rounded-full bg-white/90 shadow-xs" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div
                          onClick={() => onOpenEditModal(habit)}
                          className="flex items-center gap-1.5 mb-0.5 cursor-pointer group/title"
                          title="Click to edit task details"
                        >
                          <span
                            className={`font-bold text-xs truncate transition-colors ${
                              isDark
                                ? 'text-white group-hover/title:text-emerald-400'
                                : 'text-slate-900 group-hover/title:text-emerald-600'
                            }`}
                          >
                            {habit.name}
                          </span>
                        </div>

                        {/* Metadata: Time Range (From – To) */}
                        {timeRange && (
                          <div
                            className={`flex items-center gap-1 text-[11px] font-mono leading-tight ${
                              isDark ? 'text-neutral-400' : 'text-slate-500'
                            }`}
                          >
                            <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="text-emerald-400/90 font-medium">{timeRange}</span>
                          </div>
                        )}
                      </div>

                      {/* Habit Row Quick Actions (Edit/Delete) */}
                      <div className="relative shrink-0 flex items-center gap-0.5">
                        <button
                          onClick={() => onOpenEditModal(habit)}
                          title="Edit Task"
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isDark
                              ? 'text-neutral-500 hover:text-white hover:bg-neutral-800'
                              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteHabit(habit.id)}
                          title="Delete Task"
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isDark
                              ? 'text-neutral-500 hover:text-rose-400 hover:bg-neutral-800'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-slate-200'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Day Cells (1..31): Simple, direct toggle! */}
                  {days.map((day) => {
                    const isChecked = !!habitLog[day.dayNumber];

                    return (
                      <td
                        key={`cell-${habit.id}-${day.dayNumber}`}
                        className={`border-r p-0 text-center relative ${
                          isDark ? 'border-neutral-800/70' : 'border-slate-200'
                        } ${
                          day.isToday
                            ? isDark
                              ? 'bg-emerald-950/15'
                              : 'bg-emerald-50/30'
                            : day.isWeekend
                            ? isDark
                              ? 'bg-neutral-900/30'
                              : 'bg-slate-50/50'
                            : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onToggleDay(habit.id, day.dayNumber)}
                          title={`${habit.name} on ${day.dayOfWeek}, Day ${day.dayNumber}: ${
                            isChecked ? 'Completed (Click to uncheck)' : 'Incomplete (Click to complete)'
                          }`}
                          className={`w-full h-10 flex items-center justify-center transition-all cursor-pointer group/btn ${
                            isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-slate-100'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center transition-all transform active:scale-90 ${
                              isChecked
                                ? 'bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.4)] scale-100 font-bold'
                                : isDark
                                ? 'bg-[#18181c] border border-neutral-700/80 text-transparent hover:border-neutral-400 scale-95'
                                : 'bg-slate-100 border border-slate-300 text-transparent hover:border-slate-400 scale-95'
                            }`}
                          >
                            <Check
                              className={`w-3.5 h-3.5 stroke-[3] transition-opacity ${
                                isChecked
                                  ? 'opacity-100 text-black'
                                  : isDark
                                  ? 'opacity-0 group-hover/btn:opacity-30 text-white'
                                  : 'opacity-0 group-hover/btn:opacity-30 text-slate-700'
                              }`}
                            />
                          </div>
                        </button>
                      </td>
                    );
                  })}

                  {/* Analysis Columns */}
                  {/* 1. Goal */}
                  <td
                    className={`border-r py-2 px-2 text-center font-mono text-xs font-semibold ${
                      isDark
                        ? 'border-neutral-800 text-neutral-400 bg-neutral-900/20'
                        : 'border-slate-200 text-slate-600 bg-slate-50/50'
                    }`}
                  >
                    {habitStats.goal}
                  </td>

                  {/* 2. Actual */}
                  <td
                    className={`border-r py-2 px-2 text-center font-mono font-bold text-xs ${
                      isDark
                        ? 'border-neutral-800 text-emerald-400 bg-emerald-950/10'
                        : 'border-slate-200 text-emerald-600 bg-emerald-50/40'
                    }`}
                  >
                    {habitStats.actual}
                  </td>

                  {/* 3. Left */}
                  <td
                    className={`border-r py-2 px-2 text-center font-mono text-xs ${
                      isDark
                        ? 'border-neutral-800 text-neutral-300 bg-neutral-900/20'
                        : 'border-slate-200 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    {habitStats.left}
                  </td>

                  {/* 4. Progress (Horizontal Progress Bar) */}
                  <td
                    className={`border-r py-2 px-3 align-middle ${
                      isDark ? 'border-neutral-800 bg-neutral-900/20' : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-full rounded-full h-2 overflow-hidden p-[1px] border ${
                        isDark ? 'bg-neutral-800 border-neutral-700/50' : 'bg-slate-200 border-slate-300'
                      }`}
                    >
                      <div
                        style={{ width: `${habitStats.percentage}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          habitStats.percentage >= 80
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                            : habitStats.percentage >= 50
                            ? isDark
                              ? 'bg-gradient-to-r from-neutral-300 to-white'
                              : 'bg-gradient-to-r from-slate-600 to-slate-800'
                            : habitStats.percentage > 0
                            ? isDark
                              ? 'bg-neutral-500'
                              : 'bg-slate-400'
                            : 'bg-transparent'
                        }`}
                      />
                    </div>
                  </td>

                  {/* 5. % (Percentage Text) */}
                  <td
                    className={`py-2 px-2.5 text-right font-mono font-bold text-xs ${
                      isDark ? 'bg-neutral-900/30' : 'bg-slate-50'
                    }`}
                  >
                    <span
                      className={`${
                        habitStats.percentage >= 80
                          ? 'text-emerald-500'
                          : habitStats.percentage >= 50
                          ? isDark
                            ? 'text-white'
                            : 'text-slate-900'
                          : isDark
                          ? 'text-neutral-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {habitStats.percentage}%
                    </span>
                  </td>
                </tr>
              );
            })}

            {habits.length === 0 && (
              <tr>
                <td
                  colSpan={days.length + 6}
                  className={`text-center py-12 font-mono text-xs ${
                    isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}
                >
                  <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    No habits configured
                  </p>
                  <p className={`mb-3 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                    Add a new task or habit with your chosen schedule (From – To) &amp; color tag.
                  </p>
                  <button
                    onClick={onOpenAddModal}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-md ${
                      isDark ? 'bg-emerald-400 text-neutral-950 font-black' : 'bg-slate-900 text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Create Your First Habit</span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
