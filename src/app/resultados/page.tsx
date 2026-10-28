import { prisma } from '@/lib/prisma';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { ResultGallery } from '@/components/ResultGallery';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Resultados',
  description:
    'Casos de antes e depois de pacientes da clínica, organizados por tratamento e com o número de sessões de cada um.',
  path: '/resultados',
});

export default async function ResultadosPage() {
  const casos = await prisma.resultCase.findMany({
    orderBy: { order: 'asc' },
    include: { service: true },
  });

  return (
    <main>
      <PageHero
        eyebrow="Resultados"
        linhas={['Antes', 'e depois']}
        subtitulo="Arraste a alça para comparar. Cada caso traz o tratamento e o número de sessões."
        imagem="/img/hero/servicos.webp"
        alt="Detalhe de pele saudável"
      />

      <section className="py-20 md:py-28">
        <Container>
          <ResultGallery
            casos={casos.map((c) => ({
              id: c.id,
              beforeUrl: c.beforeUrl,
              afterUrl: c.afterUrl,
              caption: c.caption,
              sessions: c.sessions,
              servicoNome: c.service.name,
              servicoSlug: c.service.slug,
            }))}
          />

          <Reveal>
            <p className="mt-12 max-w-prose text-sm text-charcoal/65">
              Imagens ilustrativas, geradas para fins de demonstração. Resultados variam conforme
              o caso, o tipo de pele e a constância do tratamento. Nenhum resultado é garantido.
            </p>
            <div className="mt-10">
              <Button href="/agendamento">Agendar minha avaliação</Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
