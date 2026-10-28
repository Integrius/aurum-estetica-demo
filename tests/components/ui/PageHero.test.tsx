import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHero } from '@/components/ui/PageHero';

function mockMatchMedia(respostas: Record<string, boolean>) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: respostas[query] ?? false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  );
}

const LINHAS = ['Cuidado', 'que se vê', 'na pele'];

describe('PageHero', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('sob movimento reduzido, cada linha aparece em um <span> estático sem estilo de animação', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true });
    const { container } = render(
      <PageHero linhas={LINHAS} imagem="/img/hero/principal.webp" alt="Ambiente da clínica" />,
    );

    for (const linha of LINHAS) {
      expect(screen.getByText(linha)).toBeInTheDocument();
    }

    // Um .line-mask por linha; o filho direto é o span estático (sem
    // motion.span), que não recebe style inline nenhum.
    const wrappers = container.querySelectorAll('.line-mask');
    expect(wrappers).toHaveLength(LINHAS.length);
    wrappers.forEach((wrapper) => {
      const filho = wrapper.firstElementChild;
      expect(filho?.tagName).toBe('SPAN');
      expect(filho?.getAttribute('style')).toBeNull();
    });
  });

  it('com movimento permitido, cada linha ainda aparece no DOM, agora dentro do motion.span animado', () => {
    mockMatchMedia({ '(min-width: 1024px)': true });
    const { container } = render(
      <PageHero linhas={LINHAS} imagem="/img/hero/principal.webp" alt="Ambiente da clínica" />,
    );

    // Requisito de SEO/leitor de tela (restrição global 7): nenhum texto
    // nasce só da animação — o conteúdo tem que estar no DOM desde o início,
    // mesmo que a posição inicial (y: '115%') o desloque visualmente.
    for (const linha of LINHAS) {
      expect(screen.getByText(linha)).toBeInTheDocument();
    }

    const wrappers = container.querySelectorAll('.line-mask');
    expect(wrappers).toHaveLength(LINHAS.length);
    wrappers.forEach((wrapper) => {
      const filho = wrapper.firstElementChild;
      // framer-motion aplica o estado `initial` como style inline já no
      // primeiro render — distingue do branch estático, que nunca tem
      // atributo `style`.
      expect(filho?.getAttribute('style')).toMatch(/transform|translate/);
    });
  });

  it('altura="cheia" aplica min-h-[100svh]; altura="media" (default) aplica min-h-[70svh]', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true });

    const { container: cheia } = render(
      <PageHero linhas={LINHAS} imagem="/img/hero/principal.webp" alt="Ambiente" altura="cheia" />,
    );
    const secaoCheia = cheia.querySelector('section');
    expect(secaoCheia?.className).toContain('min-h-[100svh]');
    expect(secaoCheia?.className).not.toContain('min-h-[70svh]');

    const { container: media } = render(
      <PageHero linhas={LINHAS} imagem="/img/hero/principal.webp" alt="Ambiente" />,
    );
    const secaoMedia = media.querySelector('section');
    expect(secaoMedia?.className).toContain('min-h-[70svh]');
    expect(secaoMedia?.className).not.toContain('min-h-[100svh]');
  });

  it('omite eyebrow, subtítulo e children quando não fornecidos', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true });
    render(<PageHero linhas={LINHAS} imagem="/img/hero/principal.webp" alt="Ambiente" />);

    expect(screen.queryByText('Aurum Estética Avançada')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Protocolos faciais e corporais conduzidos por especialistas.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renderiza eyebrow, subtítulo e children quando fornecidos', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true });
    render(
      <PageHero
        eyebrow="Aurum Estética Avançada"
        linhas={LINHAS}
        subtitulo="Protocolos faciais e corporais conduzidos por especialistas."
        imagem="/img/hero/principal.webp"
        alt="Ambiente"
      >
        <a href="/agendamento">Agendar avaliação</a>
      </PageHero>,
    );

    expect(screen.getByText('Aurum Estética Avançada')).toBeInTheDocument();
    expect(
      screen.getByText('Protocolos faciais e corporais conduzidos por especialistas.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Agendar avaliação' })).toHaveAttribute(
      'href',
      '/agendamento',
    );
  });

  it('a imagem do hero sai com fetchpriority="high" e sem loading="lazy" (LCP de toda página)', () => {
    // Regressão do fix round 1 da Tarefa 17: `priority`/`preload` sozinhas não
    // marcam a prioridade de rede da imagem no Next 16 (doc do pacote,
    // node_modules/next/dist/docs/.../image.md, seção `preload`) — precisa de
    // `fetchPriority="high"` explícito, sem combinar com `preload`.
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true });
    render(<PageHero linhas={LINHAS} imagem="/img/hero/principal.webp" alt="Ambiente" />);

    const imagem = screen.getByAltText('Ambiente');
    expect(imagem).toHaveAttribute('fetchpriority', 'high');
    expect(imagem).not.toHaveAttribute('loading', 'lazy');
  });
});
