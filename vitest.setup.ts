import '@testing-library/jest-dom/vitest';

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - jsdom has no IntersectionObserver; framer-motion's whileInView needs one to exist.
globalThis.IntersectionObserver = IntersectionObserverStub;

// jsdom has no matchMedia either, e useMotionGuards() (src/components/motion) chama
// window.matchMedia em todo componente de movimento — Reveal incluso, que substituiu o
// FadeIn antigo em toda a árvore de páginas. Sem este stub, qualquer teste de página que
// renderize um componente de motion quebra com "window.matchMedia is not a function",
// mesmo sem testar comportamento de movimento. Testes que precisam simular um valor
// específico (ex. tests/components/motion.test.tsx) sobrescrevem com vi.stubGlobal e
// desfazem com vi.unstubAllGlobals(), que restaura este default.
//
// Pegadinha para as Tarefas 6+ (que vão consumir estas primitivas em páginas
// novas): o default abaixo é `matches: false` para QUALQUER query, inclusive
// `(min-width: 1024px)`. Um teste que renderize Reveal/ProgressBar/ScrollHint/
// StickyStory/DrawLine/TiltCard sem mockar matchMedia explicitamente vai
// sempre cair no ramo `ehDesktop = false` (e portanto `animar = false`) —
// nunca vai exercitar o layout/efeito de desktop. Se o teste precisa cobrir o
// ramo desktop, mocke com vi.stubGlobal('matchMedia', ...) retornando
// `matches: true` para `(min-width: 1024px)`, como em tests/components/
// motion.test.tsx.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
