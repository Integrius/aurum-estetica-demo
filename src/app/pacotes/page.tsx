import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { PackageTable } from '@/components/PackageTable';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { PACOTES } from '@/content/pacotes';
import { FAQ } from '@/content/faq';
import { buildMetadata, faqJsonLd, jsonLd } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pacotes e perguntas frequentes',
  description:
    'Três planos mensais de acompanhamento, com o que cada um inclui, e as dúvidas que mais aparecem na avaliação.',
  path: '/pacotes',
});

export default function PacotesPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd()) }}
      />

      <PageHero
        eyebrow="Pacotes"
        linhas={['Constância', 'sai mais', 'barato']}
        subtitulo="Tratamento avulso funciona. Acompanhamento contínuo funciona melhor — e custa menos por sessão."
        imagem="/img/ambiente/espera.webp"
        alt="Sala de espera da clínica"
      />

      <section className="py-20 md:py-28">
        <Container>
          <Reveal>
            <PackageTable pacotes={PACOTES} />
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 max-w-prose text-sm text-charcoal/65">
              Todos os planos incluem avaliação inicial e podem ser cancelados a qualquer momento,
              com aviso de 30 dias. Sessões não usadas acumulam por até 60 dias.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <Container size="narrow">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Dúvidas</p>
            <h2 className="mt-3 font-display text-display text-charcoal">
              O que mais perguntam
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-12">
              <FaqAccordion itens={FAQ} />
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-12 text-center">
              <p className="text-charcoal/70">Ficou alguma dúvida de fora?</p>
              <div className="mt-5">
                <Button href="/contato">Perguntar para a clínica</Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
