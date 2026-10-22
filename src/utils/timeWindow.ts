import { Habit, TaskTimeStatus } from '../types/tracker';

export interface ScheduleDetails {
  startTimeStr: string;
  endTimeStr: string;
  graceEndStr: string;
  windowStr: string;
  startMinutes: number;
  endMinutes: number;
  graceEndMinutes: number;
}

export interface DayStatusResult {
  status: TaskTimeStatus;
  canCheckIn: boolean;
  label: string;
  sublabel?: string;
  minutesRemaining?: number;
  secondsRemaining?: number;
}

/**
 * Converts 24h string ("09:30") to 12h formatted string ("9:30 AM")
 */
export function formatTime24to12(time24: string): string {
  if (!time24) return '';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const mFormatted = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${mFormatted} ${ampm}`;
}

/**
 * Converts 12h string ("9:30 AM") to 24h string ("09:30")
 */
export function formatTime12to24(time12: string): string {
  if (!time12) return '09:00';
  if (!time12.includes('AM') && !time12.includes('PM')) {
    return time12;
  }
  const isPM = time12.toUpperCase().includes('PM');
  const clean = time12.replace(/(AM|PM)/gi, '').trim();
  const parts = clean.split(':');
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (isPM && h < 12) h += 12;
  if (!isPM && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Parses time string (either 12h or 24h) into total minutes from midnight (0..1439).
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const isPM = timeStr.toUpperCase().includes('PM');
    const clean = timeStr.replace(/(AM|PM)/gi, '').trim();
    const parts = clean.split(':');
    let h = (parseInt(parts[0], 10) || 0) % 12;
    if (isPM) h += 12;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  }
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * Returns formatted time range string: e.g. "06:00 AM – 07:30 AM"
 */
export function getHabitTimeRange(habit: Habit): string {
  if (habit.startTime && habit.endTime) {
    const s = habit.startTime.includes('M') ? habit.startTime : formatTime24to12(habit.startTime);
    const e = habit.endTime.includes('M') ? habit.endTime : formatTime24to12(habit.endTime);
    return `${s} – ${e}`;
  }
  if (habit.startTime) {
    const s = habit.startTime.includes('M') ? habit.startTime : formatTime24to12(habit.startTime);
    return s;
  }
  if (habit.time) return habit.time;
  return '';
}

/**
 * Converts 12-hour hour, minute and AM/PM into total minutes from midnight (0..1439).
 */
export function toMinutesFromMidnight(hour12: number, minute: number, ampm: 'AM' | 'PM'): number {
  let h = hour12 % 12;
  if (ampm === 'PM') {
    h += 12;
  }
  return h * 60 + minute;
}

/**
 * Formats total minutes from midnight into 12-hour string (e.g., "04:00 AM", "05:15 PM").
 */
export function formatMinutesTo12h(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  const hStr = hours12 < 10 ? `0${hours12}` : `${hours12}`;
  const mStr = mins < 10 ? `0${mins}` : `${mins}`;
  return `${hStr}:${mStr} ${ampm}`;
}

/**
 * Returns complete schedule breakdown for a habit.
 */
export function getHabitScheduleDetails(habit: Habit): ScheduleDetails {
  if (habit.startTime && habit.endTime) {
    const startMinutes = parseTimeToMinutes(habit.startTime);
    const endMinutes = parseTimeToMinutes(habit.endTime);
    const startTimeStr = formatMinutesTo12h(startMinutes);
    const endTimeStr = formatMinutesTo12h(endMinutes);
    return {
      startTimeStr,
      endTimeStr,
      graceEndStr: endTimeStr,
      windowStr: `${startTimeStr} – ${endTimeStr}`,
      startMinutes,
      endMinutes,
      graceEndMinutes: endMinutes,
    };
  }

  const startHour = habit.startHour || 5;
  const startMinute = habit.startMinute || 0;
  const startAmPm = habit.startAmPm || 'AM';
  const duration = habit.durationMinutes || 60;
  const grace = habit.graceMinutes || 15;

  const startMinutes = toMinutesFromMidnight(startHour, startMinute, startAmPm);
  const endMinutes = startMinutes + duration;
  const graceEndMinutes = endMinutes + grace;

  const startTimeStr = formatMinutesTo12h(startMinutes);
  const endTimeStr = formatMinutesTo12h(endMinutes);
  const graceEndStr = formatMinutesTo12h(graceEndMinutes);
  const windowStr = `${endTimeStr} - ${graceEndStr}`;

  return {
    startTimeStr,
    endTimeStr,
    graceEndStr,
    windowStr,
    startMinutes,
    endMinutes,
    graceEndMinutes,
  };
}

/**
 * Simple status check: any day can be checked/completed freely!
 */
export function getHabitDayStatus(
  habit: Habit,
  dayNumber: number,
  year: number,
  month: number,
  isChecked: boolean,
  currentTime: Date
): DayStatusResult {
  if (isChecked) {
    return {
      status: 'completed',
      canCheckIn: true,
      label: 'Done',
      sublabel: 'Completed',
    };
  }

  return {
    status: 'upcoming',
    canCheckIn: true,
    label: 'Ready',
    sublabel: getHabitTimeRange(habit) || 'Daily habit',
  };
}
