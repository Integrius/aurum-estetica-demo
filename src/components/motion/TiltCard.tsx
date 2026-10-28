'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { MouseEvent, ReactNode } from 'react';
import { useMotionGuards } from './useMotionGuards';

export function TiltCard({
  children,
  className = '',
  intensidade = 8,
}: {
  children: ReactNode;
  className?: string;
  intensidade?: number;
}) {
  const { animar } = useMotionGuards();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Máximo de ~4° por lado. Acima disso o efeito passa de sofisticado a enjoativo.
  const rotateY = useSpring(useTransform(x, [0, 1], [-intensidade / 2, intensidade / 2]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateX = useSpring(useTransform(y, [0, 1], [intensidade / 2, -intensidade / 2]), {
    stiffness: 200,
    damping: 20,
  });

  function aoMover(evento: MouseEvent<HTMLDivElement>) {
    if (!animar) return;
    const r = evento.currentTarget.getBoundingClientRect();
    const px = (evento.clientX - r.left) / r.width;
    const py = (evento.clientY - r.top) / r.height;
    x.set(px);
    y.set(py);
    evento.currentTarget.style.setProperty('--mx', `${px * 100}%`);
    evento.currentTarget.style.setProperty('--my', `${py * 100}%`);
  }

  function aoSair() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <motion.div
      onMouseMove={aoMover}
      onMouseLeave={aoSair}
      style={animar ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      className={`group relative overflow-hidden transition-shadow duration-300 hover:shadow-[0_30px_60px_-24px_rgba(31,27,24,0.45)] ${className}`}
    >
      {/* Brilho seguindo o cursor. Inerte em touch, que não tem hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgba(192,133,82,0.22), transparent 62%)',
        }}
      />
      {children}
    </motion.div>
  );
}
