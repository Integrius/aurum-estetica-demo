'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface PostDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  tags: string[];
  publishedAt: string | null;
}

const FORM_VAZIO = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  coverUrl: '',
  tags: '',
  publishedAt: '',
};

function paraDataInput(publishedAt: string | null) {
  // publishedAt vem como ISO completo (ex: 2026-09-22T10:00:00.000Z);
  // <input type="date"> só aceita "AAAA-MM-DD".
  return publishedAt ? publishedAt.slice(0, 10) : '';
}

// M4: se a data no formulário ainda corresponde à data do publishedAt
// original, mantém o ISO original (preserva o horário real de publicação).
// Só recalcula com T10:00:00Z quando o usuário de fato mudou a data (ou é
// um post novo/rascunho sem original).
export function calcularPublishedAt(dataFormulario: string, publishedAtOriginal: string | null): string | null {
  if (!dataFormulario) return null;
  if (publishedAtOriginal && paraDataInput(publishedAtOriginal) === dataFormulario) {
    return publishedAtOriginal;
  }
  return new Date(`${dataFormulario}T10:00:00.000Z`).toISOString();
}

export function AdminPostsManager({ initialPosts }: { initialPosts: PostDTO[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  // publishedAt original do post em edição (ISO completo, com o horário
  // real de publicação). O <input type="date"> só guarda "AAAA-MM-DD" em
  // `form.publishedAt`; sem isso, todo save reescreveria o publishedAt para
  // T10:00:00Z mesmo quando a data não mudou (M4).
  const [publishedAtOriginal, setPublishedAtOriginal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function limparFormulario() {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setPublishedAtOriginal(null);
  }

  function iniciarEdicao(post: PostDTO) {
    setEditandoId(post.id);
    setPublishedAtOriginal(post.publishedAt);
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      coverUrl: post.coverUrl,
      tags: post.tags.join(', '),
      publishedAt: paraDataInput(post.publishedAt),
    });
    setError(null);
  }

  function payloadDoFormulario() {
    return {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      body: form.body,
      coverUrl: form.coverUrl,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt: calcularPublishedAt(form.publishedAt, publishedAtOriginal),
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (enviando) return;
    setError(null);
    setEnviando(true);

    const payload = payloadDoFormulario();

    try {
      if (editandoId) {
        const res = await fetch(`/api/admin/posts/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          setError('Não foi possível salvar o post. Verifique os dados e tente novamente.');
          return;
        }
        const atualizado = await res.json();
        setPosts((prev) => prev.map((p) => (p.id === editandoId ? { ...p, ...payload, id: atualizado.id ?? p.id } : p)));
        limparFormulario();
      } else {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          setError('Não foi possível salvar o post. Verifique os dados e tente novamente.');
          return;
        }
        const criado = await res.json();
        setPosts((prev) => [{ id: criado.id, ...payload }, ...prev]);
        limparFormulario();
      }
    } catch {
      setError('Não foi possível salvar o post. Verifique os dados e tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setError('Não foi possível remover o post. Tente novamente.');
        return;
      }
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (editandoId === id) limparFormulario();
    } catch {
      setError('Não foi possível remover o post. Tente novamente.');
    }
  }

  return (
    <div className="space-y-10">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="divide-y divide-charcoal/10 rounded-2xl bg-white">
        {posts.length === 0 && (
          <li className="p-4 text-sm text-charcoal/65">Nenhum post cadastrado. Adicione o primeiro abaixo.</li>
        )}
        {posts.map((post) => (
          <li key={post.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{post.title}</p>
              <p className="text-sm text-charcoal/65">
                /{post.slug} · {post.publishedAt ? `publicado em ${paraDataInput(post.publishedAt)}` : 'rascunho'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <button type="button" onClick={() => iniciarEdicao(post)} className="text-sm text-terracotta">
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(post.id)}
                aria-label={`Remover ${post.title}`}
                className="text-sm text-red-600"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl bg-white p-6 md:grid-cols-2">
        <p className="text-sm font-medium md:col-span-2">
          {editandoId ? 'Editando post' : 'Novo post'}
        </p>
        <label className="block text-sm font-medium">
          Endereço (slug)
          <input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Título
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium md:col-span-2">
          Resumo
          <textarea
            required
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium md:col-span-2">
          Corpo (use "## título" para subtítulos)
          <textarea
            required
            rows={8}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Capa (caminho da imagem)
          <input
            required
            value={form.coverUrl}
            onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Tags (separadas por vírgula)
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Data de publicação (vazia = rascunho)
          <input
            type="date"
            value={form.publishedAt}
            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
          />
        </label>
        <div className="flex items-center gap-4 md:col-span-2">
          <Button type="submit" disabled={enviando}>
            {editandoId ? 'Salvar alterações' : 'Adicionar post'}
          </Button>
          {editandoId && (
            <button type="button" onClick={limparFormulario} className="text-sm text-charcoal/65">
              Cancelar edição
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
