'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useMotionGuards } from '@/components/motion';
import { Container } from '@/components/ui/Container';

export function PageHero({
  eyebrow,
  linhas,
  subtitulo,
  imagem,
  alt,
  altura = 'media',
  children,
}: {
  eyebrow?: string;
  /** Cada string vira uma linha do H1. Mantenha 1 a 3 palavras por linha. */
  linhas: string[];
  subtitulo?: string;
  imagem: string;
  alt: string;
  altura?: 'cheia' | 'media';
  children?: ReactNode;
}) {
  const { semMovimento } = useMotionGuards();

  return (
    <section
      className={`photo-scrim relative flex items-end overflow-hidden ${
        altura === 'cheia' ? 'min-h-[100svh]' : 'min-h-[70svh]'
      }`}
    >
      <Image
        src={imagem}
        alt={alt}
        fill
        // `priority` foi descontinuada no Next 16 em favor de `preload`, mas a
        // doc do próprio pacote (node_modules/next/dist/docs/.../image.md,
        // seção `preload`, "When not to use it") diz para NÃO combinar
        // `preload` com `fetchPriority` — usar `loading="eager"` ou
        // `fetchPriority="high"` no lugar de `preload`. `fetchPriority="high"`
        // sozinho já evita o `loading="lazy"` e marca a prioridade de rede
        // (achado da auditoria da Tarefa 17, fix round 1 da revisão);
        // `loading="eager"` reforça isso mesmo sem `priority`/`preload`.
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />

      <Container className="relative z-10 pb-20 pt-32 md:pb-28">
        {eyebrow && (
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-champagne/90">{eyebrow}</p>
        )}

        <h1 className="font-display text-hero text-white">
          {linhas.map((linha, i) => (
            <span key={`${i}-${linha}`} className="line-mask">
              {semMovimento ? (
                <span className="block">{linha}</span>
              ) : (
                <motion.span
                  className="block"
                  initial={{ y: '115%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.05, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  {linha}
                </motion.span>
              )}
            </span>
          ))}
        </h1>

        {subtitulo && (
          <p className="mt-7 max-w-xl text-lg text-white/85">{subtitulo}</p>
        )}

        {children && <div className="mt-10 flex flex-wrap gap-4">{children}</div>}
      </Container>
    </section>
  );
}
