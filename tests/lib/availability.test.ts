import { describe, it, expect } from 'vitest';
import { getAvailableSlots } from '@/lib/availability';

const MONDAY = new Date('2026-08-24T00:00:00');

describe('getAvailableSlots', () => {
  it('returns no slots when there are no working hours for that weekday', () => {
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMinutes: 60,
      workingHours: [{ weekday: 2, startMinute: 9 * 60, endMinute: 18 * 60 }],
      busySlots: [],
    });
    expect(slots).toEqual([]);
  });

  it('returns evenly spaced slots across an open day with no bookings', () => {
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMinutes: 60,
      workingHours: [{ weekday: 1, startMinute: 9 * 60, endMinute: 10 * 60 + 30 }],
      busySlots: [],
      slotIncrementMinutes: 30,
    });
    expect(slots.map((s) => s.toTimeString().slice(0, 5))).toEqual(['09:00', '09:30']);
  });

  it('excludes slots that overlap an existing appointment', () => {
    const busyStart = new Date('2026-08-24T09:30:00');
    const busyEnd = new Date('2026-08-24T10:30:00');
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMinutes: 60,
      workingHours: [{ weekday: 1, startMinute: 9 * 60, endMinute: 12 * 60 }],
      busySlots: [{ startAt: busyStart, endAt: busyEnd }],
      slotIncrementMinutes: 30,
    });
    expect(slots.map((s) => s.toTimeString().slice(0, 5))).toEqual(['10:30', '11:00']);
  });

  it('excludes a slot whose duration would run past closing time', () => {
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMinutes: 90,
      workingHours: [{ weekday: 1, startMinute: 9 * 60, endMinute: 10 * 60 + 30 }],
      busySlots: [],
      slotIncrementMinutes: 30,
    });
    expect(slots.map((s) => s.toTimeString().slice(0, 5))).toEqual(['09:00']);
  });
});
