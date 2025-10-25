import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Shift } from './types';

// Extend dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Calculates the absolute 'from' and 'to' epoch milliseconds for a given shift.
 *
 * @param shift - The shift configuration with start/end times and optional date offset
 * @param timezone - IANA timezone (e.g., "Europe/Warsaw") - shifts are interpreted in this timezone
 * @param selectedDate - Optional date string (YYYY-MM-DD). If not provided, uses current date in the timezone.
 * @returns Object with 'from' and 'to' as UTC epoch milliseconds
 *
 * IMPORTANT: Shift times are ALWAYS interpreted in the specified timezone, regardless of:
 * - Database timezone (should be UTC)
 * - Grafana server timezone
 * - Client browser timezone
 *
 * The returned timestamps are in UTC milliseconds, ready for Grafana's time range.
 *
 * DATE OFFSET: If shift.dateOffset is set, it adds/subtracts days from the selected date.
 * Example: dateOffset=-1 means the shift starts one day before the selected date.
 * Useful for overnight shifts where you want to reference them by the day they END.
 */
export const getShiftTimeRange = (
  shift: Shift,
  tz: string,
  selectedDate?: string
): { from: number; to: number } => {
  // Validate shift input
  if (!shift || !shift.start || !shift.end) {
    throw new Error('Invalid shift configuration: shift object must have start and end times');
  }

  // Validate timezone
  if (!tz || typeof tz !== 'string') {
    throw new Error('Invalid timezone: timezone must be a non-empty string');
  }

  // Create base date in the specified timezone
  // If selectedDate provided, use it; otherwise use current date in that timezone
  let baseDate = selectedDate ? dayjs.tz(selectedDate, tz) : dayjs.tz(dayjs(), tz);

  // Check if timezone parsing failed
  if (!baseDate.isValid()) {
    throw new Error(`Invalid timezone or date: "${tz}" / "${selectedDate}"`);
  }

  // Apply date offset if configured
  // E.g., dateOffset=-1 means shift starts one day before selected date
  if (shift.dateOffset) {
    baseDate = baseDate.add(shift.dateOffset, 'day');
  }

  // Parse and validate time format
  const startParts = shift.start.split(':');
  const endParts = shift.end.split(':');

  if (startParts.length !== 2 || endParts.length !== 2) {
    throw new Error(`Invalid time format: start="${shift.start}", end="${shift.end}". Expected HH:mm format.`);
  }

  const [startHour, startMin] = startParts.map(Number);
  const [endHour, endMin] = endParts.map(Number);

  // Validate time values
  if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
    throw new Error(
      `Invalid time values: start="${shift.start}", end="${shift.end}". Hours and minutes must be numbers.`
    );
  }

  if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
    throw new Error(`Invalid hour values: hours must be between 0 and 23`);
  }

  if (startMin < 0 || startMin > 59 || endMin < 0 || endMin > 59) {
    throw new Error(`Invalid minute values: minutes must be between 0 and 59`);
  }

  // Set times in the specified timezone
  let from = baseDate.hour(startHour).minute(startMin).second(0).millisecond(0);
  let to = baseDate.hour(endHour).minute(endMin).second(0).millisecond(0);

  // Check for overnight shift (e.g., 22:00 -> 06:00)
  if (from.isAfter(to)) {
    // For overnight shifts, end time is always next day
    to = to.add(1, 'day');
  }

  // Convert to UTC and return as milliseconds
  // This ensures Grafana receives UTC timestamps regardless of client timezone
  return {
    from: from.utc().valueOf(),
    to: to.utc().valueOf(),
  };
};

/**
 * Checks if a shift is currently active based on the current time.
 * If selectedDate is provided, checks if current time falls within that shift on that date.
 *
 * @param shift - The shift to check
 * @param timezone - IANA timezone for shift interpretation
 * @param selectedDate - Optional date string (YYYY-MM-DD)
 * @returns true if the shift is currently active
 */
export const isShiftActive = (shift: Shift, tz: string, selectedDate?: string): boolean => {
  const { from, to } = getShiftTimeRange(shift, tz, selectedDate);
  const now = Date.now();

  // If a specific date is selected, check if it's today and if we're in the shift
  if (selectedDate) {
    const selected = dayjs.tz(selectedDate, tz);
    const today = dayjs.tz(dayjs(), tz);

    // Only show as active if the selected date is today and we're in the shift
    if (selected.isSame(today, 'day')) {
      return now >= from && now <= to;
    }
    return false;
  }

  return now >= from && now <= to;
};
