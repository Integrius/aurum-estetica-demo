'use client';

import { useEffect, useState } from 'react';

/**
 * Guardas de movimento, centralizadas.
 *
 * Nenhum componente de animação deste projeto decide por conta própria se pode
 * animar — todos perguntam aqui. Isso é o que garante que prefers-reduced-motion
 * e o corte de viewport sejam respeitados sem depender de ninguém lembrar.
 *
 * Começa em `false` no servidor e na primeira renderização do cliente, para não
 * haver divergência de hidratação. O efeito roda logo depois e liga o que puder.
 */
export function useMotionGuards() {
  const [semMovimento, setSemMovimento] = useState(false);
  const [ehDesktop, setEhDesktop] = useState(false);

  useEffect(() => {
    const mqMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqDesktop = window.matchMedia('(min-width: 1024px)');

    const sincronizar = () => {
      setSemMovimento(mqMovimento.matches);
      setEhDesktop(mqDesktop.matches);
    };

    sincronizar();
    mqMovimento.addEventListener('change', sincronizar);
    mqDesktop.addEventListener('change', sincronizar);
    return () => {
      mqMovimento.removeEventListener('change', sincronizar);
      mqDesktop.removeEventListener('change', sincronizar);
    };
  }, []);

  return {
    semMovimento,
    ehDesktop,
    /** Efeitos pesados (preso, ligado ao scroll, 3D) só quando isto é true. */
    animar: ehDesktop && !semMovimento,
  };
}
