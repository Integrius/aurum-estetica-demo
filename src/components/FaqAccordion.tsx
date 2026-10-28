import type { FaqItem } from '@/content/faq';

export function FaqAccordion({ itens }: { itens: FaqItem[] }) {
  return (
    <div className="divide-y divide-charcoal/10 border-y border-charcoal/10">
      {itens.map((item) => (
        <details key={item.pergunta} className="group py-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
            <h3 className="font-display text-lg text-charcoal md:text-xl">{item.pergunta}</h3>
            <span
              aria-hidden="true"
              className="shrink-0 text-2xl text-terracotta transition-transform duration-300 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-4 max-w-prose text-charcoal/70">{item.resposta}</p>
        </details>
      ))}
    </div>
  );
}
