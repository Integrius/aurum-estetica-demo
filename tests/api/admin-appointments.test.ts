import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: { findMany: vi.fn(), update: vi.fn() },
  },
}));

import { prisma } from '@/lib/prisma';
import { GET as listAppointments } from '@/app/api/admin/appointments/route';
import { PATCH as updateAppointmentStatus } from '@/app/api/admin/appointments/[id]/route';

describe('admin appointments API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET lists appointments for the given date with client/service/professional names', async () => {
    (prisma.appointment.findMany as any).mockResolvedValue([
      {
        id: 'apt_1',
        startAt: new Date('2026-08-24T09:00:00Z'),
        status: 'confirmed',
        client: { name: 'Ana Souza' },
        service: { name: 'Limpeza de Pele Profunda' },
        professional: { name: 'Dra. Camila Duarte' },
      },
    ]);

    const response = await listAppointments(new Request('http://localhost/api/admin/appointments?date=2026-08-24'));
    const body = await response.json();

    expect(body.appointments).toEqual([
      {
        id: 'apt_1',
        clientName: 'Ana Souza',
        serviceName: 'Limpeza de Pele Profunda',
        professionalName: 'Dra. Camila Duarte',
        startAt: '2026-08-24T09:00:00.000Z',
        status: 'confirmed',
      },
    ]);
  });

  it('GET filters by professionalId when provided', async () => {
    (prisma.appointment.findMany as any).mockResolvedValue([]);

    await listAppointments(
      new Request('http://localhost/api/admin/appointments?professionalId=pro_1')
    );

    expect(prisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ professionalId: 'pro_1' }),
      })
    );
  });

  it('GET filters by date bounds when provided', async () => {
    (prisma.appointment.findMany as any).mockResolvedValue([]);

    await listAppointments(new Request('http://localhost/api/admin/appointments?date=2026-08-24'));

    const call = (prisma.appointment.findMany as any).mock.calls[0][0];
    expect(call.where.startAt.gte).toBeInstanceOf(Date);
    expect(call.where.startAt.lte).toBeInstanceOf(Date);
    expect(call.where.startAt.gte.getFullYear()).toBe(2026);
    expect(call.where.startAt.gte.getMonth()).toBe(7); // August (0-indexed)
    expect(call.where.startAt.gte.getDate()).toBe(24);
    expect(call.where.startAt.gte.getTime()).toBeLessThan(call.where.startAt.lte.getTime());
  });

  it('GET filters by both date and professionalId when provided together', async () => {
    (prisma.appointment.findMany as any).mockResolvedValue([]);

    await listAppointments(
      new Request('http://localhost/api/admin/appointments?date=2026-08-24&professionalId=pro_2')
    );

    const call = (prisma.appointment.findMany as any).mock.calls[0][0];
    expect(call.where.professionalId).toBe('pro_2');
    expect(call.where.startAt.gte).toBeInstanceOf(Date);
    expect(call.where.startAt.lte).toBeInstanceOf(Date);
  });

  it('PATCH updates the appointment status', async () => {
    (prisma.appointment.update as any).mockResolvedValue({ id: 'apt_1', status: 'cancelled' });
    const response = await updateAppointmentStatus(
      new Request('http://localhost/api/admin/appointments/apt_1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      }),
      { params: Promise.resolve({ id: 'apt_1' }) }
    );
    expect(response.status).toBe(200);
    expect(prisma.appointment.update).toHaveBeenCalledWith({ where: { id: 'apt_1' }, data: { status: 'cancelled' } });
  });
});
