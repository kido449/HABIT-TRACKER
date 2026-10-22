import { Habit, MonthHabitRecord, MonthWellnessRecord } from '../types/tracker';

export const DEFAULT_HABIT_COLORS = [
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#14b8a6',
];

// Empty default habits as requested by user
export const DEFAULT_HABITS: Habit[] = [];

// Clean storage keys for an empty, user-customized ledger
const STORAGE_KEY_HABITS = 'habit_tracker_habits_v3_clean';
const STORAGE_KEY_LOGS_PREFIX = 'habit_tracker_logs_v3_';
const STORAGE_KEY_WELLNESS_PREFIX = 'habit_tracker_wellness_v3_';

export function getMonthLogKey(year: number, month: number): string {
  return `${STORAGE_KEY_LOGS_PREFIX}${year}_${month}`;
}

export function getMonthWellnessKey(year: number, month: number): string {
  return `${STORAGE_KEY_WELLNESS_PREFIX}${year}_${month}`;
}

/**
 * Loads habits list from localStorage or returns empty list
 */
export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HABITS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((h: any, idx: number) => ({
          ...h,
          color: h.color || DEFAULT_HABIT_COLORS[idx % DEFAULT_HABIT_COLORS.length],
        }));
      }
    }
  } catch (err) {
    console.warn('Failed to load habits from localStorage', err);
  }
  return DEFAULT_HABITS;
}

/**
 * Saves habits list to localStorage
 */
export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
  } catch (err) {
    console.error('Failed to save habits', err);
  }
}

/**
 * Loads habit completion record for a specific year and month
 */
export function loadMonthRecords(year: number, month: number, habits: Habit[]): MonthHabitRecord {
  const key = getMonthLogKey(year, month);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`Failed to load month record for ${key}`, err);
  }

  return {};
}

/**
 * Saves habit completion record for a specific year and month
 */
export function saveMonthRecords(year: number, month: number, records: MonthHabitRecord): void {
  const key = getMonthLogKey(year, month);
  try {
    localStorage.setItem(key, JSON.stringify(records));
  } catch (err) {
    console.error(`Failed to save month record for ${key}`, err);
  }
}

/**
 * Loads wellness record for a specific year and month
 */
export function loadMonthWellness(year: number, month: number): MonthWellnessRecord {
  const key = getMonthWellnessKey(year, month);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`Failed to load wellness record for ${key}`, err);
  }

  return {};
}

/**
 * Saves wellness record for a specific year and month
 */
export function saveMonthWellness(year: number, month: number, records: MonthWellnessRecord): void {
  const key = getMonthWellnessKey(year, month);
  try {
    localStorage.setItem(key, JSON.stringify(records));
  } catch (err) {
    console.error(`Failed to save wellness record for ${key}`, err);
  }
}

/**
 * Clear all stored data completely
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HABITS);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('habit_tracker_') || key.startsWith(STORAGE_KEY_LOGS_PREFIX) || key.startsWith(STORAGE_KEY_WELLNESS_PREFIX))) {
        localStorage.removeItem(key);
      }
    }
  } catch (err) {
    console.error('Failed to clear data', err);
  }
}

/**
 * Export all tracker data as a backup JSON
 */
export function exportAllData(): string {
  const habits = loadHabits();
  const allLogs: Record<string, any> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(STORAGE_KEY_LOGS_PREFIX) || key.startsWith(STORAGE_KEY_WELLNESS_PREFIX))) {
      allLogs[key] = JSON.parse(localStorage.getItem(key) || '{}');
    }
  }

  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    version: '3.0',
    habits,
    logs: allLogs,
  }, null, 2);
}

/**
 * Import backup JSON
 */
export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data && Array.isArray(data.habits)) {
      saveHabits(data.habits);
      if (data.logs && typeof data.logs === 'object') {
        Object.entries(data.logs).forEach(([k, v]) => {
          localStorage.setItem(k, JSON.stringify(v));
        });
      }
      return true;
    }
  } catch (err) {
    console.error('Failed to import backup data', err);
  }
  return false;
}
