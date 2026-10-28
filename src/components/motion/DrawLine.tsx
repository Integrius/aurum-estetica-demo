'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useMotionGuards } from './useMotionGuards';

export function DrawLine({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 70%', 'end 80%'],
  });
  const avanco = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const { animar } = useMotionGuards();

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <svg viewBox="0 0 2 600" preserveAspectRatio="none" className="h-full w-[2px]">
        <motion.path
          d="M1 0 V600"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          style={{ pathLength: animar ? avanco : 1 }}
        />
      </svg>
    </div>
  );
}
