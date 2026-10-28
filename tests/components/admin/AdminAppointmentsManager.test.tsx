import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminAppointmentsManager } from '@/components/admin/AdminAppointmentsManager';

const initialAppointments = [
  {
    id: 'apt_1',
    clientName: 'Ana Souza',
    serviceName: 'Limpeza de Pele Profunda',
    professionalName: 'Dra. Camila Duarte',
    startAt: '2026-08-24T09:00:00.000Z',
    status: 'confirmed',
  },
];

describe('AdminAppointmentsManager', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })) as unknown as typeof fetch;
  });

  it('lists appointments and marks one as completed', async () => {
    const user = userEvent.setup();
    render(<AdminAppointmentsManager initialAppointments={initialAppointments} />);

    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('Limpeza de Pele Profunda')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /marcar como concluído/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/appointments/apt_1',
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ status: 'completed' }) })
      );
    });
  });

  it('shows an error message and keeps the old status when the update fails', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 })) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<AdminAppointmentsManager initialAppointments={initialAppointments} />);

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(await screen.findByText(/não foi possível atualizar o agendamento/i)).toBeInTheDocument();
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
  });
});
