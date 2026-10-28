import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockPrisma = {
  post: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
const mockGetServerSession = vi.fn();

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next-auth', () => ({ getServerSession: mockGetServerSession }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

const { GET, POST } = await import('@/app/api/admin/posts/route');
const { PUT, DELETE } = await import('@/app/api/admin/posts/[id]/route');

function requisicao(corpo: unknown) {
  return new Request('http://localhost/api/admin/posts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(corpo),
  });
}

function requisicaoId(corpo: unknown, method: 'PUT' | 'DELETE' = 'PUT') {
  return new Request('http://localhost/api/admin/posts/p1', {
    method,
    headers: { 'content-type': 'application/json' },
    body: method === 'DELETE' ? undefined : JSON.stringify(corpo),
  });
}

// O `body` do brief original era só "## Conteúdo" (11 caracteres) — abaixo do
// próprio `body: z.string().min(20)` do esquema (Step 3), então nunca passaria
// no Step 4. Alongado para respeitar o mínimo do próprio esquema do brief.
const POST_VALIDO = {
  slug: 'teste-de-post',
  title: 'Teste de post',
  excerpt: 'Resumo do post de teste.',
  body: '## Conteúdo\n\nTexto de teste com tamanho suficiente para passar na validação.',
  coverUrl: '/img/diario/sessoes.webp',
  tags: ['teste'],
  publishedAt: '2026-09-22T10:00:00.000Z',
};

describe('POST /api/admin/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('recusa sem sessão', async () => {
    mockGetServerSession.mockResolvedValue(null);
    const resposta = await POST(requisicao(POST_VALIDO));
    expect(resposta.status).toBe(401);
    expect(mockPrisma.post.create).not.toHaveBeenCalled();
  });

  it('recusa corpo inválido com 400', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@aurum.com' } });
    const resposta = await POST(requisicao({ title: '' }));
    expect(resposta.status).toBe(400);
    expect(mockPrisma.post.create).not.toHaveBeenCalled();
  });

  it('cria o post quando autenticado e válido', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@aurum.com' } });
    mockPrisma.post.create.mockResolvedValue({ id: 'p1', ...POST_VALIDO });
    const resposta = await POST(requisicao(POST_VALIDO));
    expect(resposta.status).toBe(201);
    expect(mockPrisma.post.create).toHaveBeenCalledOnce();
  });

  it('devolve 409 quando o slug já existe', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@aurum.com' } });
    mockPrisma.post.create.mockRejectedValue({ code: 'P2002' });
    const resposta = await POST(requisicao(POST_VALIDO));
    expect(resposta.status).toBe(409);
  });

  it('recusa coverUrl absoluta com 400 (M4)', async () => {
    // Um host fora do configurado em next.config faz next/image lançar (500
    // em /, /diario e no post), e uma URL absoluta vira
    // "https://beauty.zevro.apphttps://..." em OG/JSON-LD.
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@aurum.com' } });
    const resposta = await POST(
      requisicao({ ...POST_VALIDO, coverUrl: 'https://exemplo.com/foto.jpg' })
    );
    expect(resposta.status).toBe(400);
    expect(mockPrisma.post.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/admin/posts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('recusa sem sessão', async () => {
    mockGetServerSession.mockResolvedValue(null);
    const resposta = await GET();
    expect(resposta.status).toBe(401);
  });
});

describe('PUT /api/admin/posts/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  function chamar(corpo: unknown) {
    return PUT(requisicaoId(corpo), { params: Promise.resolve({ id: 'p1' }) });
  }

  it('recusa sem sessão', async () => {
    mockGetServerSession.mockResolvedValue(null);
    const resposta = await chamar({ title: 'Novo título' });
    expect(resposta.status).toBe(401);
    expect(mockPrisma.post.update).not.toHaveBeenCalled();
  });

  it('devolve 404 quando o post não existe (P2025)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@aurum.com' } });
    mockPrisma.post.update.mockRejectedValue({ code: 'P2025' });
    const resposta = await chamar({ title: 'Novo título' });
    expect(resposta.status).toBe(404);
  });

  it('atualiza o post quando autenticado e válido', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@aurum.com' } });
    mockPrisma.post.update.mockResolvedValue({ id: 'p1', ...POST_VALIDO, title: 'Novo título' });
    const resposta = await chamar({ title: 'Novo título' });
    expect(resposta.status).toBe(200);
    expect(mockPrisma.post.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { title: 'Novo título' },
    });
  });

  it('recusa coverUrl absoluta com 400 (M4)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@aurum.com' } });
    const resposta = await chamar({ coverUrl: 'https://exemplo.com/foto.jpg' });
    expect(resposta.status).toBe(400);
    expect(mockPrisma.post.update).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/admin/posts/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  function chamar() {
    return DELETE(requisicaoId(undefined, 'DELETE'), { params: Promise.resolve({ id: 'p1' }) });
  }

  it('recusa sem sessão', async () => {
    mockGetServerSession.mockResolvedValue(null);
    const resposta = await chamar();
    expect(resposta.status).toBe(401);
    expect(mockPrisma.post.delete).not.toHaveBeenCalled();
  });

  it('devolve 404 quando o post não existe (P2025)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@aurum.com' } });
    mockPrisma.post.delete.mockRejectedValue({ code: 'P2025' });
    const resposta = await chamar();
    expect(resposta.status).toBe(404);
  });

  it('remove o post quando autenticado', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'admin@aurum.com' } });
    mockPrisma.post.delete.mockResolvedValue({ id: 'p1' });
    const resposta = await chamar();
    expect(resposta.status).toBe(204);
    expect(mockPrisma.post.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });
});
