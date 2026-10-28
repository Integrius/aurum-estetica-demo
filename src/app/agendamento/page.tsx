import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { SITE } from '@/content/site';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Agendamento',
  description: 'Escolha o serviço, o profissional e o horário para sua avaliação, em poucos passos.',
  path: '/agendamento',
});

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;

  return (
    <main>
      <PageHero
        eyebrow="Agendamento"
        linhas={['Agende', 'sua avaliação']}
        subtitulo="Escolha o serviço, o profissional e o horário — a confirmação chega na hora."
        imagem="/img/ambiente/sala.webp"
        alt={`Sala de atendimento da ${SITE.nome}`}
        altura="media"
      />

      <section className="py-20 md:py-28">
        <Container size="narrow">
          <BookingWizard initialServiceSlug={service} />
        </Container>
      </section>
    </main>
  );
}
