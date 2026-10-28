import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal, ScrollHint, TiltCard, StickyStory, DrawLine } from '@/components/motion';
import { TeamCard } from '@/components/TeamCard';
import { PostCard } from '@/components/PostCard';
import { SITE } from '@/content/site';
import { DEPOIMENTOS } from '@/content/depoimentos';
import { NUMEROS } from '@/content/numeros';
import { formatPrice, formatDuration } from '@/lib/format';
import { jsonLd, medicalBusinessJsonLd } from '@/lib/seo';
import { postsPublicadosWhere } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [servicos, casos, profissionais, posts] = await Promise.all([
    prisma.service.findMany({ orderBy: { category: 'asc' }, take: 6 }),
    prisma.resultCase.findMany({ orderBy: { order: 'asc' }, take: 3, include: { service: true } }),
    // I3: sem o filtro, a ordenação por createdAt colocava Dra. Camila Duarte
    // (sem foto, sem bio) primeiro na prévia da home — a query original desta
    // seção. Profissionais sem foto continuam existindo e aparecem em /equipe.
    prisma.professional.findMany({ where: { photoUrl: { not: null } }, orderBy: { createdAt: 'asc' }, take: 3 }),
    prisma.post.findMany({
      where: postsPublicadosWhere(),
      orderBy: { publishedAt: 'desc' },
      take: 3,
    }),
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(medicalBusinessJsonLd()) }}
      />

      <PageHero
        eyebrow={SITE.nome}
        linhas={['Cuidado', 'que se vê', 'na pele']}
        subtitulo="Protocolos faciais e corporais conduzidos por especialistas, com avaliação honesta e acompanhamento sessão a sessão."
        imagem="/img/hero/principal.webp"
        alt={`Ambiente da clínica ${SITE.nome}`}
        altura="cheia"
      >
        <Button href="/agendamento">Agendar avaliação</Button>
        <Button
          href="/resultados"
          variant="outline"
          className="border-white text-white hover:bg-white hover:text-charcoal"
        >
          Ver resultados
        </Button>
        <ScrollHint />
      </PageHero>

      {/* Prova social logo abaixo do hero — padrão dos sites premiados de 2026. */}
      <section className="border-b border-charcoal/10 bg-ivory py-14">
        <Container>
          <dl className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {NUMEROS.map((n, i) => (
              <Reveal key={n.texto} delay={i * 0.08}>
                <dt className="font-display text-4xl text-charcoal">
                  {n.valor}
                  <span className="text-xl text-terracotta">{n.unidade}</span>
                </dt>
                <dd className="mt-2 text-sm leading-snug text-charcoal/65">{n.texto}</dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Tratamentos"
              title="O que fazemos aqui"
              subtitle="Cada protocolo começa por uma avaliação. O que você vê abaixo é o ponto de partida, não um cardápio fechado."
            />
          </Reveal>

          {servicos.length === 0 ? (
            <p className="mt-12 text-charcoal/65">
              Estamos atualizando a lista de tratamentos. Fale com a gente pelo WhatsApp que
              contamos o que está disponível hoje.
            </p>
          ) : (
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {servicos.map((servico, i) => (
                <Reveal key={servico.id} delay={(i % 3) * 0.08}>
                  <TiltCard className="h-full rounded-2xl border border-charcoal/10 bg-ivory">
                    <Link href={`/servicos/${servico.slug}`} className="flex h-full flex-col p-7">
                      <p className="text-xs uppercase tracking-[0.2em] text-terracotta">
                        {servico.category}
                      </p>
                      <h3 className="mt-3 font-display text-2xl text-charcoal">{servico.name}</h3>
                      <p className="mt-3 flex-1 text-charcoal/70">{servico.description}</p>
                      <p className="mt-6 flex items-baseline gap-3 text-sm text-charcoal/65">
                        <span className="font-medium text-charcoal">
                          {formatPrice(servico.price.toNumber())}
                        </span>
                        <span>·</span>
                        <span>{formatDuration(servico.duration)}</span>
                      </p>
                    </Link>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal delay={0.1}>
            <div className="mt-12">
              <Button href="/servicos" variant="outline">Ver todos os tratamentos</Button>
            </div>
          </Reveal>
        </Container>
      </section>
      <section className="bg-ivory py-24 md:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Como funciona"
              title="A jornada de quem se trata aqui"
              subtitle="Três etapas, sempre nesta ordem. Nenhum protocolo começa antes da avaliação."
            />
          </Reveal>
        </Container>

        <Container className="mt-16">
          <StickyStory
            capitulos={[
              {
                imagem: '/img/ambiente/recepcao.webp',
                alt: 'Recepção da clínica',
                titulo: 'Avaliação',
                texto:
                  'Uma hora com a biomédica esteta para analisar sua pele, entender seu histórico e ouvir o que você quer mudar. Saímos daqui com um plano escrito e uma estimativa honesta de sessões.',
              },
              {
                imagem: '/img/ambiente/sala.webp',
                alt: 'Sala de atendimento',
                titulo: 'Protocolo',
                texto:
                  'As sessões acontecem em intervalo definido, com a mesma profissional do início ao fim. Cada aplicação é registrada, e a intensidade se ajusta conforme a sua resposta.',
              },
              {
                imagem: '/img/ambiente/detalhe.webp',
                alt: 'Detalhe de produtos e instrumentos',
                titulo: 'Manutenção',
                texto:
                  'Terminado o ciclo, você recebe a rotina domiciliar e o intervalo de manutenção. Resultado que não se sustenta em casa não é resultado — é gasto.',
              },
            ]}
          />
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Resultados"
              title="Antes e depois"
              subtitle="Exemplos ilustrativos do nível de resultado que buscamos entregar em cada tratamento."
            />
          </Reveal>

          {casos.length > 0 && (
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {casos.map((caso, i) => (
                <Reveal key={caso.id} delay={i * 0.08}>
                  <Link href="/resultados" className="group block">
                    <div className="relative aspect-square overflow-hidden rounded-2xl">
                      <Image
                        src={caso.afterUrl}
                        alt={caso.caption}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-terracotta">
                      {caso.service.name} · {caso.sessions} sessões
                    </p>
                    <p className="mt-2 text-charcoal/75">{caso.caption}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal delay={0.1}>
            <p className="mt-8 text-xs text-charcoal/65">
              Imagens ilustrativas. Resultados variam conforme o caso.
            </p>
            <div className="mt-6">
              <Button href="/resultados" variant="outline">Ver a galeria completa</Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-charcoal py-24 text-champagne md:py-32">
        <Container>
          <div className="grid gap-12 md:grid-cols-[auto_1fr]">
            <DrawLine className="hidden h-full text-terracotta-light md:block" />
            <div>
              <Reveal>
                <p className="text-xs uppercase tracking-[0.3em] text-terracotta-light">Depoimentos</p>
                <h2 className="mt-3 font-display text-display">O que elas dizem</h2>
              </Reveal>
              <div className="mt-14 grid gap-10 md:grid-cols-2">
                {DEPOIMENTOS.map((d, i) => (
                  <Reveal key={d.nome} delay={(i % 2) * 0.1}>
                    <blockquote>
                      <p className="text-lg leading-relaxed text-champagne/85">“{d.texto}”</p>
                      <footer className="mt-4 text-sm text-champagne/55">
                        {d.nome} · {d.tratamento}
                      </footer>
                    </blockquote>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Equipe"
              title="Quem vai te atender"
              subtitle="A equipe de especialistas da clínica, com formação e especialização na área em que cada uma atua."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profissionais.map((profissional, i) => (
              <Reveal key={profissional.id} delay={(i % 3) * 0.08}>
                <Link href="/equipe" className="block h-full">
                  <TeamCard
                    profissional={{
                      id: profissional.id,
                      nome: profissional.name,
                      cargo: profissional.role,
                      bio: profissional.bio,
                      foto: profissional.photoUrl,
                      credenciais: profissional.credentials,
                      especialidades: profissional.specialties,
                    }}
                  />
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <div className="mt-12">
              <Button href="/equipe" variant="outline">Conhecer a equipe</Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-ivory py-24 md:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Diário"
              title="O que escrevemos por aqui"
              subtitle="Conteúdo sobre pele sem promessa mágica."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.08}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden py-28 md:py-36">
        <Container className="relative z-10 text-center">
          <Reveal>
            <h2 className="mx-auto max-w-3xl font-display text-display text-charcoal">
              A avaliação é o único jeito de saber o que a sua pele precisa
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-charcoal/70">
              Uma hora, sem compromisso de fechar pacote. Você sai com um plano escrito.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button href="/agendamento">Agendar avaliação</Button>
              <Button href="/contato" variant="outline">Falar com a clínica</Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
