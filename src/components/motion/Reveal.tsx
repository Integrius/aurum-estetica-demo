'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useMotionGuards } from './useMotionGuards';

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const { semMovimento } = useMotionGuards();

  // Movimento reduzido: renderiza direto no estado final, sem animação alguma.
  if (semMovimento) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
