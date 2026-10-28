import { prisma } from '@/lib/prisma';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { TreatmentAccordion, type Grupo } from '@/components/TreatmentAccordion';
import { Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDuration } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Tratamentos',
  description:
    'Protocolos faciais e corporais da clínica, com preço, duração e o que cada um resolve. Toda jornada começa por uma avaliação.',
  path: '/servicos',
});

export default async function ServicosPage() {
  const servicos = await prisma.service.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });

  const grupos: Grupo[] = Object.values(
    servicos.reduce<Record<string, Grupo>>((acc, servico) => {
      acc[servico.category] ??= { categoria: servico.category, itens: [] };
      acc[servico.category].itens.push({
        id: servico.id,
        slug: servico.slug,
        nome: servico.name,
        descricao: servico.description,
        preco: formatPrice(servico.price.toNumber()),
        duracao: formatDuration(servico.duration),
      });
      return acc;
    }, {}),
  );

  return (
    <main>
      <PageHero
        eyebrow="Tratamentos"
        linhas={['O que', 'fazemos']}
        subtitulo="Cada protocolo tem indicação, número de sessões e resultado esperado. Nada aqui promete milagre."
        imagem="/img/hero/servicos.webp"
        alt="Detalhe de um atendimento na clínica"
      />

      <section className="py-20 md:py-28">
        <Container>
          {grupos.length === 0 ? (
            <p className="text-charcoal/65">
              Estamos atualizando a lista. Fale com a gente pelo WhatsApp que contamos o que
              está disponível hoje.
            </p>
          ) : (
            <TreatmentAccordion grupos={grupos} />
          )}

          <Reveal>
            <div className="mt-16 rounded-2xl bg-ivory p-8 md:p-12">
              <h2 className="font-display text-2xl text-charcoal">Não sabe por onde começar?</h2>
              <p className="mt-3 max-w-prose text-charcoal/70">
                É o mais comum. A avaliação existe exatamente para isso: você chega sem saber e
                sai com um plano escrito.
              </p>
              <div className="mt-6">
                <Button href="/agendamento">Agendar avaliação</Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
