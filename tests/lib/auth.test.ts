import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: { adminUser: { findUnique: vi.fn() } },
}));
vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn() },
}));

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authorize } from '@/lib/auth';

describe('authorize', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when credentials are missing', async () => {
    expect(await authorize(undefined)).toBeNull();
  });

  it('returns null when no admin user matches the email', async () => {
    (prisma.adminUser.findUnique as any).mockResolvedValue(null);
    expect(await authorize({ email: 'nobody@x.com', password: 'x' })).toBeNull();
  });

  it('returns null when the password does not match', async () => {
    (prisma.adminUser.findUnique as any).mockResolvedValue({ id: '1', email: 'admin@x.com', passwordHash: 'hash', name: 'Admin' });
    (bcrypt.compare as any).mockResolvedValue(false);
    expect(await authorize({ email: 'admin@x.com', password: 'wrong' })).toBeNull();
  });

  it('returns the user when credentials are valid', async () => {
    (prisma.adminUser.findUnique as any).mockResolvedValue({ id: '1', email: 'admin@x.com', passwordHash: 'hash', name: 'Admin' });
    (bcrypt.compare as any).mockResolvedValue(true);
    const user = await authorize({ email: 'admin@x.com', password: 'right' });
    expect(user).toEqual({ id: '1', email: 'admin@x.com', name: 'Admin' });
  });
});
