import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => {
  const mockPrisma: any = {
    professional: { findMany: vi.fn(), create: vi.fn() },
    workingHour: { deleteMany: vi.fn(), createMany: vi.fn() },
  };
  mockPrisma.$transaction = vi.fn((callback: (tx: unknown) => Promise<unknown>) => callback(mockPrisma));
  return { prisma: mockPrisma };
});

import { prisma } from '@/lib/prisma';
import { GET as listProfessionals, POST as createProfessional } from '@/app/api/admin/professionals/route';
import { PATCH as updateWorkingHours } from '@/app/api/admin/professionals/[id]/route';

describe('admin professionals API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET lists professionals with working hours', async () => {
    (prisma.professional.findMany as any).mockResolvedValue([
      { id: 'pro_1', name: 'Dra. Camila Duarte', workingHours: [{ weekday: 1, startMinute: 540, endMinute: 1080 }] },
    ]);
    const response = await listProfessionals();
    const body = await response.json();
    expect(body.professionals[0].name).toBe('Dra. Camila Duarte');
  });

  it('POST creates a professional with initial working hours', async () => {
    (prisma.professional.create as any).mockResolvedValue({ id: 'pro_2' });
    const response = await createProfessional(
      new Request('http://localhost/api/admin/professionals', {
        method: 'POST',
        body: JSON.stringify({ name: 'Dr. Rafael Nogueira', workingHours: [{ weekday: 2, startMinute: 540, endMinute: 1080 }] }),
      })
    );
    expect(response.status).toBe(201);
    expect(prisma.professional.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Dr. Rafael Nogueira',
          workingHours: { create: [{ weekday: 2, startMinute: 540, endMinute: 1080 }] },
        }),
      })
    );
  });

  it('PATCH replaces the working hours for a professional', async () => {
    (prisma.workingHour.deleteMany as any).mockResolvedValue({ count: 1 });
    (prisma.workingHour.createMany as any).mockResolvedValue({ count: 1 });
    const response = await updateWorkingHours(
      new Request('http://localhost/api/admin/professionals/pro_1', {
        method: 'PATCH',
        body: JSON.stringify({ workingHours: [{ weekday: 3, startMinute: 540, endMinute: 1020 }] }),
      }),
      { params: Promise.resolve({ id: 'pro_1' }) }
    );
    expect(response.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.workingHour.deleteMany).toHaveBeenCalledWith({ where: { professionalId: 'pro_1' } });
    expect(prisma.workingHour.createMany).toHaveBeenCalledWith({
      data: [{ professionalId: 'pro_1', weekday: 3, startMinute: 540, endMinute: 1020 }],
    });
  });
});
