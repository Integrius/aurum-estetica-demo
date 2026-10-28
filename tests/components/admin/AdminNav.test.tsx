import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const signOutMock = vi.fn();
vi.mock('next-auth/react', () => ({ signOut: (...args: unknown[]) => signOutMock(...args) }));

import { AdminNav } from '@/components/admin/AdminNav';

describe('AdminNav', () => {
  it('renders links to the admin sections and signs out on click', async () => {
    const user = userEvent.setup();
    render(<AdminNav userName="Administração Aurum" />);

    expect(screen.getByRole('link', { name: 'Agendamentos' })).toHaveAttribute('href', '/admin/agendamentos');
    expect(screen.getByRole('link', { name: 'Serviços' })).toHaveAttribute('href', '/admin/servicos');
    expect(screen.getByRole('link', { name: 'Profissionais' })).toHaveAttribute('href', '/admin/profissionais');
    expect(screen.getByRole('link', { name: 'Diário' })).toHaveAttribute('href', '/admin/diario');
    expect(screen.getByText('Administração Aurum')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /sair/i }));
    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: '/admin/login' });
  });
});
