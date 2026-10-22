import { Habit, TaskTimeStatus } from '../types/tracker';

export interface ScheduleDetails {
  startTimeStr: string;
  endTimeStr: string;
  windowStr: string;
  durationMinutes: number;
}

export interface DayStatusResult {
  status: TaskTimeStatus;
  canCheckIn: boolean;
  label: string;
  sublabel?: string;
}

/**
 * Strict 12-hour device clock formatter:
 * Outputs e.g. "01:15 PM" or "01:15:30 PM"
 */
export function formatDeviceClock12h(date: Date, includeSeconds = false): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (includeSeconds) {
    const seconds = date.getSeconds();
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
  }
  return `${pad(hours)}:${pad(minutes)} ${ampm}`;
}

/**
 * Formats any hours and minutes into strict 12-hour string (e.g. "02:00 PM", "12:15 AM")
 */
export function format12HourTime(hour12: number, minute: number, ampm: 'AM' | 'PM'): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  let h = hour12 % 12;
  if (h === 0) h = 12;
  return `${pad(h)}:${pad(minute)} ${ampm}`;
}

/**
 * Parses time string (e.g. "02:00 PM", "2:00pm", "14:00") into { hour12, minute, ampm }
 */
export function parse12HourTime(timeStr: string): { hour12: number; minute: number; ampm: 'AM' | 'PM' } {
  if (!timeStr) return { hour12: 2, minute: 0, ampm: 'PM' };
  
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const clean = timeStr.replace(/[a-zA-Z]/g, '').trim();
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;

  if (isPM || isAM) {
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour12, minute: m, ampm: isPM ? 'PM' : 'AM' };
  }

  // 24-hour fallback
  const ampm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute: m, ampm };
}

/**
 * Accurately calculates exact End Time and Time Window from Start Time and Duration.
 * Handles AM/PM rollover across noon (e.g., 11:30 AM + 45m = 12:15 PM)
 * and midnight (e.g., 11:45 PM + 30m = 12:15 AM).
 */
export function calculateScheduleFromDuration(
  startHour12: number,
  startMinute: number,
  startAmPm: 'AM' | 'PM',
  durationMinutes: number
): {
  startTimeStr: string;
  endTimeStr: string;
  timeWindow: string;
  endHour12: number;
  endMinute: number;
  endAmPm: 'AM' | 'PM';
} {
  // Convert start time to 24-hour total minutes from midnight
  let startH24 = startHour12 % 12;
  if (startAmPm === 'PM') startH24 += 12;
  const startTotalMinutes = startH24 * 60 + startMinute;

  // Compute end time in minutes with 24-hour modulo for rollover
  const safeDuration = Math.max(1, Math.round(durationMinutes));
  const endTotalMinutes = ((startTotalMinutes + safeDuration) % 1440 + 1440) % 1440;

  // Convert end time back to 12-hour format with AM/PM
  const endH24 = Math.floor(endTotalMinutes / 60);
  const endMinute = endTotalMinutes % 60;
  const endAmPm: 'AM' | 'PM' = endH24 >= 12 ? 'PM' : 'AM';
  let endHour12 = endH24 % 12;
  if (endHour12 === 0) endHour12 = 12;

  const pad = (n: number) => n.toString().padStart(2, '0');
  let cleanStartH = startHour12 % 12;
  if (cleanStartH === 0) cleanStartH = 12;

  const startTimeStr = `${pad(cleanStartH)}:${pad(startMinute)} ${startAmPm}`;
  const endTimeStr = `${pad(endHour12)}:${pad(endMinute)} ${endAmPm}`;
  const timeWindow = `${startTimeStr} - ${endTimeStr}`;

  return {
    startTimeStr,
    endTimeStr,
    timeWindow,
    endHour12,
    endMinute,
    endAmPm,
  };
}

/**
 * Formats time string strictly into 12-hour format "hh:mm AM/PM"
 */
export function formatTo12hStrict(timeStr: string): string {
  if (!timeStr) return '';
  const parsed = parse12HourTime(timeStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(parsed.hour12)}:${pad(parsed.minute)} ${parsed.ampm}`;
}

/**
 * Returns formatted time range string: e.g. "02:00 PM - 03:30 PM"
 */
export function getHabitTimeRange(habit: Habit): string {
  if (habit.startTime && habit.endTime) {
    return `${formatTo12hStrict(habit.startTime)} - ${formatTo12hStrict(habit.endTime)}`;
  }
  if (habit.time) {
    // Check if habit.time already contains range
    if (habit.time.includes('-') || habit.time.includes('–')) {
      const parts = habit.time.split(/[-–]/);
      if (parts.length === 2) {
        return `${formatTo12hStrict(parts[0].trim())} - ${formatTo12hStrict(parts[1].trim())}`;
      }
    }
    return formatTo12hStrict(habit.time);
  }
  return '';
}

/**
 * Returns complete schedule breakdown for a habit.
 */
export function getHabitScheduleDetails(habit: Habit): ScheduleDetails {
  if (habit.startTime && habit.endTime) {
    const s = formatTo12hStrict(habit.startTime);
    const e = formatTo12hStrict(habit.endTime);
    return {
      startTimeStr: s,
      endTimeStr: e,
      windowStr: `${s} - ${e}`,
      durationMinutes: habit.durationMinutes || 60,
    };
  }

  if (habit.time) {
    const timeWindow = getHabitTimeRange(habit);
    const parts = timeWindow.split(' - ');
    return {
      startTimeStr: parts[0] || '07:00 AM',
      endTimeStr: parts[1] || '08:00 AM',
      windowStr: timeWindow,
      durationMinutes: habit.durationMinutes || 60,
    };
  }

  return {
    startTimeStr: '07:00 AM',
    endTimeStr: '08:00 AM',
    windowStr: '07:00 AM - 08:00 AM',
    durationMinutes: 60,
  };
}

/**
 * Simple status check: any day can be checked/completed freely!
 */
export function getHabitDayStatus(
  habit: Habit,
  _dayNumber: number,
  _year: number,
  _month: number,
  isChecked: boolean,
  _currentTime: Date
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
