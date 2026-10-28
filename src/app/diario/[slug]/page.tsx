import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { buildMetadata, articleJsonLd, jsonLd } from '@/lib/seo';
import { estaPublicado } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  // Rascunho e post agendado para o futuro têm que virar exatamente a mesma
  // metadata de "não encontrado" — senão título/resumo/imagem vazam no
  // <head> (e em previews de link) antes da hora.
  if (!estaPublicado(post)) {
    return buildMetadata({ title: 'Texto não encontrado', description: '', path: `/diario/${slug}` });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/diario/${slug}`,
    image: post.coverUrl,
  });
}

/**
 * Conversor mínimo de markdown. O seed usa apenas "## título" e parágrafos —
 * não vale adicionar uma dependência de 60 KB para isso. Se o admin passar a
 * aceitar markdown rico, troque por uma biblioteca de verdade.
 */
function renderizarCorpo(body: string) {
  return body.split('\n\n').map((bloco, i) => {
    const texto = bloco.trim();
    if (!texto) return null;
    if (texto.startsWith('## ')) {
      return (
        <h2 key={i} className="mt-12 font-display text-2xl text-charcoal md:text-3xl">
          {texto.slice(3)}
        </h2>
      );
    }
    return (
      <p key={i} className="mt-5 text-lg leading-relaxed text-charcoal/80">
        {texto}
      </p>
    );
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!estaPublicado(post)) notFound();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            articleJsonLd({
              titulo: post.title,
              resumo: post.excerpt,
              slug: post.slug,
              capa: post.coverUrl,
              publicadoEm: post.publishedAt,
            }),
          ),
        }}
      />

      <article className="pt-32 md:pt-40">
        <Container size="narrow">
          <Link href="/diario" className="text-sm text-terracotta hover:underline">
            ← Diário
          </Link>

          <time
            dateTime={post.publishedAt.toISOString()}
            className="mt-8 block text-xs uppercase tracking-[0.25em] text-charcoal/65"
          >
            {post.publishedAt.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </time>

          <h1 className="mt-4 font-display text-display text-charcoal">{post.title}</h1>
          <p className="mt-5 text-xl text-charcoal/70">{post.excerpt}</p>
        </Container>

        <Container className="mt-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={post.coverUrl}
              alt=""
              fill
              // Mesmo ajuste do PageHero (ver comentário lá): sem `preload`
              // junto de `fetchPriority`, conforme a doc do Next 16.
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </Container>

        <Container size="narrow" className="pb-20 md:pb-28">
          <div className="mt-14">{renderizarCorpo(post.body)}</div>

          {post.tags.length > 0 && (
            <ul className="mt-12 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag} className="rounded-full bg-sand/50 px-3 py-1 text-xs text-charcoal/70">
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-16 rounded-2xl bg-ivory p-8 text-center md:p-12">
            <h2 className="font-display text-2xl text-charcoal">
              Quer saber o que isso significa para a sua pele?
            </h2>
            <div className="mt-6">
              <Button href="/agendamento">Agendar avaliação</Button>
            </div>
          </div>
        </Container>
      </article>
    </main>
  );
}
