import { prisma } from '@/lib/prisma';
import { AdminPostsManager } from '@/components/admin/AdminPostsManager';

export default async function AdminDiarioPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <h1 className="font-display text-3xl">Diário</h1>
      <div className="mt-8">
        <AdminPostsManager
          initialPosts={posts.map((post) => ({
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            body: post.body,
            coverUrl: post.coverUrl,
            tags: post.tags,
            publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
          }))}
        />
      </div>
    </div>
  );
}
