import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    professionalService: { createMany: vi.fn() },
  },
}));

import { prisma } from '@/lib/prisma';
import { GET as listServices, POST as createService } from '@/app/api/admin/services/route';
import { PATCH as updateService, DELETE as deleteService } from '@/app/api/admin/services/[id]/route';

const fixture = {
  id: 'svc_1',
  name: 'Peeling de Diamante',
  slug: 'peeling-de-diamante',
  category: 'Facial',
  description: 'Renovação celular com microcristais.',
  duration: 45,
  price: { toNumber: () => 190 },
};

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/admin/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('admin services API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET lists all services', async () => {
    (prisma.service.findMany as any).mockResolvedValue([fixture]);
    const response = await listServices();
    const body = await response.json();
    expect(body.services[0].slug).toBe('peeling-de-diamante');
    expect(body.services[0].price).toBe(190);
  });

  it('POST creates a service and derives the slug from the name', async () => {
    (prisma.service.create as any).mockResolvedValue(fixture);
    const response = await createService(
      makeRequest({ name: 'Peeling de Diamante', category: 'Facial', description: 'Renovação celular com microcristais.', duration: 45, price: 190 })
    );
    expect(response.status).toBe(201);
    expect(prisma.service.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: 'peeling-de-diamante' }) })
    );
    // professionalIds defaults to [] and must not leak into the Service payload
    expect(prisma.service.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.not.objectContaining({ professionalIds: expect.anything() }) })
    );
    expect(prisma.professionalService.createMany).not.toHaveBeenCalled();
  });

  it('POST links the new service to the selected professionals', async () => {
    (prisma.service.create as any).mockResolvedValue(fixture);
    const response = await createService(
      makeRequest({
        name: 'Peeling de Diamante',
        category: 'Facial',
        description: 'Renovação celular com microcristais.',
        duration: 45,
        price: 190,
        professionalIds: ['pro_1', 'pro_2'],
      })
    );
    expect(response.status).toBe(201);
    expect(prisma.professionalService.createMany).toHaveBeenCalledWith({
      data: [
        { professionalId: 'pro_1', serviceId: 'svc_1' },
        { professionalId: 'pro_2', serviceId: 'svc_1' },
      ],
      skipDuplicates: true,
    });
  });

  it('POST rejects a non-string professionalIds entry', async () => {
    const response = await createService(
      makeRequest({
        name: 'Peeling de Diamante',
        category: 'Facial',
        description: 'Renovação celular com microcristais.',
        duration: 45,
        price: 190,
        professionalIds: [42],
      })
    );
    expect(response.status).toBe(400);
  });

  it('PATCH updates a service by id', async () => {
    (prisma.service.update as any).mockResolvedValue({ ...fixture, price: { toNumber: () => 210 } });
    const response = await updateService(
      new Request('http://localhost/api/admin/services/svc_1', {
        method: 'PATCH',
        body: JSON.stringify({ price: 210 }),
      }),
      { params: Promise.resolve({ id: 'svc_1' }) }
    );
    expect(response.status).toBe(200);
    expect(prisma.service.update).toHaveBeenCalledWith({ where: { id: 'svc_1' }, data: { price: 210 } });
  });

  it('DELETE removes a service by id', async () => {
    (prisma.service.delete as any).mockResolvedValue(fixture);
    const response = await deleteService(new Request('http://localhost/api/admin/services/svc_1', { method: 'DELETE' }), {
      params: Promise.resolve({ id: 'svc_1' }),
    });
    expect(response.status).toBe(204);
    expect(prisma.service.delete).toHaveBeenCalledWith({ where: { id: 'svc_1' } });
  });
});
