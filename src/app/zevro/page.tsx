import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/content/site';

export const metadata = buildMetadata({
  title: 'Quem fez este site',
  description:
    'Este site foi criado e é mantido pela Zevro. Veja as condições de criação, hospedagem e manutenção.',
  path: '/zevro',
});

const CONDICOES = [
  {
    titulo: 'Hospedagem e domínio',
    texto:
      'O site pode ser hospedado na infraestrutura própria da Zevro com endereço próprio do cliente, ou ficar por conta da Zevro e ser encontrado em "seunome".zevro.app — sem custo extra de domínio nesse caso.',
  },
  {
    titulo: 'Atualizações inclusas',
    texto:
      'Sites hospedados na nossa estrutura têm direito a até 5 atualizações visuais ou textuais por mês, incluídas. Alterações estruturais (novas páginas, novas funcionalidades) são orçadas antes de implementadas, mediante aprovação do orçamento.',
  },
  {
    titulo: 'SEO por padrão',
    texto:
      'Todo site é construído para alcançar as melhores posições nas buscas do Google — não é um serviço à parte, é como já produzimos.',
  },
  {
    titulo: 'Monitoramento em tempo integral',
    texto:
      'Acompanhamos a permanência do site no ar 24 horas por dia, apoiados na parceria com um datacenter de grande porte — estrutura ampla e estável o suficiente para manter qualquer site ou aplicação funcionando em tempo integral, sem instabilidade.',
  },
  {
    titulo: 'Tecnologia atual',
    texto:
      'Utilizamos as tecnologias mais modernas e atuais disponíveis para entregar o melhor conteúdo e desempenho.',
  },
  {
    titulo: 'Tendência e técnica',
    texto:
      'Seguimos as últimas tendências de design e as técnicas mais atuais de construção de sites e aplicativos para melhor atender cada cliente.',
  },
  {
    titulo: 'Certificado de segurança incluso',
    texto:
      'Sites hospedados na nossa estrutura sobem com certificado SSL válido — o cadeado do navegador — sem custo adicional.',
  },
  {
    titulo: 'Atualizações também são testadas',
    texto:
      'Mesmo uma alteração pequena passa pelo mesmo processo de testes usado na construção do site, para garantir que nada quebre ao publicar.',
  },
];

const ENTREGAS = [
  'Criação de sites sob medida para o seu negócio',
  'Hospedagem em infraestrutura própria, monitorada 24h',
  'Manutenção contínua com atualizações inclusas',
  'Produção de conteúdo para Instagram',
];

export default function ZevroPage() {
  return (
    <main>
      <PageHero
        eyebrow="Zevro"
        linhas={['Quem fez', 'este site']}
        subtitulo="O que você acabou de navegar é uma demonstração. Este é o padrão do que entregamos — e as condições em que entregamos."
        imagem="/img/ambiente/bancada.webp"
        alt="Bancada de trabalho"
      />

      <section className="py-20 md:py-28">
        <Container size="narrow">
          <Reveal>
            <p className="text-lg leading-relaxed text-charcoal/80">
              A {SITE.nome} é uma clínica fictícia. O site, não: cada página,
              animação, formulário e o sistema de agendamento ligado a um banco de dados real
              foram construídos do zero, e é exatamente isso que entregamos a um cliente de
              verdade.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <ul className="mt-10 space-y-3">
              {ENTREGAS.map((entrega) => (
                <li key={entrega} className="flex gap-3 text-charcoal/75">
                  <span aria-hidden="true" className="text-terracotta">—</span>
                  {entrega}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <section className="bg-charcoal py-20 text-champagne md:py-28">
        <Container>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-terracotta-light">Condições</p>
            <h2 className="mt-3 font-display text-display">Como trabalhamos</h2>
          </Reveal>

          <ol className="mt-14 grid gap-8 md:grid-cols-2">
            {CONDICOES.map((condicao, i) => (
              <li key={condicao.titulo} className="border-t border-champagne/20 pt-6">
                <Reveal delay={(i % 2) * 0.08}>
                  <span className="text-xs tabular-nums text-terracotta-light">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 font-display text-xl">{condicao.titulo}</h3>
                  <p className="mt-3 text-champagne/75">{condicao.texto}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-20 text-center md:py-28">
        <Container size="narrow">
          <Reveal>
            <h2 className="font-display text-display text-charcoal">
              Quer um site assim para o seu negócio?
            </h2>
            <p className="mt-5 text-lg text-charcoal/70">
              Conte o que você faz e a gente mostra como ficaria.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="https://zevro.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-charcoal"
              >
                Conhecer a Zevro
              </a>
              <Button href="/" variant="outline">Voltar ao site da clínica</Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
