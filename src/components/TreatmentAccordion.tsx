'use client';

import Link from 'next/link';
import { useState } from 'react';

export interface ItemTratamento {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  preco: string;
  duracao: string;
}

export interface Grupo {
  categoria: string;
  itens: ItemTratamento[];
}

export function TreatmentAccordion({ grupos }: { grupos: Grupo[] }) {
  const primeiro = grupos[0]?.itens[0]?.id ?? null;
  const [aberto, setAberto] = useState<string | null>(primeiro);

  return (
    <div className="space-y-16">
      {grupos.map((grupo) => (
        <section key={grupo.categoria}>
          <h2 className="text-xs uppercase tracking-[0.3em] text-terracotta">{grupo.categoria}</h2>
          <ul className="mt-6 space-y-2">
            {grupo.itens.map((item, indice) => {
              const estaAberto = aberto === item.id;
              return (
                <li
                  key={item.id}
                  className={`overflow-hidden rounded-2xl transition-colors duration-500 ease-editorial ${
                    estaAberto ? 'bg-charcoal text-champagne' : 'bg-ivory text-charcoal hover:bg-sand/40'
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`botao-${item.id}`}
                      onClick={() => setAberto(estaAberto ? null : item.id)}
                      aria-expanded={estaAberto}
                      aria-controls={`painel-${item.id}`}
                      className="flex w-full items-center justify-between gap-6 px-6 py-6 text-left md:px-8"
                    >
                      <span className="font-display text-xl md:text-2xl">{item.nome}</span>
                      <span
                        className={`shrink-0 text-sm tabular-nums ${
                          estaAberto ? 'text-champagne/60' : 'text-charcoal/65'
                        }`}
                      >
                        {String(indice + 1).padStart(2, '0')}
                      </span>
                    </button>
                  </h3>

                  <div
                    id={`painel-${item.id}`}
                    role="region"
                    aria-labelledby={`botao-${item.id}`}
                    // Painel fechado tem altura 0 mas continua no DOM: inert tira
                    // seus links da ordem de Tab e da árvore de acessibilidade.
                    inert={!estaAberto}
                    className="grid transition-[grid-template-rows] duration-500 ease-editorial"
                    style={{ gridTemplateRows: estaAberto ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-7 md:px-8">
                        <p className={estaAberto ? 'text-champagne/80' : 'text-charcoal/70'}>
                          {item.descricao}
                        </p>
                        <p className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                          <span className="font-medium">{item.preco}</span>
                          <span className="opacity-40">·</span>
                          <span className="opacity-70">{item.duracao}</span>
                        </p>
                        <Link
                          href={`/servicos/${item.slug}`}
                          className="mt-6 inline-flex rounded-full border border-current px-5 py-2.5 text-sm transition-colors hover:bg-terracotta hover:border-terracotta hover:text-white"
                        >
                          Ver detalhes
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
