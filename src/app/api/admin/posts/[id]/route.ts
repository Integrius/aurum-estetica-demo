import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const esquemaAtualizacao = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(3).optional(),
  excerpt: z.string().min(10).optional(),
  body: z.string().min(20).optional(),
  coverUrl: z.string().min(1).startsWith('/', 'A capa deve ser um caminho local começando com "/"').optional(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getServerSession(authOptions))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { id } = await params;

  const corpo = await request.json().catch(() => null);
  const validado = esquemaAtualizacao.safeParse(corpo);
  if (!validado.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  const { publishedAt, ...resto } = validado.data;

  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...resto,
        ...(publishedAt !== undefined
          ? { publishedAt: publishedAt ? new Date(publishedAt) : null }
          : {}),
      },
    });
    return NextResponse.json(post);
  } catch (erro) {
    const codigo = (erro as { code?: string }).code;
    if (codigo === 'P2025') return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    if (codigo === 'P2002') return NextResponse.json({ error: 'Endereço já usado' }, { status: 409 });
    throw erro;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getServerSession(authOptions))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { id } = await params;

  try {
    await prisma.post.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (erro) {
    if ((erro as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }
    throw erro;
  }
}
