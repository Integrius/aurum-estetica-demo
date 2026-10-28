import { prisma } from '@/lib/prisma';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { TeamCard } from '@/components/TeamCard';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion';
import { buildMetadata, jsonLd, personJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Equipe',
  description:
    'A equipe de especialistas da clínica, com formação, registro no conselho e as áreas em que cada profissional atua.',
  path: '/equipe',
});

export default async function EquipePage() {
  const profissionais = await prisma.professional.findMany({ orderBy: { createdAt: 'asc' } });

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            profissionais
              .filter((p) => p.photoUrl)
              .map((p) => personJsonLd({ nome: p.name, cargo: p.role ?? '', foto: p.photoUrl! })),
          ),
        }}
      />

      <PageHero
        eyebrow="Equipe"
        linhas={['Quem', 'cuida', 'de você']}
        subtitulo="A equipe de especialistas tem registro ativo no conselho e especialização na área em que cada um atua. Você é atendida pela mesma profissional do começo ao fim do protocolo."
        imagem="/img/ambiente/bancada.webp"
        alt="Bancada de trabalho da clínica"
      />

      <section className="py-20 md:py-28">
        <Container>
          {profissionais.length === 0 ? (
            <p className="text-charcoal/65">
              Estamos atualizando as informações da equipe. Fale com a gente pelo WhatsApp.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profissionais.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.08}>
                  <TeamCard
                    profissional={{
                      id: p.id,
                      nome: p.name,
                      cargo: p.role,
                      bio: p.bio,
                      foto: p.photoUrl,
                      credenciais: p.credentials,
                      especialidades: p.specialties,
                    }}
                  />
                </Reveal>
              ))}
            </div>
          )}

          <Reveal>
            <div className="mt-16 rounded-2xl bg-charcoal p-8 text-champagne md:p-12">
              <h2 className="font-display text-2xl">Quer ser atendida por alguém específico?</h2>
              <p className="mt-3 max-w-prose text-champagne/75">
                No agendamento você escolhe a profissional e vê os horários reais dela.
              </p>
              <div className="mt-6">
                <Button href="/agendamento">Escolher profissional e horário</Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
