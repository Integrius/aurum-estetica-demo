import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion';
import { formatPrice, formatDuration } from '@/lib/format';
import { buildMetadata, jsonLd, serviceJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

async function buscarServico(slug: string) {
  return prisma.service.findUnique({
    where: { slug },
    include: {
      results: { orderBy: { order: 'asc' } },
      professionals: { include: { professional: true } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const servico = await buscarServico(slug);
  if (!servico) return buildMetadata({ title: 'Tratamento não encontrado', description: '', path: `/servicos/${slug}` });

  return buildMetadata({
    title: servico.name,
    description: servico.description,
    path: `/servicos/${slug}`,
  });
}

export default async function ServicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const servico = await buscarServico(slug);
  if (!servico) notFound();

  const preco = servico.price.toNumber();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            serviceJsonLd({ nome: servico.name, descricao: servico.description, preco, slug }),
          ),
        }}
      />

      <PageHero
        eyebrow={servico.category}
        linhas={servico.name.split(' ')}
        imagem="/img/hero/servicos.webp"
        alt={servico.name}
      />

      <section className="py-20 md:py-28">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <Reveal>
                <p className="max-w-prose text-lg leading-relaxed text-charcoal/80">
                  {servico.description}
                </p>
              </Reveal>

              {/* Antes/depois DESTE tratamento — o achado mais forte da pesquisa de
                  concorrentes: quem chega do Google quer ver resultado do que buscou. */}
              {servico.results.length > 0 && (
                <div className="mt-16">
                  <Reveal>
                    <h2 className="font-display text-display text-charcoal">
                      Resultados deste tratamento
                    </h2>
                  </Reveal>
                  <div className="mt-8 grid gap-10 md:grid-cols-2">
                    {servico.results.map((caso) => (
                      <Reveal key={caso.id}>
                        <BeforeAfterSlider
                          antes={caso.beforeUrl}
                          depois={caso.afterUrl}
                          alt={`${servico.name}: ${caso.caption}`}
                          legenda={`${caso.sessions} sessões — ${caso.caption}`}
                        />
                      </Reveal>
                    ))}
                  </div>
                  <p className="mt-6 text-sm text-charcoal/65">
                    Imagens ilustrativas. Resultados variam conforme o caso.
                  </p>
                </div>
              )}

              {servico.professionals.length > 0 && (
                <div className="mt-16">
                  <Reveal>
                    <h2 className="font-display text-2xl text-charcoal">Quem atende</h2>
                  </Reveal>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {servico.professionals.map(({ professional }) => (
                      <li key={professional.id}>
                        <Link
                          href="/equipe"
                          className="flex items-center gap-4 rounded-2xl bg-ivory p-4 transition-colors hover:bg-sand/40"
                        >
                          {professional.photoUrl && (
                            <Image
                              src={professional.photoUrl}
                              alt={professional.name}
                              width={56}
                              height={56}
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          )}
                          <span>
                            <span className="block font-medium text-charcoal">{professional.name}</span>
                            {professional.role && (
                              <span className="block text-sm text-charcoal/65">{professional.role}</span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-charcoal/10 bg-ivory p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-terracotta">Investimento</p>
                <p className="mt-3 font-display text-4xl text-charcoal">{formatPrice(preco)}</p>
                <p className="mt-2 text-charcoal/65">por sessão · {formatDuration(servico.duration)}</p>
                <div className="mt-8 space-y-3">
                  <Button href={`/agendamento?service=${slug}`} className="w-full">Agendar este tratamento</Button>
                  <Button href="/pacotes" variant="outline" className="w-full">Ver em pacote mensal</Button>
                </div>
                <p className="mt-6 text-xs leading-relaxed text-charcoal/65">
                  O valor da avaliação é abatido da primeira sessão caso você siga com o
                  tratamento.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
