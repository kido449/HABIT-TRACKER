import { DayInfo, WeekGroup } from '../types/tracker';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_OF_WEEK_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
export const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns number of days in a given year and month (0-indexed month)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Generates array of DayInfo for each day of the month
 */
export function getMonthDays(year: number, month: number): DayInfo[] {
  const totalDays = getDaysInMonth(year, month);
  const now = new Date();
  const isCurrentYear = now.getFullYear() === year;
  const isCurrentMonth = now.getMonth() === month;
  const currentDay = now.getDate();

  const days: DayInfo[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dayOfWeekIndex = date.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;
    const isToday = isCurrentYear && isCurrentMonth && currentDay === day;
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    days.push({
      dayNumber: day,
      dayOfWeek: DAY_OF_WEEK_LABELS[dayOfWeekIndex],
      fullDayName: FULL_DAY_NAMES[dayOfWeekIndex],
      isWeekend,
      isToday,
      dateKey,
    });
  }

  return days;
}

/**
 * Groups days into calendar weeks (Week 1, Week 2, Week 3, etc.)
 * Splits on Saturday -> Sunday boundary so columns correspond cleanly to calendar weeks
 */
export function getWeekGroups(days: DayInfo[]): WeekGroup[] {
  if (days.length === 0) return [];

  const groups: WeekGroup[] = [];
  let currentWeekDays: DayInfo[] = [];
  let weekIndex = 1;

  days.forEach((day, index) => {
    currentWeekDays.push(day);

    // If day is Saturday (end of standard US calendar week) or last day of month
    if (day.dayOfWeek === 'Sa' || index === days.length - 1) {
      groups.push({
        weekNumber: weekIndex,
        weekLabel: `Week ${weekIndex}`,
        days: [...currentWeekDays],
        colSpan: currentWeekDays.length,
      });
      currentWeekDays = [];
      weekIndex++;
    }
  });

  return groups;
}

/**
 * Calculates current and longest streak for a habit in a month
 */
export function calculateStreaks(dayCompletion: Record<number, boolean>, totalDays: number): { currentStreak: number; longestStreak: number } {
  let longestStreak = 0;
  let tempStreak = 0;

  for (let d = 1; d <= totalDays; d++) {
    if (dayCompletion[d]) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Current streak (counting backwards from today or last completed day)
  let currentStreak = 0;
  for (let d = totalDays; d >= 1; d--) {
    if (dayCompletion[d]) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}
