import React, { useState, useEffect } from 'react';
import { Habit } from '../types/tracker';
import { useTheme } from '../context/ThemeContext';
import { X, Check, Clock, Timer, ShieldAlert, Trash2, ArrowRight, Bell, Palette } from 'lucide-react';
import { getHabitScheduleDetails } from '../utils/timeWindow';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (habitId: string) => void;
  initialHabit?: Habit | null;
}

const DURATION_PRESETS = [30, 45, 60, 90, 120, 180];
const GRACE_OPTIONS = [10, 15, 20, 30];

export const HABIT_COLOR_PALETTE = [
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Fuchsia', hex: '#d946ef' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Lime', hex: '#84cc16' },
];

const QUICK_SUGGESTIONS = [
  { name: 'Gym Workout', hour: 6, minute: 0, ampm: 'AM' as const, duration: 60, color: '#f97316' },
  { name: 'Morning Hydrate & Routine', hour: 6, minute: 30, ampm: 'AM' as const, duration: 30, color: '#06b6d4' },
  { name: 'Deep Work Session', hour: 9, minute: 0, ampm: 'AM' as const, duration: 90, color: '#6366f1' },
  { name: 'Reading & Learning', hour: 8, minute: 0, ampm: 'PM' as const, duration: 30, color: '#8b5cf6' },
  { name: 'Evening Meditation', hour: 9, minute: 30, ampm: 'PM' as const, duration: 30, color: '#10b981' },
];

const ALARM_PRESETS = [
  { label: '06:00 AM', hour: 6, minute: 0, ampm: 'AM' as const },
  { label: '07:00 AM', hour: 7, minute: 0, ampm: 'AM' as const },
  { label: '08:00 AM', hour: 8, minute: 0, ampm: 'AM' as const },
  { label: '09:00 AM', hour: 9, minute: 0, ampm: 'AM' as const },
  { label: '12:00 PM', hour: 12, minute: 0, ampm: 'PM' as const },
  { label: '05:00 PM', hour: 5, minute: 0, ampm: 'PM' as const },
  { label: '07:30 PM', hour: 7, minute: 30, ampm: 'PM' as const },
  { label: '09:00 PM', hour: 9, minute: 0, ampm: 'PM' as const },
];

// Helper to convert 12-hour values into 24-hour "HH:mm" for <input type="time">
function to24HourStr(hour12: number, minute: number, ampm: 'AM' | 'PM'): string {
  let h24 = hour12 % 12;
  if (ampm === 'PM') h24 += 12;
  const hStr = h24.toString().padStart(2, '0');
  const mStr = minute.toString().padStart(2, '0');
  return `${hStr}:${mStr}`;
}

