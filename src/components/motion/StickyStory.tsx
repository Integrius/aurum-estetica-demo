'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useMotionGuards } from './useMotionGuards';

export interface Capitulo {
  imagem: string;
  alt: string;
  titulo: string;
  texto: string;
}

/**
 * Keyframes de opacidade do capítulo: aparece na sua fatia do scroll e some na
 * seguinte. No desktop o framer-motion acelera isso via Element.animate(), o
 * que impõe duas regras: offsets dentro de [0, 1] (fora disso lança e derruba
 * a página) e keyframes explícitos em 0 e em 1 — sem eles o navegador cria
 * keyframes implícitos com a opacidade base do elemento, e o primeiro capítulo
 * reacendia no fim da rolagem, sobreposto ao último.
 */
export function quadrosDoCapitulo(
  indice: number,
  total: number,
): { pontos: number[]; opacidades: number[] } {
  const fatia = 1 / total;
  const entra = indice * fatia;
  const sai = entra + fatia;
  const transicao = fatia * 0.35;
  const primeiro = indice === 0;
  const ultimo = indice === total - 1;

  // O primeiro já começa visível; o último não some no fim.
  const pontos = [0];
  const opacidades = [primeiro ? 1 : 0];
  if (!primeiro) {
    pontos.push(entra - transicao, entra);
    opacidades.push(0, 1);
  }
  if (!ultimo) {
    pontos.push(sai - transicao, sai);
    opacidades.push(1, 0);
  }
  pontos.push(1);
  opacidades.push(ultimo ? 1 : 0);
  return { pontos, opacidades };
}

function Capitulo({
  capitulo,
  indice,
  total,
  progresso,
  animar,
  parte,
}: {
  capitulo: Capitulo;
  indice: number;
  total: number;
  progresso: ReturnType<typeof useScroll>['scrollYProgress'];
  animar: boolean;
  /** No modo preso, imagem e texto vivem em colunas diferentes do grid,
      então o mesmo capítulo é renderizado duas vezes — uma por coluna. */
  parte?: 'imagem' | 'texto';
}) {
  const { pontos, opacidades } = quadrosDoCapitulo(indice, total);
  const opacity = useTransform(progresso, pontos, opacidades);

  if (!animar) {
    return (
      <div className="mb-16 last:mb-0">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
          <Image src={capitulo.imagem} alt={capitulo.alt} fill className="object-cover" sizes="100vw" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.25em] text-terracotta">
          {String(indice + 1).padStart(2, '0')}
        </p>
        <h3 className="mt-2 font-display text-2xl text-charcoal">{capitulo.titulo}</h3>
        <p className="mt-3 max-w-prose text-charcoal/75">{capitulo.texto}</p>
      </div>
    );
  }

  if (parte === 'imagem') {
    return (
      <motion.div style={{ opacity }} className="absolute inset-0">
        <Image
          src={capitulo.imagem}
          alt={capitulo.alt}
          fill
          className="rounded-2xl object-cover"
          sizes="(min-width: 1024px) 45vw, 100vw"
        />
      </motion.div>
    );
  }

  return (
    <motion.div style={{ opacity }} className="absolute inset-x-0 top-1/2 -translate-y-1/2">
      <p className="text-xs uppercase tracking-[0.25em] text-terracotta">
        {String(indice + 1).padStart(2, '0')}
      </p>
      <h3 className="mt-2 font-display text-display text-charcoal">{capitulo.titulo}</h3>
      <p className="mt-4 max-w-prose text-lg text-charcoal/75">{capitulo.texto}</p>
    </motion.div>
  );
}

export function StickyStory({ capitulos }: { capitulos: Capitulo[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const { animar } = useMotionGuards();

  if (!animar) {
    // `ref` também é anexado aqui, mesmo sem uso de scroll: o useScroll acima já
    // foi chamado (hooks não podem ser condicionais) com `target: ref`, e um ref
    // nunca hidratado faz o framer-motion lançar "Target ref is defined but not
    // hydrated" de forma assíncrona. Anexar em um <div> inerte resolve sem mudar
    // layout, já que este branch não lê `scrollYProgress`.
    return (
      <div ref={ref}>
        {capitulos.map((capitulo, i) => (
          <Capitulo
            key={capitulo.titulo}
            capitulo={capitulo}
            indice={i}
            total={capitulos.length}
            progresso={scrollYProgress}
            animar={false}
          />
        ))}
      </div>
    );
  }

  return (
    // Uma viewport de altura por capítulo. Se mudar o número de capítulos,
    // esta altura acompanha sozinha.
    <div ref={ref} style={{ height: `${capitulos.length * 100}vh` }}>
      <div className="sticky top-0 grid h-screen grid-cols-2 items-center gap-16">
        <div className="relative h-[70vh]">
          {capitulos.map((capitulo, i) => (
            <Capitulo
              key={`img-${capitulo.titulo}`}
              capitulo={capitulo}
              indice={i}
              total={capitulos.length}
              progresso={scrollYProgress}
              animar
              parte="imagem"
            />
          ))}
        </div>
        <div className="relative h-[70vh]">
          {capitulos.map((capitulo, i) => (
            <Capitulo
              key={`txt-${capitulo.titulo}`}
              capitulo={capitulo}
              indice={i}
              total={capitulos.length}
              progresso={scrollYProgress}
              animar
              parte="texto"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
