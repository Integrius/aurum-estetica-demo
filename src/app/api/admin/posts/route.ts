import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const esquemaPost = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Use apenas minúsculas, números e hífens'),
  title: z.string().min(3),
  excerpt: z.string().min(10),
  body: z.string().min(20),
  // M4: um valor absoluto (https://...) faz next/image lançar em host não
  // autorizado (500 em /, /diario e no post) e vira
  // "https://beauty.zevro.apphttps://..." em OG/JSON-LD (seo.ts). Exigir "/"
  // trava a capa em caminhos locais servidos por /public.
  coverUrl: z.string().min(1).startsWith('/', 'A capa deve ser um caminho local começando com "/"'),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string().datetime().nullable().optional(),
});

async function exigirSessao() {
  const sessao = await getServerSession(authOptions);
  return Boolean(sessao);
}

export async function GET() {
  if (!(await exigirSessao())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  if (!(await exigirSessao())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const corpo = await request.json().catch(() => null);
  const validado = esquemaPost.safeParse(corpo);
  if (!validado.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', detalhes: validado.error.flatten() },
      { status: 400 },
    );
  }

  const { publishedAt, ...resto } = validado.data;

  try {
    const post = await prisma.post.create({
      data: { ...resto, publishedAt: publishedAt ? new Date(publishedAt) : null },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (erro) {
    if ((erro as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Já existe um post com esse endereço' }, { status: 409 });
    }
    throw erro;
  }
}
