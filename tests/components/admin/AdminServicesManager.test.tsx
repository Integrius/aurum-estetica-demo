import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminServicesManager } from '@/components/admin/AdminServicesManager';

const initialServices = [
  { id: 'svc_1', name: 'Limpeza de Pele Profunda', slug: 'limpeza-de-pele-profunda', category: 'Facial', description: 'desc', duration: 60, price: 220 },
];

describe('AdminServicesManager', () => {
  beforeEach(() => {
    global.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      if (url.endsWith('/api/admin/services') && init?.method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify({ id: 'svc_2', slug: 'peeling-de-diamante' }), { status: 201 }));
      }
      if (url.includes('/api/admin/services/') && init?.method === 'DELETE') {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as unknown as typeof fetch;
  });

  it('adds a new service to the list after a successful create', async () => {
    const user = userEvent.setup();
    render(<AdminServicesManager initialServices={initialServices} />);

    await user.type(screen.getByLabelText('Nome'), 'Peeling de Diamante');
    await user.type(screen.getByLabelText('Categoria'), 'Facial');
    await user.type(screen.getByLabelText('Descrição'), 'Renovação celular.');
    await user.type(screen.getByLabelText('Duração (min)'), '45');
    await user.type(screen.getByLabelText('Preço (R$)'), '190');
    await user.click(screen.getByRole('button', { name: /adicionar serviço/i }));

    await waitFor(() => expect(screen.getByText('Peeling de Diamante')).toBeInTheDocument());
  });

  it('removes a service from the list after delete', async () => {
    const user = userEvent.setup();
    render(<AdminServicesManager initialServices={initialServices} />);

    await user.click(screen.getByRole('button', { name: /remover limpeza de pele profunda/i }));

    await waitFor(() => expect(screen.queryByText('Limpeza de Pele Profunda')).not.toBeInTheDocument());
  });

  it('sends the selected professional ids with the create request', async () => {
    const user = userEvent.setup();
    render(
      <AdminServicesManager
        initialServices={initialServices}
        professionals={[
          { id: 'pro_1', name: 'Dra. Camila Duarte' },
          { id: 'pro_2', name: 'Dra. Marina Alves' },
        ]}
      />
    );

    await user.type(screen.getByLabelText('Nome'), 'Peeling de Diamante');
    await user.type(screen.getByLabelText('Categoria'), 'Facial');
    await user.type(screen.getByLabelText('Descrição'), 'Renovação celular.');
    await user.type(screen.getByLabelText('Duração (min)'), '45');
    await user.type(screen.getByLabelText('Preço (R$)'), '190');
    await user.click(screen.getByLabelText('Dra. Camila Duarte'));
    await user.click(screen.getByRole('button', { name: /adicionar serviço/i }));

    await waitFor(() => expect(screen.getByText('Peeling de Diamante')).toBeInTheDocument());

    const [, init] = (global.fetch as any).mock.calls.find(
      ([url, opts]: [string, RequestInit]) => url.toString().endsWith('/api/admin/services') && opts?.method === 'POST'
    );
    expect(JSON.parse(init.body as string).professionalIds).toEqual(['pro_1']);
  });

  it('shows an error message when a create fails', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 }))
    ) as unknown as typeof fetch;

    render(<AdminServicesManager initialServices={initialServices} />);

    await user.type(screen.getByLabelText('Nome'), 'Peeling de Diamante');
    await user.type(screen.getByLabelText('Categoria'), 'Facial');
    await user.type(screen.getByLabelText('Descrição'), 'Renovação celular.');
    await user.type(screen.getByLabelText('Duração (min)'), '45');
    await user.type(screen.getByLabelText('Preço (R$)'), '190');
    await user.click(screen.getByRole('button', { name: /adicionar serviço/i }));

    expect(await screen.findByText(/não foi possível salvar o serviço/i)).toBeInTheDocument();
  });

  it('shows an error message when a delete fails', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 }))
    ) as unknown as typeof fetch;

    render(<AdminServicesManager initialServices={initialServices} />);

    await user.click(screen.getByRole('button', { name: /remover limpeza de pele profunda/i }));

    expect(await screen.findByText(/não foi possível remover o serviço/i)).toBeInTheDocument();
    expect(screen.getByText('Limpeza de Pele Profunda')).toBeInTheDocument();
  });
});
