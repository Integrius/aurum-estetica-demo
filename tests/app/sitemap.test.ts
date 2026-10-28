import { describe, it, expect, vi } from 'vitest';
import { SITE } from '@/content/site';

const mockServiceFindMany = vi.hoisted(() =>
  vi.fn().mockResolvedValue([
    { slug: 'limpeza-de-pele', updatedAt: new Date('2026-08-01T00:00:00Z') },
  ]),
);
const mockPostFindMany = vi.hoisted(() =>
  vi.fn().mockResolvedValue([
    { slug: 'pele-no-inverno', updatedAt: new Date('2026-07-28T00:00:00Z') },
  ]),
);

vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: { findMany: mockServiceFindMany },
    post: { findMany: mockPostFindMany },
  },
}));

import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

describe('sitemap', () => {
  it('inclui todas as rotas estáticas, incluindo /zevro', async () => {
    const entradas = await sitemap();
    const urls = entradas.map((e) => e.url);

    for (const rota of [
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
    ]) {
      expect(urls).toContain(`${SITE.url}${rota}`);
    }
  });

  it('inclui os serviços do banco, com a URL de detalhe e o updatedAt real', async () => {
    const entradas = await sitemap();
    const entrada = entradas.find((e) => e.url === `${SITE.url}/servicos/limpeza-de-pele`);
    expect(entrada).toBeDefined();
    expect(entrada?.lastModified).toEqual(new Date('2026-08-01T00:00:00Z'));
  });

  it('inclui os posts publicados do banco, com a URL de detalhe e o updatedAt real', async () => {
    const entradas = await sitemap();
    const entrada = entradas.find((e) => e.url === `${SITE.url}/diario/pele-no-inverno`);
    expect(entrada).toBeDefined();
    expect(entrada?.lastModified).toEqual(new Date('2026-07-28T00:00:00Z'));
  });

  it('busca posts com o filtro de postsPublicadosWhere ("publishedAt <= agora"), não só "not null"', async () => {
    await sitemap();
    const chamada = mockPostFindMany.mock.calls.at(-1)?.[0];
    expect(chamada.where).toEqual({ publishedAt: { lte: expect.any(Date) } });
    expect(chamada.where.publishedAt.lte.getTime()).toBeLessThanOrEqual(Date.now());
    expect(chamada.where.publishedAt.not).toBeUndefined();
  });
});

describe('robots', () => {
  it('bloqueia /admin/ e /api/, e aponta para o sitemap em SITE.url', () => {
    const resultado = robots();
    expect(resultado.rules).toEqual(
      expect.objectContaining({ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] }),
    );
    expect(resultado.sitemap).toBe(`${SITE.url}/sitemap.xml`);
  });
});
