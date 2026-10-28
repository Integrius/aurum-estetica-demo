import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion';
import { ContactForm } from '@/components/ContactForm';
import { SITE } from '@/content/site';
import { whatsappLink } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Contato',
  description:
    'Endereço, horários de atendimento, WhatsApp e e-mail da clínica, além do formulário direto para tirar dúvidas.',
  path: '/contato',
});

export default function ContatoPage() {
  return (
    <main>
      <PageHero
        eyebrow="Contato"
        linhas={['Fale', 'com a', 'clínica']}
        subtitulo="Escreva pelo formulário, chame no WhatsApp ou apareça no endereço abaixo dentro do horário de atendimento."
        imagem="/img/hero/contato.webp"
        alt={`Recepção da ${SITE.nome}`}
      />

      <section className="py-20 md:py-28">
        <Container>
          <div className="grid gap-14 md:grid-cols-2">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Mensagem</p>
              <h2 className="mt-3 font-display text-2xl text-charcoal">Escreva para a gente</h2>
              <p className="mt-3 max-w-prose text-charcoal/70">
                Preencha os campos abaixo — a mensagem abre direto no WhatsApp da clínica, com o
                que você escreveu já preenchido.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="space-y-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Endereço</p>
                  <p className="mt-2 text-lg text-charcoal">{SITE.endereco}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Horários</p>
                  <dl className="mt-2 space-y-1">
                    {SITE.horarios.map((h) => (
                      <div key={h.dias} className="flex justify-between gap-4 text-charcoal/75">
                        <dt>{h.dias}</dt>
                        <dd>{h.horas}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-terracotta">
                    WhatsApp e telefone
                  </p>
                  <p className="mt-2">
                    <a
                      href={whatsappLink()}
                      className="text-lg text-charcoal underline-offset-4 hover:underline"
                    >
                      {SITE.telefoneExibicao}
                    </a>
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-terracotta">E-mail</p>
                  <p className="mt-2">
                    <a
                      href={`mailto:${SITE.email}`}
                      className="text-lg text-charcoal underline-offset-4 hover:underline"
                    >
                      {SITE.email}
                    </a>
                  </p>
                </div>

                <Button href={whatsappLink()} variant="outline">
                  Chamar no WhatsApp
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container>
          <Reveal>
            <iframe
              title={`Mapa da localização de ${SITE.nome}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${SITE.mapa.lng - 0.006}%2C${SITE.mapa.lat - 0.004}%2C${SITE.mapa.lng + 0.006}%2C${SITE.mapa.lat + 0.004}&layer=mapnik&marker=${SITE.mapa.lat}%2C${SITE.mapa.lng}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[420px] w-full rounded-2xl border-0"
            />
          </Reveal>
        </Container>
      </section>

      <section className="pb-24 md:pb-32">
        <Container>
          <Reveal>
            <div className="relative aspect-[16/7] overflow-hidden rounded-2xl">
              <Image
                src="/img/ambiente/fachada.webp"
                alt={`Entrada da ${SITE.nome}`}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
