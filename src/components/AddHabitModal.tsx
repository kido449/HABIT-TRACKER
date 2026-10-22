import React, { useState, useEffect, useMemo } from 'react';
import { Habit } from '../types/tracker';
import { useTheme } from '../context/ThemeContext';
import { X, Check, Clock, Trash2, ArrowRight, Palette, Timer, Sparkles } from 'lucide-react';
import { calculateScheduleFromDuration, parse12HourTime } from '../utils/timeWindow';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (habitId: string) => void;
  initialHabit?: Habit | null;
}

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

const DURATION_PRESETS = [
  { label: '15m', value: 15, unit: 'minutes' as const },
  { label: '30m', value: 30, unit: 'minutes' as const },
  { label: '45m', value: 45, unit: 'minutes' as const },
  { label: '1 hour', value: 1, unit: 'hours' as const },
  { label: '1.5 hrs', value: 1.5, unit: 'hours' as const },
  { label: '2 hours', value: 2, unit: 'hours' as const },
];

const TEMPLATE_SUGGESTIONS = [
  { name: 'Morning Workout', hour: 6, minute: 30, ampm: 'AM' as const, duration: 45, unit: 'minutes' as const, color: '#f97316' },
  { name: 'Deep Work Session', hour: 9, minute: 0, ampm: 'AM' as const, duration: 1.5, unit: 'hours' as const, color: '#6366f1' },
  { name: 'Afternoon Focus', hour: 2, minute: 0, ampm: 'PM' as const, duration: 1.5, unit: 'hours' as const, color: '#3b82f6' },
  { name: 'Evening Reading', hour: 8, minute: 0, ampm: 'PM' as const, duration: 45, unit: 'minutes' as const, color: '#8b5cf6' },
  { name: 'Night Reflection', hour: 10, minute: 15, ampm: 'PM' as const, duration: 30, unit: 'minutes' as const, color: '#10b981' },
];

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES_PRESETS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

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
  const [startHour, setStartHour] = useState<number>(2);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [startAmPm, setStartAmPm] = useState<'AM' | 'PM'>('PM');
  const [durationValue, setDurationValue] = useState<number>(1.5);
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('hours');
  const [color, setColor] = useState('#10b981');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name || '');
      setColor(initialHabit.color || '#10b981');

      if (initialHabit.startTime) {
        const parsed = parse12HourTime(initialHabit.startTime);
        setStartHour(parsed.hour12);
        setStartMinute(parsed.minute);
        setStartAmPm(parsed.ampm);
      } else if (initialHabit.startHour !== undefined) {
        setStartHour(initialHabit.startHour % 12 === 0 ? 12 : initialHabit.startHour % 12);
        setStartMinute(initialHabit.startMinute || 0);
        setStartAmPm(initialHabit.startAmPm || 'AM');
      } else {
        setStartHour(2);
        setStartMinute(0);
        setStartAmPm('PM');
      }

      if (initialHabit.durationMinutes) {
        if (initialHabit.durationMinutes % 60 === 0) {
          setDurationValue(initialHabit.durationMinutes / 60);
          setDurationUnit('hours');
        } else if (initialHabit.durationMinutes % 30 === 0 && initialHabit.durationMinutes > 60) {
          setDurationValue(initialHabit.durationMinutes / 60);
          setDurationUnit('hours');
        } else {
          setDurationValue(initialHabit.durationMinutes);
          setDurationUnit('minutes');
        }
      } else {
        setDurationValue(1.5);
        setDurationUnit('hours');
      }
    } else {
      setName('');
      setStartHour(2);
      setStartMinute(0);
      setStartAmPm('PM');
      setDurationValue(1.5);
      setDurationUnit('hours');
      setColor('#10b981');
    }
    setError('');
  }, [initialHabit, isOpen]);

  // Total duration in minutes
  const totalDurationMinutes = useMemo(() => {
    const val = Number(durationValue) || 0;
    if (durationUnit === 'hours') {
      return Math.max(1, Math.round(val * 60));
    }
    return Math.max(1, Math.round(val));
  }, [durationValue, durationUnit]);

  // Strict 12-hour calculated schedule with rollover handling
  const schedule = useMemo(() => {
    return calculateScheduleFromDuration(startHour, startMinute, startAmPm, totalDurationMinutes);
  }, [startHour, startMinute, startAmPm, totalDurationMinutes]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: typeof TEMPLATE_SUGGESTIONS[0]) => {
    setName(tmpl.name);
    setStartHour(tmpl.hour);
    setStartMinute(tmpl.minute);
    setStartAmPm(tmpl.ampm);
    setDurationValue(tmpl.duration);
    setDurationUnit(tmpl.unit);
    setColor(tmpl.color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name for this habit/task.');
      return;
    }

    if (totalDurationMinutes <= 0) {
      setError('Please provide a valid duration greater than 0.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        color,
        startTime: schedule.startTimeStr,
        endTime: schedule.endTimeStr,
        time: schedule.timeWindow,
        durationMinutes: totalDurationMinutes,
        duration: durationUnit === 'hours' ? `${durationValue} hours` : `${durationValue} minutes`,
        startHour,
        startMinute,
        startAmPm,
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
              className="w-5 h-5 rounded-full shrink-0 shadow-md border-2 border-white/30"
              style={{ backgroundColor: color }}
            />
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {initialHabit ? 'Edit Task Schedule' : 'Schedule New Task / Habit'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                12-Hour format with automatic End Time calculation.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Quick Templates */}
          {!initialHabit && (
            <div>
              <label
                className={`text-[10px] font-mono uppercase font-semibold mb-1.5 flex items-center gap-1 ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_SUGGESTIONS.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => handleApplyTemplate(t)}
                    className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Task Name */}
          <div className="space-y-1">
            <label
              className={`text-xs font-mono uppercase font-semibold ${
                isDark ? 'text-neutral-300' : 'text-slate-700'
              }`}
            >
              Task / Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Work, Gym Workout, Reading"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-colors border ${
                isDark
                  ? 'bg-[#17171a] border-neutral-700/80 text-white placeholder:text-neutral-600 focus:border-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-800'
              }`}
            />
          </div>

          {/* START TIME: 12-Hour Custom Time Picker */}
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
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Start Time (12-Hour Format)
              </label>

              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                {schedule.startTimeStr}
              </span>
            </div>

            {/* Custom 12-Hour Picker Row */}
            <div className="grid grid-cols-12 gap-2.5 items-center">
              {/* Hour Dropdown */}
              <div className="col-span-4 space-y-1">
                <span className={`text-[10px] font-mono uppercase block ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Hour
                </span>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className={`w-full text-base font-mono font-bold px-3 py-2 rounded-xl border focus:outline-none cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-[#1e1e24] border-neutral-700 text-white focus:border-emerald-400'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600 shadow-2xs'
                  }`}
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minute Dropdown */}
              <div className="col-span-4 space-y-1">
                <span className={`text-[10px] font-mono uppercase block ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Minute
                </span>
                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(Number(e.target.value))}
                  className={`w-full text-base font-mono font-bold px-3 py-2 rounded-xl border focus:outline-none cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-[#1e1e24] border-neutral-700 text-white focus:border-emerald-400'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600 shadow-2xs'
                  }`}
                >
                  {MINUTES_PRESETS.map((m) => (
                    <option key={m} value={m}>
                      :{m.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              {/* AM / PM Toggle */}
              <div className="col-span-4 space-y-1">
                <span className={`text-[10px] font-mono uppercase block ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  AM / PM
                </span>
                <div className="flex items-center rounded-xl p-1 border border-neutral-700/80 bg-neutral-900/80">
                  <button
                    type="button"
                    onClick={() => setStartAmPm('AM')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
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
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      startAmPm === 'PM'
                        ? 'bg-emerald-500 text-black shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DURATION & AUTOMATIC END TIME */}
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
                <Timer className="w-3.5 h-3.5 text-sky-400" />
                Duration (e.g., 45 minutes or 1.5 hours)
              </label>

              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                {totalDurationMinutes} mins total
              </span>
            </div>

            {/* Duration Input & Unit Selector */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  placeholder="e.g. 45 or 1.5"
                  value={durationValue}
                  onChange={(e) => setDurationValue(Number(e.target.value))}
                  className={`w-full text-base font-mono font-bold px-3.5 py-2 rounded-xl border focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#1a1a1f] border-neutral-700 text-white focus:border-sky-400'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-sky-600 shadow-2xs'
                  }`}
                />
              </div>

              {/* Unit Toggle: Minutes / Hours */}
              <div className="flex items-center rounded-xl p-1 border border-neutral-700/80 bg-neutral-900/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setDurationUnit('minutes')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    durationUnit === 'minutes'
                      ? 'bg-sky-500 text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Minutes
                </button>
                <button
                  type="button"
                  onClick={() => setDurationUnit('hours')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    durationUnit === 'hours'
                      ? 'bg-sky-500 text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Hours
                </button>
              </div>
            </div>

            {/* Quick Duration Preset Chips */}
            <div className="flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map((p) => {
                const isSelected = durationValue === p.value && durationUnit === p.unit;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setDurationValue(p.value);
                      setDurationUnit(p.unit);
                    }}
                    className={`py-1 px-2.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-sky-500 text-black border-sky-400 font-bold shadow-xs'
                        : isDark
                        ? 'bg-neutral-800/80 border-neutral-700/60 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CALCULATED SCHEDULE SUMMARY (STRICT 12-HOUR FORMAT) */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
              isDark
                ? 'bg-neutral-900/90 border-neutral-800 text-neutral-200'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold uppercase tracking-wider text-neutral-400">
                Calculated Schedule Window:
              </span>
              <span className="text-emerald-400 font-bold font-mono">
                {schedule.timeWindow}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-lg border bg-black/20 border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 uppercase">Start Time</span>
                <span className="font-bold text-white text-sm">{schedule.startTimeStr}</span>
              </div>

              <div className="flex items-center gap-1.5 text-neutral-400">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-semibold">{totalDurationMinutes}m</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] text-sky-400 uppercase font-semibold">Exact End Time</span>
                <span className="font-bold text-sky-400 text-sm">{schedule.endTimeStr}</span>
              </div>
            </div>
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
                <span>{initialHabit ? 'Update Schedule' : 'Save Task'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
