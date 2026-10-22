import React, { useState } from 'react';
import { Habit, DayInfo, WeekGroup, MonthHabitRecord, HabitAnalytics } from '../types/tracker';
import { useTheme } from '../context/ThemeContext';
import { 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Flame, 
  Clock, 
  Timer,
  ListFilter,
  AlertCircle,
  X as CloseIcon,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { getHabitScheduleDetails, getHabitDayStatus } from '../utils/timeWindow';

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
  year,
  month,
  onToggleDay,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteHabit,
  onOpenManageModal,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // For viewing expiration details or forcing a check-in if user missed
  const [expiredNotice, setExpiredNotice] = useState<{
    habit: Habit;
    dayNumber: number;
    schedule: ReturnType<typeof getHabitScheduleDetails>;
  } | null>(null);

  const [upcomingNotice, setUpcomingNotice] = useState<{
    habit: Habit;
    schedule: ReturnType<typeof getHabitScheduleDetails>;
  } | null>(null);

  // Map analytics by habitId for rapid lookup
  const analyticsMap = React.useMemo(() => {
    const map = new Map<string, HabitAnalytics>();
    analytics.forEach((a) => map.set(a.habitId, a));
    return map;
  }, [analytics]);

  const handleCellClick = (habit: Habit, day: DayInfo, isChecked: boolean) => {
    // Check status
    const dayStatus = getHabitDayStatus(habit, day.dayNumber, year, month, isChecked, currentTime);

    if (day.isToday) {
      if (dayStatus.status === 'in_window' || dayStatus.status === 'completed') {
        onToggleDay(habit.id, day.dayNumber);
      } else if (dayStatus.status === 'upcoming') {
        setUpcomingNotice({
          habit,
          schedule: getHabitScheduleDetails(habit),
        });
      } else if (dayStatus.status === 'expired') {
        setExpiredNotice({
          habit,
          dayNumber: day.dayNumber,
          schedule: getHabitScheduleDetails(habit),
        });
      }
    } else {
      // Past or future day
      onToggleDay(habit.id, day.dayNumber);
    }
  };

  return (
    <div className={`border rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200 ${
      isDark 
        ? 'bg-[#121214] border-neutral-800/80' 
        : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      {/* Grid Subheader / Action Bar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'border-neutral-800 bg-[#151518]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-xs font-mono font-bold tracking-wider uppercase ${
            isDark ? 'text-neutral-300' : 'text-slate-800'
          }`}>
            SPREADSHEET TRACKING GRID
          </span>
          <span className={isDark ? 'text-neutral-600' : 'text-slate-300'}>|</span>
          <span className={`text-xs font-mono ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            {habits.length} Habits &bull; Real-Time Grace Window Enforced
          </span>
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

      {/* Real-time Status Legend Bar */}
      <div className={`px-5 py-2 border-b text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 ${
        isDark ? 'bg-[#0f0f12] border-neutral-800 text-neutral-400' : 'bg-slate-100/70 border-slate-200 text-slate-600'
      }`}>
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Real-Time Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/30" />
            <span className="text-emerald-400 font-semibold">Active Tick Window (15m grace)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Upcoming / In-Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="text-rose-400">✕ Expired / Missed Window</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-400" />
            <span>✓ Completed</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-neutral-400">
          Live Clock: <strong className="text-neutral-200">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
        </div>
      </div>

      {/* Main Table Container with horizontal and vertical scroll */}
      <div className="overflow-x-auto relative scrollbar-thin">
        <table className="w-full border-collapse text-left text-xs select-none">
          <thead>
            {/* ROW 1: WEEKS GROUPING & TOP SECTION HEADERS */}
            <tr className={`border-b text-[11px] font-mono uppercase tracking-wider ${
              isDark 
                ? 'bg-[#0c0c0e] border-neutral-800 text-neutral-400' 
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              {/* Sticky Habits Column Header */}
              <th
                rowSpan={3}
                className={`sticky left-0 z-30 border-r border-b p-3 min-w-[260px] max-w-[280px] align-bottom shadow-[2px_0_5px_rgba(0,0,0,0.15)] ${
                  isDark ? 'bg-[#0d0d0f] border-neutral-800' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-extrabold text-sm tracking-normal ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      MY HABITS
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-200 text-slate-700 font-bold'
                    }`}>
                      {habits.length}
                    </span>
                  </div>
                </div>
                <div className={`text-[10px] font-mono normal-case tracking-normal ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}>
                  Avatar &bull; Schedule &bull; 15m Tick Window
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
                  <span className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] ${
                    isDark ? 'bg-neutral-800/80 text-white' : 'bg-white text-slate-800 shadow-2xs font-bold'
                  }`}>
                    {week.weekLabel}
                  </span>
                </th>
              ))}

              {/* Analysis Section Header spanning 5 columns */}
              <th
                colSpan={5}
                className={`border-b py-1.5 px-3 text-center font-bold tracking-wider ${
                  isDark 
                    ? 'border-neutral-800 text-white bg-neutral-900/90' 
                    : 'border-slate-200 text-slate-900 bg-slate-200/80'
                }`}
              >
                <span className="text-emerald-500 font-mono text-[11px] font-extrabold tracking-widest uppercase">
                  ANALYSIS &amp; METRICS
                </span>
              </th>
            </tr>

            {/* ROW 2: DAYS OF WEEK (Su, Mo, Tu, We, Th, Fr, Sa) & ANALYSIS COLUMNS */}
            <tr className={`border-b text-[11px] font-mono text-center ${
              isDark ? 'bg-[#111114] border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {days.map((day) => (
                <th
                  key={`dow-${day.dayNumber}`}
                  className={`border-r py-1 px-1 min-w-[34px] max-w-[36px] font-semibold ${
                    isDark ? 'border-neutral-800/80' : 'border-slate-200'
                  } ${
                    day.isToday
                      ? 'text-emerald-400 bg-emerald-500/15 font-bold ring-1 ring-emerald-500/30'
                      : day.isWeekend
                      ? isDark ? 'text-neutral-400 bg-neutral-900/40' : 'text-slate-400 bg-slate-100/50'
                      : isDark ? 'text-neutral-200' : 'text-slate-700'
                  }`}
                  title={`${day.fullDayName}, Day ${day.dayNumber}${day.isToday ? ' (TODAY)' : ''}`}
                >
                  {day.dayOfWeek}
                </th>
              ))}

              {/* Analysis Column Titles */}
              <th className={`border-r py-1.5 px-2 text-center min-w-[50px] font-bold ${
                isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-600'
              }`}>
                Goal
              </th>
              <th className={`border-r py-1.5 px-2 text-center text-emerald-500 min-w-[55px] font-bold ${
                isDark ? 'border-neutral-800' : 'border-slate-200'
              }`}>
                Actual
              </th>
              <th className={`border-r py-1.5 px-2 text-center min-w-[50px] font-bold ${
                isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-600'
              }`}>
                Left
              </th>
              <th className={`border-r py-1.5 px-3 text-left min-w-[130px] font-bold ${
                isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-600'
              }`}>
                Progress
              </th>
              <th className={`py-1.5 px-2.5 text-right min-w-[55px] font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                %
              </th>
            </tr>

            {/* ROW 3: DATE NUMBERS (1, 2, 3... 31) */}
            <tr className={`border-b-2 text-[11px] font-mono text-center ${
              isDark ? 'bg-[#141418] border-neutral-700' : 'bg-slate-100/90 border-slate-300'
            }`}>
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
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded ${
                    day.isToday 
                      ? 'bg-emerald-500 text-black font-black shadow-xs ring-1 ring-emerald-300' 
                      : ''
                  }`}>
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

              const schedule = getHabitScheduleDetails(habit);

              return (
                <tr
                  key={habit.id}
                  className={`transition-colors group ${
                    isDark ? 'hover:bg-neutral-900/60' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Left Column: Habit Avatar, Name, Schedule Window & Actions (Sticky) */}
                  <td className={`sticky left-0 z-20 border-r p-2.5 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.1)] ${
                    isDark 
                      ? 'bg-[#121214] group-hover:bg-[#18181c] border-neutral-800' 
                      : 'bg-white group-hover:bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between gap-2.5">
                      {/* Avatar Badge */}
                      <button
                        type="button"
                        onClick={() => onOpenEditModal(habit)}
                        title="Click to edit task"
                        className="text-xl w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-neutral-500/10 border border-neutral-500/20 hover:scale-105 transition-transform cursor-pointer"
                      >
                        {habit.avatar || '🎯'}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div 
                          onClick={() => onOpenEditModal(habit)}
                          className="flex items-center gap-1.5 mb-0.5 cursor-pointer group/title"
                          title="Click to edit task details"
                        >
                          <span className={`font-bold text-xs truncate transition-colors ${
                            isDark 
                              ? 'text-white group-hover/title:text-emerald-400' 
                              : 'text-slate-900 group-hover/title:text-emerald-600'
                          }`}>
                            {habit.name}
                          </span>
                        </div>

                        {/* Metadata: Schedule Time & Grace Window */}
                        <div className={`flex flex-col gap-0.5 text-[10px] font-mono leading-tight ${
                          isDark ? 'text-neutral-400' : 'text-slate-500'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                              <Clock className="w-2.5 h-2.5 text-neutral-400" />
                              {schedule.startTimeStr} &rarr; {schedule.endTimeStr}
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-0.5 text-neutral-300">
                              <Timer className="w-2.5 h-2.5 text-neutral-400" />
                              {habit.durationMinutes || 60}m
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-amber-400/90">
                            <span>Tick Window:</span>
                            <span className="font-semibold">{schedule.windowStr}</span>
                          </div>
                        </div>
                      </div>

                      {/* Habit Row Quick Actions (Edit/Delete) */}
                      <div className="relative shrink-0 flex items-center gap-0.5">
                        <button
                          onClick={() => onOpenEditModal(habit)}
                          title={`Edit ${habit.name}`}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isDark
                              ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteHabit(habit.id)}
                          title={`Delete ${habit.name}`}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isDark
                              ? 'text-neutral-400 hover:text-rose-400 hover:bg-rose-950/50'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Calendar Grid Cells: Real-time Check-In Status */}
                  {days.map((day) => {
                    const isChecked = !!habitLog[day.dayNumber];
                    const dayStatus = getHabitDayStatus(habit, day.dayNumber, year, month, isChecked, currentTime);

                    return (
                      <td
                        key={`cell-${habit.id}-${day.dayNumber}`}
                        className={`border-r p-0 text-center relative ${
                          isDark ? 'border-neutral-800/80' : 'border-slate-200'
                        } ${day.isToday ? (isDark ? 'bg-emerald-950/25 ring-1 ring-emerald-500/20' : 'bg-emerald-50/60 ring-1 ring-emerald-500/30') : ''}`}
                      >
                        {/* CELL CONTENT BASED ON REAL-TIME WINDOW */}
                        {day.isToday ? (
                          // TODAY: Active real-time window logic
                          <div className="w-full h-10 flex items-center justify-center p-0.5">
                            {isChecked ? (
                              // Completed on time!
                              <button
                                type="button"
                                onClick={() => handleCellClick(habit, day, isChecked)}
                                title="Completed! Click to toggle if needed."
                                className="w-6 h-6 rounded-md bg-emerald-500 text-black flex items-center justify-center font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-transform hover:scale-110 cursor-pointer"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>
                            ) : dayStatus.status === 'in_window' ? (
                              // ACTIVE CHECK-IN WINDOW RIGHT NOW! Pulsing & countdown
                              <button
                                type="button"
                                onClick={() => handleCellClick(habit, day, isChecked)}
                                title={`Check-in window open! ${dayStatus.sublabel}`}
                                className="w-full h-8 px-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold flex flex-col items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-pulse transition-transform hover:scale-105 cursor-pointer"
                              >
                                <span className="text-[9px] font-mono leading-none tracking-tight">TICK NOW</span>
                                <span className="text-[8px] font-mono opacity-90 leading-none mt-0.5">
                                  {dayStatus.minutesRemaining}m left
                                </span>
                              </button>
                            ) : dayStatus.status === 'upcoming' ? (
                              // UPCOMING / IN PROGRESS: Not yet finished
                              <button
                                type="button"
                                onClick={() => handleCellClick(habit, day, isChecked)}
                                title={`${dayStatus.label}: ${dayStatus.sublabel}. Check-in opens at ${schedule.endTimeStr}.`}
                                className={`w-5 h-5 rounded border flex items-center justify-center text-[10px] transition-colors cursor-pointer ${
                                  isDark
                                    ? 'bg-neutral-900/60 border-neutral-700/80 text-sky-400 hover:border-sky-400'
                                    : 'bg-sky-50 border-sky-300 text-sky-600 hover:border-sky-500'
                                }`}
                              >
                                <Clock className="w-3 h-3 text-sky-400" />
                              </button>
                            ) : (
                              // EXPIRED: Missed 15-minute window!
                              <button
                                type="button"
                                onClick={() => handleCellClick(habit, day, isChecked)}
                                title={`✕ Expired! Check-in window was ${schedule.windowStr}. Click for details.`}
                                className={`w-5 h-5 rounded border flex items-center justify-center text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                  isDark
                                    ? 'bg-rose-950/30 border-rose-900/50 text-rose-400/90 hover:bg-rose-900/40'
                                    : 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                                }`}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          // OTHER DAYS (Past or Future)
                          <button
                            type="button"
                            onClick={() => handleCellClick(habit, day, isChecked)}
                            title={`${habit.name} on ${day.dayOfWeek}, Day ${day.dayNumber}: ${
                              isChecked ? 'Completed' : 'Incomplete'
                            }`}
                            className={`w-full h-10 flex items-center justify-center transition-all cursor-pointer group/btn ${
                              isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-slate-100'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center transition-all transform active:scale-90 ${
                                isChecked
                                  ? isDark
                                    ? 'bg-white text-neutral-950 shadow-[0_0_8px_rgba(255,255,255,0.4)] scale-100 font-bold'
                                    : 'bg-emerald-600 text-white shadow-xs scale-100 font-bold'
                                  : isDark
                                  ? 'bg-[#18181c] border border-neutral-700/80 text-transparent hover:border-neutral-400 scale-95'
                                  : 'bg-slate-100 border border-slate-300 text-transparent hover:border-slate-400 scale-95'
                              }`}
                            >
                              <Check
                                className={`w-3.5 h-3.5 stroke-[3] transition-opacity ${
                                  isChecked
                                    ? isDark ? 'opacity-100 text-neutral-950' : 'opacity-100 text-white'
                                    : isDark
                                    ? 'opacity-0 group-hover/btn:opacity-30 text-white'
                                    : 'opacity-0 group-hover/btn:opacity-30 text-slate-700'
                                }`}
                              />
                            </div>
                          </button>
                        )}
                      </td>
                    );
                  })}

                  {/* Analysis Columns */}
                  {/* 1. Goal */}
                  <td className={`border-r py-2 px-2 text-center font-mono text-xs font-semibold ${
                    isDark ? 'border-neutral-800 text-neutral-400 bg-neutral-900/20' : 'border-slate-200 text-slate-600 bg-slate-50/50'
                  }`}>
                    {habitStats.goal}
                  </td>

                  {/* 2. Actual */}
                  <td className={`border-r py-2 px-2 text-center font-mono font-bold text-xs ${
                    isDark ? 'border-neutral-800 text-emerald-400 bg-emerald-950/10' : 'border-slate-200 text-emerald-600 bg-emerald-50/40'
                  }`}>
                    {habitStats.actual}
                  </td>

                  {/* 3. Left */}
                  <td className={`border-r py-2 px-2 text-center font-mono text-xs ${
                    isDark ? 'border-neutral-800 text-neutral-300 bg-neutral-900/20' : 'border-slate-200 text-slate-700 bg-slate-50/50'
                  }`}>
                    {habitStats.left}
                  </td>

                  {/* 4. Progress (Horizontal Progress Bar) */}
                  <td className={`border-r py-2 px-3 align-middle ${
                    isDark ? 'border-neutral-800 bg-neutral-900/20' : 'border-slate-200 bg-slate-50/50'
                  }`}>
                    <div className={`w-full rounded-full h-2 overflow-hidden p-[1px] border ${
                      isDark ? 'bg-neutral-800 border-neutral-700/50' : 'bg-slate-200 border-slate-300'
                    }`}>
                      <div
                        style={{ width: `${habitStats.percentage}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          habitStats.percentage >= 80
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                            : habitStats.percentage >= 50
                            ? isDark ? 'bg-gradient-to-r from-neutral-300 to-white' : 'bg-gradient-to-r from-slate-600 to-slate-800'
                            : habitStats.percentage > 0
                            ? isDark ? 'bg-neutral-500' : 'bg-slate-400'
                            : 'bg-transparent'
                        }`}
                      />
                    </div>
                  </td>

                  {/* 5. % (Percentage Text) */}
                  <td className={`py-2 px-2.5 text-right font-mono font-bold text-xs ${
                    isDark ? 'bg-neutral-900/30' : 'bg-slate-50'
                  }`}>
                    <span
                      className={`${
                        habitStats.percentage >= 80
                          ? 'text-emerald-500'
                          : habitStats.percentage >= 50
                          ? isDark ? 'text-white' : 'text-slate-900'
                          : isDark ? 'text-neutral-400' : 'text-slate-500'
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
                  className={`text-center py-12 font-mono text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
                >
                  <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No habits configured</p>
                  <p className={`mb-3 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Add a new task or habit with your chosen clock schedule &amp; avatar.</p>
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

      {/* EXPIRED WINDOW MODAL / NOTICE */}
      {expiredNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`border rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 ${
            isDark ? 'bg-[#141417] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <span>Check-In Window Expired</span>
              </div>
              <button
                onClick={() => setExpiredNotice(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-white cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className="text-xl">{expiredNotice.habit.avatar}</span>
                <span>{expiredNotice.habit.name}</span>
              </div>

              <div className="text-[11px] font-mono text-neutral-400 space-y-1 pt-1">
                <div>Scheduled: <strong className="text-white">{expiredNotice.schedule.startTimeStr} &rarr; {expiredNotice.schedule.endTimeStr}</strong></div>
                <div>Check-in Window was: <strong className="text-amber-400">{expiredNotice.schedule.windowStr}</strong> ({expiredNotice.habit.graceMinutes || 15}m grace period)</div>
                <div>Current Time: <strong className="text-rose-400">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
              The 15-minute grace window for ticking this task has passed. By default, it is locked as <strong>Undone / Expired</strong> for today to keep you accountable.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800 gap-2">
              <button
                onClick={() => {
                  onToggleDay(expiredNotice.habit.id, expiredNotice.dayNumber);
                  setExpiredNotice(null);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  isDark ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Override &amp; Force Tick
              </button>

              <button
                onClick={() => setExpiredNotice(null)}
                className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold cursor-pointer"
              >
                Keep Undone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPCOMING NOTICE MODAL */}
      {upcomingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`border rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 ${
            isDark ? 'bg-[#141417] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Clock className="w-5 h-5 text-sky-400" />
                <span>Task Not Yet Completed</span>
              </div>
              <button
                onClick={() => setUpcomingNotice(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-white cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className="text-xl">{upcomingNotice.habit.avatar}</span>
                <span>{upcomingNotice.habit.name}</span>
              </div>

              <div className="text-[11px] font-mono text-neutral-400 space-y-1 pt-1">
                <div>Scheduled: <strong className="text-white">{upcomingNotice.schedule.startTimeStr} &rarr; {upcomingNotice.schedule.endTimeStr}</strong></div>
                <div>Tick Window Opens: <strong className="text-emerald-400">{upcomingNotice.schedule.endTimeStr}</strong> (active for {upcomingNotice.habit.graceMinutes || 15} mins)</div>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
              This habit has not completed its scheduled duration yet. Come back between <strong>{upcomingNotice.schedule.windowStr}</strong> to tick it off!
            </p>

            <div className="flex justify-end pt-2 border-t border-neutral-800">
              <button
                onClick={() => setUpcomingNotice(null)}
                className="px-4 py-1.5 rounded-lg bg-white text-black font-bold text-xs cursor-pointer hover:bg-neutral-200"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
