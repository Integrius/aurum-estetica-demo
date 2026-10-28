export interface WorkingHours {
  weekday: number;
  startMinute: number;
  endMinute: number;
}

export interface BusySlot {
  startAt: Date;
  endAt: Date;
}

export interface AvailabilityInput {
  date: Date;
  durationMinutes: number;
  workingHours: WorkingHours[];
  busySlots: BusySlot[];
  slotIncrementMinutes?: number;
}

export function getAvailableSlots(input: AvailabilityInput): Date[] {
  const { date, durationMinutes, workingHours, busySlots, slotIncrementMinutes = 30 } = input;
  const weekday = date.getDay();
  const dayHours = workingHours.find((wh) => wh.weekday === weekday);
  if (!dayHours) return [];

  const slots: Date[] = [];
  for (
    let minute = dayHours.startMinute;
    minute + durationMinutes <= dayHours.endMinute;
    minute += slotIncrementMinutes
  ) {
    const slotStart = new Date(date);
    slotStart.setHours(0, minute, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

    const overlaps = busySlots.some((busy) => slotStart < busy.endAt && slotEnd > busy.startAt);

    if (!overlaps) {
      slots.push(slotStart);
    }
  }

  return slots;
}
