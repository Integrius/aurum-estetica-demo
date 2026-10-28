import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import type { NextRequestWithAuth } from 'next-auth/middleware';

const protectPages = withAuth({
  pages: { signIn: '/admin/login' },
});

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  // API routes must answer with a 401 JSON body. Letting withAuth redirect them to
  // the login page makes a failed write look like a 200 OK to `fetch`.
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Page routes keep the redirect-to-login behaviour.
  return protectPages(request as NextRequestWithAuth, event);
}

export const config = {
  matcher: [
    '/admin/agendamentos/:path*',
    '/admin/servicos/:path*',
    '/admin/profissionais/:path*',
    '/admin/diario/:path*',
    '/api/admin/:path*',
  ],
};
