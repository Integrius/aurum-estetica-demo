'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { useMotionGuards } from './useMotionGuards';

export function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const largura = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  const { animar } = useMotionGuards();

  // `animar` já engloba semMovimento e ehDesktop: uma barra ligada ao scroll é
  // exatamente o tipo de efeito que a restrição global 6 proíbe abaixo de
  // 1024px, além do caso já coberto de prefers-reduced-motion.
  if (!animar) return null;

  return (
    <motion.div
      aria-hidden="true"
      data-testid="progress-bar"
      // bg-terracotta-balanced (não o padrão nem o -light): a barra fica fixa
      // no topo de toda página, que ora tem hero escuro (photo-scrim) ora fundo
      // claro (ex.: /diario/[slug], sem hero) — precisa de ≥3:1 não-textual
      // nos dois. Ver a nota em tailwind.config.ts.
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-terracotta-balanced"
      style={{ scaleX: largura }}
    />
  );
}
