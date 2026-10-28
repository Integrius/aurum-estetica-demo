import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminProfessionalsManager } from '@/components/admin/AdminProfessionalsManager';

const initialProfessionals = [
  { id: 'pro_1', name: 'Dra. Camila Duarte', workingHours: [{ weekday: 1, startMinute: 540, endMinute: 1080 }] },
];

describe('AdminProfessionalsManager', () => {
  it('saves updated working hours for a professional', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<AdminProfessionalsManager initialProfessionals={initialProfessionals} />);

    expect(screen.getByText('Dra. Camila Duarte')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /salvar horários de dra\. camila duarte/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/professionals/pro_1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  it('shows an error message when the save fails', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 })) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<AdminProfessionalsManager initialProfessionals={initialProfessionals} />);

    await user.click(screen.getByRole('button', { name: /salvar horários de dra\. camila duarte/i }));

    expect(await screen.findByText(/não foi possível salvar os horários/i)).toBeInTheDocument();
  });
});
