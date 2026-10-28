import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPostsManager, calcularPublishedAt } from '@/components/admin/AdminPostsManager';

const postPublicado = {
  id: 'post_1',
  slug: 'primeira-sessao',
  title: 'Primeira sessão',
  excerpt: 'Resumo da primeira sessão.',
  body: '## Conteúdo\n\nTexto com tamanho suficiente.',
  coverUrl: '/img/diario/sessoes.webp',
  tags: ['pele'],
  // Publicado antes das 10:00Z, o horário padrão que o form usaria se
  // reescrevesse a data — cenário exato do bug do M4.
  publishedAt: '2026-09-20T07:30:00.000Z',
};

describe('calcularPublishedAt (M4)', () => {
  it('mantém o ISO original quando a data do formulário não muda', () => {
    expect(calcularPublishedAt('2026-09-20', '2026-09-20T07:30:00.000Z')).toBe(
      '2026-09-20T07:30:00.000Z'
    );
  });

  it('recalcula para T10:00:00Z quando a data muda de fato', () => {
    expect(calcularPublishedAt('2026-09-21', '2026-09-20T07:30:00.000Z')).toBe(
      '2026-09-21T10:00:00.000Z'
    );
  });

  it('devolve null quando o campo de data é esvaziado (vira rascunho)', () => {
    expect(calcularPublishedAt('', '2026-09-20T07:30:00.000Z')).toBeNull();
  });

  it('calcula normalmente quando não há original (post novo)', () => {
    expect(calcularPublishedAt('2026-09-22', null)).toBe('2026-09-22T10:00:00.000Z');
  });
});

describe('AdminPostsManager', () => {
  beforeEach(() => {
    global.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      if (url.endsWith(`/api/admin/posts/${postPublicado.id}`) && init?.method === 'PUT') {
        return Promise.resolve(
          new Response(JSON.stringify({ id: postPublicado.id }), { status: 200 })
        );
      }
      throw new Error(`Unexpected fetch: ${url} ${init?.method}`);
    }) as unknown as typeof fetch;
  });

  it('não reescreve publishedAt de um post já publicado ao salvar sem mudar a data', async () => {
    const user = userEvent.setup();
    render(<AdminPostsManager initialPosts={[postPublicado]} />);

    await user.click(screen.getByRole('button', { name: /editar/i }));
    // Não mexe no campo de data — só reenvia o formulário como está.
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const [, init] = (global.fetch as any).mock.calls[0];
    const corpo = JSON.parse(init.body as string);
    expect(corpo.publishedAt).toBe(postPublicado.publishedAt);
  });
});
