'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';

const PASSO = 2;

export function BeforeAfterSlider({
  antes,
  depois,
  alt,
  legenda,
}: {
  antes: string;
  depois: string;
  alt: string;
  legenda?: string;
}) {
  const [posicao, setPosicao] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const arrastando = useRef(false);

  const atualizarPorEvento = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const bruto = ((clientX - r.left) / r.width) * 100;
    setPosicao(Math.min(100, Math.max(0, Math.round(bruto))));
  }, []);

  function aoPressionar(evento: PointerEvent<HTMLDivElement>) {
    arrastando.current = true;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    atualizarPorEvento(evento.clientX);
  }

  function aoMover(evento: PointerEvent<HTMLDivElement>) {
    if (!arrastando.current) return;
    atualizarPorEvento(evento.clientX);
  }

  function aoSoltar(evento: PointerEvent<HTMLDivElement>) {
    arrastando.current = false;
    evento.currentTarget.releasePointerCapture(evento.pointerId);
  }

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    const acoes: Record<string, () => void> = {
      ArrowRight: () => setPosicao((p) => Math.min(100, p + PASSO)),
      ArrowLeft: () => setPosicao((p) => Math.max(0, p - PASSO)),
      ArrowUp: () => setPosicao((p) => Math.min(100, p + PASSO)),
      ArrowDown: () => setPosicao((p) => Math.max(0, p - PASSO)),
      Home: () => setPosicao(0),
      End: () => setPosicao(100),
    };
    const acao = acoes[evento.key];
    if (!acao) return;
    evento.preventDefault();
    acao();
  }

  return (
    <figure>
      <div
        ref={containerRef}
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        // pan-y é o que impede o slider de sequestrar o scroll vertical no mobile.
        className="relative aspect-square touch-pan-y select-none overflow-hidden rounded-2xl"
      >
        <Image src={depois} alt={`${alt} — depois`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />

        {/* O "antes" ocupa a área inteira e é RECORTADO por clip-path, em vez de
            ter o contêiner estreitado. Estreitar o contêiner faria a imagem
            reflowar e esticar a cada movimento; o recorte mantém as duas
            imagens exatamente alinhadas, que é o que faz a comparação valer.
            Também evita ler offsetWidth durante a renderização — leitura de DOM
            no render não reage a redimensionamento e quebra na hidratação. */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - posicao}% 0 0)` }}
        >
          <Image src={antes} alt={`${alt} — antes`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label={`${alt}. Use as setas para comparar antes e depois.`}
          aria-valuenow={posicao}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${posicao}% do antes visível`}
          onKeyDown={aoTeclar}
          className="absolute inset-y-0 z-10 flex w-11 -translate-x-1/2 cursor-ew-resize items-center justify-center"
          style={{ left: `${posicao}%` }}
        >
          <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white" />
          <span
            aria-hidden="true"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-charcoal shadow-lg"
          >
            ↔
          </span>
        </div>

        <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-charcoal/70 px-3 py-1 text-xs uppercase tracking-wider text-white">
          Antes
        </span>
        <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-terracotta px-3 py-1 text-xs uppercase tracking-wider text-white">
          Depois
        </span>
      </div>

      {legenda && <figcaption className="mt-4 text-charcoal/75">{legenda}</figcaption>}
    </figure>
  );
}
