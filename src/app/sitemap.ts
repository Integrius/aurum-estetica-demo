import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE } from '@/content/site';
import { postsPublicadosWhere } from '@/lib/posts';

// Assim como as páginas que consultam o banco (ex.: src/app/diario/page.tsx),
// o sitemap não pode ser congelado em build: o build roda sem acesso ao Neon
// e a lista de serviços/posts muda depois do deploy.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [servicos, posts] = await Promise.all([
    prisma.service.findMany({ select: { slug: true, updatedAt: true } }),
    // Mesma regra de visibilidade pública das páginas /diario: publicado é
    // `publishedAt <= agora`. Rascunho ou post agendado para o futuro não
    // pode vazar no sitemap (decisão da Tarefa 13, ver src/lib/posts.ts).
    prisma.post.findMany({
      where: postsPublicadosWhere(),
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const estaticas = [
    '',
    '/servicos',
    '/resultados',
    '/equipe',
    '/pacotes',
    '/diario',
    '/sobre',
    '/contato',
    '/agendamento',
    '/zevro',
  ];

  return [
    ...estaticas.map((rota) => ({
      url: `${SITE.url}${rota}`,
      lastModified: new Date(),
      priority: rota === '' ? 1 : 0.8,
    })),
    ...servicos.map((s) => ({
      url: `${SITE.url}/servicos/${s.slug}`,
      lastModified: s.updatedAt,
      priority: 0.9,
    })),
    ...posts.map((p) => ({
      url: `${SITE.url}/diario/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.6,
    })),
  ];
}
