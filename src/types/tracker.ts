export interface Habit {
  id: string;
  name: string;
  color: string; // Hex color e.g. "#10b981", "#3b82f6"
  startTime?: string; // e.g. "06:00 AM" or "06:00"
  endTime?: string; // e.g. "07:30 AM" or "07:30"
  time?: string; // Display time string e.g., "06:00 AM – 07:30 AM"
  duration?: string; // Optional legacy duration string
  startHour?: number;
  startMinute?: number;
  startAmPm?: 'AM' | 'PM';
  durationMinutes?: number;
  graceMinutes?: number;
  avatar?: string;
  category?: string;
  createdAt: number;
}

export type DayCompletionMap = Record<number, boolean>; // dayNumber (1..31) -> boolean

export interface MonthHabitRecord {
  // key is habitId -> DayCompletionMap
  [habitId: string]: DayCompletionMap;
}

export type MoodType = 'great' | 'good' | 'neutral' | 'low' | 'energized' | '';

export interface DayWellness {
  mood: MoodType;
  sleepHours: number | null; // e.g., 7.5
}

export type MonthWellnessRecord = Record<number, DayWellness>; // dayNumber -> DayWellness

export interface TrackerMonthKey {
  year: number; // e.g. 2026
  month: number; // 0-indexed: 0 = January, 2 = March, etc.
}

export interface DayInfo {
  dayNumber: number;
  dayOfWeek: string; // "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"
  fullDayName: string;
  isWeekend: boolean;
  isToday: boolean;
  dateKey: string; // "YYYY-MM-DD"
}

export interface WeekGroup {
  weekNumber: number;
  weekLabel: string; // "Week 1", "Week 2", ...
  days: DayInfo[];
  colSpan: number;
}

export interface HabitAnalytics {
  habitId: string;
  habit: Habit;
  goal: number;
  actual: number;
  left: number;
  percentage: number;
  currentStreak: number;
  longestStreak: number;
}

export type TaskTimeStatus = 
  | 'completed'       // Already checked off
  | 'in_window'       // Finished task, in the 15-min check-in window!
  | 'upcoming'        // Has not finished yet today (before end time)
  | 'expired'         // Check-in window closed today, marked undone!
  | 'future'          // Future calendar day
  | 'past_missed';    // Past calendar day, was never checked
