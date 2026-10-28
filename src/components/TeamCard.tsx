import Image from 'next/image';
import { TiltCard } from '@/components/motion';

export interface ProfissionalCard {
  id: string;
  nome: string;
  cargo: string | null;
  bio: string | null;
  foto: string | null;
  credenciais: string[];
  especialidades: string[];
}

export function TeamCard({ profissional }: { profissional: ProfissionalCard }) {
  return (
    <TiltCard className="h-full rounded-2xl border border-charcoal/10 bg-ivory">
      <article className="flex h-full flex-col">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
          {profissional.foto ? (
            <Image
              src={profissional.foto}
              alt={`Retrato de ${profissional.nome}`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full items-center justify-center bg-sand/40 font-display text-5xl text-charcoal/30"
            >
              {profissional.nome.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-7">
          <h3 className="font-display text-2xl text-charcoal">{profissional.nome}</h3>
          {profissional.cargo && (
            <p className="mt-1 text-sm text-terracotta">{profissional.cargo}</p>
          )}
          {profissional.bio && (
            <p className="mt-4 flex-1 text-charcoal/70">{profissional.bio}</p>
          )}

          {profissional.especialidades.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {profissional.especialidades.map((especialidade) => (
                <li
                  key={especialidade}
                  className="rounded-full bg-sand/50 px-3 py-1 text-xs text-charcoal/75"
                >
                  {especialidade}
                </li>
              ))}
            </ul>
          )}

          {profissional.credenciais.length > 0 && (
            <dl className="mt-6 border-t border-charcoal/10 pt-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-charcoal/65">Formação</dt>
              <dd className="mt-2 space-y-1 text-sm text-charcoal/65">
                {profissional.credenciais.map((credencial) => (
                  <p key={credencial}>{credencial}</p>
                ))}
              </dd>
            </dl>
          )}
        </div>
      </article>
    </TiltCard>
  );
}
