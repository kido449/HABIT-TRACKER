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
 * Returns complete schedule breakdown for a habit:
 * Start time, End time, and Check-in Window End time.
 */
export function getHabitScheduleDetails(habit: Habit): ScheduleDetails {
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
 * Evaluates real-time check-in window and expiration status for a given calendar day.
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
      canCheckIn: true, // Can click to toggle or view details
      label: 'Done',
      sublabel: 'Completed on time',
    };
  }

  const today = new Date(currentTime);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const isToday = year === todayYear && month === todayMonth && dayNumber === todayDate;
  const isPast =
    year < todayYear ||
    (year === todayYear && month < todayMonth) ||
    (year === todayYear && month === todayMonth && dayNumber < todayDate);
  const isFuture =
    year > todayYear ||
    (year === todayYear && month > todayMonth) ||
    (year === todayYear && month === todayMonth && dayNumber > todayDate);

  if (isFuture) {
    return {
      status: 'future',
      canCheckIn: false,
      label: 'Future',
      sublabel: 'Not yet reached',
    };
  }

  if (isPast) {
    return {
      status: 'past_missed',
      canCheckIn: false,
      label: 'Missed',
      sublabel: 'Window expired',
    };
  }

  // IT IS TODAY! Calculate real-time window:
  const schedule = getHabitScheduleDetails(habit);
  const currentMinutes = today.getHours() * 60 + today.getMinutes();
  const currentSeconds = today.getSeconds();

  // If before end time:
  if (currentMinutes < schedule.endMinutes) {
    const minUntilEnd = schedule.endMinutes - currentMinutes;
    const isOngoing = currentMinutes >= schedule.startMinutes;
    return {
      status: 'upcoming',
      canCheckIn: false,
      label: isOngoing ? 'In Progress' : 'Upcoming',
      sublabel: isOngoing
        ? `Ends in ${minUntilEnd}m (${schedule.endTimeStr})`
        : `Starts ${schedule.startTimeStr}`,
    };
  }

  // If in check-in window (endMinutes <= currentMinutes <= graceEndMinutes):
  if (currentMinutes < schedule.graceEndMinutes || (currentMinutes === schedule.graceEndMinutes && currentSeconds === 0)) {
    const totalSecondsLeft = (schedule.graceEndMinutes * 60) - (currentMinutes * 60 + currentSeconds);
    const minLeft = Math.floor(totalSecondsLeft / 60);
    const secLeft = totalSecondsLeft % 60;

    return {
      status: 'in_window',
      canCheckIn: true,
      label: 'Check In Now!',
      sublabel: `${minLeft}m ${secLeft}s left to tick`,
      minutesRemaining: minLeft,
      secondsRemaining: totalSecondsLeft,
    };
  }

  // Window has closed and user did not check in:
  return {
    status: 'expired',
    canCheckIn: false,
    label: 'Expired',
    sublabel: `Window closed at ${schedule.graceEndStr}`,
  };
}
