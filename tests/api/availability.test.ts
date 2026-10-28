import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: { findUnique: vi.fn() },
    appointment: { findMany: vi.fn() },
  },
}));

import { prisma } from '@/lib/prisma';
import { GET as getAvailability } from '@/app/api/availability/route';

describe('GET /api/availability', () => {
  beforeEach(() => vi.clearAllMocks());

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 400 when serviceId or date is missing', async () => {
    const response = await getAvailability(new Request('http://localhost/api/availability?date=2026-08-24'));
    expect(response.status).toBe(400);
  });

  it('returns available slots per professional for the given service and date', async () => {
    // M2: getAvailableSlots agora é filtrada por "slot > agora" na rota, então
    // o relógio precisa estar fixado antes de 2026-08-24T09:00 para os três
    // horários esperados continuarem no futuro.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-24T06:00:00'));

    (prisma.service.findUnique as any).mockResolvedValue({
      id: 'svc_1',
      duration: 60,
      professionals: [
        {
          professional: {
            id: 'pro_1',
            name: 'Dra. Camila Duarte',
            photoUrl: '/img/equipe/camila.webp',
            workingHours: [{ weekday: 1, startMinute: 9 * 60, endMinute: 11 * 60 }],
          },
        },
      ],
    });
    (prisma.appointment.findMany as any).mockResolvedValue([]);

    const response = await getAvailability(
      new Request('http://localhost/api/availability?serviceId=svc_1&date=2026-08-24')
    );
    const body = await response.json();

    expect(body.options).toEqual([
      {
        professionalId: 'pro_1',
        professionalName: 'Dra. Camila Duarte',
        professionalPhotoUrl: '/img/equipe/camila.webp',
        slots: ['2026-08-24T09:00:00.000', '2026-08-24T09:30:00.000', '2026-08-24T10:00:00.000'],
      },
    ]);
  });

  it('returns professionalPhotoUrl as null when the professional has no photo', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-24T06:00:00'));

    (prisma.service.findUnique as any).mockResolvedValue({
      id: 'svc_1',
      duration: 60,
      professionals: [
        {
          professional: {
            id: 'pro_2',
            name: 'Rafael Teixeira',
            photoUrl: null,
            workingHours: [{ weekday: 1, startMinute: 9 * 60, endMinute: 10 * 60 + 30 }],
          },
        },
      ],
    });
    (prisma.appointment.findMany as any).mockResolvedValue([]);

    const response = await getAvailability(
      new Request('http://localhost/api/availability?serviceId=svc_1&date=2026-08-24')
    );
    const body = await response.json();

    expect(body.options[0].professionalPhotoUrl).toBeNull();
  });

  it('M2: does not offer slots that have already passed today', async () => {
    // "Hoje" é 2026-08-24 (segunda-feira, weekday 1); o relógio fica fixado
    // às 09:45, então o slot das 09:00 já passou mas o das 09:30 ainda não.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-24T09:45:00'));

    (prisma.service.findUnique as any).mockResolvedValue({
      id: 'svc_1',
      duration: 30,
      professionals: [
        {
          professional: {
            id: 'pro_1',
            name: 'Dra. Camila Duarte',
            photoUrl: null,
            workingHours: [{ weekday: 1, startMinute: 9 * 60, endMinute: 11 * 60 }],
          },
        },
      ],
    });
    (prisma.appointment.findMany as any).mockResolvedValue([]);

    const response = await getAvailability(
      new Request('http://localhost/api/availability?serviceId=svc_1&date=2026-08-24')
    );
    const body = await response.json();

    expect(body.options[0].slots).not.toContain('2026-08-24T09:00:00.000');
    expect(body.options[0].slots[0]).toBe('2026-08-24T10:00:00.000');
  });
});
