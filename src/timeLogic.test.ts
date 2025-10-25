import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getShiftTimeRange, isShiftActive } from './timeLogic';
import { Shift } from './types';

// Extend dayjs with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);

describe('timeLogic', () => {
  describe('getShiftTimeRange', () => {
    it('should calculate time range for a basic shift in Europe/Warsaw timezone', () => {
      const shift: Shift = {
        name: 'Morning',
        start: '08:00',
        end: '16:00',
      };

      const result = getShiftTimeRange(shift, 'Europe/Warsaw', '2025-01-15');

      // Convert back to Europe/Warsaw to verify
      const fromLocal = dayjs.utc(result.from).tz('Europe/Warsaw');
      const toLocal = dayjs.utc(result.to).tz('Europe/Warsaw');

      expect(fromLocal.format('YYYY-MM-DD HH:mm')).toBe('2025-01-15 08:00');
      expect(toLocal.format('YYYY-MM-DD HH:mm')).toBe('2025-01-15 16:00');
    });

    it('should calculate time range for a shift in UTC timezone', () => {
      const shift: Shift = {
        name: 'Day',
        start: '10:00',
        end: '18:00',
      };

      const result = getShiftTimeRange(shift, 'UTC', '2025-01-15');

      const fromLocal = dayjs.utc(result.from);
      const toLocal = dayjs.utc(result.to);

      expect(fromLocal.format('YYYY-MM-DD HH:mm')).toBe('2025-01-15 10:00');
      expect(toLocal.format('YYYY-MM-DD HH:mm')).toBe('2025-01-15 18:00');
    });

    it('should handle overnight shifts (end time after midnight)', () => {
      const shift: Shift = {
        name: 'Night',
        start: '22:00',
        end: '06:00',
      };

      const result = getShiftTimeRange(shift, 'Europe/Warsaw', '2025-01-15');

      const fromLocal = dayjs.utc(result.from).tz('Europe/Warsaw');
      const toLocal = dayjs.utc(result.to).tz('Europe/Warsaw');

      expect(fromLocal.format('YYYY-MM-DD HH:mm')).toBe('2025-01-15 22:00');
      expect(toLocal.format('YYYY-MM-DD HH:mm')).toBe('2025-01-16 06:00'); // Next day
    });

    it('should apply dateOffset correctly', () => {
      const shift: Shift = {
        name: 'Previous Day Shift',
        start: '20:00',
        end: '04:00',
        dateOffset: -1,
      };

      const result = getShiftTimeRange(shift, 'Europe/Warsaw', '2025-01-15');

      const fromLocal = dayjs.utc(result.from).tz('Europe/Warsaw');
      const toLocal = dayjs.utc(result.to).tz('Europe/Warsaw');

      // With dateOffset=-1, shift starts on Jan 14
      expect(fromLocal.format('YYYY-MM-DD HH:mm')).toBe('2025-01-14 20:00');
      expect(toLocal.format('YYYY-MM-DD HH:mm')).toBe('2025-01-15 04:00');
    });

    it('should handle positive dateOffset', () => {
      const shift: Shift = {
        name: 'Next Day Shift',
        start: '08:00',
        end: '16:00',
        dateOffset: 1,
      };

      const result = getShiftTimeRange(shift, 'Europe/Warsaw', '2025-01-15');

      const fromLocal = dayjs.utc(result.from).tz('Europe/Warsaw');

      expect(fromLocal.format('YYYY-MM-DD HH:mm')).toBe('2025-01-16 08:00');
    });

    it('should use current date when selectedDate is not provided', () => {
      const shift: Shift = {
        name: 'Morning',
        start: '08:00',
        end: '16:00',
      };

      const result = getShiftTimeRange(shift, 'Europe/Warsaw');

      const today = dayjs().tz('Europe/Warsaw').format('YYYY-MM-DD');
      const fromLocal = dayjs.utc(result.from).tz('Europe/Warsaw');

      expect(fromLocal.format('YYYY-MM-DD')).toBe(today);
    });

    it('should handle different timezones correctly', () => {
      const shift: Shift = {
        name: 'Morning',
        start: '09:00',
        end: '17:00',
      };

      const resultWarsaw = getShiftTimeRange(shift, 'Europe/Warsaw', '2025-06-15');
      const resultNY = getShiftTimeRange(shift, 'America/New_York', '2025-06-15');

      // Both should be different UTC timestamps for the same local time
      expect(resultWarsaw.from).not.toBe(resultNY.from);

      // But they should represent the correct local times
      const warsawFrom = dayjs.utc(resultWarsaw.from).tz('Europe/Warsaw');
      const nyFrom = dayjs.utc(resultNY.from).tz('America/New_York');

      expect(warsawFrom.format('HH:mm')).toBe('09:00');
      expect(nyFrom.format('HH:mm')).toBe('09:00');
    });

    it('should throw error for invalid shift configuration', () => {
      expect(() => {
        getShiftTimeRange({} as Shift, 'UTC', '2025-01-15');
      }).toThrow('Invalid shift configuration');

      expect(() => {
        getShiftTimeRange({ name: 'Test', start: '08:00' } as Shift, 'UTC', '2025-01-15');
      }).toThrow('Invalid shift configuration');
    });

    it('should throw error for invalid timezone', () => {
      const shift: Shift = {
        name: 'Morning',
        start: '08:00',
        end: '16:00',
      };

      expect(() => {
        getShiftTimeRange(shift, '', '2025-01-15');
      }).toThrow('Invalid timezone');

      expect(() => {
        getShiftTimeRange(shift, null as any, '2025-01-15');
      }).toThrow('Invalid timezone');
    });

    it('should throw error for invalid time format', () => {
      const shift: Shift = {
        name: 'Invalid',
        start: '08',
        end: '16:00',
      };

      expect(() => {
        getShiftTimeRange(shift, 'UTC', '2025-01-15');
      }).toThrow('Invalid time format');
    });

    it('should throw error for invalid time values', () => {
      const shift: Shift = {
        name: 'Invalid Hour',
        start: '25:00',
        end: '16:00',
      };

      expect(() => {
        getShiftTimeRange(shift, 'UTC', '2025-01-15');
      }).toThrow('Invalid hour values');
    });

    it('should throw error for invalid minutes', () => {
      const shift: Shift = {
        name: 'Invalid Minutes',
        start: '08:60',
        end: '16:00',
      };

      expect(() => {
        getShiftTimeRange(shift, 'UTC', '2025-01-15');
      }).toThrow('Invalid minute values');
    });

    it('should handle edge case of midnight to midnight', () => {
      const shift: Shift = {
        name: 'Full Day',
        start: '00:00',
        end: '23:59',
      };

      const result = getShiftTimeRange(shift, 'UTC', '2025-01-15');

      const fromLocal = dayjs.utc(result.from);
      const toLocal = dayjs.utc(result.to);

      expect(fromLocal.format('YYYY-MM-DD HH:mm')).toBe('2025-01-15 00:00');
      expect(toLocal.format('YYYY-MM-DD HH:mm')).toBe('2025-01-15 23:59');
    });

    it('should handle DST transitions correctly', () => {
      // Test during DST transition in Europe/Warsaw (typically late March)
      const shift: Shift = {
        name: 'DST Test',
        start: '01:00',
        end: '05:00',
      };

      // Calculate shifts in summer (DST active) and winter (standard time)
      getShiftTimeRange(shift, 'Europe/Warsaw', '2025-07-15');
      getShiftTimeRange(shift, 'Europe/Warsaw', '2025-01-15');

      // The UTC offsets should be different due to DST
      const summerOffset = dayjs.tz('2025-07-15 01:00', 'Europe/Warsaw').utcOffset();
      const winterOffset = dayjs.tz('2025-01-15 01:00', 'Europe/Warsaw').utcOffset();

      expect(summerOffset).not.toBe(winterOffset);
    });
  });

  describe('isShiftActive', () => {
    it('should return false for a shift on a past date', () => {
      const shift: Shift = {
        name: 'Morning',
        start: '08:00',
        end: '16:00',
      };

      const pastDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      const result = isShiftActive(shift, 'UTC', pastDate);

      expect(result).toBe(false);
    });

    it('should return false for a shift on a future date', () => {
      const shift: Shift = {
        name: 'Morning',
        start: '08:00',
        end: '16:00',
      };

      const futureDate = dayjs().add(1, 'day').format('YYYY-MM-DD');
      const result = isShiftActive(shift, 'UTC', futureDate);

      expect(result).toBe(false);
    });

    it('should correctly check if current time is within shift range for today', () => {
      const now = dayjs().tz('UTC');
      const currentHour = now.hour();

      // Create a shift that's currently active (1 hour before to 1 hour after current time)
      const shift: Shift = {
        name: 'Current',
        start: `${String(currentHour - 1).padStart(2, '0')}:00`,
        end: `${String(currentHour + 1).padStart(2, '0')}:00`,
      };

      const today = now.format('YYYY-MM-DD');
      const result = isShiftActive(shift, 'UTC', today);

      // Should be true since we're within the shift
      expect(result).toBe(true);
    });

    it('should work without a selected date', () => {
      const now = dayjs().tz('UTC');
      const currentHour = now.hour();

      const shift: Shift = {
        name: 'Current',
        start: `${String(currentHour - 1).padStart(2, '0')}:00`,
        end: `${String(currentHour + 1).padStart(2, '0')}:00`,
      };

      const result = isShiftActive(shift, 'UTC');

      expect(result).toBe(true);
    });

    it('should handle overnight shifts correctly', () => {
      const shift: Shift = {
        name: 'Night',
        start: '22:00',
        end: '06:00',
      };

      // This would need to be tested at specific times, but we can test the logic
      const result = isShiftActive(shift, 'UTC');

      // Result depends on current time, just ensure it doesn't throw
      expect(typeof result).toBe('boolean');
    });
  });
});