// Helper to parse 24-hour "HH:mm" string back to 12-hour components
function from24HourStr(timeStr: string): { hour: number; minute: number; ampm: 'AM' | 'PM' } {
  if (!timeStr) return { hour: 6, minute: 0, ampm: 'AM' };
  const [hStr, mStr] = timeStr.split(':');
  const h24 = parseInt(hStr, 10) || 0;
  const minute = parseInt(mStr, 10) || 0;
  const ampm: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  let hour = h24 % 12;
  if (hour === 0) hour = 12;
  return { hour, minute, ampm };
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialHabit,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [name, setName] = useState('');
  const [startHour, setStartHour] = useState<number>(6);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [startAmPm, setStartAmPm] = useState<'AM' | 'PM'>('AM');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [graceMinutes, setGraceMinutes] = useState<number>(15);
  const [color, setColor] = useState<string>('#10b981');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name || '');
      setStartHour(initialHabit.startHour || 6);
      setStartMinute(initialHabit.startMinute || 0);
      setStartAmPm(initialHabit.startAmPm || 'AM');
      setDurationMinutes(initialHabit.durationMinutes || 60);
      setGraceMinutes(initialHabit.graceMinutes || 15);
      setColor(initialHabit.color || '#10b981');
    } else {
      setName('');
      setStartHour(6);
      setStartMinute(0);
      setStartAmPm('AM');
      setDurationMinutes(60);
      setGraceMinutes(15);
      setColor('#10b981');
    }
    setError('');
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  // Format temporary preview
  const previewHabit: Habit = {
    id: 'preview',
    name: name || 'Task Preview',
    time: '',
    duration: '',
    startHour,
    startMinute,
    startAmPm,
    durationMinutes,
    graceMinutes,
    color,
    createdAt: Date.now(),
  };

  const schedule = getHabitScheduleDetails(previewHabit);

  const handleDurationAdd30 = () => {
    setDurationMinutes((prev) => Math.min(prev + 30, 360));
  };

  const handleDurationSub30 = () => {
    setDurationMinutes((prev) => Math.max(prev - 30, 15));
  };

  const applySuggestion = (s: typeof QUICK_SUGGESTIONS[0]) => {
    setName(s.name);
    setStartHour(s.hour);
    setStartMinute(s.minute);
    setStartAmPm(s.ampm);
    setDurationMinutes(s.duration);
    setColor(s.color);
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const parsed = from24HourStr(e.target.value);
      setStartHour(parsed.hour);
      setStartMinute(parsed.minute);
      setStartAmPm(parsed.ampm);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this habit/task.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        time: schedule.startTimeStr,
        duration: `${durationMinutes} mins`,
        startHour,
        startMinute,
        startAmPm,
        durationMinutes,
        graceMinutes,
        color,
      },
      initialHabit?.id
    );
    onClose();
  };

  const handleDelete = () => {
    if (initialHabit && onDelete) {
      onDelete(initialHabit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          isDark
            ? 'bg-[#121214] border-neutral-800 text-neutral-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-neutral-800 bg-[#161619]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="w-6 h-6 rounded-full shrink-0 shadow-md border-2 border-white/30"
              style={{ backgroundColor: color }}
            />
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {initialHabit ? 'Edit Habit & Schedule' : 'New Habit / Task'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Set alarm time, duration, and color tag.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Quick Suggestions */}
          {!initialHabit && (
            <div>
              <label
                className={`text-[10px] font-mono uppercase font-semibold mb-1.5 block ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}
              >
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => applySuggestion(s)}
                    className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Habit Name */}
          <div className="space-y-1">
            <label
              className={`text-xs font-mono uppercase font-semibold ${
                isDark ? 'text-neutral-300' : 'text-slate-700'
              }`}
            >
              Habit / Task Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gym Workout, Reading, Cold Shower"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-colors border ${
                isDark
                  ? 'bg-[#17171a] border-neutral-700/80 text-white placeholder:text-neutral-600 focus:border-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-800'
              }`}
            />
          </div>

          {/* Color Selector */}
          <div className="space-y-1.5">
            <label
              className={`text-xs font-mono uppercase font-semibold flex items-center justify-between ${
                isDark ? 'text-neutral-300' : 'text-slate-700'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                Select Color Tag
              </span>
              <span className="text-[11px] font-normal text-neutral-400 font-sans flex items-center gap-1.5">
                Selected:
                <span
                  className="w-3.5 h-3.5 rounded-full inline-block border border-white/30"
                  style={{ backgroundColor: color }}
                />
              </span>
            </label>
            <div
              className={`p-3 rounded-xl border grid grid-cols-8 gap-2.5 ${
                isDark ? 'bg-[#161619] border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {HABIT_COLOR_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setColor(c.hex)}
                  className={`h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer relative shadow-sm ${
                    color === c.hex
                      ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black/50'
                      : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {color === c.hex && <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-md" />}
                </button>
              ))}
            </div>
          </div>

          {/* Alarm-Style Time Picker */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#161619] border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                className={`text-xs font-mono uppercase font-semibold flex items-center gap-1.5 ${
                  isDark ? 'text-neutral-200' : 'text-slate-800'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                Alarm / Start Time
              </label>

              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {schedule.startTimeStr}
              </span>
            </div>

            {/* Direct Alarm Time Input & AM/PM Switcher */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <input
                  type="time"
                  value={to24HourStr(startHour, startMinute, startAmPm)}
                  onChange={handleTimeInputChange}
                  className={`w-full text-xl font-mono font-bold tracking-wider px-3.5 py-2 rounded-xl border focus:outline-none transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#1a1a1f] border-neutral-700 text-white focus:border-emerald-400'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600 shadow-xs'
                  }`}
                />
              </div>

              {/* AM / PM Toggle */}
              <div className="flex items-center rounded-xl p-1 border border-neutral-700/80 bg-neutral-900/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setStartAmPm('AM')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    startAmPm === 'AM'
                      ? 'bg-emerald-500 text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setStartAmPm('PM')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    startAmPm === 'PM'
                      ? 'bg-emerald-500 text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Alarm Presets */}
            <div>
              <span
                className={`text-[10px] font-mono uppercase block mb-1.5 ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}
              >
                Quick Alarm Presets
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {ALARM_PRESETS.map((preset) => {
                  const isSelected =
                    startHour === preset.hour &&
                    startMinute === preset.minute &&
                    startAmPm === preset.ampm;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setStartHour(preset.hour);
                        setStartMinute(preset.minute);
                        setStartAmPm(preset.ampm);
                      }}
                      className={`py-1 px-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-xs'
                          : isDark
                          ? 'bg-neutral-800/80 border-neutral-700/60 text-neutral-300 hover:bg-neutral-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Duration Selector */}
          <div
            className={`p-3.5 rounded-xl border space-y-2.5 ${
              isDark ? 'bg-[#161619] border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                className={`text-xs font-mono uppercase font-semibold flex items-center gap-1.5 ${
                  isDark ? 'text-neutral-200' : 'text-slate-800'
                }`}
              >
                <Timer className="w-3.5 h-3.5 text-sky-400" />
                Duration: <span className="text-sky-400 font-bold">{durationMinutes} mins</span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDurationSub30}
                  className={`px-2 py-0.5 rounded text-xs font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  -30m
                </button>
                <button
                  type="button"
                  onClick={handleDurationAdd30}
                  className={`px-2 py-0.5 rounded text-xs font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  +30m
                </button>
              </div>
            </div>

            {/* Presets: 30, 45, 60, 90, 120, 180 */}
            <div className="grid grid-cols-6 gap-1.5">
              {DURATION_PRESETS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDurationMinutes(dur)}
                  className={`py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    durationMinutes === dur
                      ? 'bg-sky-500 text-black font-bold shadow-xs'
                      : isDark
                      ? 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {dur}m
                </button>
              ))}
            </div>
          </div>

          {/* Check-In Grace Window */}
          <div
            className={`p-3.5 rounded-xl border space-y-2.5 ${
              isDark ? 'bg-[#161619] border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                className={`text-xs font-mono uppercase font-semibold flex items-center gap-1.5 ${
                  isDark ? 'text-neutral-200' : 'text-slate-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Check-in Grace Period
              </label>

              <span className="text-xs font-mono font-bold text-amber-400">
                {graceMinutes} minutes
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {GRACE_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGraceMinutes(g)}
                  className={`py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    graceMinutes === g
                      ? 'bg-amber-400 text-black font-bold'
                      : isDark
                      ? 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {g} mins
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Breakdown Summary */}
          <div
            className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
              isDark
                ? 'bg-neutral-900/90 border-neutral-800 text-neutral-200'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <div className="text-[10px] font-mono uppercase font-bold text-neutral-400">
              Schedule Summary:
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="font-semibold text-emerald-400">{schedule.startTimeStr}</span>
              <ArrowRight className="w-3 h-3 text-neutral-500" />
              <span className="font-semibold text-sky-400">{schedule.endTimeStr}</span>
              <span className="text-neutral-500 text-[11px]">({durationMinutes}m duration)</span>
            </div>
            <div className="text-[11px] flex items-center gap-1.5 text-amber-300/90">
              <span>⏳ Check-in Window:</span>
              <span className="font-mono font-bold">{schedule.windowStr}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={`pt-3 border-t flex items-center justify-between ${
              isDark ? 'border-neutral-800' : 'border-slate-200'
            }`}
          >
            {initialHabit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-lg font-bold text-xs tracking-wide transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-neutral-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{initialHabit ? 'Update Habit' : 'Save Habit'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
