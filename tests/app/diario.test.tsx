import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const postPublicado = vi.hoisted(() => ({
  id: 'post_1',
  slug: 'pele-no-inverno',
  title: 'Por que sua pele muda no inverno',
  excerpt: 'Ar seco, banho quente e aquecedor formam a combinação que mais destrói barreira cutânea.',
  body: '## O que acontece com a barreira\n\nUmidade baixa acelera a perda de água pela pele.\n\n## Três ajustes que resolvem a maior parte\n\nBanho mais morno e mais curto, hidratante e protetor solar.',
  coverUrl: '/img/diario/inverno.webp',
  tags: ['sazonal', 'barreira cutânea'],
  publishedAt: new Date('2026-07-28T10:00:00Z'),
}));

// Post com data de publicação no futuro (possível pelo date picker do admin) —
// não pode ficar público antes da hora.
const postAgendado = vi.hoisted(() => ({
  id: 'post_2',
  slug: 'post-agendado',
  title: 'Post agendado para o futuro',
  excerpt: 'Este texto ainda não deveria estar no ar.',
  body: '## Ainda não\n\nEste conteúdo está agendado e não pode vazar antes da data.',
  coverUrl: '/img/diario/sessoes.webp',
  tags: [],
  publishedAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 dias no futuro
}));

// Rascunho — sem data de publicação.
const postRascunho = vi.hoisted(() => ({
  id: 'post_3',
  slug: 'post-rascunho',
  title: 'Rascunho ainda não publicado',
  excerpt: 'Este texto está em rascunho.',
  body: '## Rascunho\n\nEste conteúdo ainda não foi publicado.',
  coverUrl: '/img/diario/skincare.webp',
  tags: [],
  publishedAt: null,
}));

const mockFindMany = vi.hoisted(() => vi.fn().mockResolvedValue([postPublicado]));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: mockFindMany,
      findUnique: vi.fn((args: { where: { slug: string } }) => {
        const todos = [postPublicado, postAgendado, postRascunho];
        return Promise.resolve(todos.find((p) => p.slug === args.where.slug) ?? null);
      }),
    },
  },
}));

import DiarioPage from '@/app/diario/page';
import PostPage, { generateMetadata } from '@/app/diario/[slug]/page';

describe('Diário listing page', () => {
  it('lista os posts publicados e a chamada do Instagram', async () => {
    render(await DiarioPage());
    expect(screen.getByText(postPublicado.title)).toBeInTheDocument();
    expect(screen.getByText('O dia a dia da clínica')).toBeInTheDocument();
  });

  it('busca só posts com publishedAt no passado (não rascunho, não agendado)', async () => {
    await DiarioPage();
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { publishedAt: { lte: expect.any(Date) } },
      }),
    );
    // A checagem tem que ser "<= agora", não só "não nulo" — senão um post
    // agendado para o futuro (publishedAt preenchido, mas adiante) apareceria.
    const chamada = mockFindMany.mock.calls.at(-1)?.[0];
    expect(chamada.where.publishedAt.lte.getTime()).toBeLessThanOrEqual(Date.now());
    expect(chamada.where.publishedAt.not).toBeUndefined();
  });
});

describe('Post detail page', () => {
  it('devolve notFound (404) para slug inexistente', async () => {
    await expect(
      PostPage({ params: Promise.resolve({ slug: 'slug-que-nao-existe' }) }),
    ).rejects.toThrow(/404/);
  });

  it('devolve notFound (404) para post com publishedAt no futuro (agendado)', async () => {
    await expect(
      PostPage({ params: Promise.resolve({ slug: postAgendado.slug }) }),
    ).rejects.toThrow(/404/);
  });

  it('devolve notFound (404) para post em rascunho (publishedAt nulo)', async () => {
    await expect(
      PostPage({ params: Promise.resolve({ slug: postRascunho.slug }) }),
    ).rejects.toThrow(/404/);
  });

  it('renderiza os "## título" do corpo como <h2>, e o JSON-LD Article', async () => {
    render(await PostPage({ params: Promise.resolve({ slug: postPublicado.slug }) }));

    // Os dois primeiros <h2> vêm do "## título" do corpo; o terceiro é o
    // título do CTA fixo no fim da página (não faz parte do markdown).
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.slice(0, 2).map((h) => h.textContent)).toEqual([
      'O que acontece com a barreira',
      'Três ajustes que resolvem a maior parte',
    ]);

    // Parágrafos de texto corrido também devem estar no DOM inicial.
    expect(screen.getByText(/Umidade baixa acelera a perda de água/)).toBeInTheDocument();

    const scriptTag = document.querySelector('script[type="application/ld+json"]');
    expect(scriptTag).not.toBeNull();
    const jsonLd = JSON.parse(scriptTag!.innerHTML);
    expect(jsonLd['@type']).toBe('Article');
    expect(jsonLd.headline).toBe(postPublicado.title);
    expect(jsonLd.url).toContain(`/diario/${postPublicado.slug}`);
  });
});

describe('generateMetadata de /diario/[slug]', () => {
  it('expõe título e resumo de um post publicado', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: postPublicado.slug }),
    });
    expect(metadata.title).toContain(postPublicado.title);
    expect(metadata.description).toBe(postPublicado.excerpt);
  });

  it('NÃO expõe título/resumo de um post agendado para o futuro', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: postAgendado.slug }),
    });
    expect(metadata.title).not.toContain(postAgendado.title);
    expect(metadata.description).not.toBe(postAgendado.excerpt);
  });

  it('NÃO expõe título/resumo de um post em rascunho', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: postRascunho.slug }),
    });
    expect(metadata.title).not.toContain(postRascunho.title);
    expect(metadata.description).not.toBe(postRascunho.excerpt);
  });
});
