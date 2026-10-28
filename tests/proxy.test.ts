import { describe, it, expect, vi, beforeEach } from 'vitest';

const getToken = vi.hoisted(() => vi.fn());
const pageMiddleware = vi.hoisted(() => vi.fn());

vi.mock('next-auth/jwt', () => ({ getToken }));
vi.mock('next-auth/middleware', () => ({ withAuth: () => pageMiddleware }));

import { NextRequest } from 'next/server';
import proxy, { config } from '@/proxy';

function makeRequest(path: string) {
  return new NextRequest(new Request(`http://localhost${path}`));
}

describe('admin proxy', () => {
  beforeEach(() => vi.clearAllMocks());

  it('answers unauthenticated /api/admin requests with a 401 JSON body, not a redirect', async () => {
    getToken.mockResolvedValue(null);

    const response = await proxy(makeRequest('/api/admin/services/svc_1'), {} as never);

    expect(response?.status).toBe(401);
    expect(await (response as Response).json()).toEqual({ error: 'Não autenticado' });
    expect(pageMiddleware).not.toHaveBeenCalled();
  });

  it('lets authenticated /api/admin requests through', async () => {
    getToken.mockResolvedValue({ sub: 'admin_1' });

    const response = await proxy(makeRequest('/api/admin/services'), {} as never);

    expect(response?.status).toBe(200);
    expect(pageMiddleware).not.toHaveBeenCalled();
  });

  it('delegates admin page routes to the redirect-to-login middleware', async () => {
    pageMiddleware.mockReturnValue('delegated');

    const result = await proxy(makeRequest('/admin/agendamentos'), {} as never);

    expect(pageMiddleware).toHaveBeenCalled();
    expect(result).toBe('delegated');
    expect(getToken).not.toHaveBeenCalled();
  });

  it('still matches every protected path', () => {
    expect(config.matcher).toContain('/api/admin/:path*');
    expect(config.matcher).toContain('/admin/agendamentos/:path*');
    expect(config.matcher).toContain('/admin/servicos/:path*');
    expect(config.matcher).toContain('/admin/profissionais/:path*');
    expect(config.matcher).toContain('/admin/diario/:path*');
  });
});
