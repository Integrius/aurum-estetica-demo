'use client';

import { useEffect, useState } from 'react';
import { useMotionGuards } from './useMotionGuards';

export function ScrollHint({ label = 'role' }: { label?: string }) {
  const [oculto, setOculto] = useState(false);
  const { semMovimento } = useMotionGuards();

  useEffect(() => {
    const aoRolar = () => setOculto(window.scrollY > 60);
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-white/80 transition-opacity duration-500 ${
        oculto ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {label}
      {/* Sob prefers-reduced-motion, a classe que liga o loop CSS fica de fora:
          a linha renderiza no estado final e estático (comprimento total,
          visível), nunca no frame inicial da animação (scaleY(0)), que
          esconderia a linha para quem pediu menos movimento. */}
      <span
        className={`h-11 w-px bg-gradient-to-b from-white/90 to-transparent ${
          semMovimento ? '' : 'scroll-hint-line'
        }`}
      />
      <style jsx>{`
        .scroll-hint-line {
          animation: desce 1.8s ease-in-out infinite;
        }
        @keyframes desce {
          0% { transform: scaleY(0); transform-origin: top; }
          45% { transform: scaleY(1); transform-origin: top; }
          55% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
      `}</style>
    </div>
  );
}
