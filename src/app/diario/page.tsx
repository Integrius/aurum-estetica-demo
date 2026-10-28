import { prisma } from '@/lib/prisma';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { PostCard } from '@/components/PostCard';
import { InstagramGrid } from '@/components/InstagramGrid';
import { Reveal } from '@/components/motion';
import { buildMetadata } from '@/lib/seo';
import { postsPublicadosWhere } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Diário',
  description:
    'Textos sobre pele, tratamentos e rotina de cuidado — escritos pela equipe da clínica, sem promessa mágica.',
  path: '/diario',
});

export default async function DiarioPage() {
  const posts = await prisma.post.findMany({
    where: postsPublicadosWhere(),
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <main>
      <PageHero
        eyebrow="Diário"
        linhas={['O que', 'a gente', 'escreve']}
        subtitulo="Sem promessa mágica e sem jargão. O que a equipe explicaria numa consulta, por escrito."
        imagem="/img/ambiente/detalhe.webp"
        alt="Detalhe do ambiente da clínica"
      />

      <section className="py-20 md:py-28">
        <Container>
          {posts.length === 0 ? (
            <p className="text-charcoal/65">
              Os primeiros textos saem em breve. Enquanto isso, acompanhe pelo Instagram.
            </p>
          ) : (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={(i % 3) * 0.08}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <Container>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Instagram</p>
            <h2 className="mt-3 font-display text-display text-charcoal">O dia a dia da clínica</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-12">
              <InstagramGrid />
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
