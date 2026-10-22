import React, { useState } from 'react';
import { Habit } from '../types/tracker';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Plus, 
  RotateCcw,
  ListFilter,
  Clock
} from 'lucide-react';
import { getHabitScheduleDetails } from '../utils/timeWindow';

interface ManageTasksModalProps {
  isOpen: boolean;
  habits: Habit[];
  onClose: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onReorderHabits: (habits: Habit[]) => void;
  onClearHabitChecks: (habitId: string) => void;
  onOpenAddNew: () => void;
}

export const ManageTasksModal: React.FC<ManageTasksModalProps> = ({
  isOpen,
  habits,
  onClose,
  onEditHabit,
  onDeleteHabit,
  onReorderHabits,
  onClearHabitChecks,
  onOpenAddNew,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');

  if (!isOpen) return null;

  const moveHabit = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= habits.length) return;

    const updated = [...habits];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    onReorderHabits(updated);
  };

  const handleStartInlineEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditedName(habit.name);
  };

  const handleSaveInlineEdit = (habit: Habit) => {
    if (editedName.trim() && editedName.trim() !== habit.name) {
      const updated = habits.map((h) => 
        h.id === habit.id ? { ...h, name: editedName.trim() } : h
      );
      onReorderHabits(updated);
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors ${
          isDark 
            ? 'bg-[#121214] border-neutral-800 text-neutral-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-neutral-800 bg-[#161619]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-300 text-slate-800'
            }`}>
              <ListFilter className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Manage Tasks &amp; Habits
              </h2>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Rename, reorder, delete, or inspect real-time windows for any task.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAddNew();
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Habit</span>
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Habits List */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1 scrollbar-thin">
          {habits.map((habit, index) => {
            const isEditing = editingId === habit.id;
            const schedule = getHabitScheduleDetails(habit);

            return (
              <div
                key={habit.id}
                className={`border rounded-xl p-3 flex items-center justify-between gap-3 transition-colors ${
                  isDark
                    ? 'bg-[#17171b] border-neutral-800/90 hover:border-neutral-700/80'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left: Reorder buttons & Avatar & Name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Reorder Stepper */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      disabled={index === 0}
                      onClick={() => moveHabit(index, 'up')}
                      title="Move Up"
                      className={`p-0.5 rounded disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed ${
                        isDark ? 'text-neutral-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === habits.length - 1}
                      onClick={() => moveHabit(index, 'down')}
                      title="Move Down"
                      className={`p-0.5 rounded disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed ${
                        isDark ? 'text-neutral-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Color Tag Badge */}
                  <span
                    className="w-5 h-5 rounded-full shrink-0 shadow-sm border border-white/20"
                    style={{ backgroundColor: habit.color || '#10b981' }}
                  />

                  {/* Name (Inline editable or static) */}
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveInlineEdit(habit);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className={`border rounded px-2.5 py-1 text-sm focus:outline-none flex-1 ${
                            isDark ? 'bg-neutral-900 border-neutral-600 text-white' : 'bg-white border-slate-400 text-slate-900'
                          }`}
                        />
                        <button
                          onClick={() => handleSaveInlineEdit(habit)}
                          className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className={`p-1.5 rounded cursor-pointer ${
                            isDark ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleStartInlineEdit(habit)}
                        className="cursor-pointer group/name"
                        title="Click to rename"
                      >
                        <span className={`font-semibold text-sm transition-colors ${
                          isDark ? 'text-white group-hover/name:text-neutral-200' : 'text-slate-900 group-hover/name:text-slate-700'
                        }`}>
                          {habit.name}
                        </span>
                        <div className={`flex items-center gap-1.5 text-[11px] font-mono mt-0.5 ${
                          isDark ? 'text-neutral-400' : 'text-slate-500'
                        }`}>
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">
                            {schedule.startTimeStr} &rarr; {schedule.endTimeStr}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onEditHabit(habit);
                    }}
                    title="Edit habit name, schedule, and color"
                    className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                      isDark 
                        ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white' 
                        : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => onClearHabitChecks(habit.id)}
                    title="Clear all checkmarks for this habit in current month"
                    className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                      isDark 
                        ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-amber-400' 
                        : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600 hover:text-amber-600 shadow-2xs'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear Checks</span>
                  </button>

                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    title="Delete this habit"
                    className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-900/60 text-rose-300 hover:text-rose-100'
                        : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600 hover:text-rose-700 shadow-2xs'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="font-semibold">Delete</span>
                  </button>
                </div>
              </div>
            );
          })}

          {habits.length === 0 && (
            <div className={`text-center py-12 font-mono text-sm ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              No tasks or habits created yet. Click &quot;New Habit&quot; above to create one!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between text-xs font-mono ${
          isDark ? 'border-neutral-800 bg-[#161619] text-neutral-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <span>{habits.length} habits configured</span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
