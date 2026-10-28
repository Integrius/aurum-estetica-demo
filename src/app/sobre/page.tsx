import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';
import { Reveal, DrawLine } from '@/components/motion';
import { SITE } from '@/content/site';
import { NUMEROS } from '@/content/numeros';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Sobre',
  description:
    'Como a clínica trabalha: avaliação antes de qualquer pacote, número de sessões realista e a mesma profissional do início ao fim do protocolo.',
  path: '/sobre',
});

const PRINCIPIOS = [
  {
    titulo: 'Avaliação antes de venda',
    texto:
      'Nenhum pacote é oferecido antes de a pele ser analisada. Se o que você precisa não está aqui, indicamos quem faz — e isso já aconteceu mais vezes do que gostaríamos de admitir.',
  },
  {
    titulo: 'Número de sessões realista',
    texto:
      'Dizemos a faixa provável na primeira consulta e revisamos com foto a cada ciclo. Se o resultado vier antes, o tratamento termina antes.',
  },
  {
    titulo: 'A mesma profissional do começo ao fim',
    texto:
      'Quem avalia é quem atende. Trocar de mão no meio do protocolo custa resultado, e a gente não faz isso para encaixar agenda.',
  },
];

const AMBIENTE = [
  { src: '/img/ambiente/recepcao.webp', alt: 'Recepção da clínica' },
  { src: '/img/ambiente/bancada.webp', alt: 'Bancada de trabalho da clínica' },
  { src: '/img/ambiente/espera.webp', alt: 'Sala de espera da clínica' },
];

export default function SobrePage() {
  return (
    <main>
      <PageHero
        eyebrow="Sobre"
        linhas={['Critério', 'antes de', 'promessa']}
        subtitulo={`Por dentro da forma de trabalhar da ${SITE.nomeCurto} — o que orienta cada avaliação, cada protocolo e cada sessão.`}
        imagem="/img/hero/sobre.webp"
        alt={`Ambiente interno da ${SITE.nome}`}
      />

      <section className="py-20 md:py-28">
        <Container size="narrow">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Manifesto</p>
            <h2 className="mt-3 font-display text-display text-charcoal">
              Resultado não se promete. Se constrói, sessão a sessão.
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-charcoal/75">
              <p>
                A {SITE.nome} nasceu de uma irritação simples: pacotes fechados vendidos antes de
                qualquer avaliação, prometendo o mesmo resultado para peles diferentes. Aqui a
                ordem é invertida — primeiro se entende a pele, depois se decide o que fazer com
                ela.
              </p>
              <p>
                Isso significa consultas mais longas, alguma paciência com quem chega sem saber o
                que quer, e a coragem de dizer que um tratamento não é indicado quando não é.
                Também significa acompanhar de perto: a mesma profissional do início ao fim, com
                registro fotográfico a cada ciclo para revisar o plano com dado, não com opinião.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="pb-4">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            {AMBIENTE.map((imagem, i) => (
              <Reveal key={imagem.src} delay={i * 0.08}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <Image
                    src={imagem.src}
                    alt={imagem.alt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-charcoal py-24 text-champagne md:py-32">
        <Container>
          <div className="grid gap-12 md:grid-cols-[auto_1fr]">
            <DrawLine className="hidden h-full text-terracotta-light md:block" />
            <div>
              <Reveal>
                <p className="text-xs uppercase tracking-[0.3em] text-terracotta-light">Princípios</p>
                <h2 className="mt-3 font-display text-display">Como decidimos o que fazer</h2>
              </Reveal>
              <ol className="mt-14 space-y-10">
                {PRINCIPIOS.map((principio, i) => (
                  <Reveal key={principio.titulo} delay={i * 0.08}>
                    <li className="flex gap-6">
                      <span className="font-display text-3xl text-terracotta-light">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="font-display text-xl text-champagne">{principio.titulo}</h3>
                        <p className="mt-2 max-w-prose text-champagne/75">{principio.texto}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

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

      <section className="py-24 text-center md:py-32">
        <Container>
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-display text-display text-charcoal">
              Quer saber o que a sua pele precisa?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-charcoal/70">
              A avaliação é o primeiro passo — e o único jeito honesto de responder essa pergunta.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button href="/agendamento">Agendar avaliação</Button>
              <Button href="/contato" variant="outline">
                Falar com a clínica
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
