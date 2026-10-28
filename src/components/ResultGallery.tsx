'use client';

import { useState } from 'react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Reveal } from '@/components/motion';

export interface CasoResultado {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  caption: string;
  sessions: number;
  servicoNome: string;
  servicoSlug: string;
}

export function ResultGallery({ casos }: { casos: CasoResultado[] }) {
  const servicos = Array.from(new Set(casos.map((c) => c.servicoNome)));
  const [filtro, setFiltro] = useState<string | null>(null);
  const visiveis = filtro ? casos.filter((c) => c.servicoNome === filtro) : casos;

  if (casos.length === 0) {
    return (
      <p className="text-charcoal/65">
        Estamos organizando os registros das próximas pacientes. Enquanto isso, fale com a
        gente pelo WhatsApp — mostramos casos parecidos com o seu na avaliação.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tratamento">
        <button
          type="button"
          onClick={() => setFiltro(null)}
          aria-pressed={filtro === null}
          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
            filtro === null
              ? 'border-terracotta bg-terracotta text-white'
              : 'border-charcoal/20 text-charcoal/70 hover:border-terracotta'
          }`}
        >
          Todos
        </button>
        {servicos.map((servico) => (
          <button
            key={servico}
            type="button"
            onClick={() => setFiltro(servico)}
            aria-pressed={filtro === servico}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              filtro === servico
                ? 'border-terracotta bg-terracotta text-white'
                : 'border-charcoal/20 text-charcoal/70 hover:border-terracotta'
            }`}
          >
            {servico}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        {visiveis.map((caso, i) => (
          <Reveal key={caso.id} delay={(i % 2) * 0.1}>
            <BeforeAfterSlider
              antes={caso.beforeUrl}
              depois={caso.afterUrl}
              alt={`${caso.servicoNome}: ${caso.caption}`}
              legenda={`${caso.servicoNome} · ${caso.sessions} sessões — ${caso.caption}`}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
