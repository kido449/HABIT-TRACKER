import React, { useState, useEffect } from 'react';
import { Habit } from '../types/tracker';
import { useTheme } from '../context/ThemeContext';
import { X, Check, Clock, Trash2, ArrowRight, Palette } from 'lucide-react';
import { formatTime24to12, formatTime12to24 } from '../utils/timeWindow';

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

const QUICK_PRESETS = [
  { name: 'Morning Routine', start: '06:00', end: '07:00', color: '#06b6d4' },
  { name: 'Gym Workout', start: '07:00', end: '08:30', color: '#f97316' },
  { name: 'Deep Work Session', start: '09:00', end: '11:30', color: '#6366f1' },
  { name: 'Afternoon Focus', start: '14:00', end: '16:00', color: '#3b82f6' },
  { name: 'Evening Walk / Run', start: '18:00', end: '19:00', color: '#10b981' },
  { name: 'Reading & Learning', start: '20:30', end: '21:30', color: '#8b5cf6' },
];

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
  const [startTime, setStartTime] = useState('07:00'); // 24-hr format "HH:mm"
  const [endTime, setEndTime] = useState('08:00');   // 24-hr format "HH:mm"
  const [color, setColor] = useState('#10b981');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name || '');
      setColor(initialHabit.color || '#10b981');
      if (initialHabit.startTime) {
        setStartTime(formatTime12to24(initialHabit.startTime));
      } else if (initialHabit.startHour !== undefined) {
        const h24 = (initialHabit.startHour % 12) + (initialHabit.startAmPm === 'PM' ? 12 : 0);
        const m = initialHabit.startMinute || 0;
        setStartTime(`${h24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      } else {
        setStartTime('07:00');
      }

      if (initialHabit.endTime) {
        setEndTime(formatTime12to24(initialHabit.endTime));
      } else {
        setEndTime('08:00');
      }
    } else {
      setName('');
      setStartTime('07:00');
      setEndTime('08:00');
      setColor('#10b981');
    }
    setError('');
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const start12 = formatTime24to12(startTime);
  const end12 = formatTime24to12(endTime);

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setName(preset.name);
    setStartTime(preset.start);
    setEndTime(preset.end);
    setColor(preset.color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name for this habit/task.');
      return;
    }

    const timeRangeStr = `${start12} – ${end12}`;

    onSave(
      {
        name: name.trim(),
        color,
        startTime: start12,
        endTime: end12,
        time: timeRangeStr,
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
                {initialHabit ? 'Edit Habit / Task' : 'Add New Habit / Task'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Set your task name, schedule (From – To), and color tag.
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

          {/* Quick Presets */}
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
                {QUICK_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.name}</span>
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
              Task Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gym Workout, Reading, Deep Work"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-colors border ${
                isDark
                  ? 'bg-[#17171a] border-neutral-700/80 text-white placeholder:text-neutral-600 focus:border-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-800'
              }`}
            />
          </div>

          {/* Time: From [Time] To [Time] */}
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
                Schedule: From – To
              </label>

              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                {start12} &rarr; {end12}
              </span>
            </div>

            {/* Time Pickers Row */}
            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Start Time */}
              <div className="space-y-1">
                <span className={`text-[10px] font-mono uppercase font-semibold block ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}>
                  From (Start Time)
                </span>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`w-full text-base font-mono font-semibold px-3 py-2 rounded-xl border focus:outline-none transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#1a1a1f] border-neutral-700 text-white focus:border-emerald-400'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600 shadow-2xs'
                  }`}
                />
              </div>

              {/* End Time */}
              <div className="space-y-1">
                <span className={`text-[10px] font-mono uppercase font-semibold block ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}>
                  To (End Time)
                </span>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full text-base font-mono font-semibold px-3 py-2 rounded-xl border focus:outline-none transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#1a1a1f] border-neutral-700 text-white focus:border-emerald-400'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600 shadow-2xs'
                  }`}
                />
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
                <span>{initialHabit ? 'Update Task' : 'Save Task'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
