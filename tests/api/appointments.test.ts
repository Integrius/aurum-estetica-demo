import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: { findUnique: vi.fn() },
    professional: { findFirst: vi.fn() },
    appointment: { findFirst: vi.fn(), create: vi.fn() },
    client: { upsert: vi.fn() },
    $transaction: vi.fn(async (callback: (tx: any) => Promise<any>) => {
      const mockTx = {
        appointment: {
          findFirst: vi.fn(),
          create: vi.fn(),
        },
        client: {
          upsert: vi.fn(),
        },
      };
      return callback(mockTx);
    }),
  },
}));

import { prisma } from '@/lib/prisma';
import { POST as createAppointment } from '@/app/api/appointments/route';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** A local-time ISO-ish string N days from now at the given hour:minute. */
function futureLocalDateTime(daysAhead: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, minute, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

// The professional works 09:00–18:00 every weekday of the week.
const allWeekWorkingHours = Array.from({ length: 7 }, (_, weekday) => ({
  weekday,
  startMinute: 9 * 60,
  endMinute: 18 * 60,
}));

const validBody = {
  serviceId: 'svc_1',
  professionalId: 'pro_1',
  startAt: futureLocalDateTime(1, 9),
  client: { name: 'Ana Souza', phone: '+5511999999999', email: 'ana@example.com' },
};

function mockHappyPathLookups() {
  (prisma.service.findUnique as any).mockResolvedValue({ id: 'svc_1', duration: 60 });
  (prisma.professional.findFirst as any).mockResolvedValue({
    id: 'pro_1',
    workingHours: allWeekWorkingHours,
  });
}

function mockSuccessfulTransaction() {
  (prisma.$transaction as any).mockImplementationOnce(async (callback: (tx: any) => Promise<any>) => {
    const mockTx = {
      appointment: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: 'apt_1',
          startAt: new Date(validBody.startAt),
          endAt: new Date(new Date(validBody.startAt).getTime() + 60 * 60000),
          status: 'confirmed',
        }),
      },
      client: {
        upsert: vi.fn().mockResolvedValue({ id: 'cli_1' }),
      },
    };
    return callback(mockTx);
  });
}

describe('POST /api/appointments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 for an invalid body', async () => {
    const response = await createAppointment(makeRequest({ serviceId: 'svc_1' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 for an invalid startAt date', async () => {
    const response = await createAppointment(makeRequest({ ...validBody, startAt: 'not-a-date' }));
    expect(response.status).toBe(400);
  });

  it('returns 404 when the service does not exist', async () => {
    (prisma.service.findUnique as any).mockResolvedValue(null);
    const response = await createAppointment(makeRequest(validBody));
    expect(response.status).toBe(404);
  });

  it('returns 400 for a startAt in the past', async () => {
    mockHappyPathLookups();
    const response = await createAppointment(makeRequest({ ...validBody, startAt: futureLocalDateTime(-1, 9) }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when the professional does not offer the service', async () => {
    (prisma.service.findUnique as any).mockResolvedValue({ id: 'svc_1', duration: 60 });
    (prisma.professional.findFirst as any).mockResolvedValue(null);

    const response = await createAppointment(makeRequest(validBody));
    expect(response.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns 400 for a slot outside the professional working hours', async () => {
    mockHappyPathLookups();

    const response = await createAppointment(makeRequest({ ...validBody, startAt: futureLocalDateTime(1, 3) }));
    expect(response.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns 400 when the professional does not work that weekday', async () => {
    (prisma.service.findUnique as any).mockResolvedValue({ id: 'svc_1', duration: 60 });
    const startAt = futureLocalDateTime(1, 9);
    const closedWeekday = new Date(startAt).getDay();
    (prisma.professional.findFirst as any).mockResolvedValue({
      id: 'pro_1',
      workingHours: allWeekWorkingHours.filter((wh) => wh.weekday !== closedWeekday),
    });

    const response = await createAppointment(makeRequest({ ...validBody, startAt }));
    expect(response.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns 409 when the slot collides with an existing appointment', async () => {
    mockHappyPathLookups();

    // Mock $transaction to simulate collision
    (prisma.$transaction as any).mockImplementationOnce(async (callback: (tx: any) => Promise<any>) => {
      const mockTx = {
        appointment: {
          findFirst: vi.fn().mockResolvedValue({ id: 'existing' }),
          create: vi.fn(),
        },
        client: {
          upsert: vi.fn(),
        },
      };
      return callback(mockTx);
    });

    const response = await createAppointment(makeRequest(validBody));
    expect(response.status).toBe(409);
  });

  it('returns 409 on transaction write conflict (P2034)', async () => {
    mockHappyPathLookups();

    // Mock $transaction to throw P2034 error (Serializable conflict)
    (prisma.$transaction as any).mockImplementationOnce(async () => {
      const error = new Error('Transaction failed due to write conflict');
      (error as any).code = 'P2034';
      throw error;
    });

    const response = await createAppointment(makeRequest(validBody));
    expect(response.status).toBe(409);
  });

  it('creates the client and appointment and returns 201', async () => {
    mockHappyPathLookups();
    mockSuccessfulTransaction();

    const response = await createAppointment(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.appointment.status).toBe('confirmed');
  });
});
