import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/format';
import type { Pacote } from '@/content/pacotes';

export function PackageTable({ pacotes }: { pacotes: Pacote[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {pacotes.map((pacote) => (
        <article
          key={pacote.slug}
          className={`relative flex flex-col rounded-2xl p-8 ${
            pacote.destaque
              ? 'bg-charcoal text-champagne ring-2 ring-terracotta-light'
              : 'border border-charcoal/10 bg-ivory text-charcoal'
          }`}
        >
          {pacote.destaque && (
            <span className="absolute -top-3 left-8 rounded-full bg-terracotta px-4 py-1 text-xs uppercase tracking-wider text-white">
              Mais procurado
            </span>
          )}

          <h3 className="font-display text-2xl">{pacote.nome}</h3>
          <p className={`mt-2 text-sm ${pacote.destaque ? 'text-champagne/70' : 'text-charcoal/65'}`}>
            {pacote.chamada}
          </p>

          <p className="mt-8 font-display text-4xl">
            {formatPrice(pacote.precoMensal)}
            <span className={`text-base ${pacote.destaque ? 'text-champagne/55' : 'text-charcoal/65'}`}>
              /mês
            </span>
          </p>
          <p className={`mt-1 text-sm ${pacote.destaque ? 'text-champagne/55' : 'text-charcoal/65'}`}>
            {pacote.sessoes} sessões mensais
          </p>

          <ul className="mt-8 flex-1 space-y-3">
            {pacote.inclui.map((item) => (
              <li key={item} className="flex gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className={pacote.destaque ? 'text-terracotta-light' : 'text-terracotta'}
                >
                  —
                </span>
                <span className={pacote.destaque ? 'text-champagne/85' : 'text-charcoal/75'}>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Button
              href="/agendamento"
              variant={pacote.destaque ? 'primary' : 'outline'}
              className="w-full"
            >
              Começar pelo {pacote.nome}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
