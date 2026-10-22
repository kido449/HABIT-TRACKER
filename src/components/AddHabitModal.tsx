import React, { useState, useEffect } from 'react';
import { Habit } from '../types/tracker';
import { useTheme } from '../context/ThemeContext';
import { X, Plus, Check, Clock, Timer, ShieldAlert, Trash2, ArrowRight } from 'lucide-react';
import { getHabitScheduleDetails } from '../utils/timeWindow';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (habitId: string) => void;
  initialHabit?: Habit | null;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 15, 30, 45];
const DURATION_PRESETS = [30, 60, 90, 120, 150, 180];
const GRACE_OPTIONS = [10, 15, 20, 30];

const AVATAR_OPTIONS = [
  // Fitness
  '🏋️', '🏃', '🚴', '🧘', '🥊', '🏊', '🚶', '🤸',
  // Productivity & Focus
  '💻', '📚', '✍️', '🎯', '🧠', '💼', '📈', '⏱️',
  // Health & Body
  '💧', '🥗', '🍎', '😴', '🚿', '🍵', '💊', '🌿',
  // Lifestyle & Routine
  '🌅', '⚡', '🪴', '🐕', '🎸', '🎨', '🧹', '✨',
];

const QUICK_SUGGESTIONS = [
  { name: 'Gym Workout', hour: 4, minute: 0, ampm: 'AM' as const, duration: 60, avatar: '🏋️' },
  { name: 'Morning Wakeup & Hydrate', hour: 5, minute: 0, ampm: 'AM' as const, duration: 30, avatar: '🌅' },
  { name: 'Deep Work Session', hour: 9, minute: 0, ampm: 'AM' as const, duration: 90, avatar: '💻' },
  { name: 'Reading & Learning', hour: 8, minute: 0, ampm: 'PM' as const, duration: 30, avatar: '📚' },
  { name: 'Evening Meditation', hour: 9, minute: 30, ampm: 'PM' as const, duration: 30, avatar: '🧘' },
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
  const [startHour, setStartHour] = useState<number>(4);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [startAmPm, setStartAmPm] = useState<'AM' | 'PM'>('AM');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [graceMinutes, setGraceMinutes] = useState<number>(15);
  const [avatar, setAvatar] = useState<string>('🏋️');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name || '');
      setStartHour(initialHabit.startHour || 5);
      setStartMinute(initialHabit.startMinute || 0);
      setStartAmPm(initialHabit.startAmPm || 'AM');
      setDurationMinutes(initialHabit.durationMinutes || 60);
      setGraceMinutes(initialHabit.graceMinutes || 15);
      setAvatar(initialHabit.avatar || '🏋️');
    } else {
      setName('');
      setStartHour(4);
      setStartMinute(0);
      setStartAmPm('AM');
      setDurationMinutes(60);
      setGraceMinutes(15);
      setAvatar('🏋️');
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
    avatar,
    createdAt: Date.now(),
  };

  const schedule = getHabitScheduleDetails(previewHabit);

  const handleDurationAdd30 = () => {
    setDurationMinutes((prev) => Math.min(prev + 30, 360));
  };

  const handleDurationSub30 = () => {
    setDurationMinutes((prev) => Math.max(prev - 30, 30));
  };

  const applySuggestion = (s: typeof QUICK_SUGGESTIONS[0]) => {
    setName(s.name);
    setStartHour(s.hour);
    setStartMinute(s.minute);
    setStartAmPm(s.ampm);
    setDurationMinutes(s.duration);
    setAvatar(s.avatar);
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
        avatar,
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
            <span className="text-2xl p-1 rounded-lg bg-neutral-500/10 border border-neutral-500/20">
              {avatar}
            </span>
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {initialHabit ? 'Edit Habit & Schedule' : 'New Habit with Real-Time Window'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Select clock time, duration, avatar, and tick grace window.
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4.5 overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Quick Suggestions */}
          {!initialHabit && (
            <div>
              <label className={`text-[10px] font-mono uppercase font-semibold mb-1.5 block ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}>
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
                    <span>{s.avatar}</span>
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Habit Name */}
          <div className="space-y-1">
            <label className={`text-xs font-mono uppercase font-semibold ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
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

          {/* Avatar Selector (Replacing Color Action) */}
          <div className="space-y-1.5">
            <label className={`text-xs font-mono uppercase font-semibold flex items-center justify-between ${
              isDark ? 'text-neutral-300' : 'text-slate-700'
            }`}>
              <span>Choose Habit Avatar</span>
              <span className="text-[11px] font-normal text-neutral-400 font-sans">
                Selected: <strong className="text-base">{avatar}</strong>
              </span>
            </label>
            <div className={`p-2.5 rounded-xl border grid grid-cols-8 gap-2 ${
              isDark ? 'bg-[#161619] border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`h-9 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer ${
                    avatar === av
                      ? isDark
                        ? 'bg-neutral-700 border-2 border-emerald-400 scale-110 shadow-sm'
                        : 'bg-white border-2 border-emerald-600 shadow-sm scale-110'
                      : isDark
                      ? 'hover:bg-neutral-800/80'
                      : 'hover:bg-slate-200/70'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Clock Time Selector (No typing, purely click-to-select) */}
          <div className={`p-3.5 rounded-xl border space-y-3 ${
            isDark ? 'bg-[#161619] border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-mono uppercase font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-neutral-200' : 'text-slate-800'
              }`}>
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                Select Start Time (Clock)
              </label>

              {/* AM / PM Toggle */}
              <div className="flex items-center rounded-lg p-0.5 border border-neutral-700 bg-neutral-900/60">
                <button
                  type="button"
                  onClick={() => setStartAmPm('AM')}
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
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
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    startAmPm === 'PM'
                      ? 'bg-emerald-500 text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Hour Chips (1 to 12) */}
            <div>
              <span className={`text-[10px] font-mono uppercase block mb-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Hour: <strong className="text-emerald-400 text-xs">{startHour}</strong>
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setStartHour(h)}
                    className={`py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      startHour === h
                        ? 'bg-emerald-500 text-black font-bold'
                        : isDark
                        ? 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {h < 10 ? `0${h}` : h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minute Chips (00, 15, 30, 45) */}
            <div>
              <span className={`text-[10px] font-mono uppercase block mb-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Minute: <strong className="text-emerald-400 text-xs">:{startMinute < 10 ? `0${startMinute}` : startMinute}</strong>
              </span>
              <div className="grid grid-cols-4 gap-2">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setStartMinute(m)}
                    className={`py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      startMinute === m
                        ? 'bg-emerald-500 text-black font-bold'
                        : isDark
                        ? 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    :{m < 10 ? `0${m}` : m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Duration Selector (30m increments) */}
          <div className={`p-3.5 rounded-xl border space-y-2.5 ${
            isDark ? 'bg-[#161619] border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-mono uppercase font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-neutral-200' : 'text-slate-800'
              }`}>
                <Timer className="w-3.5 h-3.5 text-sky-400" />
                Duration: <span className="text-sky-400 font-bold">{durationMinutes} mins</span> ({durationMinutes / 60 >= 1 ? `${Math.floor(durationMinutes / 60)}h ` : ''}{durationMinutes % 60 ? `${durationMinutes % 60}m` : ''})
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDurationSub30}
                  className={`px-2 py-0.5 rounded text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  -30m
                </button>
                <button
                  type="button"
                  onClick={handleDurationAdd30}
                  className={`px-2 py-0.5 rounded text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  +30m
                </button>
              </div>
            </div>

            {/* Presets: 30, 60, 90, 120, 150, 180 */}
            <div className="grid grid-cols-6 gap-1.5">
              {DURATION_PRESETS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDurationMinutes(dur)}
                  className={`py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    durationMinutes === dur
                      ? 'bg-sky-500 text-black font-bold'
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

          {/* Check-In Grace Window & Auto-Expiration Rule */}
          <div className={`p-3.5 rounded-xl border space-y-2.5 ${
            isDark ? 'bg-[#161619] border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-mono uppercase font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-neutral-200' : 'text-slate-800'
              }`}>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Check-in Grace Period (Post-Task)
              </label>

              <span className="text-xs font-mono font-bold text-amber-400">
                {graceMinutes} minutes
              </span>
            </div>

            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              After the task ends, you get a window of {graceMinutes} minutes to check it off. If missed, it locks as <span className="text-rose-400 font-semibold">✕ Expired / Undone</span>.
            </p>

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

          {/* Real-time Schedule Breakdown Preview */}
          <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
            isDark ? 'bg-neutral-900/90 border-neutral-800 text-neutral-200' : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <div className="text-[10px] font-mono uppercase font-bold text-neutral-400">
              Live Window Summary:
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="font-semibold text-emerald-400">
                {schedule.startTimeStr}
              </span>
              <ArrowRight className="w-3 h-3 text-neutral-500" />
              <span className="font-semibold text-sky-400">
                {schedule.endTimeStr}
              </span>
              <span className="text-neutral-500 text-[11px]">({durationMinutes}m task)</span>
            </div>
            <div className="text-[11px] flex items-center gap-1.5 text-amber-300/90">
              <span>⏳ Tick Window:</span>
              <span className="font-mono font-bold">{schedule.windowStr}</span>
              <span className="text-[10px] text-neutral-400">({graceMinutes}m to tick)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`pt-3 border-t flex items-center justify-between ${
            isDark ? 'border-neutral-800' : 'border-slate-200'
          }`}>
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
