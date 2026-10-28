import Image from 'next/image';
import Link from 'next/link';

export interface PostResumo {
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  tags: string[];
  publishedAt: Date | null;
}

export function PostCard({ post }: { post: PostResumo }) {
  return (
    <article>
      <Link href={`/diario/${post.slug}`} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
          <Image
            src={post.coverUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
          />
        </div>
        <div className="mt-5">
          {post.publishedAt && (
            <time
              dateTime={post.publishedAt.toISOString()}
              className="text-xs uppercase tracking-[0.2em] text-terracotta"
            >
              {post.publishedAt.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          )}
          <h3 className="mt-2 font-display text-xl text-charcoal group-hover:text-terracotta">
            {post.title}
          </h3>
          <p className="mt-2 text-charcoal/70">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
