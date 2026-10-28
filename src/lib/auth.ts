import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function authorize(
  credentials: { email: string; password: string } | undefined
): Promise<{ id: string; email: string; name: string } | null> {
  if (!credentials) return null;

  const admin = await prisma.adminUser.findUnique({ where: { email: credentials.email } });
  if (!admin) return null;

  const valid = await bcrypt.compare(credentials.password, admin.passwordHash);
  if (!valid) return null;

  return { id: admin.id, email: admin.email, name: admin.name };
}

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      authorize: (credentials) => authorize(credentials as { email: string; password: string } | undefined),
    }),
  ],
};
