import Image from 'next/image';
import { SITE } from '@/content/site';
import { INSTAGRAM_POSTS } from '@/content/instagram';

export function InstagramGrid() {
  return (
    <div>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {INSTAGRAM_POSTS.map((post) => (
          <li key={post.imagem} className="group relative aspect-square overflow-hidden rounded-xl">
            <Image
              src={post.imagem}
              alt={post.alt}
              fill
              sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 ease-editorial group-hover:scale-110"
            />
            <span className="pointer-events-none absolute inset-0 flex items-end bg-charcoal/0 p-3 text-xs text-white opacity-0 transition-all duration-300 group-hover:bg-charcoal/55 group-hover:opacity-100">
              {post.legenda}
            </span>
          </li>
        ))}
      </ul>
      <a
        href={SITE.instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex rounded-full border border-charcoal/20 px-6 py-3 text-sm transition-colors hover:border-terracotta hover:text-terracotta"
      >
        Seguir {SITE.instagram.usuario}
      </a>
    </div>
  );
}
