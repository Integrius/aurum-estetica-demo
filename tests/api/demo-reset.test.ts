import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockPrisma = {
  appointment: { deleteMany: vi.fn() },
  client: { deleteMany: vi.fn() },
};
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

const { POST } = await import('@/app/api/demo/reset/route');

function requisicao(segredo?: string) {
  return new Request('http://localhost/api/demo/reset', {
    method: 'POST',
    headers: segredo ? { authorization: `Bearer ${segredo}` } : {},
  });
}

describe('POST /api/demo/reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DEMO_RESET_SECRET = 'segredo-de-teste';
    mockPrisma.appointment.deleteMany.mockResolvedValue({ count: 3 });
    mockPrisma.client.deleteMany.mockResolvedValue({ count: 2 });
  });

  it('recusa sem o segredo', async () => {
    const resposta = await POST(requisicao());
    expect(resposta.status).toBe(401);
    expect(mockPrisma.appointment.deleteMany).not.toHaveBeenCalled();
  });

  it('recusa com segredo errado', async () => {
    const resposta = await POST(requisicao('errado'));
    expect(resposta.status).toBe(401);
    expect(mockPrisma.appointment.deleteMany).not.toHaveBeenCalled();
  });

  it('apaga apenas registros com mais de 24h', async () => {
    const resposta = await POST(requisicao('segredo-de-teste'));
    expect(resposta.status).toBe(200);

    const filtro = mockPrisma.appointment.deleteMany.mock.calls[0][0];
    const limite = filtro.where.createdAt.lt as Date;
    const horasAtras = (Date.now() - limite.getTime()) / 3_600_000;
    expect(horasAtras).toBeGreaterThan(23.9);
    expect(horasAtras).toBeLessThan(24.1);
  });

  it('relata quantas linhas removeu', async () => {
    const resposta = await POST(requisicao('segredo-de-teste'));
    await expect(resposta.json()).resolves.toMatchObject({
      agendamentos: 3,
      clientes: 2,
    });
  });

  it('recusa quando o segredo tem tamanho diferente do esperado', async () => {
    // Cobre o branch de timingSafeEqual que rejeita por tamanho antes de
    // comparar bytes — timingSafeEqual lançaria se os buffers não tivessem
    // exatamente o mesmo tamanho.
    const resposta = await POST(requisicao('seg'));
    expect(resposta.status).toBe(401);
    expect(mockPrisma.appointment.deleteMany).not.toHaveBeenCalled();
  });

  it('só apaga clientes sem nenhum agendamento (não reverte a FK)', async () => {
    await POST(requisicao('segredo-de-teste'));

    const filtroClientes = mockPrisma.client.deleteMany.mock.calls[0][0];
    expect(filtroClientes.where.appointments).toEqual({ none: {} });
  });

  it('apaga agendamentos antes de clientes, respeitando a FK', async () => {
    const ordem: string[] = [];
    mockPrisma.appointment.deleteMany.mockImplementation(async () => {
      ordem.push('appointment');
      return { count: 3 };
    });
    mockPrisma.client.deleteMany.mockImplementation(async () => {
      ordem.push('client');
      return { count: 2 };
    });

    await POST(requisicao('segredo-de-teste'));

    expect(ordem).toEqual(['appointment', 'client']);
  });
});
