import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { GET as listServices } from '@/app/api/services/route';
import { GET as getServiceBySlug } from '@/app/api/services/[slug]/route';

const fixture = {
  id: 'svc_1',
  name: 'Limpeza de Pele Profunda',
  slug: 'limpeza-de-pele-profunda',
  category: 'Facial',
  description: 'Higienização, esfoliação e extração.',
  duration: 60,
  price: { toNumber: () => 220 },
};

describe('GET /api/services', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the list of services with price as a number', async () => {
    (prisma.service.findMany as any).mockResolvedValue([fixture]);
    const response = await listServices();
    const body = await response.json();
    expect(body.services).toEqual([
      {
        id: 'svc_1',
        name: 'Limpeza de Pele Profunda',
        slug: 'limpeza-de-pele-profunda',
        category: 'Facial',
        description: 'Higienização, esfoliação e extração.',
        duration: 60,
        price: 220,
      },
    ]);
  });
});

describe('GET /api/services/[slug]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the service when the slug exists', async () => {
    (prisma.service.findUnique as any).mockResolvedValue(fixture);
    const response = await getServiceBySlug(new Request('http://localhost/api/services/limpeza-de-pele-profunda'), {
      params: Promise.resolve({ slug: 'limpeza-de-pele-profunda' }),
    });
    const body = await response.json();
    expect(body.slug).toBe('limpeza-de-pele-profunda');
    expect(response.status).toBe(200);
  });

  it('returns 404 when the slug does not exist', async () => {
    (prisma.service.findUnique as any).mockResolvedValue(null);
    const response = await getServiceBySlug(new Request('http://localhost/api/services/nao-existe'), {
      params: Promise.resolve({ slug: 'nao-existe' }),
    });
    expect(response.status).toBe(404);
  });
});
