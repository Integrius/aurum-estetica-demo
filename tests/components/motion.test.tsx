import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from '@/components/motion/Reveal';
import { ProgressBar } from '@/components/motion/ProgressBar';
import { ScrollHint } from '@/components/motion/ScrollHint';
import { StickyStory, quadrosDoCapitulo } from '@/components/motion/StickyStory';

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

const CAPITULOS = [
  { imagem: '/img/ambiente/recepcao.webp', alt: 'Recepção', titulo: 'Avaliação', texto: 'Primeiro passo.' },
  { imagem: '/img/ambiente/sala.webp', alt: 'Sala', titulo: 'Protocolo', texto: 'Segundo passo.' },
];

describe('Reveal', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('renderiza o conteúdo mesmo com movimento reduzido, sem estilo de animação aplicado', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true });
    const { container } = render(<Reveal><p>conteúdo visível</p></Reveal>);
    expect(screen.getByText('conteúdo visível')).toBeInTheDocument();
    // Distingue de "framer-motion renderizou, mas com opacity:0 inicial e
    // texto presente mesmo assim": sob movimento reduzido o wrapper é um
    // <div> puro, sem o style inline que o motion.div aplicaria.
    const wrapper = container.firstElementChild;
    expect(wrapper?.tagName).toBe('DIV');
    expect(wrapper?.getAttribute('style')).toBeNull();
  });

  it('aplica o estado inicial de animação (opacity/transform) quando o movimento é permitido', () => {
    mockMatchMedia({ '(min-width: 1024px)': true });
    const { container } = render(<Reveal><p>conteúdo visível</p></Reveal>);
    expect(screen.getByText('conteúdo visível')).toBeInTheDocument();
    // Falharia se a guarda fosse removida e Reveal sempre caísse no branch
    // "sem animação": aqui o motion.div aplica opacity/transform inline
    // porque o IntersectionObserver stubado nunca dispara "em vista".
    const wrapper = container.firstElementChild;
    expect(wrapper?.getAttribute('style')).toMatch(/opacity/);
  });
});

describe('ProgressBar', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('não renderiza a barra ligada ao scroll abaixo de 1024px', () => {
    // Guarda global 6: viewport < 1024px não recebe efeito ligado ao scroll,
    // mesmo sem prefers-reduced-motion. Falharia se ProgressBar voltasse a
    // checar só semMovimento (como o literal do brief fazia).
    mockMatchMedia({ '(min-width: 1024px)': false });
    render(<ProgressBar />);
    expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
  });

  it('não renderiza a barra com movimento reduzido, mesmo no desktop', () => {
    mockMatchMedia({ '(min-width: 1024px)': true, '(prefers-reduced-motion: reduce)': true });
    render(<ProgressBar />);
    expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
  });

  it('renderiza a barra ligada ao scroll no desktop, sem movimento reduzido', () => {
    mockMatchMedia({ '(min-width: 1024px)': true });
    render(<ProgressBar />);
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });
});

describe('ScrollHint', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('não anima em loop sob prefers-reduced-motion — renderiza a linha no estado final', () => {
    // Falharia se ScrollHint continuasse sem consultar useMotionGuards: a
    // classe que liga o @keyframes infinito não pode estar presente aqui.
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true });
    const { container } = render(<ScrollHint />);
    expect(container.querySelector('.scroll-hint-line')).not.toBeInTheDocument();
    // E a linha continua visível (não é um estado que esconde o indicador).
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('anima em loop quando o movimento é permitido', () => {
    mockMatchMedia({ '(min-width: 1024px)': true });
    const { container } = render(<ScrollHint />);
    expect(container.querySelector('.scroll-hint-line')).toBeInTheDocument();
  });
});

describe('StickyStory', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('mostra o texto de TODOS os capítulos no DOM inicial e usa o layout preso no desktop', () => {
    mockMatchMedia({ '(min-width: 1024px)': true });
    const { container } = render(<StickyStory capitulos={CAPITULOS} />);
    // Requisito de SEO e leitor de tela: nada nasce de animação.
    expect(screen.getByText('Primeiro passo.')).toBeInTheDocument();
    expect(screen.getByText('Segundo passo.')).toBeInTheDocument();
    // Distingue "caiu no fallback vertical" de "renderizou o layout preso
    // ligado ao scroll": só o branch animar usa a seção `sticky`, e só o
    // branch !animar usa o wrapper `.mb-16` por capítulo. Falharia se a
    // guarda fosse removida e o mobile também renderizasse o layout preso.
    expect(container.querySelector('.sticky')).toBeInTheDocument();
    expect(container.querySelector('.mb-16')).not.toBeInTheDocument();
  });

  it('mostra todos os capítulos também no mobile, em fluxo vertical comum, sem posição presa', () => {
    mockMatchMedia({ '(min-width: 1024px)': false });
    const { container } = render(<StickyStory capitulos={CAPITULOS} />);
    expect(screen.getByText('Primeiro passo.')).toBeInTheDocument();
    expect(screen.getByText('Segundo passo.')).toBeInTheDocument();
    expect(container.querySelector('.sticky')).not.toBeInTheDocument();
    expect(container.querySelector('.mb-16')).toBeInTheDocument();
  });
});

describe('quadrosDoCapitulo', () => {
  // No desktop o framer-motion acelera a opacidade ligada ao scroll via
  // Element.animate(), que lança se algum offset sair de [0, 1] ou decrescer —
  // e a exceção derruba a página inteira ("This page couldn't load").
  it.each([1, 2, 3, 4, 7])('gera offsets em [0, 1] e não decrescentes para %i capítulos', (total) => {
    for (let indice = 0; indice < total; indice++) {
      const { pontos, opacidades } = quadrosDoCapitulo(indice, total);
      expect(opacidades).toHaveLength(pontos.length);
      pontos.forEach((ponto, i) => {
        expect(ponto).toBeGreaterThanOrEqual(0);
        expect(ponto).toBeLessThanOrEqual(1);
        if (i > 0) expect(ponto).toBeGreaterThanOrEqual(pontos[i - 1]);
      });
    }
  });

  // Sem keyframe explícito em 0 e em 1, o navegador cria um implícito com o
  // valor base do elemento — e o primeiro capítulo voltava a opacidade 1 no
  // fim da rolagem, sobreposto ao último.
  it.each([1, 2, 3, 4, 7])('ancora em 0 e 1, e no fim só o último capítulo fica visível (%i)', (total) => {
    for (let indice = 0; indice < total; indice++) {
      const { pontos, opacidades } = quadrosDoCapitulo(indice, total);
      expect(pontos[0]).toBe(0);
      expect(pontos.at(-1)).toBe(1);
      expect(opacidades[0]).toBe(indice === 0 ? 1 : 0);
      expect(opacidades.at(-1)).toBe(indice === total - 1 ? 1 : 0);
    }
  });
});
