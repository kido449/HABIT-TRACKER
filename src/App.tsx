/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Habit, DayInfo, WeekGroup, MonthHabitRecord, MonthWellnessRecord, HabitAnalytics, MoodType } from './types/tracker';
import { getMonthDays, getWeekGroups, calculateStreaks, MONTH_NAMES } from './utils/calendar';
import { useTheme } from './context/ThemeContext';
import { usePWAInstall } from './hooks/usePWAInstall';
import { 
  loadHabits, 
  saveHabits, 
  loadMonthRecords, 
  saveMonthRecords, 
  loadMonthWellness, 
  saveMonthWellness,
  exportAllData,
  importAllData,
  clearAllData,
  DEFAULT_HABITS
} from './utils/storage';
import { HeaderPanel } from './components/HeaderPanel';
import { DailyProgressBarChart } from './components/DailyProgressBarChart';
import { OverallStatsDonut } from './components/OverallStatsDonut';
import { HabitGrid } from './components/HabitGrid';
import { WellnessTracker } from './components/WellnessTracker';
import { TopHabitsList } from './components/TopHabitsList';
import { AddHabitModal } from './components/AddHabitModal';
import { ManageTasksModal } from './components/ManageTasksModal';
import { ConfirmModal } from './components/ConfirmModal';
import { InstallAppModal } from './components/InstallAppModal';
import { ShieldCheck, CheckCircle2, Sun, Moon, Download, Smartphone, Clock, Plus } from 'lucide-react';
import { formatDeviceClock12h } from './utils/timeWindow';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { isInstallable, install } = usePWAInstall();

  // Live ticking clock state for real-time check-in window and countdowns
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Current calendar selection (defaults to current year and month)
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());

  // Habits list
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());

  // Habit completion records for the selected month: { [habitId]: { [day]: boolean } }
  const [records, setRecords] = useState<MonthHabitRecord>(() => 
    loadMonthRecords(selectedYear, selectedMonth, habits)
  );

  // Wellness records for the selected month: { [day]: { mood, sleepHours } }
  const [wellness, setWellness] = useState<MonthWellnessRecord>(() => 
    loadMonthWellness(selectedYear, selectedMonth)
  );

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // In-app Confirm Modal State (Never use window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    isDestructive: true,
    onConfirm: () => {},
  });

  // Undo buffer for deleted habit
  const lastDeletedRef = useRef<{ habit: Habit; records: MonthHabitRecord } | null>(null);

  // Toast notification state with optional action
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  const showToast = useCallback((message: string, actionLabel?: string, onAction?: () => void) => {
    const id = Date.now();
    setToast({ id, message, actionLabel, onAction });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  }, []);

  // When selected Year or Month changes, load corresponding records from persistent storage
  useEffect(() => {
    const loadedRecords = loadMonthRecords(selectedYear, selectedMonth, habits);
    const loadedWellness = loadMonthWellness(selectedYear, selectedMonth);
    setRecords(loadedRecords);
    setWellness(loadedWellness);
  }, [selectedYear, selectedMonth, habits]);

  // Calendar days and week grouping for the selected Year & Month
  const days: DayInfo[] = useMemo(() => {
    return getMonthDays(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const weekGroups: WeekGroup[] = useMemo(() => {
    return getWeekGroups(days);
  }, [days]);

  // Toggle habit completion on a specific day
  const handleToggleDay = useCallback((habitId: string, dayNumber: number) => {
    setRecords((prev) => {
      const habitLog = { ...(prev[habitId] || {}) };
      const currentlyChecked = !!habitLog[dayNumber];
      
      if (currentlyChecked) {
        delete habitLog[dayNumber];
      } else {
        habitLog[dayNumber] = true;
      }

      const updated = {
        ...prev,
        [habitId]: habitLog,
      };

      // Persist immediately to storage
      saveMonthRecords(selectedYear, selectedMonth, updated);

      const habit = habits.find((h) => h.id === habitId);
      if (!currentlyChecked) {
        showToast(`Checked in: ✓ ${habit?.name || 'Habit'} (Day ${dayNumber})`);

        const allCompleted = habits.length > 0 && habits.every((h) => {
          if (h.id === habitId) return true;
          return !!prev[h.id]?.[dayNumber];
        });

        if (allCompleted) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10b981', '#ffffff', '#38bdf8', '#fbbf24'],
          });
        }
      } else {
        showToast(`Unchecked: ${habit?.name || 'Habit'} (Day ${dayNumber})`);
      }

      return updated;
    });
  }, [habits, selectedYear, selectedMonth, showToast]);

  // Save new or edited habit
  const handleSaveHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      // Edit existing
      setHabits((prev) => {
        const updated = prev.map((h) => 
          h.id === existingId ? { ...h, ...habitData } : h
        );
        saveHabits(updated);
        return updated;
      });
      showToast(`Updated "${habitData.name}"`);
    } else {
      // Add new
      const newHabit: Habit = {
        id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ...habitData,
        createdAt: Date.now(),
      };
      setHabits((prev) => {
        const updated = [...prev, newHabit];
        saveHabits(updated);
        return updated;
      });
      showToast(`Added new habit "${habitData.name}"`);
    }
  }, [showToast]);

  // Reorder habits
  const handleReorderHabits = useCallback((reordered: Habit[]) => {
    setHabits(reordered);
    saveHabits(reordered);
  }, []);

  // Execute deletion of a habit
  const executeDeleteHabit = useCallback((habitId: string) => {
    const habitToDelete = habits.find((h) => h.id === habitId);
    if (!habitToDelete) return;

    // Cache for undo
    lastDeletedRef.current = {
      habit: habitToDelete,
      records: { ...records },
    };

    setHabits((prev) => {
      const updated = prev.filter((h) => h.id !== habitId);
      saveHabits(updated);
      return updated;
    });

    setRecords((prev) => {
      const next = { ...prev };
      delete next[habitId];
      saveMonthRecords(selectedYear, selectedMonth, next);
      return next;
    });

    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    // Show toast with Undo action
    showToast(
      `Deleted "${habitToDelete.name}"`,
      'Undo',
      () => {
        if (lastDeletedRef.current) {
          const { habit: restoredHabit, records: restoredRecords } = lastDeletedRef.current;
          setHabits((prev) => {
            const nextHabits = [...prev, restoredHabit];
            saveHabits(nextHabits);
            return nextHabits;
          });
          setRecords(restoredRecords);
          saveMonthRecords(selectedYear, selectedMonth, restoredRecords);
          lastDeletedRef.current = null;
          showToast(`Restored "${restoredHabit.name}"`);
        }
      }
    );
  }, [habits, records, selectedYear, selectedMonth, showToast]);

  // Request deletion with in-app confirmation modal
  const handleDeleteHabit = useCallback((habitId: string) => {
    const habitToDelete = habits.find((h) => h.id === habitId);
    if (!habitToDelete) return;

    setConfirmModal({
      isOpen: true,
      title: 'Delete Habit?',
      message: `Are you sure you want to delete "${habitToDelete.name}"? This will remove it from your spreadsheet. You will also have an instant Undo option.`,
      confirmLabel: 'Delete Habit',
      isDestructive: true,
      onConfirm: () => executeDeleteHabit(habitId),
    });
  }, [habits, executeDeleteHabit]);

  // Clear checkmarks for a specific habit
  const handleClearHabitChecks = useCallback((habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    setConfirmModal({
      isOpen: true,
      title: 'Clear Checked Days?',
      message: `Reset all checkmarks for "${habit?.name || 'this habit'}" in ${MONTH_NAMES[selectedMonth]} ${selectedYear}?`,
      confirmLabel: 'Clear All Checks',
      isDestructive: false,
      onConfirm: () => {
        setRecords((prev) => {
          const next = {
            ...prev,
            [habitId]: {},
          };
          saveMonthRecords(selectedYear, selectedMonth, next);
          return next;
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`Cleared checkmarks for "${habit?.name}"`);
      },
    });
  }, [habits, selectedYear, selectedMonth, showToast]);

  // Update wellness record
  const handleUpdateWellness = useCallback((dayNumber: number, mood: MoodType, sleepHours: number | null) => {
    setWellness((prev) => {
      const updated = {
        ...prev,
        [dayNumber]: {
          mood,
          sleepHours,
        },
      };
      saveMonthWellness(selectedYear, selectedMonth, updated);
      return updated;
    });
  }, [selectedYear, selectedMonth]);

  // Clear all data to an empty app
  const handleResetData = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear All Habits & Data?',
      message: `This will remove all habits and tracking records, giving you a completely empty habit ledger to add your own tasks.`,
      confirmLabel: 'Clear Everything',
      isDestructive: true,
      onConfirm: () => {
        clearAllData();
        setHabits([]);
        setRecords({});
        setWellness({});
        saveHabits([]);
        saveMonthRecords(selectedYear, selectedMonth, {});
        saveMonthWellness(selectedYear, selectedMonth, {});
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast('All habits and data cleared. Clean slate ready!');
      },
    });
  }, [selectedYear, selectedMonth, showToast]);

  // Backup & restore
  const handleExport = useCallback(() => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${selectedYear}-${selectedMonth + 1}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup JSON exported successfully.');
  }, [selectedYear, selectedMonth, showToast]);

  const handleImport = useCallback((content: string) => {
    const success = importAllData(content);
    if (success) {
      setHabits(loadHabits());
      setRecords(loadMonthRecords(selectedYear, selectedMonth, loadHabits()));
      setWellness(loadMonthWellness(selectedYear, selectedMonth));
      showToast('Backup restored successfully!');
    } else {
      showToast('Error: Invalid backup JSON format.');
    }
  }, [selectedYear, selectedMonth, showToast]);

  // REAL-TIME ANALYTICS CALCULATIONS
  // 1. Habit-level analytics (Goal, Actual, Left, %, Streaks)
  const habitAnalytics: HabitAnalytics[] = useMemo(() => {
    const totalDaysInMonth = days.length;

    return habits.map((habit) => {
      const habitLog = records[habit.id] || {};
      const completedDays = Object.keys(habitLog).filter((d) => habitLog[Number(d)]).length;
      const leftDays = Math.max(0, totalDaysInMonth - completedDays);
      const percentage = totalDaysInMonth > 0 ? Math.round((completedDays / totalDaysInMonth) * 100) : 0;
      const { currentStreak, longestStreak } = calculateStreaks(habitLog, totalDaysInMonth);

      return {
        habitId: habit.id,
        habit,
        goal: totalDaysInMonth,
        actual: completedDays,
        left: leftDays,
        percentage,
        currentStreak,
        longestStreak,
      };
    });
  }, [habits, days, records]);

  // 2. Overall Month KPI calculations
  const totalGoal = useMemo(() => habits.length * days.length, [habits.length, days.length]);
  
  const totalCompleted = useMemo(() => {
    return habitAnalytics.reduce((acc, curr) => acc + curr.actual, 0);
  }, [habitAnalytics]);

  const totalLeft = useMemo(() => Math.max(0, totalGoal - totalCompleted), [totalGoal, totalCompleted]);

  const overallPercentage = useMemo(() => {
    if (totalGoal === 0) return 0;
    return Math.round((totalCompleted / totalGoal) * 100);
  }, [totalGoal, totalCompleted]);

  // 3. Daily Completion Percentages & Grouped by Day of Week
  const dailyPercentages: { [dayNumber: number]: number } = useMemo(() => {
    const result: { [dayNumber: number]: number } = {};
    if (habits.length === 0) return result;

    days.forEach((day) => {
      let completedOnDay = 0;
      habits.forEach((h) => {
        if (records[h.id]?.[day.dayNumber]) {
          completedOnDay++;
        }
      });
      result[day.dayNumber] = Math.round((completedOnDay / habits.length) * 100);
    });

    return result;
  }, [days, habits, records]);

  const dayOfWeekAverages = useMemo(() => {
    const stats: { [dow: string]: { sumPercent: number; count: number; completedCount: number; totalPossible: number } } = {
      Su: { sumPercent: 0, count: 0, completedCount: 0, totalPossible: 0 },
      Mo: { sumPercent: 0, count: 0, completedCount: 0, totalPossible: 0 },
      Tu: { sumPercent: 0, count: 0, completedCount: 0, totalPossible: 0 },
      We: { sumPercent: 0, count: 0, completedCount: 0, totalPossible: 0 },
      Th: { sumPercent: 0, count: 0, completedCount: 0, totalPossible: 0 },
      Fr: { sumPercent: 0, count: 0, completedCount: 0, totalPossible: 0 },
      Sa: { sumPercent: 0, count: 0, completedCount: 0, totalPossible: 0 },
    };

    days.forEach((day) => {
      const p = dailyPercentages[day.dayNumber] || 0;
      if (stats[day.dayOfWeek]) {
        stats[day.dayOfWeek].sumPercent += p;
        stats[day.dayOfWeek].count += 1;
        stats[day.dayOfWeek].totalPossible += habits.length;

        habits.forEach((h) => {
          if (records[h.id]?.[day.dayNumber]) {
            stats[day.dayOfWeek].completedCount += 1;
          }
        });
      }
    });

    const averages: { [dow: string]: { avg: number; count: number; completedCount: number; totalPossible: number } } = {};
    Object.entries(stats).forEach(([dow, item]) => {
      averages[dow] = {
        avg: item.count > 0 ? item.sumPercent / item.count : 0,
        count: item.count,
        completedCount: item.completedCount,
        totalPossible: item.totalPossible,
      };
    });

    return averages;
  }, [days, dailyPercentages, habits, records]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark 
        ? 'bg-[#09090b] text-neutral-100 selection:bg-neutral-800 selection:text-white' 
        : 'bg-[#f4f5f8] text-slate-900 selection:bg-slate-300 selection:text-slate-900'
    }`}>
      {/* Toast Notification with Undo Action */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 border text-xs font-mono py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 ${
          isDark 
            ? 'bg-neutral-900 border-neutral-700 text-white' 
            : 'bg-white border-slate-300 text-slate-900'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toast.message}</span>
          {toast.actionLabel && toast.onAction && (
            <button
              onClick={toast.onAction}
              className="ml-2 px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] uppercase tracking-wide cursor-pointer transition-colors shadow-xs"
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}

      {/* Prominent Live Device Clock & Top Dashboard Bar */}
      <header className={`border-b px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md transition-colors ${
        isDark ? 'bg-[#09090b]/90 border-neutral-800' : 'bg-white/90 border-slate-200 shadow-2xs'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
          <span className="font-extrabold text-sm tracking-tight flex items-center gap-2">
            <span>HaBity</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase font-bold ${
              isDark ? 'border-neutral-700 bg-neutral-800/80 text-neutral-300' : 'border-slate-300 bg-slate-100 text-slate-700'
            }`}>
              Live Tracker OS
            </span>
          </span>
        </div>

        {/* Live Device Clock: Strictly 12-hour format with AM/PM (e.g., "01:15 PM") */}
        <div className="flex items-center gap-3">
          <div
            title="Real-time device clock (12-hour format)"
            className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2.5 shadow-sm font-mono transition-all ${
              isDark 
                ? 'bg-[#121215] border-emerald-500/30 text-white' 
                : 'bg-emerald-50/70 border-emerald-200 text-slate-900 shadow-2xs'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: '60s' }} />
            <div className="flex items-baseline gap-1.5">
              <span className={`text-[11px] font-sans font-medium hidden sm:inline ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}>
                Live Clock:
              </span>
              <span className="text-sm md:text-base font-extrabold tracking-tight text-emerald-500">
                {formatDeviceClock12h(currentTime)}
              </span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <button
            onClick={() => {
              setEditingHabit(null);
              setIsModalOpen(true);
            }}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl font-bold text-xs tracking-tight transition-all active:scale-[0.98] shadow-sm cursor-pointer ${
              isDark
                ? 'bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* SECTION 1: TOP 3 PANELS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* Top Left Panel (Calendar Settings) - 4 cols */}
          <div className="lg:col-span-4 h-full">
            <HeaderPanel
              year={selectedYear}
              month={selectedMonth}
              currentTime={currentTime}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
              onOpenAddModal={() => {
                setEditingHabit(null);
                setIsModalOpen(true);
              }}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              onResetData={handleResetData}
              onExport={handleExport}
              onImport={handleImport}
            />
          </div>

          {/* Top Middle Panel (Daily Progress Bar Chart) - 4 cols */}
          <div className="lg:col-span-4 h-full">
            <DailyProgressBarChart
              days={days}
              dailyPercentages={dailyPercentages}
              dayOfWeekAverages={dayOfWeekAverages}
            />
          </div>

          {/* Top Right Panel (Overall Stats & Donut Chart) - 4 cols */}
          <div className="lg:col-span-4 h-full">
            <OverallStatsDonut
              goal={totalGoal}
              completed={totalCompleted}
              left={totalLeft}
              percentage={overallPercentage}
              totalHabitsCount={habits.length}
              daysCount={days.length}
            />
          </div>
        </section>

        {/* SECTION 2: MAIN HABIT TRACKING GRID & ANALYSIS TABLE */}
        <section>
          <HabitGrid
            habits={habits}
            days={days}
            weekGroups={weekGroups}
            records={records}
            analytics={habitAnalytics}
            currentTime={currentTime}
            year={selectedYear}
            month={selectedMonth}
            onToggleDay={handleToggleDay}
            onOpenAddModal={() => {
              setEditingHabit(null);
              setIsModalOpen(true);
            }}
            onOpenEditModal={(habit) => {
              setEditingHabit(habit);
              setIsModalOpen(true);
            }}
            onDeleteHabit={handleDeleteHabit}
            onOpenManageModal={() => setIsManageModalOpen(true)}
          />
        </section>

        {/* SECTION 3 & 4: OVERALL WELLNESS & TOP 10 HABITS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Bottom Left / Center: Overall Wellness Tracker - 8 cols */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <WellnessTracker
              days={days}
              wellness={wellness}
              onUpdateDayWellness={handleUpdateWellness}
            />
          </div>

          {/* Bottom Right: Top 10 Habits Leaderboard - 4 cols */}
          <div className="lg:col-span-4">
            <TopHabitsList analytics={habitAnalytics} />
          </div>
        </section>

        {/* Footer info bar with Download App & Theme Switcher */}
        <footer className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono gap-3 transition-colors ${
          isDark ? 'border-neutral-900 text-neutral-400' : 'border-slate-200 text-slate-500'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>HaBity &bull; Spreadsheet OS</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold font-sans transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40 text-emerald-400' 
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800 shadow-2xs'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Download / Install App</span>
            </button>

            <span>&bull;</span>

            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-sans transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white' 
                  : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs'
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{isDark ? 'Bright Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </footer>
      </main>

      {/* Add / Edit Habit Modal */}
      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
        initialHabit={editingHabit}
      />

      {/* Manage Tasks & Habits Modal */}
      <ManageTasksModal
        isOpen={isManageModalOpen}
        habits={habits}
        onClose={() => setIsManageModalOpen(false)}
        onEditHabit={(habit) => {
          setEditingHabit(habit);
          setIsModalOpen(true);
        }}
        onDeleteHabit={handleDeleteHabit}
        onReorderHabits={handleReorderHabits}
        onClearHabitChecks={handleClearHabitChecks}
        onOpenAddNew={() => {
          setEditingHabit(null);
          setIsModalOpen(true);
        }}
      />

      {/* Download & Install PWA App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* In-app Confirm Modal (replaces browser confirm) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
